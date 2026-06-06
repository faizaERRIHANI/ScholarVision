from typing import Optional
from uuid import UUID
from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.config import settings
from app.models.attendance import Attendance
from app.models.student import Student
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate, AttendanceResponse, FacialAttendancePayload, JustifyRequest

router = APIRouter(prefix="/attendance", tags=["Présences"])

@router.get("", response_model=list[AttendanceResponse])
async def list_attendance(student_id: Optional[UUID]=None, class_id: Optional[UUID]=None,
    status_filter: Optional[str]=Query(None,alias="status"), date_from: Optional[date]=None,
    date_to: Optional[date]=None, limit: int=Query(50,le=200),
    db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    q = select(Attendance).order_by(Attendance.date.desc())
    if student_id: q = q.where(Attendance.student_id == student_id)
    if status_filter: q = q.where(Attendance.status == status_filter)
    if date_from: q = q.where(Attendance.date >= date_from)
    if date_to: q = q.where(Attendance.date <= date_to)
    if class_id:
        ids_r = await db.execute(select(Student.id).where(Student.class_id == class_id))
        ids = [row[0] for row in ids_r.all()]
        q = q.where(Attendance.student_id.in_(ids))
    r = await db.execute(q.limit(limit))
    return [AttendanceResponse.model_validate(rec) for rec in r.scalars().all()]

@router.post("", response_model=AttendanceResponse, status_code=201)
async def create_attendance(data: AttendanceCreate, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","enseignant","secretaire"))):
    record = Attendance(**data.model_dump())
    record.detected_at = datetime.now(timezone.utc)
    db.add(record); await db.commit(); await db.refresh(record)
    return AttendanceResponse.model_validate(record)

@router.post("/facial", response_model=AttendanceResponse, status_code=201)
async def facial_attendance(data: FacialAttendancePayload, db: AsyncSession = Depends(get_db)):
    if data.ml_api_key != settings.ML_API_KEY:
        raise HTTPException(403, "Clé API ML invalide")
    existing = await db.execute(select(Attendance).where(
        Attendance.student_id == data.student_id,
        Attendance.date == data.detected_at.date(),
        Attendance.session == data.session))
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Présence déjà enregistrée pour cette session")
    record = Attendance(student_id=data.student_id, date=data.detected_at.date(),
        session=data.session, status="present", detection_method="facial",
        confidence_score=data.confidence_score, detected_at=data.detected_at)
    db.add(record); await db.commit(); await db.refresh(record)
    try:
        from app.api.websocket import manager
        import json
        sr = await db.execute(select(Student).where(Student.id == data.student_id))
        s = sr.scalar_one_or_none()
        if s:
            await manager.broadcast_all(json.dumps({"type":"attendance_recorded",
                "student_id":str(data.student_id),"student_name":f"{s.first_name} {s.last_name}",
                "timestamp":data.detected_at.isoformat(),"confidence":data.confidence_score}))
    except Exception:
        pass
    return AttendanceResponse.model_validate(record)

@router.put("/{attendance_id}", response_model=AttendanceResponse)
async def update_attendance(attendance_id: UUID, data: AttendanceUpdate,
    db: AsyncSession = Depends(get_db), current_user=Depends(require_role("directeur","enseignant","secretaire"))):
    r = await db.execute(select(Attendance).where(Attendance.id == attendance_id))
    record = r.scalar_one_or_none()
    if not record: raise HTTPException(404, "Enregistrement introuvable")
    for k, v in data.model_dump(exclude_none=True).items(): setattr(record, k, v)
    await db.commit(); await db.refresh(record)
    return AttendanceResponse.model_validate(record)

@router.post("/justify/{attendance_id}")
async def justify_absence(attendance_id: UUID, data: JustifyRequest,
    db: AsyncSession = Depends(get_db), current_user=Depends(require_role("directeur","secretaire"))):
    r = await db.execute(select(Attendance).where(Attendance.id == attendance_id))
    record = r.scalar_one_or_none()
    if not record: raise HTTPException(404, "Enregistrement introuvable")
    record.status = "justified"; record.justified_by = data.justified_by
    record.notes = data.notes; await db.commit()
    return {"message": "Absence justifiée"}

@router.get("/daily-report")
async def daily_report(report_date: date = Query(..., alias="date"),
    class_id: Optional[UUID]=None, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    q = select(Attendance).where(Attendance.date == report_date)
    if class_id:
        ids_r = await db.execute(select(Student.id).where(Student.class_id == class_id))
        ids = [row[0] for row in ids_r.all()]
        q = q.where(Attendance.student_id.in_(ids))
    r = await db.execute(q)
    records = r.scalars().all()
    statuses = [rec.status for rec in records]
    total = len(statuses); present = statuses.count("present")
    return {"date":str(report_date),"total":total,"present":present,"absent":statuses.count("absent"),
        "late":statuses.count("retard"),"justified":statuses.count("justified"),
        "attendance_rate":round(present/total*100 if total else 0,1),
        "records":[AttendanceResponse.model_validate(rec) for rec in records]}

@router.get("/stats/monthly")
async def monthly_stats(month: str=Query(...), class_id: Optional[UUID]=None,
    db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    year, mon = int(month.split("-")[0]), int(month.split("-")[1])
    q = select(Attendance).where(extract("year",Attendance.date)==year, extract("month",Attendance.date)==mon)
    if class_id:
        ids_r = await db.execute(select(Student.id).where(Student.class_id == class_id))
        ids = [row[0] for row in ids_r.all()]
        q = q.where(Attendance.student_id.in_(ids))
    r = await db.execute(q)
    records = r.scalars().all()
    total = len(records); present = sum(1 for rec in records if rec.status == "present")
    return {"month":month,"total_sessions":total,"present":present,"absent":total-present,
        "attendance_rate":round(present/total*100 if total else 0,1)}

@router.get("/alerts")
async def get_alerts(db: AsyncSession = Depends(get_db), current_user=Depends(require_role("directeur","secretaire"))):
    r = await db.execute(select(Attendance.student_id, func.count(Attendance.id).label("cnt"))
        .where(Attendance.status == "absent").group_by(Attendance.student_id)
        .having(func.count(Attendance.id) >= 3).order_by(func.count(Attendance.id).desc()).limit(20))
    alerts = []
    for row in r.all():
        sr = await db.execute(select(Student).where(Student.id == row.student_id))
        s = sr.scalar_one_or_none()
        if s: alerts.append({"student_id":str(s.id),"student_name":f"{s.first_name} {s.last_name}","absent_count":row.cnt})
    return {"alerts": alerts}
