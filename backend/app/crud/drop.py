from __future__ import annotations

from typing import Sequence

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.drop import Drop
from app.schemas.drop import DropCreate, DropUpdate


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


async def get_drops(session: AsyncSession) -> Sequence[Drop]:
    statement: Select[tuple[Drop]] = select(Drop).order_by(Drop.created_at.desc())
    result = await session.execute(statement)
    return result.scalars().all()


async def create_drop(session: AsyncSession, drop_in: DropCreate) -> Drop:
    drop = Drop(
        name=drop_in.name,
        description=drop_in.description,
        capacity=drop_in.capacity,
        claim_window_start=drop_in.claim_window_start,
        claim_window_end=drop_in.claim_window_end,
        is_active=drop_in.is_active,
    )
    session.add(drop)
    await session.flush()
    await session.refresh(drop)
    return drop


async def update_drop(session: AsyncSession, drop: Drop, drop_in: DropUpdate) -> Drop:
    for field, value in drop_in.model_dump(exclude_unset=True).items():
        setattr(drop, field, value)
    await session.flush()
    await session.refresh(drop)
    return drop


async def delete_drop(session: AsyncSession, drop: Drop) -> None:
    await session.delete(drop)
    await session.flush()

