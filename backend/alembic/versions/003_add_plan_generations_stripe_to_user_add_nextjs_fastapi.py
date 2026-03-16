"""Add plan, generations, stripe to user; add nextjs, fastapi to framework

Revision ID: 003
Revises: 002
Create Date: 2026-03-15 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def column_exists(table, column):
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)
    columns = [c['name'] for c in inspector.get_columns(table)]
    return column in columns


def upgrade() -> None:
    if not column_exists('users', 'plan'):
        op.add_column('users', sa.Column('plan', sa.String(50), nullable=False, server_default='free'))
    if not column_exists('users', 'generations_used'):
        op.add_column('users', sa.Column('generations_used', sa.Integer(), nullable=False, server_default='0'))
    if not column_exists('users', 'stripe_customer_id'):
        op.add_column('users', sa.Column('stripe_customer_id', sa.String(255), nullable=True))

    op.execute("ALTER TYPE framework ADD VALUE IF NOT EXISTS 'nextjs'")
    op.execute("ALTER TYPE framework ADD VALUE IF NOT EXISTS 'fastapi'")


def downgrade() -> None:
    op.drop_column('users', 'stripe_customer_id')
    op.drop_column('users', 'generations_used')
    op.drop_column('users', 'plan')
