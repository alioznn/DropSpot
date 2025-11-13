from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, schemas
from app.api.deps import get_current_active_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.services.waitlist import WaitlistService

router = APIRouter()


@router.get("", response_model=list[schemas.DropRead])
async def list_active_drops(session: AsyncSession = Depends(get_db)) -> list[schemas.DropRead]:
    drops = await crud.get_active_drops(session)
    return [schemas.DropRead.model_validate(drop) for drop in drops]


@router.post(
    "/{drop_id}/join",
    response_model=schemas.WaitlistJoinResponse,
    status_code=status.HTTP_200_OK,
)
async def join_waitlist(
    drop_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
) -> schemas.WaitlistJoinResponse:
    drop = await crud.get_drop(session, drop_id)
    if not drop or not drop.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drop not found")

    priority_score = await compute_priority_score(session, current_user.id, drop.id)
    service = WaitlistService(session)
    entry, created = await service.join_waitlist(
        user=current_user,
        drop=drop,
        priority_score=priority_score,
    )
    await session.commit()

    return schemas.WaitlistJoinResponse(
        entry=schemas.WaitlistEntryRead.model_validate(entry),
        created=created,
    )


@router.post(
    "/{drop_id}/leave",
    response_model=schemas.WaitlistLeaveResponse,
)
async def leave_waitlist(
    drop_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
) -> schemas.WaitlistLeaveResponse:
    drop = await crud.get_drop(session, drop_id)
    if not drop or not drop.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drop not found")

    service = WaitlistService(session)
    entry = await service.leave_waitlist(user=current_user, drop=drop)
    await session.commit()

    return schemas.WaitlistLeaveResponse(
        success=True,
        state=entry.state if entry else WaitlistService.LEFT_STATE,
    )


async def compute_priority_score(
    session: AsyncSession,
    user_id: int,
    drop_id: int,
) -> float:
    # Placeholder priority calculation; will integrate seed-based logic later.
    # Using join timestamp to derive a simple priority ensures deterministic ordering.
    _ = (session, user_id, drop_id)
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)
    return float(now.timestamp())

