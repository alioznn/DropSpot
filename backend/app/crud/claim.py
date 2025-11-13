from __future__ import annotations

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.waitlist_entry import WaitlistEntry


async def list_waitlist_by_drop(
    session: AsyncSession,
    *,
    drop_id: int,
) -> list[WaitlistEntry]:
    statement: Select[tuple[WaitlistEntry]] = select(WaitlistEntry).where(
        WaitlistEntry.drop_id == drop_id,
        WaitlistEntry.state == "joined",
    ).order_by(WaitlistEntry.priority_score.desc(), WaitlistEntry.joined_at)
    result = await session.execute(statement)
    return list(result.scalars().all())

