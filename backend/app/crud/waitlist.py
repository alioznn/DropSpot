from __future__ import annotations

from datetime import datetime

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.waitlist_entry import WaitlistEntry


async def get_waitlist_entry(
    session: AsyncSession,
    *,
    user_id: int,
    drop_id: int,
    for_update: bool = False,
) -> WaitlistEntry | None:
    statement: Select[tuple[WaitlistEntry]] = select(WaitlistEntry).where(
        WaitlistEntry.user_id == user_id,
        WaitlistEntry.drop_id == drop_id,
    )
    if for_update:
        statement = statement.with_for_update()
    result = await session.execute(statement)
    return result.scalars().first()


async def create_waitlist_entry(
    session: AsyncSession,
    *,
    user_id: int,
    drop_id: int,
    priority_score: float,
    joined_at: datetime,
) -> WaitlistEntry:
    entry = WaitlistEntry(
        user_id=user_id,
        drop_id=drop_id,
        priority_score=priority_score,
        joined_at=joined_at,
        state="joined",
    )
    session.add(entry)
    await session.flush()
    await session.refresh(entry)
    return entry


async def update_waitlist_entry_state(
    session: AsyncSession,
    entry: WaitlistEntry,
    *,
    state: str,
    joined_at: datetime | None = None,
    priority_score: float | None = None,
) -> WaitlistEntry:
    entry.state = state
    if joined_at is not None:
        entry.joined_at = joined_at
    if priority_score is not None:
        entry.priority_score = priority_score
    if state != "claimed":
        entry.claim_code = None
        entry.claimed_at = None
    await session.flush()
    await session.refresh(entry)
    return entry


async def delete_waitlist_entry(session: AsyncSession, entry: WaitlistEntry) -> None:
    await session.delete(entry)
    await session.flush()

