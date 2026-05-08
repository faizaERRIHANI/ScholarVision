import enum
import uuid
from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import Boolean, Date, Enum as SQLEnum, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class StaffRole(str, enum.Enum):
    ENSEIGNANT = "enseignant"
    SECRETAIRE = "secretaire"
    VIE_SCOLAIRE = "vie_scolaire"
    TECHNIQUE = "technique"


class ContractType(str, enum.Enum):
    CDI = "CDI"
    CDD = "CDD"
    VACATAIRE = "vacataire"


class Staff(BaseModel):
    __tablename__ = "staff"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True, unique=True,
    )
    employee_number: Mapped[str] = mapped_column(String(30), unique=True, nullable=False, index=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    role: Mapped[StaffRole] = mapped_column(
        SQLEnum(StaffRole, name="staff_role_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False, index=True,
    )
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    specialization: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    contract_type: Mapped[ContractType] = mapped_column(
        SQLEnum(ContractType, name="contract_type_enum", values_callable=lambda x: [e.value for e in x]),
        default=ContractType.CDI, nullable=False,
    )
    contract_start: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    contract_end: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    hourly_rate: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    monthly_salary: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    hire_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    diploma: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    years_experience: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="staff_profile")
    head_of_classes: Mapped[list["Classroom"]] = relationship(
        "Classroom", foreign_keys="Classroom.head_teacher_id", back_populates="head_teacher"
    )
    schedules: Mapped[list["Schedule"]] = relationship("Schedule", back_populates="staff")
    grades_given: Mapped[list["Grade"]] = relationship("Grade", back_populates="staff")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
