import re, logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import (
    create_access_token, create_refresh_token, get_current_user,
    get_password_hash, get_token_remaining_seconds, generate_otp,
    verify_password, verify_refresh_token,
)
from app.core.redis_client import redis_client
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentification"])

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

class RefreshRequest(BaseModel):
    refresh_token: str

class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Minimum 8 caractères")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Au moins une majuscule requise")
        if not re.search(r"\d", v):
            raise ValueError("Au moins un chiffre requis")
        return v

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

def build_user_response(user: User) -> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": f"{user.first_name} {user.last_name}",
        "phone": getattr(user, "phone", None),
        "avatar_url": getattr(user, "avatar_url", None),
        "is_active": user.is_active,
        "last_login": user.last_login.isoformat() if getattr(user, "last_login", None) else None,
    }

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé.")
    access_token = create_access_token(str(user.id), user.email, user.role)
    refresh_token = create_refresh_token(str(user.id))
    redis_client.store_refresh_token(str(user.id), refresh_token)
    if hasattr(user, "last_login"):
        user.last_login = datetime.now(timezone.utc)
        await db.commit()
    logger.info("LOGIN ✅ user=%s role=%s", user.email, user.role)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token,
        user=build_user_response(user))

@router.post("/refresh")
async def refresh_token(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    user_id = verify_refresh_token(request.refresh_token)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token invalide ou expiré")
    stored = redis_client.get_refresh_token(user_id)
    if stored != request.refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token révoqué.")
    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Utilisateur inactif")
    return {"access_token": create_access_token(str(user.id), user.email, user.role),
            "token_type": "bearer"}

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    remaining = get_token_remaining_seconds(current_user._raw_token)
    if remaining > 0:
        redis_client.blacklist_token(current_user._jti, remaining)
    redis_client.delete_refresh_token(str(current_user.id))
    return {"message": "Déconnecté avec succès"}

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user),
                 db: AsyncSession = Depends(get_db)):
    return build_user_response(current_user)

@router.put("/me")
async def update_me(request: UpdateProfileRequest,
                    current_user: User = Depends(get_current_user),
                    db: AsyncSession = Depends(get_db)):
    if request.first_name is not None:
        current_user.first_name = request.first_name
    if request.last_name is not None:
        current_user.last_name = request.last_name
    if request.phone is not None and hasattr(current_user, "phone"):
        current_user.phone = request.phone
    if request.avatar_url is not None and hasattr(current_user, "avatar_url"):
        current_user.avatar_url = request.avatar_url
    await db.commit()
    await db.refresh(current_user)
    return {"message": "Profil mis à jour", "user": build_user_response(current_user)}

@router.post("/change-password")
async def change_password(request: ChangePasswordRequest,
                          current_user: User = Depends(get_current_user),
                          db: AsyncSession = Depends(get_db)):
    if not verify_password(request.old_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ancien mot de passe incorrect")
    current_user.hashed_password = get_password_hash(request.new_password)
    await db.commit()
    redis_client.delete_refresh_token(str(current_user.id))
    return {"message": "Mot de passe modifié. Veuillez vous reconnecter."}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest,
                          db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    if user and user.is_active:
        otp = generate_otp()
        redis_client.store_otp(request.email, otp, expire_minutes=10)
        print(f"\n{'='*40}\n🔑 OTP: {otp}\nEmail: {request.email}\n{'='*40}\n")
        logger.info("OTP généré pour %s : %s", request.email, otp)
    return {"message": "Si cet email existe, un code vous a été envoyé."}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest,
                         db: AsyncSession = Depends(get_db)):
    if not redis_client.verify_otp(request.email, request.otp):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code OTP invalide ou expiré")
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    user.hashed_password = get_password_hash(request.new_password)
    await db.commit()
    redis_client.delete_refresh_token(str(user.id))
    return {"message": "Mot de passe réinitialisé. Vous pouvez vous connecter."}
