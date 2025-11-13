from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class WaitlistEntryRead(BaseModel):
    id: int
    user_id: int
    drop_id: int
    priority_score: float
    joined_at: datetime
    state: str
    claim_code: str | None = None
    claimed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WaitlistJoinResponse(BaseModel):
    entry: WaitlistEntryRead
    created: bool


class WaitlistLeaveResponse(BaseModel):
    success: bool
    state: str

