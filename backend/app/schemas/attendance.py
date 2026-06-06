from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import date, datetime

class AttendanceCreate(BaseModel):
    student_id: UUID
    date: date
    session: str = "matin"
    status: str = "present"
    detection_method: str = "manuel"
    confidence_score: Optional[float] = None
    notes: Optional[str] = None
    staff_id: Optional[UUID] = None

class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    justified_by: Optional[str] = None
    justification_document_url: Optional[str] = None

class AttendanceResponse(BaseModel):
    id: UUID
    student_id: UUID
    student_name: Optional[str] = None
    date: date
    session: str
    status: str
    detection_method: str
    confidence_score: Optional[float] = None
    detected_at: Optional[datetime] = None
    notes: Optional[str] = None
    justified_by: Optional[str] = None
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class FacialAttendancePayload(BaseModel):
    student_id: UUID
    detected_at: datetime
    confidence_score: float
    session: str = "matin"
    ml_api_key: str

class JustifyRequest(BaseModel):
    justified_by: str
    justification_document_url: Optional[str] = None
    notes: Optional[str] = None
