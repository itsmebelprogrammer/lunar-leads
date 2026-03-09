import uuid
from sqlalchemy import String, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class UserQuota(Base):
    __tablename__ = "user_quotas"
    __table_args__ = (UniqueConstraint("user_id", "month", name="uq_user_quota_month"),)
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    month: Mapped[str] = mapped_column(String(7), nullable=False)
    leads_used: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    user: Mapped["User"] = relationship(back_populates="quota")