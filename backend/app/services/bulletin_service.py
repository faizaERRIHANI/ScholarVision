"""
ScholarVision — Service Bulletins Scolaires
ERRIHANI Faiza — ENSET Média 2025/2026
"""
from __future__ import annotations
import logging
from datetime import date, datetime
from typing import Any
from uuid import UUID
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.attendance import Attendance, AttendanceStatus
from app.models.classroom import Classroom
from app.models.grade import Grade
from app.models.student import Student
from app.models.subject import Subject

logger = logging.getLogger(__name__)

SCHOOL_INFO = {
    "name": "École Privée Multi-Niveaux ScholarVision",
    "address": "Avenue Hassan II, Fès, Maroc",
    "phone": "+212 535 XX XX XX",
    "email": "contact@ScholarVision.ma",
    "logo_url": None,
    "directeur": "M. Mohamed Al-Fassi",
    "academic_year": "2024-2025",
}


class BulletinCalculator:

    @staticmethod
    def calculate_subject_average(grades_list: list[dict]) -> float:
        if not grades_list:
            return 0.0
        total_score = sum(g["score"] * g.get("coefficient", 1) for g in grades_list)
        total_coeff = sum(g.get("coefficient", 1) for g in grades_list)
        return round(total_score / total_coeff, 2) if total_coeff else 0.0

    @staticmethod
    def calculate_general_average(subject_averages: list[float], subject_coefficients: list[float]) -> float:
        if not subject_averages:
            return 0.0
        total = sum(avg * coeff for avg, coeff in zip(subject_averages, subject_coefficients))
        total_coeff = sum(subject_coefficients)
        return round(total / total_coeff, 2) if total_coeff else 0.0

    @staticmethod
    def get_mention(average: float) -> str:
        if average >= 16: return "Très Bien"
        elif average >= 14: return "Bien"
        elif average >= 12: return "Assez Bien"
        elif average >= 10: return "Passable"
        else: return "Insuffisant"

    @staticmethod
    def get_mention_color(mention: str) -> tuple:
        return {"Très Bien":(0.0,0.6,0.3),"Bien":(0.1,0.4,0.8),
                "Assez Bien":(0.2,0.7,0.7),"Passable":(0.9,0.6,0.0),
                "Insuffisant":(0.8,0.1,0.1)}.get(mention,(0.4,0.4,0.4))

    @staticmethod
    def get_appreciation(average: float) -> str:
        if average >= 17: return "Résultats excellents. Félicitations au conseil de classe."
        elif average >= 16: return "Très bons résultats. Travail sérieux et régulier."
        elif average >= 14: return "Bons résultats dans l'ensemble. Continuez vos efforts."
        elif average >= 12: return "Résultats satisfaisants. Des progrès sont possibles."
        elif average >= 10: return "Résultats moyens. Un effort supplémentaire est nécessaire."
        else: return "Résultats insuffisants. Un soutien scolaire est recommandé."

    @staticmethod
    def get_subject_appreciation(average: float) -> str:
        if average >= 16: return "TB"
        elif average >= 14: return "B"
        elif average >= 12: return "AB"
        elif average >= 10: return "P"
        else: return "Insuf."

    @staticmethod
    async def calculate_rank(student_id: UUID, class_id: UUID, semester: int, db: AsyncSession) -> tuple[int, int]:
        stmt = select(Student).where(Student.class_id == class_id, Student.is_active == True)
        result = await db.execute(stmt)
        students = result.scalars().all()
        if not students:
            return (1, 1)
        averages: dict[UUID, float] = {}
        for student in students:
            res = await db.execute(select(Grade).where(Grade.student_id == student.id, Grade.semester == semester))
            grades = res.scalars().all()
            if not grades:
                continue
            by_subject: dict = {}
            for g in grades:
                by_subject.setdefault(g.subject_id, []).append({"score": float(g.score), "coefficient": float(g.coefficient)})
            avgs, coeffs = [], []
            for sg in by_subject.values():
                avgs.append(BulletinCalculator.calculate_subject_average(sg))
                coeffs.append(float(sg[0]["coefficient"]))
            if avgs:
                averages[student.id] = BulletinCalculator.calculate_general_average(avgs, coeffs)
        if not averages:
            return (1, 1)
        sorted_students = sorted(averages.items(), key=lambda x: x[1], reverse=True)
        for i, (sid, avg) in enumerate(sorted_students):
            if sid == student_id:
                return (i + 1, len(averages))
        return (len(averages), len(averages))

    @staticmethod
    async def get_class_average(class_id: UUID, semester: int, db: AsyncSession) -> float:
        stmt = (select(func.avg(Grade.score)).join(Student, Grade.student_id == Student.id)
                .where(Student.class_id == class_id, Grade.semester == semester))
        result = await db.execute(stmt)
        avg = result.scalar()
        return round(float(avg), 2) if avg else 0.0

    @staticmethod
    async def build_bulletin_data(student_id: UUID, semester: int, db: AsyncSession) -> dict[str, Any]:
        stmt = select(Student).options(selectinload(Student.classroom)).where(Student.id == student_id)
        result = await db.execute(stmt)
        student = result.scalar_one_or_none()
        if not student:
            raise ValueError(f"Élève introuvable : {student_id}")
        classroom = student.classroom
        res_grades = await db.execute(
            select(Grade).options(selectinload(Grade.subject)).where(
                Grade.student_id == student_id, Grade.semester == semester).order_by(Grade.subject_id, Grade.date))
        grades = res_grades.scalars().all()
        subjects_map: dict = {}
        for g in grades:
            sid = g.subject_id
            if sid not in subjects_map:
                subjects_map[sid] = {
                    "id": str(sid), "name": g.subject.name if g.subject else "Inconnue",
                    "code": g.subject.code if g.subject else "??",
                    "coefficient": float(g.subject.coefficient) if g.subject else 1.0,
                    "color_hex": g.subject.color_hex if g.subject else "#1A56DB", "grades": []}
            subjects_map[sid]["grades"].append({
                "score": float(g.score), "coefficient": float(g.coefficient),
                "grade_type": str(g.grade_type), "date": g.date.isoformat() if g.date else None, "comments": g.comments or ""})
        subject_list, all_averages, all_coefficients = [], [], []
        for subj in subjects_map.values():
            avg = BulletinCalculator.calculate_subject_average(subj["grades"])
            subj["average"] = avg
            subj["appreciation"] = BulletinCalculator.get_subject_appreciation(avg)
            subject_list.append(subj)
            all_averages.append(avg)
            all_coefficients.append(subj["coefficient"])
        subject_list.sort(key=lambda x: x["name"])
        general_average = BulletinCalculator.calculate_general_average(all_averages, all_coefficients)
        mention = BulletinCalculator.get_mention(general_average)
        class_id = classroom.id if classroom else None
        if class_id:
            rank, total_students = await BulletinCalculator.calculate_rank(student_id, class_id, semester, db)
            class_average = await BulletinCalculator.get_class_average(class_id, semester, db)
        else:
            rank, total_students, class_average = 1, 1, general_average
        year = int(SCHOOL_INFO["academic_year"].split("-")[0])
        semester_dates = {1:(date(year,9,1),date(year,12,31)),2:(date(year+1,1,1),date(year+1,3,31)),3:(date(year+1,4,1),date(year+1,6,30))}
        date_start, date_end = semester_dates.get(semester,(date(year,9,1),date(year+1,6,30)))
        try:
            res_abs = await db.execute(select(Attendance).where(
                Attendance.student_id == student_id, Attendance.date >= date_start, Attendance.date <= date_end))
            attendances = res_abs.scalars().all()
            justified = sum(1 for a in attendances if str(a.status) in ("absent","AbsenceStatus.absent") and a.justified_by)
            not_justified = sum(1 for a in attendances if str(a.status) in ("absent","AbsenceStatus.absent") and not a.justified_by)
            late = sum(1 for a in attendances if str(a.status) in ("retard","AbsenceStatus.retard"))
        except Exception:
            justified = not_justified = late = 0
        absences = {"justified": justified, "not_justified": not_justified, "late": late, "total": justified + not_justified}
        conseil_dates = {1:f"15 janvier {year+1}",2:f"15 avril {year+1}",3:f"30 juin {year+1}"}
        return {
            "student": {"id":str(student.id),"first_name":student.first_name,"last_name":student.last_name,
                "student_number":student.student_number,"date_of_birth":student.date_of_birth.isoformat() if student.date_of_birth else None,
                "gender":str(student.gender),"photo_url":student.photo_url,
                "class_name":classroom.name if classroom else "—","level":classroom.level.value if classroom and hasattr(classroom.level,"value") else (str(classroom.level).split(".")[-1] if classroom else "—")},
            "school": SCHOOL_INFO, "semester": semester, "academic_year": SCHOOL_INFO["academic_year"],
            "subjects": subject_list, "general_average": general_average, "rank": rank,
            "total_students": total_students, "class_average": class_average, "mention": mention,
            "mention_color": BulletinCalculator.get_mention_color(mention), "absences": absences,
            "appreciation_general": BulletinCalculator.get_appreciation(general_average),
            "conseil_class_date": f"Conseil de classe du {conseil_dates.get(semester,'date à définir')}",
            "generated_at": datetime.now().isoformat()}
