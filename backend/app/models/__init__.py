"""Imports centralisés — Alembic détecte ainsi toutes les tables."""
from app.core.database import Base
from app.models.base import BaseModel, TimestampMixin

from app.models.user import User, UserRole
from app.models.classroom import Classroom, EducationLevel
from app.models.student import Student, Gender
from app.models.staff import Staff, StaffRole, ContractType
from app.models.subject import Subject
from app.models.schedule import Schedule
from app.models.attendance import (
    Attendance, AttendanceSession, AttendanceStatus, DetectionMethod,
)
from app.models.grade import Grade, GradeType
from app.models.face_embedding import FaceEmbedding, PersonType, FaceAngle
from app.models.fee import Fee, FeeType, FeeStatus, PaymentMethod
from app.models.notification import Notification, NotificationType, NotificationPriority

__all__ = [
    "Base", "BaseModel", "TimestampMixin",
    "User", "UserRole",
    "Classroom", "EducationLevel",
    "Student", "Gender",
    "Staff", "StaffRole", "ContractType",
    "Subject",
    "Schedule",
    "Grade", "GradeType",
    "Attendance", "AttendanceSession", "AttendanceStatus", "DetectionMethod",
    "FaceEmbedding", "PersonType", "FaceAngle",
    "Fee", "FeeType", "FeeStatus", "PaymentMethod",
    "Notification", "NotificationType", "NotificationPriority",
]
