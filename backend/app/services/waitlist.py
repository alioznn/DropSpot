from __future__ import annotations

from datetime import datetime, timezone
from typing import Tuple

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.models.drop import Drop
from app.models.user import User
from app.models.waitlist_entry import WaitlistEntry


class WaitlistService:
    JOINED_STATE = "joined"
    LEFT_STATE = "left"

    def __init__(self, session: AsyncSession):
        self.session = session

    async def join_waitlist(
        self,
        *,
        user: User,
        drop: Drop,
        priority_score: float,
    ) -> Tuple[WaitlistEntry, bool]:
        now = datetime.now(timezone.utc)

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

