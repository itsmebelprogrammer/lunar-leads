import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base

class Job(Base):
    __tablename__ = "jobs"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    state_id: Mapped[int] = mapped_column(ForeignKey("states.id"))
    niche_id: Mapped[int] = mapped_column(ForeignKey("niches.id"))
    job_month: Mapped[str | None] = mapped_column(String(7), nullable=True)
    status: Mapped[str] = mapped_column(Enum("QUEUED","RUNNING","DONE","FAILED","CANCELLED", name="jobstatus", create_type=False), default="QUEUED")
    export_format: Mapped[str] = mapped_column(Enum("CSV","XLSX", name="exportformat", create_type=False), default="CSV")
    selected_columns: Mapped[list] = mapped_column(JSON, default=list)
    leads_limit: Mapped[int] = mapped_column(Integer, default=5)
    leads_found: Mapped[int] = mapped_column(Integer, default=0)
    error_code: Mapped[str | None] = mapped_column(String(100), nullable=True)
    error_message: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    user: Mapped["User"] = relationship(back_populates="jobs")
    events: Mapped[list["JobEvent"]] = relationship(back_populates="job", cascade="all, delete")
    leads: Mapped[list["Lead"]] = relationship(back_populates="job", cascade="all, delete")