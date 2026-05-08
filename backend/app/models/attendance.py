import enum
import uuid
from datetime import date as date_type, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, Enum as SQLEnum, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class AttendanceSession(str, enum.Enum):
    MATIN = "matin"
    APRES_MIDI = "apres-midi"


class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    RETARD = "retard"
    JUSTIFIED = "justified"


class DetectionMethod(str, enum.Enum):
    FACIAL = "facial"
    MANUEL = "manuel"
    APPEL = "appel"


class Attendance(BaseModel):
    __tablename__ = "attendance"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    date: Mapped[date_type] = mapped_column(Date, nullable=False, index=True)
    session: Mapped[AttendanceSession] = mapped_column(
        SQLEnum(AttendanceSession, name="attendance_session_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    status: Mapped[AttendanceStatus] = mapped_column(
        SQLEnum(AttendanceStatus, name="attendance_status_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False, index=True,
    )
    detection_method: Mapped[DetectionMethod] = mapped_column(
        SQLEnum(DetectionMethod, name="detection_method_enum", values_callable=lambda x: [e.value for e in x]),
        default=DetectionMethod.MANUEL, nullable=False,
    )
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    detected_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    justified_by: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    justification_document_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    staff_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("staff.id", ondelete="SET NULL"), nullable=True,
    )

    student: Mapped["Student"] = relationship("Student", back_populates="attendances")
    validated_by: Mapped[Optional["Staff"]] = relationship("Staff", foreign_keys=[staff_id])
