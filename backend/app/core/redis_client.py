import logging
from typing import Optional
import redis
from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisClient:
    def __init__(self):
        self._client: Optional[redis.Redis] = None
        self._connect()

    def _connect(self):
        try:
            self._client = redis.from_url(settings.REDIS_URL, decode_responses=True,
                socket_connect_timeout=2, socket_timeout=2)
            self._client.ping()
            logger.info("✅ Redis connecté : %s", settings.REDIS_URL)
        except Exception as e:
            logger.warning("⚠️ Redis indisponible (%s) — mode dégradé", e)
            self._client = None

    def _safe(self, func, default=None):
        if self._client is None:
            self._connect()
        try:
            return func()
        except Exception as e:
            logger.warning("Redis erreur : %s", e)
            self._client = None
            return default

    def blacklist_token(self, jti: str, expire_seconds: int) -> bool:
        return bool(self._safe(lambda: self._client.setex(f"blacklist:{jti}", expire_seconds, "1")))

    def is_token_blacklisted(self, jti: str) -> bool:
        return bool(self._safe(lambda: self._client.exists(f"blacklist:{jti}"), default=False))

    def store_refresh_token(self, user_id: str, token: str, expire_days: int = 7) -> bool:
        return bool(self._safe(lambda: self._client.setex(f"refresh:{user_id}", expire_days*24*3600, token)))

    def get_refresh_token(self, user_id: str) -> Optional[str]:
        return self._safe(lambda: self._client.get(f"refresh:{user_id}"), default=None)

    def delete_refresh_token(self, user_id: str) -> bool:
        return bool(self._safe(lambda: self._client.delete(f"refresh:{user_id}")))

    def store_otp(self, email: str, otp: str, expire_minutes: int = 10) -> bool:
        return bool(self._safe(lambda: self._client.setex(f"otp:{email}", expire_minutes*60, otp)))

    def verify_otp(self, email: str, otp: str) -> bool:
        stored = self._safe(lambda: self._client.get(f"otp:{email}"), default=None)
        if stored == otp:
            self._safe(lambda: self._client.delete(f"otp:{email}"))
            return True
        return False

    def is_connected(self) -> bool:
        try:
            if self._client:
                self._client.ping()
                return True
        except Exception:
            pass
        return False

redis_client = RedisClient()
