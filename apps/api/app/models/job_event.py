import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base

class JobEvent(Base):
    __tablename__ = "job_events"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("jobs.id"))
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    level: Mapped[str] = mapped_column(Enum("INFO","WARN","ERROR", name="eventlevel", create_type=True), default="INFO")
    message: Mapped[str] = mapped_column(String(1000))
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    job: Mapped["Job"] = relationship(back_populates="events")