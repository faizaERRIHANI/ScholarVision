from pydantic import BaseModel, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import date, datetime

class GradeCreate(BaseModel):
    student_id: UUID
    subject_id: UUID
    classroom_id: UUID
    academic_year: str = "2024-2025"
    semester: int
    grade_type: str = "devoir"
    score: float
    coefficient: float = 1.0
    date: Optional[date] = None
    comments: Optional[str] = None
    @field_validator("score")
    @classmethod
    def score_range(cls, v):
        if not 0 <= v <= 20: raise ValueError("Note entre 0 et 20")
        return round(v, 2)
    @field_validator("semester")
    @classmethod
    def semester_range(cls, v):
        if v not in (1,2,3): raise ValueError("Trimestre 1, 2 ou 3")
        return v

class GradeUpdate(BaseModel):
    score: Optional[float] = None
    coefficient: Optional[float] = None
    grade_type: Optional[str] = None
    date: Optional[date] = None
    comments: Optional[str] = None

class GradeResponse(BaseModel):
    id: UUID
    student_id: UUID
    subject_id: UUID
    subject_name: Optional[str] = None
    classroom_id: UUID
    academic_year: str
    semester: int
    grade_type: str
    score: float
    coefficient: float
    date: Optional[date] = None
    comments: Optional[str] = None
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class SubjectBulletinData(BaseModel):
    subject_name: str
    coefficient: float
    color_hex: Optional[str] = "#1a56db"
    grades: List[dict]
    average: float
    appreciation: str

class BulletinResponse(BaseModel):
    student_id: UUID
    student_name: str
    student_number: str
    classroom_name: str
    level: str
    semester: int
    academic_year: str
    subjects: List[SubjectBulletinData]
    general_average: float
    rank: Optional[int] = None
    total_students: Optional[int] = None
    mention: str
    absences_justified: int = 0
    absences_unjustified: int = 0
    appreciation_general: Optional[str] = None
    chart_data: Optional[List[dict]] = None

class ClassBulletinRequest(BaseModel):
    class_id: UUID
    semester: int
    academic_year: str = "2024-2025"

class BulkGradeCreate(BaseModel):
    grades: List[GradeCreate]
