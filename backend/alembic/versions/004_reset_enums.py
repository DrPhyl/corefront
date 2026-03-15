"""Reset enum values to lowercase

Revision ID: 004
Revises: 003
Create Date: 2026-03-15 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '004'
down_revision: Union[str, None] = '003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Update existing uppercase enum values to lowercase in projects table
    op.execute("UPDATE projects SET framework = LOWER(framework) WHERE framework != LOWER(framework)")
    op.execute("UPDATE projects SET status = LOWER(status) WHERE status != LOWER(status)")


def downgrade() -> None:
    pass
