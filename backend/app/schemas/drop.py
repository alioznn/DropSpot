from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class DropRead(BaseModel):
    id: int
    name: str
    description: str | None = None
    capacity: int
    claim_window_start: datetime
    claim_window_end: datetime
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

