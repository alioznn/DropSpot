from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate


async def get_user_by_email(
    session: AsyncSession,
    email: str,
) -> User | None:
    statement = select(User).where(User.email == email.lower())
    result = await session.execute(statement)
    return result.scalars().first()


async def create_user(
    session: AsyncSession,
    *,
    user_in: UserCreate,
) -> User:
    user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
    )
    session.add(user)
    await session.flush()
    await session.refresh(user)
    return user


async def authenticate_user(
    session: AsyncSession,
    *,
    email: str,
    password: str,
) -> User | None:
    user = await get_user_by_email(session, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

