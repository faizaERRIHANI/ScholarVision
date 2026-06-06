"""
ScholarVision — Router Grades : Notes + Bulletins PDF + Exports Excel
ERRIHANI Faiza — ENSET Média 2025/2026
"""
from __future__ import annotations
import io, os, zipfile
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.grade import Grade
from app.models.student import Student
from app.schemas.grade import GradeCreate, GradeUpdate, GradeResponse, BulkGradeCreate, ClassBulletinRequest

router = APIRouter(prefix="/grades", tags=["Notes"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
BULLETINS_DIR = f"{UPLOAD_DIR}/bulletins"
os.makedirs(BULLETINS_DIR, exist_ok=True)

@router.get("", response_model=list[GradeResponse])
async def list_grades(
    student_id: Optional[UUID]=None, class_id: Optional[UUID]=None,
    subject_id: Optional[UUID]=None, semester: Optional[int]=None,
    page: int=Query(1,ge=1), page_size: int=Query(20,ge=1,le=100),
    db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    q = select(Grade)
    if student_id: q = q.where(Grade.student_id == student_id)
    if class_id:   q = q.where(Grade.classroom_id == class_id)
    if subject_id: q = q.where(Grade.subject_id == subject_id)
    if semester:   q = q.where(Grade.semester == semester)
    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar_one()
    r = await db.execute(q.offset((page-1)*page_size).limit(page_size))
    return [GradeResponse.model_validate(g) for g in r.scalars().all()]

@router.post("", response_model=GradeResponse, status_code=201)
async def create_grade(data: GradeCreate, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","enseignant"))):
    grade = Grade(**data.model_dump())
    grade.staff_id = current_user.id
    db.add(grade); await db.commit(); await db.refresh(grade)
    return GradeResponse.model_validate(grade)

@router.post("/bulk", status_code=201)
async def bulk_create_grades(data: BulkGradeCreate, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","enseignant"))):
    for g in data.grades:
        grade = Grade(**g.model_dump())
        grade.staff_id = current_user.id
        db.add(grade)
    await db.commit()
    return {"message": f"{len(data.grades)} note(s) enregistrée(s)"}

@router.get("/stats/class/{class_id}")
async def class_grade_stats(class_id: UUID, semester: int=Query(1,ge=1,le=3),
    db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    r = await db.execute(select(Grade).where(Grade.classroom_id==class_id, Grade.semester==semester))
    grades = r.scalars().all()
    if not grades: return {"class_id":str(class_id),"semester":semester,"count":0,"average":0,"min":0,"max":0,"success_rate":0}
    scores = [float(g.score) for g in grades]
    avg = sum(scores)/len(scores)
    return {"class_id":str(class_id),"semester":semester,"count":len(scores),
        "average":round(avg,2),"min":min(scores),"max":max(scores),
        "success_rate":round(sum(1 for s in scores if s>=10)/len(scores)*100,1)}

@router.get("/bulletin/{student_id}")
async def get_bulletin(student_id: UUID, semester: int=Query(1,ge=1,le=3),
    format: str=Query("json", alias="format"),
    db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    from app.services.bulletin_service import BulletinCalculator
    try:
        bulletin_data = await BulletinCalculator.build_bulletin_data(student_id, semester, db)
    except ValueError as e:
        raise HTTPException(404, str(e))
    if format == "pdf":
        from app.services.pdf_service import BulletinPDFGenerator
        gen = BulletinPDFGenerator(BULLETINS_DIR)
        student = bulletin_data["student"]
        filename = f"{student['student_number']}_T{semester}.pdf"
        output_path = f"{BULLETINS_DIR}/{filename}"
        gen.generate_bulletin(bulletin_data, output_path)
        return FileResponse(output_path, media_type="application/pdf",
            filename=filename,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'})
    return bulletin_data

@router.post("/bulletins/generate")
async def generate_class_bulletins(data: ClassBulletinRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","secretaire"))):
    from app.services.bulletin_service import BulletinCalculator
    from app.services.pdf_service import BulletinPDFGenerator
    r = await db.execute(select(Student).where(Student.class_id==data.class_id, Student.is_active==True))
    students = r.scalars().all()
    if not students:
        raise HTTPException(404, "Aucun élève actif dans cette classe")
    bulletins_data = []
    errors = []
    for s in students:
        try:
            bd = await BulletinCalculator.build_bulletin_data(s.id, data.semester, db)
            bulletins_data.append(bd)
        except Exception as e:
            errors.append({"student_id": str(s.id), "error": str(e)})
    if not bulletins_data:
        raise HTTPException(422, f"Impossible de générer les bulletins : {errors}")
    gen = BulletinPDFGenerator(BULLETINS_DIR)
    zip_bytes = gen.generate_zip_bytes(bulletins_data)
    zip_filename = f"bulletins_T{data.semester}_{data.class_id}.zip"
    return StreamingResponse(
        io.BytesIO(zip_bytes), media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{zip_filename}"',
            "X-Generated-Count": str(len(bulletins_data)),
            "X-Errors-Count": str(len(errors))})

@router.get("/export")
async def export_grades(class_id: UUID, semester: int=Query(1,ge=1,le=3),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","enseignant","secretaire"))):
    from app.models.subject import Subject
    from app.models.classroom import Classroom
    from app.services.bulletin_service import BulletinCalculator
    from app.services.export_service import ExcelExporter
    r_students = await db.execute(select(Student).where(Student.class_id==class_id, Student.is_active==True).order_by(Student.last_name))
    students = r_students.scalars().all()
    r_subj = await db.execute(select(Subject).join(Grade, Grade.subject_id==Subject.id)
        .join(Student, Grade.student_id==Student.id)
        .where(Student.class_id==class_id, Grade.semester==semester).distinct().order_by(Subject.name))
    subjects = r_subj.scalars().all()
    students_data = []
    for student in students:
        r_g = await db.execute(select(Grade).where(Grade.student_id==student.id, Grade.semester==semester))
        grades = r_g.scalars().all()
        by_subj = {}
        for g in grades:
            by_subj.setdefault(str(g.subject_id), []).append({"score":float(g.score),"coefficient":float(g.coefficient)})
        subj_avgs = {}; all_avgs = []; all_coeffs = []
        for subj in subjects:
            sid = str(subj.id); sg = by_subj.get(sid, [])
            avg = BulletinCalculator.calculate_subject_average(sg) if sg else None
            subj_avgs[sid] = avg
            if avg is not None: all_avgs.append(avg); all_coeffs.append(float(subj.coefficient))
        gen_avg = BulletinCalculator.calculate_general_average(all_avgs, all_coeffs) if all_avgs else 0.0
        rank, total = await BulletinCalculator.calculate_rank(student.id, class_id, semester, db)
        students_data.append({"student_number":student.student_number,"last_name":student.last_name,
            "first_name":student.first_name,"subject_averages":subj_avgs,"general_average":gen_avg,"rank":rank})
    r_cls = await db.execute(select(Classroom).where(Classroom.id==class_id))
    classroom = r_cls.scalar_one_or_none()
    class_data = {"class_name": classroom.name if classroom else str(class_id),
        "subjects":[{"id":str(s.id),"name":s.name,"coefficient":float(s.coefficient)} for s in subjects],
        "students": students_data}
    exporter = ExcelExporter()
    excel_bytes = exporter.export_grades_class(class_data, semester)
    cls_name = classroom.name if classroom else str(class_id)
    filename = f"notes_{cls_name}_T{semester}.xlsx"
    return StreamingResponse(io.BytesIO(excel_bytes if isinstance(excel_bytes,bytes) else b""),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'})

@router.put("/{grade_id}", response_model=GradeResponse)
async def update_grade(grade_id: UUID, data: GradeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","enseignant"))):
    r = await db.execute(select(Grade).where(Grade.id==grade_id))
    g = r.scalar_one_or_none()
    if not g: raise HTTPException(404, "Note introuvable")
    for k, v in data.model_dump(exclude_none=True).items(): setattr(g, k, v)
    await db.commit(); await db.refresh(g)
    return GradeResponse.model_validate(g)

@router.delete("/{grade_id}")
async def delete_grade(grade_id: UUID, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","enseignant"))):
    r = await db.execute(select(Grade).where(Grade.id==grade_id))
    g = r.scalar_one_or_none()
    if not g: raise HTTPException(404, "Note introuvable")
    await db.delete(g); await db.commit()
    return {"message": "Note supprimée"}
