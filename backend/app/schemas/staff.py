from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

class StaffCreate(BaseModel):
    first_name: str
    last_name: str
    employee_number: Optional[str] = None
    role: str
    department: Optional[str] = None
    specialization: Optional[str] = None
    contract_type: str = "CDI"
    contract_start: Optional[date] = None
    contract_end: Optional[date] = None
    hourly_rate: Optional[float] = None
    monthly_salary: Optional[float] = None
    hire_date: Optional[date] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    diploma: Optional[str] = None
    years_experience: Optional[int] = None
    email: Optional[EmailStr] = None
    is_active: bool = True

class StaffUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    specialization: Optional[str] = None
    contract_type: Optional[str] = None
    monthly_salary: Optional[float] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    diploma: Optional[str] = None
    years_experience: Optional[int] = None
    is_active: Optional[bool] = None

class StaffResponse(BaseModel):
    id: UUID
    employee_number: str
    first_name: str
    last_name: str
    role: str
    department: Optional[str] = None
    specialization: Optional[str] = None
    contract_type: Optional[str] = None
    contract_start: Optional[date] = None
    hire_date: Optional[date] = None
    phone: Optional[str] = None
    diploma: Optional[str] = None
    years_experience: Optional[int] = None
    monthly_salary: Optional[float] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class StaffScheduleResponse(BaseModel):
    staff_id: UUID
    staff_name: str
    schedule: List[dict]
