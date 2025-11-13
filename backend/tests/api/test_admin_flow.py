from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient
from sqlalchemy import update

from app.models.user import User


@pytest.mark.asyncio
async def test_admin_drop_flow(async_session, client: AsyncClient):
    # Sign up admin user
    admin_payload = {"email": "admin@test.com", "password": "adminpassw"}
    response = await client.post("/api/auth/signup", json=admin_payload)
    assert response.status_code == 201
    admin_token = response.json()["token"]["access_token"]

    # Promote to admin
    await async_session.execute(
        update(User)
        .where(User.email == admin_payload["email"])
        .values(is_admin=True)
    )
    await async_session.commit()

    headers = {"Authorization": f"Bearer {admin_token}"}
    now = datetime.now(timezone.utc)
    drop_payload = {
        "name": "Admin Managed Drop",
        "description": "Integration test drop",
        "capacity": 5,
        "claim_window_start": (now - timedelta(minutes=5)).isoformat(),
        "claim_window_end": (now + timedelta(hours=1)).isoformat(),
        "is_active": True,
    }
    # Create drop
    create_resp = await client.post("/api/admin/drops", json=drop_payload, headers=headers)
    assert create_resp.status_code == 201
    drop_id = create_resp.json()["id"]

    # List drops
    list_resp = await client.get("/api/admin/drops", headers=headers)
    assert list_resp.status_code == 200
    assert any(drop["id"] == drop_id for drop in list_resp.json())

    # Update drop
    update_resp = await client.put(
        f"/api/admin/drops/{drop_id}",
        json={"description": "Updated description"},
        headers=headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["description"] == "Updated description"

    # Sign up regular user
    user_payload = {"email": "user1@test.com", "password": "userpassw"}
    user_resp = await client.post("/api/auth/signup", json=user_payload)
    assert user_resp.status_code == 201
    user_token = user_resp.json()["token"]["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}

    # Join waitlist
    join_resp = await client.post(f"/api/drops/{drop_id}/join", headers=user_headers)
    assert join_resp.status_code == 200

    # Claim drop
    claim_resp = await client.post(f"/api/drops/{drop_id}/claim", headers=user_headers)
    assert claim_resp.status_code in (200, 403)
    if claim_resp.status_code == 200:
        body = claim_resp.json()
        assert "claim_code" in body and body["claim_code"]
    else:
        assert claim_resp.json()["detail"] in {"Claim window is not active", "Capacity exceeded for this drop"}

    # Delete drop
    delete_resp = await client.delete(f"/api/admin/drops/{drop_id}", headers=headers)
    assert delete_resp.status_code == 204

