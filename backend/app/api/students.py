import csv, io, os, uuid as uuid_lib
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.config import settings
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse, StudentListResponse, StudentBulkImport

router = APIRouter(prefix="/students", tags=["Élèves"])

@router.get("", response_model=StudentListResponse)
async def list_students(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None, class_id: Optional[UUID] = None,
    level: Optional[str] = None, is_active: Optional[bool] = True,
    db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    q = select(Student)
    if is_active is not None: q = q.where(Student.is_active == is_active)
    if class_id: q = q.where(Student.class_id == class_id)
    if level: q = q.where(Student.level == level)
    if search:
        t = f"%{search}%"
        q = q.where(or_(Student.first_name.ilike(t), Student.last_name.ilike(t), Student.student_number.ilike(t)))
    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar_one()
    result = await db.execute(q.offset((page-1)*page_size).limit(page_size))
    students = result.scalars().all()
    return StudentListResponse(items=[StudentResponse.model_validate(s) for s in students],
        total=total, page=page, page_size=page_size, pages=(total+page_size-1)//page_size)

@router.post("", response_model=StudentResponse, status_code=201)
async def create_student(data: StudentCreate, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","secretaire"))):
    if not data.student_number:
        data.student_number = f"EL-{uuid_lib.uuid4().hex[:6].upper()}"
    student = Student(**data.model_dump())
    db.add(student); await db.commit(); await db.refresh(student)
    return StudentResponse.model_validate(student)

@router.get("/export")
async def export_students(db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","secretaire"))):
    result = await db.execute(select(Student).where(Student.is_active == True))
    students = result.scalars().all()
    output = io.StringIO()
    w = csv.writer(output)
    w.writerow(["ID","Numéro","Prénom","Nom","Niveau","Tel Parent","Email Parent"])
    for s in students:
        w.writerow([str(s.id),s.student_number,s.first_name,s.last_name,
            s.level or "",s.parent1_phone or "",s.parent1_email or ""])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition":"attachment;filename=eleves.csv"})

@router.post("/import")
async def import_students(data: StudentBulkImport, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","secretaire"))):
    for s in data.students:
        if not s.student_number:
            s.student_number = f"EL-{uuid_lib.uuid4().hex[:6].upper()}"
        db.add(Student(**s.model_dump()))
    await db.commit()
    return {"message": f"{len(data.students)} élève(s) importé(s)"}

@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(student_id: UUID, db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)):
    r = await db.execute(select(Student).where(Student.id == student_id))
    s = r.scalar_one_or_none()
    if not s: raise HTTPException(404, "Élève introuvable")
    return StudentResponse.model_validate(s)

@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(student_id: UUID, data: StudentUpdate,
    db: AsyncSession = Depends(get_db), current_user=Depends(require_role("directeur","secretaire"))):
    r = await db.execute(select(Student).where(Student.id == student_id))
    s = r.scalar_one_or_none()
    if not s: raise HTTPException(404, "Élève introuvable")
    for k, v in data.model_dump(exclude_none=True).items(): setattr(s, k, v)
    await db.commit(); await db.refresh(s)
    return StudentResponse.model_validate(s)

@router.delete("/{student_id}")
async def delete_student(student_id: UUID, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur"))):
    r = await db.execute(select(Student).where(Student.id == student_id))
    s = r.scalar_one_or_none()
    if not s: raise HTTPException(404, "Élève introuvable")
    s.is_active = False; await db.commit()
    return {"message": "Élève désactivé"}

@router.get("/{student_id}/grades")
async def get_student_grades(student_id: UUID, semester: Optional[int] = None,
    db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.grade import Grade
    q = select(Grade).where(Grade.student_id == student_id)
    if semester: q = q.where(Grade.semester == semester)
    r = await db.execute(q)
    grades = r.scalars().all()
    return {"grades": [{"id":str(g.id),"score":g.score,"semester":g.semester,"subject_id":str(g.subject_id)} for g in grades]}

@router.get("/{student_id}/attendance")
async def get_student_attendance(student_id: UUID, db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)):
    from app.models.attendance import Attendance
    r = await db.execute(select(Attendance).where(Attendance.student_id == student_id)
        .order_by(Attendance.date.desc()).limit(60))
    records = r.scalars().all()
    return {"records": [{"id":str(r.id),"date":str(r.date),"status":r.status,"session":r.session} for r in records]}

@router.get("/{student_id}/bulletin")
async def get_student_bulletin(student_id: UUID, semester: int = Query(1, ge=1, le=3),
    db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    from app.services.bulletin_service import BulletinCalculator
    return await BulletinCalculator(db).build_bulletin_data(student_id, semester)

@router.post("/{student_id}/photo")
async def upload_photo(student_id: UUID, file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db), current_user=Depends(require_role("directeur","secretaire"))):
    if not file.content_type.startswith("image/"): raise HTTPException(400, "Fichier image requis")
    os.makedirs(f"{settings.UPLOAD_DIR}/students", exist_ok=True)
    fn = f"{student_id}_{uuid_lib.uuid4().hex[:6]}.jpg"
    fp = f"{settings.UPLOAD_DIR}/students/{fn}"
    content = await file.read()
    with open(fp, "wb") as f: f.write(content)
    r = await db.execute(select(Student).where(Student.id == student_id))
    s = r.scalar_one_or_none()
    if s: s.photo_url = f"/uploads/students/{fn}"; await db.commit()
    return {"photo_url": f"/uploads/students/{fn}"}
