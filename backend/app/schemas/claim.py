from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class ClaimResponse(BaseModel):
    claim_code: str
    claimed_at: datetime
    position: int

