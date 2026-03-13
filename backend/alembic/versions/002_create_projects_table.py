"""Create projects table

Revision ID: 002
Revises: 001
Create Date: 2024-01-02 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column("generated_code", sa.Text(), nullable=True),
        sa.Column(
            "framework",
            sa.Enum("REACT", "VUE", "SVELTE", name="framework"),
            nullable=False,
            server_default="REACT",
        ),
        sa.Column(
            "status",
            sa.Enum("PENDING", "GENERATING", "COMPLETED", "FAILED", name="projectstatus"),
            nullable=False,
            server_default="PENDING",
        ),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_projects_id"), "projects", ["id"], unique=False)
    op.create_index(op.f("ix_projects_user_id"), "projects", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_projects_user_id"), table_name="projects")
    op.drop_index(op.f("ix_projects_id"), table_name="projects")
    op.drop_table("projects")
    op.execute("DROP TYPE IF EXISTS framework")
    op.execute("DROP TYPE IF EXISTS projectstatus")
