from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from app.core.security import get_password_hash
from app.models.drop import Drop
from app.models.user import User
from app.services.waitlist import WaitlistService


@pytest.mark.asyncio
async def test_join_waitlist_idempotent(async_session):
    user = User(
        email="waitlist@example.com",
        hashed_password=get_password_hash("testpassword"),
        is_active=True,
    )
    now = datetime.now(timezone.utc)
    drop = Drop(
        name="Test Drop",
        description="Idempotency check",
        capacity=10,
        claim_window_start=now - timedelta(hours=1),
        claim_window_end=now + timedelta(hours=1),
        is_active=True,
    )
    async_session.add_all([user, drop])
    await async_session.flush()

    service = WaitlistService(async_session)
    entry, created = await service.join_waitlist(user=user, drop=drop)

    assert created is True
    assert entry.state == WaitlistService.JOINED_STATE

    second_entry, second_created = await service.join_waitlist(user=user, drop=drop)

    assert second_created is False
    assert second_entry.id == entry.id
    assert second_entry.state == WaitlistService.JOINED_STATE

