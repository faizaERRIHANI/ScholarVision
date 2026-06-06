from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.schedule import Schedule
from app.schemas.schedule import ScheduleCreate, ScheduleUpdate, ScheduleResponse, ConflictCheck

router = APIRouter(prefix="/schedule", tags=["Emploi du temps"])

@router.get("", response_model=list[ScheduleResponse])
async def list_schedule(class_id: Optional[UUID]=None, staff_id: Optional[UUID]=None,
    db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    q = select(Schedule).where(Schedule.is_active == True)
    if class_id: q = q.where(Schedule.classroom_id == class_id)
    if staff_id: q = q.where(Schedule.staff_id == staff_id)
    r = await db.execute(q.order_by(Schedule.day_of_week, Schedule.start_time))
    return [ScheduleResponse.model_validate(s) for s in r.scalars().all()]

@router.post("", response_model=ScheduleResponse, status_code=201)
async def create_schedule(data: ScheduleCreate, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","secretaire"))):
    conflict = await db.execute(select(Schedule).where(Schedule.staff_id==data.staff_id,
        Schedule.day_of_week==data.day_of_week, Schedule.is_active==True,
        Schedule.start_time < data.end_time, Schedule.end_time > data.start_time))
    if conflict.scalar_one_or_none():
        raise HTTPException(409, "Conflit détecté : professeur déjà occupé sur ce créneau")
    slot = Schedule(**data.model_dump())
    db.add(slot); await db.commit(); await db.refresh(slot)
    return ScheduleResponse.model_validate(slot)

@router.get("/weekly")
async def weekly_schedule(class_id: UUID, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    r = await db.execute(select(Schedule).where(Schedule.classroom_id==class_id, Schedule.is_active==True)
        .order_by(Schedule.day_of_week, Schedule.start_time))
    slots = r.scalars().all()
    by_day = {}
    for s in slots:
        by_day.setdefault(str(s.day_of_week), []).append(ScheduleResponse.model_validate(s))
    return {"class_id": str(class_id), "schedule": by_day}

@router.get("/check-conflicts")
async def check_conflicts(staff_id: UUID, day: int, start: str, end: str,
    db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    from datetime import time
    start_t = time.fromisoformat(start); end_t = time.fromisoformat(end)
    r = await db.execute(select(Schedule).where(Schedule.staff_id==staff_id, Schedule.day_of_week==day,
        Schedule.is_active==True, Schedule.start_time < end_t, Schedule.end_time > start_t))
    c = r.scalar_one_or_none()
    return ConflictCheck(has_conflict=c is not None,
        conflicts=[{"id":str(c.id),"start":str(c.start_time),"end":str(c.end_time)}] if c else [],
        message="Conflit détecté" if c else "Aucun conflit")

@router.put("/{slot_id}", response_model=ScheduleResponse)
async def update_schedule(slot_id: UUID, data: ScheduleUpdate, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","secretaire"))):
    r = await db.execute(select(Schedule).where(Schedule.id == slot_id))
    s = r.scalar_one_or_none()
    if not s: raise HTTPException(404, "Créneau introuvable")
    for k, v in data.model_dump(exclude_none=True).items(): setattr(s, k, v)
    await db.commit(); await db.refresh(s)
    return ScheduleResponse.model_validate(s)

@router.delete("/{slot_id}")
async def delete_schedule(slot_id: UUID, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","secretaire"))):
    r = await db.execute(select(Schedule).where(Schedule.id == slot_id))
    s = r.scalar_one_or_none()
    if not s: raise HTTPException(404, "Créneau introuvable")
    s.is_active = False; await db.commit()
    return {"message": "Créneau supprimé"}
