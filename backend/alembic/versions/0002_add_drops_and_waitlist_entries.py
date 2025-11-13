"""add drops and waitlist entries tables

Revision ID: 0002_add_drops_waitlist
Revises: 0001_create_users
Create Date: 2025-11-13 14:47:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0002_add_drops_waitlist"
down_revision: Union[str, None] = "0001_create_users"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "drops",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("capacity", sa.Integer(), nullable=False),
        sa.Column("claim_window_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("claim_window_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.sql.expression.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_drops_id"), "drops", ["id"], unique=False)
    op.create_index(op.f("ix_drops_name"), "drops", ["name"], unique=False)

    op.create_table(
        "waitlist_entries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("drop_id", sa.Integer(), nullable=False),
        sa.Column("priority_score", sa.Numeric(16, 6), nullable=False),
        sa.Column("joined_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("state", sa.String(length=32), nullable=False),
        sa.Column("claim_code", sa.String(length=64), nullable=True),
        sa.Column("claimed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["drop_id"], ["drops.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "drop_id", name="uq_waitlist_user_drop"),
    )
    op.create_index(op.f("ix_waitlist_entries_id"), "waitlist_entries", ["id"], unique=False)
    op.create_index(
        op.f("ix_waitlist_entries_drop_id"),
        "waitlist_entries",
        ["drop_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_waitlist_entries_user_id"),
        "waitlist_entries",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_waitlist_entries_user_id"), table_name="waitlist_entries")
    op.drop_index(op.f("ix_waitlist_entries_drop_id"), table_name="waitlist_entries")
    op.drop_index(op.f("ix_waitlist_entries_id"), table_name="waitlist_entries")
    op.drop_table("waitlist_entries")
    op.drop_index(op.f("ix_drops_name"), table_name="drops")
    op.drop_index(op.f("ix_drops_id"), table_name="drops")
    op.drop_table("drops")

