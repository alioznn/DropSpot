from __future__ import annotations

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.drop import Drop


async def get_drop(session: AsyncSession, drop_id: int) -> Drop | None:
    statement: Select[tuple[Drop]] = select(Drop).where(Drop.id == drop_id)
    result = await session.execute(statement)
    return result.scalars().first()


async def get_active_drops(session: AsyncSession) -> list[Drop]:
    statement: Select[tuple[Drop]] = (
        select(Drop).where(Drop.is_active.is_(True)).order_by(Drop.claim_window_start)
    )
    result = await session.execute(statement)
    return list(result.scalars().all())

