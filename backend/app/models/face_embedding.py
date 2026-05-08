import enum
import uuid
from typing import Optional

from pgvector.sqlalchemy import Vector
from sqlalchemy import Boolean, Enum as SQLEnum, Float, Index, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class PersonType(str, enum.Enum):
    STUDENT = "student"
    STAFF = "staff"


class FaceAngle(str, enum.Enum):
    FACE = "face"
    LEFT = "left"
    RIGHT = "right"
    UP = "up"
    DOWN = "down"


class FaceEmbedding(BaseModel):
    __tablename__ = "face_embeddings"

    person_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    person_type: Mapped[PersonType] = mapped_column(
        SQLEnum(PersonType, name="person_type_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False, index=True,
    )
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    angle: Mapped[FaceAngle] = mapped_column(
        SQLEnum(FaceAngle, name="face_angle_enum", values_callable=lambda x: [e.value for e in x]),
        default=FaceAngle.FACE, nullable=False,
    )
    embedding: Mapped[list[float]] = mapped_column(Vector(512), nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), default="buffalo_l", nullable=False)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

    __table_args__ = (
        Index("ix_face_embeddings_person", "person_id", "person_type"),
    )
