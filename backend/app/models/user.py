import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Enum as SQLEnum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class UserRole(str, enum.Enum):
    DIRECTEUR = "directeur"
    ENSEIGNANT = "enseignant"
    SECRETAIRE = "secretaire"
    PARENT = "parent"
    ELEVE = "eleve"


class User(BaseModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="user_role_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False, index=True,
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    student_profile: Mapped[Optional["Student"]] = relationship(
        "Student", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    staff_profile: Mapped[Optional["Staff"]] = relationship(
        "Staff", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    notifications: Mapped[list["Notification"]] = relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
