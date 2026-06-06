from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False, extra="ignore")
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    DATABASE_URL: str = "postgresql+asyncpg://scolaire:scolaire123@localhost:5432/gestion_scolaire"
    DATABASE_URL_SYNC: str = "postgresql://scolaire:scolaire123@localhost:5432/gestion_scolaire"
    SECRET_KEY: str = "changeme_32chars_minimum_please!!"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://localhost"
    ML_SERVICE_URL: str = "http://localhost:5001"
    ML_CONFIDENCE_THRESHOLD: float = 0.75
    ML_API_KEY: str = "ml_internal_key_ScholarVision_2024"
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_PASSWORD: str = "redis123"
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10485760
    EMAIL_ENABLED: bool = False
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "noreply@ecole.ma"
    SMTP_PASSWORD: str = "changeme"

    @property
    def CORS_ORIGINS_LIST(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

settings = Settings()
