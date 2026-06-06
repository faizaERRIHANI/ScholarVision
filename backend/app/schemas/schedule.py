from pydantic import BaseModel, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import time

class ScheduleCreate(BaseModel):
    classroom_id: UUID
    subject_id: UUID
    staff_id: UUID
    day_of_week: int
    start_time: time
    end_time: time
    room: Optional[str] = None
    academic_year: str = "2024-2025"
    semester: Optional[int] = None
    is_active: bool = True
    @field_validator("day_of_week")
    @classmethod
    def valid_day(cls, v):
        if not 1 <= v <= 6: raise ValueError("Jour 1=lundi à 6=samedi")
        return v

class ScheduleUpdate(BaseModel):
    day_of_week: Optional[int] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    room: Optional[str] = None
    is_active: Optional[bool] = None

class ScheduleResponse(BaseModel):
    id: UUID
    classroom_id: UUID
    classroom_name: Optional[str] = None
    subject_id: UUID
    subject_name: Optional[str] = None
    subject_color: Optional[str] = None
    staff_id: UUID
    staff_name: Optional[str] = None
    day_of_week: int
    start_time: time
    end_time: time
    room: Optional[str] = None
    academic_year: str
    is_active: bool
    model_config = {"from_attributes": True}

class ConflictCheck(BaseModel):
    has_conflict: bool
    conflicts: List[dict]
    message: str
