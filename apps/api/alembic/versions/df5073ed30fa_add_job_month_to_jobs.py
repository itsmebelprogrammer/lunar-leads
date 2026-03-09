"""add_job_month_to_jobs

Revision ID: df5073ed30fa
Revises: 792c01001227
Create Date: 2026-03-08 23:43:23.460634

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

revision: str = 'df5073ed30fa'
down_revision: Union[str, Sequence[str], None] = '792c01001227'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(text("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_month VARCHAR(7)"))


def downgrade() -> None:
    op.drop_column('jobs', 'job_month')