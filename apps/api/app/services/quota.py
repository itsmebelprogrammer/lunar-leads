from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user_quota import UserQuota
from datetime import datetime, timezone
import uuid

MONTHLY_LIMIT = 5

def to_uuid(value) -> uuid.UUID:
    if isinstance(value, uuid.UUID):
        return value
    return uuid.UUID(str(value))

async def get_quota(user_id, db: AsyncSession) -> UserQuota:
    month = datetime.now(timezone.utc).strftime("%Y-%m")
    uid = to_uuid(user_id)
    result = await db.execute(
        select(UserQuota).where(UserQuota.user_id == uid, UserQuota.month == month)
    )
    quota = result.scalar_one_or_none()
    if not quota:
        quota = UserQuota(user_id=uid, month=month, leads_used=0)
        db.add(quota)
        await db.commit()
        await db.refresh(quota)
    return quota

async def check_quota(user_id, db: AsyncSession) -> bool:
    quota = await get_quota(user_id, db)
    return quota.leads_used < MONTHLY_LIMIT

async def consume_quota(user_id, amount: int, db: AsyncSession):
    quota = await get_quota(user_id, db)
    quota.leads_used += amount
    await db.commit()