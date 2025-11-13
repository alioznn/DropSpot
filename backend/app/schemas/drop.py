from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class DropBase(BaseModel):
    name: str = Field(min_length=3, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    capacity: int = Field(gt=0)
    claim_window_start: datetime
    claim_window_end: datetime
    is_active: bool = True


class DropCreate(DropBase):
    pass


class DropUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    capacity: int | None = Field(default=None, gt=0)
    claim_window_start: datetime | None = None
    claim_window_end: datetime | None = None
    is_active: bool | None = None


class DropRead(DropBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

