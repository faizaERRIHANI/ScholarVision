from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

class StudentCreate(BaseModel):
    first_name: str
    last_name: str
    student_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    nationality: str = "Marocaine"
    class_id: Optional[UUID] = None
    level: Optional[str] = None
    parent1_name: Optional[str] = None
    parent1_phone: Optional[str] = None
    parent1_email: Optional[EmailStr] = None
    parent2_name: Optional[str] = None
    parent2_phone: Optional[str] = None
    parent2_email: Optional[EmailStr] = None
    photo_url: Optional[str] = None
    medical_notes: Optional[str] = None
    enrollment_date: Optional[date] = None
    is_active: bool = True

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    nationality: Optional[str] = None
    class_id: Optional[UUID] = None
    level: Optional[str] = None
    parent1_name: Optional[str] = None
    parent1_phone: Optional[str] = None
    parent1_email: Optional[EmailStr] = None
    parent2_name: Optional[str] = None
    parent2_phone: Optional[str] = None
    parent2_email: Optional[EmailStr] = None
    photo_url: Optional[str] = None
    medical_notes: Optional[str] = None
    is_active: Optional[bool] = None

class StudentResponse(BaseModel):
    id: UUID
    student_number: str
    first_name: str
    last_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    nationality: Optional[str] = None
    class_id: Optional[UUID] = None
    level: Optional[str] = None
    parent1_name: Optional[str] = None
    parent1_phone: Optional[str] = None
    parent1_email: Optional[str] = None
    parent2_name: Optional[str] = None
    parent2_phone: Optional[str] = None
    parent2_email: Optional[str] = None
    photo_url: Optional[str] = None
    medical_notes: Optional[str] = None
    enrollment_date: Optional[date] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    average: Optional[float] = None
    attendance_rate: Optional[float] = None
    rank: Optional[int] = None
    model_config = {"from_attributes": True}

class StudentListResponse(BaseModel):
    items: List[StudentResponse]
    total: int
    page: int
    page_size: int
    pages: int

class StudentBulkImport(BaseModel):
    students: List[StudentCreate]
