from __future__ import annotations

from pydantic import BaseModel

from app.schemas.token import Token
from app.schemas.user import UserRead


class AuthResponse(BaseModel):
    token: Token
    user: UserRead

