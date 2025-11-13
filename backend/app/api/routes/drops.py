from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, schemas
from app.api.deps import get_current_active_user
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

    service = WaitlistService(session)
    entry, created = await service.join_waitlist(
        user=current_user,
        drop=drop,
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


@router.post(
    "/{drop_id}/claim",
    response_model=schemas.ClaimResponse,
)
async def claim_drop(
    drop_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
) -> schemas.ClaimResponse:
    drop = await crud.get_drop(session, drop_id)
    if not drop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drop not found")

    service = WaitlistService(session)
    try:
        entry, position = await service.claim_waitlist_entry(user=current_user, drop=drop)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        ) from exc
    except PermissionError as exc:
        message = str(exc)
        status_code = status.HTTP_409_CONFLICT if "Capacity" in message else status.HTTP_403_FORBIDDEN
        raise HTTPException(
            status_code=status_code,
            detail=message,
        ) from exc

    await session.commit()

    if not entry.claim_code or not entry.claimed_at:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Claim code generation failed",
        )

    return schemas.ClaimResponse(
        claim_code=entry.claim_code,
        claimed_at=entry.claimed_at,
        position=position,
    )



