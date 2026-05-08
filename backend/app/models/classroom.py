import enum
import uuid
from typing import Optional

from sqlalchemy import Enum as SQLEnum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class EducationLevel(str, enum.Enum):
    CP = "CP"
    CE1 = "CE1"
    CE2 = "CE2"
    CM1 = "CM1"
    CM2 = "CM2"
    SIXIEME = "6e"
    CINQUIEME = "5e"
    QUATRIEME = "4e"
    TROISIEME = "3e"
    SECONDE = "2nde"
    PREMIERE = "1ere"
    TERMINALE = "Term"


class Classroom(BaseModel):
    __tablename__ = "classrooms"

    name: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    level: Mapped[EducationLevel] = mapped_column(
        SQLEnum(EducationLevel, name="education_level_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False, index=True,
    )
    section: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)
    capacity: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    room_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    head_teacher_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("staff.id", ondelete="SET NULL"), nullable=True,
    )
    academic_year: Mapped[str] = mapped_column(String(9), nullable=False, index=True)

    head_teacher: Mapped[Optional["Staff"]] = relationship(
        "Staff", foreign_keys=[head_teacher_id], back_populates="head_of_classes"
    )
    students: Mapped[list["Student"]] = relationship("Student", back_populates="classroom")
    schedules: Mapped[list["Schedule"]] = relationship(
        "Schedule", back_populates="classroom", cascade="all, delete-orphan"
    )
    grades: Mapped[list["Grade"]] = relationship("Grade", back_populates="classroom")
