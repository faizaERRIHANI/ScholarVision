import uuid as uuid_lib
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.staff import Staff
from app.schemas.staff import StaffCreate, StaffUpdate, StaffResponse

router = APIRouter(prefix="/staff", tags=["Personnel"])

@router.get("", response_model=list[StaffResponse])
async def list_staff(role: Optional[str] = None, is_active: Optional[bool] = True,
    db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    q = select(Staff)
    if is_active is not None: q = q.where(Staff.is_active == is_active)
    if role: q = q.where(Staff.role == role)
    result = await db.execute(q)
    return [StaffResponse.model_validate(s) for s in result.scalars().all()]

@router.post("", response_model=StaffResponse, status_code=201)
async def create_staff(data: StaffCreate, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","secretaire"))):
    if not data.employee_number:
        data.employee_number = f"ST-{uuid_lib.uuid4().hex[:6].upper()}"
    payload = data.model_dump(exclude={"email"})
    staff = Staff(**payload)
    db.add(staff); await db.commit(); await db.refresh(staff)
    return StaffResponse.model_validate(staff)

@router.get("/leaves")
async def list_leaves(current_user=Depends(require_role("directeur","secretaire"))):
    return {"leaves": [], "message": "Module congés à implémenter"}

@router.get("/{staff_id}", response_model=StaffResponse)
async def get_staff(staff_id: UUID, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    r = await db.execute(select(Staff).where(Staff.id == staff_id))
    s = r.scalar_one_or_none()
    if not s: raise HTTPException(404, "Personnel introuvable")
    return StaffResponse.model_validate(s)

@router.put("/{staff_id}", response_model=StaffResponse)
async def update_staff(staff_id: UUID, data: StaffUpdate, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","secretaire"))):
    r = await db.execute(select(Staff).where(Staff.id == staff_id))
    s = r.scalar_one_or_none()
    if not s: raise HTTPException(404, "Personnel introuvable")
    for k, v in data.model_dump(exclude_none=True).items(): setattr(s, k, v)
    await db.commit(); await db.refresh(s)
    return StaffResponse.model_validate(s)

@router.delete("/{staff_id}")
async def delete_staff(staff_id: UUID, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur"))):
    r = await db.execute(select(Staff).where(Staff.id == staff_id))
    s = r.scalar_one_or_none()
    if not s: raise HTTPException(404, "Personnel introuvable")
    s.is_active = False; await db.commit()
    return {"message": "Personnel désactivé"}

@router.get("/{staff_id}/schedule")
async def get_staff_schedule(staff_id: UUID, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.schedule import Schedule
    r = await db.execute(select(Schedule).where(Schedule.staff_id == staff_id, Schedule.is_active == True))
    slots = r.scalars().all()
    return {"staff_id": str(staff_id), "slots": [{"id":str(s.id),"day":s.day_of_week,"start":str(s.start_time),"end":str(s.end_time)} for s in slots]}

@router.get("/{staff_id}/classes")
async def get_staff_classes(staff_id: UUID, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.schedule import Schedule
    from app.models.classroom import Classroom
    r = await db.execute(select(Schedule.classroom_id).where(Schedule.staff_id == staff_id).distinct())
    ids = [row[0] for row in r.all()]
    classes = []
    for cid in ids:
        cr = await db.execute(select(Classroom).where(Classroom.id == cid))
        c = cr.scalar_one_or_none()
        if c: classes.append({"id":str(c.id),"name":c.name,"level":str(c.level)})
    return {"staff_id": str(staff_id), "classes": classes}

@router.post("/{staff_id}/leave")
async def request_leave(staff_id: UUID, data: dict, current_user=Depends(get_current_user)):
    return {"message": "Demande de congé enregistrée", "staff_id": str(staff_id)}
