from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin


class WaitlistEntry(TimestampMixin, Base):
    __tablename__ = "waitlist_entries"
    __table_args__ = (
        UniqueConstraint("user_id", "drop_id", name="uq_waitlist_user_drop"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    drop_id: Mapped[int] = mapped_column(
        ForeignKey("drops.id", ondelete="CASCADE"),
        nullable=False,
    )
    priority_score: Mapped[float] = mapped_column(Numeric(16, 6), nullable=False)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    state: Mapped[str] = mapped_column(String(32), nullable=False, default="joined")
    claim_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    claimed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    user = relationship("User", back_populates="waitlist_entries", lazy="joined")
    drop = relationship("Drop", back_populates="waitlist_entries", lazy="joined")

    def __repr__(self) -> str:
        return f"WaitlistEntry(id={self.id!r}, user_id={self.user_id!r}, drop_id={self.drop_id!r})"

