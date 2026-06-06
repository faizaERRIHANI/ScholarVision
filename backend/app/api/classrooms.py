from typing import Optional
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.classroom import Classroom
from app.models.student import Student
from app.schemas.classroom import ClassroomCreate, ClassroomUpdate, ClassroomResponse

router = APIRouter(prefix="/classrooms", tags=["Classes"])

@router.get("", response_model=list[ClassroomResponse])
async def list_classrooms(academic_year: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    q = select(Classroom)
    if academic_year: q = q.where(Classroom.academic_year == academic_year)
    result = await db.execute(q)
    classrooms = result.scalars().all()
    items = []
    for c in classrooms:
        cr = ClassroomResponse.model_validate(c)
        cnt = (await db.execute(select(func.count(Student.id)).where(Student.class_id == c.id, Student.is_active == True))).scalar_one()
        cr.student_count = cnt
        items.append(cr)
    return items

@router.post("", response_model=ClassroomResponse, status_code=201)
async def create_classroom(data: ClassroomCreate, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur"))):
    c = Classroom(**data.model_dump())
    db.add(c); await db.commit(); await db.refresh(c)
    return ClassroomResponse.model_validate(c)

@router.get("/{class_id}", response_model=ClassroomResponse)
async def get_classroom(class_id: UUID, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    r = await db.execute(select(Classroom).where(Classroom.id == class_id))
    c = r.scalar_one_or_none()
    if not c: raise HTTPException(404, "Classe introuvable")
    return ClassroomResponse.model_validate(c)

@router.put("/{class_id}", response_model=ClassroomResponse)
async def update_classroom(class_id: UUID, data: ClassroomUpdate, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur"))):
    r = await db.execute(select(Classroom).where(Classroom.id == class_id))
    c = r.scalar_one_or_none()
    if not c: raise HTTPException(404, "Classe introuvable")
    for k, v in data.model_dump(exclude_none=True).items(): setattr(c, k, v)
    await db.commit(); await db.refresh(c)
    return ClassroomResponse.model_validate(c)

@router.delete("/{class_id}")
async def delete_classroom(class_id: UUID, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur"))):
    r = await db.execute(select(Classroom).where(Classroom.id == class_id))
    c = r.scalar_one_or_none()
    if not c: raise HTTPException(404, "Classe introuvable")
    await db.delete(c); await db.commit()
    return {"message": "Classe supprimée"}

@router.get("/{class_id}/students")
async def get_classroom_students(class_id: UUID, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    r = await db.execute(select(Student).where(Student.class_id == class_id, Student.is_active == True))
    students = r.scalars().all()
    return {"class_id":str(class_id), "students":[{"id":str(s.id),"name":f"{s.first_name} {s.last_name}","number":s.student_number} for s in students]}

@router.get("/{class_id}/schedule")
async def get_classroom_schedule(class_id: UUID, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.schedule import Schedule
    r = await db.execute(select(Schedule).where(Schedule.classroom_id == class_id, Schedule.is_active == True).order_by(Schedule.day_of_week, Schedule.start_time))
    slots = r.scalars().all()
    return {"class_id":str(class_id), "slots":[{"id":str(s.id),"day":s.day_of_week,"start":str(s.start_time),"end":str(s.end_time)} for s in slots]}

@router.get("/{class_id}/attendance")
async def get_classroom_attendance(class_id: UUID, date_param: Optional[date] = Query(None, alias="date"),
    db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.attendance import Attendance
    ids_r = await db.execute(select(Student.id).where(Student.class_id == class_id))
    ids = [row[0] for row in ids_r.all()]
    q = select(Attendance).where(Attendance.student_id.in_(ids))
    if date_param: q = q.where(Attendance.date == date_param)
    r = await db.execute(q)
    records = r.scalars().all()
    return {"class_id":str(class_id), "records":[{"id":str(r.id),"student_id":str(r.student_id),"status":r.status} for r in records]}

@router.get("/{class_id}/grades")
async def get_classroom_grades(class_id: UUID, semester: int = Query(1, ge=1, le=3),
    db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.grade import Grade
    r = await db.execute(select(Grade).where(Grade.classroom_id == class_id, Grade.semester == semester))
    grades = r.scalars().all()
    return {"class_id":str(class_id), "semester":semester, "grades":[{"id":str(g.id),"student_id":str(g.student_id),"score":g.score} for g in grades]}
