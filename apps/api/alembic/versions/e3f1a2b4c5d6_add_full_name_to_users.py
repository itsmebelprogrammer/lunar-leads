"""add_full_name_to_users

Revision ID: e3f1a2b4c5d6
Revises: df5073ed30fa
Create Date: 2026-04-28 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'e3f1a2b4c5d6'
down_revision: Union[str, Sequence[str], None] = 'df5073ed30fa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(sa.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(200)"))


def downgrade() -> None:
    op.drop_column('users', 'full_name')
