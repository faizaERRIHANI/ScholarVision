from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class ClassroomCreate(BaseModel):
    name: str
    level: str
    section: Optional[str] = None
    capacity: int = 30
    room_number: Optional[str] = None
    head_teacher_id: Optional[UUID] = None
    academic_year: str = "2024-2025"

class ClassroomUpdate(BaseModel):
    name: Optional[str] = None
    level: Optional[str] = None
    section: Optional[str] = None
    capacity: Optional[int] = None
    room_number: Optional[str] = None
    academic_year: Optional[str] = None

class ClassroomResponse(BaseModel):
    id: UUID
    name: str
    level: str
    section: Optional[str] = None
    capacity: int
    room_number: Optional[str] = None
    academic_year: str
    student_count: Optional[int] = None
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}
