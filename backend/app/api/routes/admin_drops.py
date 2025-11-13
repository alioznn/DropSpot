from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, schemas
from app.api.deps import get_current_admin_user
from app.db.session import get_db
from app.models.user import User

router = APIRouter()


@router.get("", response_model=list[schemas.DropRead])
async def admin_list_drops(
    _: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_db),
) -> list[schemas.DropRead]:
    drops = await crud.get_drops(session)
    return [schemas.DropRead.model_validate(drop) for drop in drops]


@router.post(
    "",
    response_model=schemas.DropRead,
    status_code=status.HTTP_201_CREATED,
)
async def admin_create_drop(
    payload: schemas.DropCreate,
    _: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_db),
) -> schemas.DropRead:
    drop = await crud.create_drop(session, payload)
    await session.commit()
    return schemas.DropRead.model_validate(drop)


@router.put(
    "/{drop_id}",
    response_model=schemas.DropRead,
)
async def admin_update_drop(
    drop_id: int,
    payload: schemas.DropUpdate,
    _: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_db),
) -> schemas.DropRead:
    drop = await crud.get_drop(session, drop_id)
    if not drop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drop not found")
    drop = await crud.update_drop(session, drop, payload)
    await session.commit()
    return schemas.DropRead.model_validate(drop)


@router.delete(
    "/{drop_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def admin_delete_drop(
    drop_id: int,
    _: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_db),
) -> Response:
    drop = await crud.get_drop(session, drop_id)
    if not drop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drop not found")
    await crud.delete_drop(session, drop)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

