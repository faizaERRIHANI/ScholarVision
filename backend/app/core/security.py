import random, secrets, string
from datetime import datetime, timedelta, timezone
from typing import Optional, Callable
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db

class TokenPayload(BaseModel):
    sub: str
    email: str
    role: str
    jti: str
    exp: Optional[datetime] = None

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))

def create_access_token(user_id: str, email: str, role: str, expires_minutes: int = None) -> str:
    expire_minutes = expires_minutes or settings.JWT_EXPIRE_MINUTES
    jti = secrets.token_hex(16)
    payload = {
        "sub": str(user_id), "email": email, "role": role, "jti": jti,
        "type": "access", "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=expire_minutes),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    jti = secrets.token_hex(16)
    payload = {
        "sub": str(user_id), "jti": jti, "type": "refresh",
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def verify_access_token(token: str) -> Optional[TokenPayload]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "access":
            return None
        return TokenPayload(sub=payload["sub"], email=payload["email"], role=payload["role"], jti=payload["jti"])
    except JWTError:
        return None

def verify_refresh_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        return payload["sub"]
    except JWTError:
        return None

def get_token_remaining_seconds(token: str) -> int:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        return max(0, int((exp - datetime.now(timezone.utc)).total_seconds()))
    except Exception:
        return 0

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    from app.core.redis_client import redis_client
    from app.models.user import User
    from sqlalchemy import select
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalide ou expiré", headers={"WWW-Authenticate": "Bearer"})
    payload = verify_access_token(token)
    if payload is None:
        raise credentials_exception
    if redis_client.is_token_blacklisted(payload.jti):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token révoqué. Veuillez vous reconnecter.", headers={"WWW-Authenticate": "Bearer"})
    try:
        result = await db.execute(select(User).where(User.id == UUID(payload.sub)))
        user = result.scalar_one_or_none()
    except Exception:
        raise credentials_exception
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Compte désactivé.")
    user._jti = payload.jti
    user._raw_token = token
    return user

def require_role(*allowed_roles: str) -> Callable:
    async def _check_role(current_user=Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Accès refusé. Rôles requis : {', '.join(allowed_roles)}")
        return current_user
    return _check_role

def require_any_role(*roles: str) -> Callable:
    return require_role(*roles)

def is_owner_or_admin(resource_user_id: str, current_user) -> bool:
    if current_user.role == "directeur":
        return True
    return str(current_user.id) == str(resource_user_id)

def require_owner_or_admin(resource_user_id: str, current_user):
    if not is_owner_or_admin(resource_user_id, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé : vous ne pouvez accéder qu'à vos propres données.")
