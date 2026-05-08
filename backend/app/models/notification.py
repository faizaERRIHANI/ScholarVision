import enum
import uuid
from typing import Optional

from sqlalchemy import Boolean, Enum as SQLEnum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class NotificationType(str, enum.Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    ATTENDANCE = "attendance"
    GRADE = "grade"
    PAYMENT = "payment"
    BULLETIN = "bulletin"


class NotificationPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Notification(BaseModel):
    __tablename__ = "notifications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[NotificationType] = mapped_column(
        SQLEnum(NotificationType, name="notification_type_enum", values_callable=lambda x: [e.value for e in x]),
        default=NotificationType.INFO, nullable=False,
    )
    priority: Mapped[NotificationPriority] = mapped_column(
        SQLEnum(NotificationPriority, name="notification_priority_enum", values_callable=lambda x: [e.value for e in x]),
        default=NotificationPriority.MEDIUM, nullable=False, index=True,
    )
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    action_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="notifications")
