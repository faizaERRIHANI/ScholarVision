import enum
import uuid
from datetime import date as date_type
from decimal import Decimal
from typing import Optional

from sqlalchemy import Date, Enum as SQLEnum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class FeeType(str, enum.Enum):
    SCOLARITE = "scolarite"
    TRANSPORT = "transport"
    CANTINE = "cantine"
    ACTIVITE = "activite"


class FeeStatus(str, enum.Enum):
    PENDING = "pending"
    PARTIAL = "partial"
    PAID = "paid"
    OVERDUE = "overdue"


class PaymentMethod(str, enum.Enum):
    ESPECES = "especes"
    VIREMENT = "virement"
    CHEQUE = "cheque"
    CARTE = "carte"


class Fee(BaseModel):
    __tablename__ = "fees"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    academic_year: Mapped[str] = mapped_column(String(9), nullable=False, index=True)
    fee_type: Mapped[FeeType] = mapped_column(
        SQLEnum(FeeType, name="fee_type_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    paid_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    remaining_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    due_date: Mapped[date_type] = mapped_column(Date, nullable=False, index=True)
    paid_date: Mapped[Optional[date_type]] = mapped_column(Date, nullable=True)
    status: Mapped[FeeStatus] = mapped_column(
        SQLEnum(FeeStatus, name="fee_status_enum", values_callable=lambda x: [e.value for e in x]),
        default=FeeStatus.PENDING, nullable=False, index=True,
    )
    payment_method: Mapped[Optional[PaymentMethod]] = mapped_column(
        SQLEnum(PaymentMethod, name="payment_method_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=True,
    )
    receipt_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, unique=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    student: Mapped["Student"] = relationship("Student", back_populates="fees")
