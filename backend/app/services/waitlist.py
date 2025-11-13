from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from typing import Tuple

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.core.priority import PriorityCoefficients, compute_coefficients, hash_context_value
from app.models.drop import Drop
from app.models.user import User
from app.models.waitlist_entry import WaitlistEntry


class WaitlistService:
    JOINED_STATE = "joined"
    LEFT_STATE = "left"
    CLAIMED_STATE = "claimed"

    def __init__(self, session: AsyncSession):
        self.session = session
        self.coefficients: PriorityCoefficients = compute_coefficients()

    @staticmethod
    def _ensure_timezone(dt: datetime) -> datetime:
        if dt.tzinfo is None or dt.tzinfo.utcoffset(dt) is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt

    async def join_waitlist(
        self,
        *,
        user: User,
        drop: Drop,
    ) -> Tuple[WaitlistEntry, bool]:
        now = datetime.now(timezone.utc)
        priority_score = self.calculate_priority_score(user=user, drop=drop, joined_at=now)

        entry = await crud.get_waitlist_entry(
            self.session,
            user_id=user.id,
            drop_id=drop.id,
            for_update=False,
        )
        if entry:
            if entry.state == self.JOINED_STATE:
                return entry, False
            entry = await crud.update_waitlist_entry_state(
                self.session,
                entry,
                state=self.JOINED_STATE,
                joined_at=now,
                priority_score=priority_score,
            )
            return entry, False

        try:
            entry = await crud.create_waitlist_entry(
                self.session,
                user_id=user.id,
                drop_id=drop.id,
                priority_score=priority_score,
                joined_at=now,
            )
        except IntegrityError:
            await self.session.rollback()
            entry = await crud.get_waitlist_entry(
                self.session,
                user_id=user.id,
                drop_id=drop.id,
            )
            if not entry:
                raise
            if entry.state != self.JOINED_STATE:
                entry = await crud.update_waitlist_entry_state(
                    self.session,
                    entry,
                    state=self.JOINED_STATE,
                    joined_at=now,
                    priority_score=priority_score,
                )
            return entry, False

        return entry, True

    async def leave_waitlist(
        self,
        *,
        user: User,
        drop: Drop,
    ) -> WaitlistEntry | None:
        entry = await crud.get_waitlist_entry(
            self.session,
            user_id=user.id,
            drop_id=drop.id,
        )
        if not entry:
            return None
        if entry.state == self.LEFT_STATE:
            return entry

        entry = await crud.update_waitlist_entry_state(
            self.session,
            entry,
            state=self.LEFT_STATE,
        )
        return entry

    def calculate_priority_score(self, *, user: User, drop: Drop, joined_at: datetime) -> float:
        coeffs = self.coefficients
        joined_at = self._ensure_timezone(joined_at)
        user_created_at = self._ensure_timezone(user.created_at)
        delta = joined_at - user_created_at
        delta_ms = max(int(delta.total_seconds() * 1000), 0)
        account_age_days = max(delta.days, 0)
        rapid_metric = hash_context_value(str(user.id), str(drop.id), "rapid") % 100
        base = (drop.capacity % 100) + (hash_context_value(str(drop.id), "base") % 100)
        score = (
            base
            + (delta_ms % coeffs.a)
            + (account_age_days % coeffs.b)
            - (rapid_metric % coeffs.c)
        )
        fractional = (hash_context_value(str(user.id), joined_at.isoformat()) % 1000) / 1000
        return float(max(score, 0) + fractional)

    async def claim_waitlist_entry(
        self,
        *,
        user: User,
        drop: Drop,
    ) -> tuple[WaitlistEntry, int]:
        now = datetime.now(timezone.utc)
        claim_start = self._ensure_timezone(drop.claim_window_start)
        claim_end = self._ensure_timezone(drop.claim_window_end)
        if now < claim_start or now > claim_end:
            raise ValueError("Claim window is not active")

        entry = await crud.get_waitlist_entry(
            self.session,
            user_id=user.id,
            drop_id=drop.id,
        )
        if not entry or entry.state != self.JOINED_STATE:
            raise PermissionError("User is not eligible to claim this drop")

        waitlist = await crud.list_waitlist_by_drop(self.session, drop_id=drop.id)
        if not waitlist:
            raise PermissionError("No waitlist entries available")

        position = next((idx for idx, item in enumerate(waitlist, start=1) if item.id == entry.id), None)
        if position is None:
            raise PermissionError("User waitlist entry not found in ordering")

        if position > drop.capacity:
            raise PermissionError("Capacity exceeded for this drop")

        if entry.state == self.CLAIMED_STATE and entry.claim_code:
            return entry, position

        entry = await crud.update_waitlist_entry_state(
            self.session,
            entry,
            state=self.CLAIMED_STATE,
        )
        entry.claim_code = self.generate_claim_code(user=user, drop=drop, entry=entry)
        entry.claimed_at = now
        await self.session.flush()
        await self.session.refresh(entry)
        return entry, position

    def generate_claim_code(self, *, user: User, drop: Drop, entry: WaitlistEntry) -> str:
        priority = float(entry.priority_score)
        joined_at = self._ensure_timezone(entry.joined_at)
        raw = f"{user.id}|{drop.id}|{priority:.4f}|{joined_at.isoformat()}"
        digest = hashlib.sha256(raw.encode()).hexdigest()
        return digest[:16].upper()

