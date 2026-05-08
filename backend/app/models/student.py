import enum
import uuid
from datetime import date
from typing import Optional

from sqlalchemy import Boolean, Date, Enum as SQLEnum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Gender(str, enum.Enum):
    M = "M"
    F = "F"


class Student(BaseModel):
    __tablename__ = "students"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True, unique=True,
    )
    student_number: Mapped[str] = mapped_column(String(30), unique=True, nullable=False, index=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    gender: Mapped[Gender] = mapped_column(
        SQLEnum(Gender, name="gender_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    nationality: Mapped[str] = mapped_column(String(50), default="Marocaine", nullable=False)

    class_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("classrooms.id", ondelete="SET NULL"),
        nullable=True, index=True,
    )
    level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    parent1_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    parent1_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    parent1_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    parent2_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    parent2_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    parent2_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    medical_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    enrollment_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="student_profile")
    classroom: Mapped[Optional["Classroom"]] = relationship("Classroom", back_populates="students")
    attendances: Mapped[list["Attendance"]] = relationship(
        "Attendance", back_populates="student", cascade="all, delete-orphan"
    )
    grades: Mapped[list["Grade"]] = relationship(
        "Grade", back_populates="student", cascade="all, delete-orphan"
    )
    fees: Mapped[list["Fee"]] = relationship(
        "Fee", back_populates="student", cascade="all, delete-orphan"
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
