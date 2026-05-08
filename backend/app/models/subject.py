from typing import Optional

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Subject(BaseModel):
    __tablename__ = "subjects"

    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    coefficient: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    hours_per_week: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    color_hex: Mapped[str] = mapped_column(String(7), default="#3b82f6", nullable=False)

    schedules: Mapped[list["Schedule"]] = relationship("Schedule", back_populates="subject")
    grades: Mapped[list["Grade"]] = relationship("Grade", back_populates="subject")
