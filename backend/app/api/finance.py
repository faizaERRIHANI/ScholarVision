from typing import Optional
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.fee import Fee
from app.models.student import Student
from app.schemas.fee import FeeCreate, FeeUpdate, FeeResponse, PaymentCreate, FamilyFinanceReport

router = APIRouter(prefix="/finance", tags=["Finances"])

@router.get("/fees", response_model=list[FeeResponse])
async def list_fees(status_filter: Optional[str]=Query(None,alias="status"),
    student_id: Optional[UUID]=None, academic_year: Optional[str]=None,
    db: AsyncSession = Depends(get_db), current_user=Depends(require_role("directeur","secretaire"))):
    q = select(Fee)
    if status_filter: q = q.where(Fee.status == status_filter)
    if student_id: q = q.where(Fee.student_id == student_id)
    if academic_year: q = q.where(Fee.academic_year == academic_year)
    r = await db.execute(q.order_by(Fee.due_date))
    return [FeeResponse.model_validate(f) for f in r.scalars().all()]

@router.post("/fees", response_model=FeeResponse, status_code=201)
async def create_fee(data: FeeCreate, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","secretaire"))):
    fee = Fee(**data.model_dump())
    fee.paid_amount = 0.0; fee.remaining_amount = data.total_amount; fee.status = "pending"
    db.add(fee); await db.commit(); await db.refresh(fee)
    return FeeResponse.model_validate(fee)

@router.post("/payments")
async def record_payment(data: PaymentCreate, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","secretaire"))):
    r = await db.execute(select(Fee).where(Fee.id == data.fee_id))
    fee = r.scalar_one_or_none()
    if not fee: raise HTTPException(404, "Frais introuvable")
    fee.paid_amount = (fee.paid_amount or 0) + data.amount
    fee.remaining_amount = max(0, fee.total_amount - fee.paid_amount)
    fee.paid_date = data.paid_date or date.today()
    fee.payment_method = data.payment_method
    if data.receipt_number: fee.receipt_number = data.receipt_number
    fee.status = "paid" if fee.remaining_amount <= 0 else ("partial" if fee.paid_amount > 0 else "pending")
    await db.commit()
    return {"message": "Paiement enregistré", "fee_id": str(fee.id), "remaining": fee.remaining_amount}

@router.get("/student/{student_id}", response_model=FamilyFinanceReport)
async def student_finance(student_id: UUID, academic_year: str=Query("2024-2025"),
    db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    sr = await db.execute(select(Student).where(Student.id == student_id))
    student = sr.scalar_one_or_none()
    if not student: raise HTTPException(404, "Élève introuvable")
    r = await db.execute(select(Fee).where(Fee.student_id==student_id, Fee.academic_year==academic_year))
    fees = r.scalars().all()
    total_due = sum(f.total_amount for f in fees); total_paid = sum(f.paid_amount or 0 for f in fees)
    return FamilyFinanceReport(student_id=student_id, student_name=f"{student.first_name} {student.last_name}",
        academic_year=academic_year, fees=[FeeResponse.model_validate(f) for f in fees],
        total_due=total_due, total_paid=total_paid, total_remaining=total_due-total_paid,
        is_up_to_date=(total_due-total_paid)<=0)

@router.get("/summary")
async def finance_summary(academic_year: str=Query("2024-2025"),
    db: AsyncSession = Depends(get_db), current_user=Depends(require_role("directeur","secretaire"))):
    r = await db.execute(select(func.sum(Fee.total_amount).label("due"), func.sum(Fee.paid_amount).label("paid"),
        func.count(Fee.id).label("total")).where(Fee.academic_year == academic_year))
    row = r.one()
    due = float(row.due or 0); paid = float(row.paid or 0)
    return {"academic_year":academic_year,"total_due":due,"total_paid":paid,
        "total_remaining":due-paid,"recovery_rate":round(paid/due*100 if due else 0,1),"total_fees":row.total}

@router.get("/report/monthly")
async def monthly_report(month: str=Query(...),
    db: AsyncSession = Depends(get_db), current_user=Depends(require_role("directeur","secretaire"))):
    year, mon = int(month.split("-")[0]), int(month.split("-")[1])
    r = await db.execute(select(Fee).where(extract("year",Fee.paid_date)==year,
        extract("month",Fee.paid_date)==mon, Fee.status.in_(["paid","partial"])))
    fees = r.scalars().all()
    return {"month":month,"total_collected":sum(f.paid_amount or 0 for f in fees),"payments_count":len(fees)}

@router.post("/reminders/send")
async def send_reminders(db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","secretaire"))):
    r = await db.execute(select(Fee).where(Fee.status.in_(["pending","overdue","partial"])))
    overdue = r.scalars().all()
    return {"message": f"Relances simulées pour {len(overdue)} dossier(s)", "count": len(overdue)}
