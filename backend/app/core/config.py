"""Configuration centrale — lecture des variables .env via Pydantic Settings."""
from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(PROJECT_ROOT / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    APP_NAME: str = "EduPilot"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True

    DATABASE_URL: str = "postgresql+asyncpg://school_user:school123@localhost:5432/school_platform"
    DATABASE_URL_SYNC: str = "postgresql+psycopg2://school_user:school123@localhost:5432/school_platform"
    POSTGRES_USER: str = "school_user"
    POSTGRES_PASSWORD: str = "school123"
    POSTGRES_DB: str = "school_platform"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    SECRET_KEY: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PASSWORD: str = ""

    ML_SERVICE_URL: str = "http://localhost:5001"
    ML_CONFIDENCE_THRESHOLD: float = 0.75
    ML_INTERNAL_API_KEY: str = "internal-key"

    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10_485_760

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@edupilot.ma"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
