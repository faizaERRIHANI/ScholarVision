import uuid
from datetime import time
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Schedule(BaseModel):
    __tablename__ = "schedules"

    classroom_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("classrooms.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    subject_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False,
    )
    staff_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("staff.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )

    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    room: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    academic_year: Mapped[str] = mapped_column(String(9), nullable=False, index=True)
    semester: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    classroom: Mapped["Classroom"] = relationship("Classroom", back_populates="schedules")
    subject: Mapped["Subject"] = relationship("Subject", back_populates="schedules")
    staff: Mapped["Staff"] = relationship("Staff", back_populates="schedules")
