"""Add plan, generations, stripe to user; add nextjs, fastapi to framework

Revision ID: 003
Revises: 002
Create Date: 2024-03-15 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add columns to users table
    op.add_column('users', sa.Column('plan', sa.String(50), nullable=False, server_default='free'))
    op.add_column('users', sa.Column('generations_used', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('stripe_customer_id', sa.String(255), nullable=True))

    # Add new enum values using raw SQL (safe for PostgreSQL)
    op.execute("ALTER TYPE framework ADD VALUE IF NOT EXISTS 'nextjs'")
    op.execute("ALTER TYPE framework ADD VALUE IF NOT EXISTS 'fastapi'")


def downgrade() -> None:
    op.drop_column('users', 'stripe_customer_id')
    op.drop_column('users', 'generations_used')
    op.drop_column('users', 'plan')
