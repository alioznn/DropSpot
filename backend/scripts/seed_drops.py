from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.core.config import settings
from app.db.session import AsyncSessionLocal, engine
from app.models.drop import Drop

SAMPLE_DROPS = [
    {
        "name": "Alpaco Hoodie Drop",
        "description": "Limited edition Alpaco hoodies.",
        "capacity": 100,
        "start_offset_minutes": 10,
        "duration_minutes": 60,
    },
    {
        "name": "VIP Event Tickets",
        "description": "Exclusive access to Alpaco product launch event.",
        "capacity": 50,
        "start_offset_minutes": 30,
        "duration_minutes": 120,
    },
    {
        "name": "Community Beta Access",
        "description": "Early access to upcoming Alpaco platform features.",
        "capacity": 200,
        "start_offset_minutes": 5,
        "duration_minutes": 1440,
    },
]


async def seed_drops() -> None:
    async with AsyncSessionLocal() as session:
        now = datetime.now(timezone.utc)
        existing = await session.execute(select(Drop))
        drops = existing.scalars().all()
        if drops:
            print("Drops already exist, skipping seeding.")
            return

        for drop_data in SAMPLE_DROPS:
            start = now + timedelta(minutes=drop_data["start_offset_minutes"])
            end = start + timedelta(minutes=drop_data["duration_minutes"])
            drop = Drop(
                name=drop_data["name"],
                description=drop_data["description"],
                capacity=drop_data["capacity"],
                claim_window_start=start,
                claim_window_end=end,
                is_active=True,
            )
            session.add(drop)

        await session.commit()
        print(f"Seeded {len(SAMPLE_DROPS)} drops into {settings.database_url}")


def main() -> None:
    asyncio.run(seed_drops())


if __name__ == "__main__":
    main()

