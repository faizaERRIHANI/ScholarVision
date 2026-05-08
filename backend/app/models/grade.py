import enum
import uuid
from datetime import date as date_type
from decimal import Decimal
from typing import Optional

from sqlalchemy import Date, Enum as SQLEnum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class GradeType(str, enum.Enum):
    DEVOIR = "devoir"
    EXAMEN = "examen"
    ORAL = "oral"
    TP = "tp"
    PROJET = "projet"


class Grade(BaseModel):
    __tablename__ = "grades"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    subject_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    staff_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("staff.id", ondelete="SET NULL"), nullable=True,
    )
    classroom_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("classrooms.id", ondelete="SET NULL"),
        nullable=True, index=True,
    )

    academic_year: Mapped[str] = mapped_column(String(9), nullable=False, index=True)
    semester: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    grade_type: Mapped[GradeType] = mapped_column(
        SQLEnum(GradeType, name="grade_type_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    score: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    coefficient: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    date: Mapped[date_type] = mapped_column(Date, nullable=False, default=date_type.today, index=True)
    comments: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    student: Mapped["Student"] = relationship("Student", back_populates="grades")
    subject: Mapped["Subject"] = relationship("Subject", back_populates="grades")
    staff: Mapped[Optional["Staff"]] = relationship("Staff", back_populates="grades_given")
    classroom: Mapped[Optional["Classroom"]] = relationship("Classroom", back_populates="grades")
