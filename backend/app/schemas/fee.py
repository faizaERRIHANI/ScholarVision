from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import date, datetime

class FeeCreate(BaseModel):
    student_id: UUID
    academic_year: str = "2024-2025"
    fee_type: str = "scolarite"
    total_amount: float
    due_date: Optional[date] = None
    notes: Optional[str] = None

class FeeUpdate(BaseModel):
    total_amount: Optional[float] = None
    due_date: Optional[date] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class FeeResponse(BaseModel):
    id: UUID
    student_id: UUID
    student_name: Optional[str] = None
    academic_year: str
    fee_type: str
    total_amount: float
    paid_amount: float
    remaining_amount: float
    due_date: Optional[date] = None
    paid_date: Optional[date] = None
    status: str
    payment_method: Optional[str] = None
    receipt_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class PaymentCreate(BaseModel):
    fee_id: UUID
    amount: float
    payment_method: str = "especes"
    paid_date: Optional[date] = None
    receipt_number: Optional[str] = None
    notes: Optional[str] = None

class FamilyFinanceReport(BaseModel):
    student_id: UUID
    student_name: str
    academic_year: str
    fees: List[FeeResponse]
    total_due: float
    total_paid: float
    total_remaining: float
    is_up_to_date: bool
