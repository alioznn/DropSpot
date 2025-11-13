from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, schemas
from app.core.security import create_access_token
from app.db.session import get_db

router = APIRouter()


@router.post(
    "/signup",
    status_code=status.HTTP_201_CREATED,
    response_model=schemas.AuthResponse,
)
async def signup(
    payload: schemas.UserCreate,
    session: AsyncSession = Depends(get_db),
) -> schemas.AuthResponse:
    existing_user = await crud.get_user_by_email(session, payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    user = await crud.create_user(session, user_in=payload)
    await session.commit()
    token = schemas.Token(access_token=create_access_token(user.email))
    return schemas.AuthResponse(
        token=token,
        user=schemas.UserRead.model_validate(user),
    )


@router.post(
    "/login",
    response_model=schemas.AuthResponse,
)
async def login(
    payload: schemas.UserLogin,
    session: AsyncSession = Depends(get_db),
) -> schemas.AuthResponse:
    user = await crud.authenticate_user(
        session,
        email=payload.email,
        password=payload.password,
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = schemas.Token(access_token=create_access_token(user.email))
    return schemas.AuthResponse(
        token=token,
        user=schemas.UserRead.model_validate(user),
    )

