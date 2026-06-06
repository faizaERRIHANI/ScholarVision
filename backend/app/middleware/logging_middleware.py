import logging, os, time
from datetime import datetime, timezone
from starlette.middleware.base import BaseHTTPMiddleware

os.makedirs("logs", exist_ok=True)
logger = logging.getLogger("ScholarVision.audit")
fh = logging.FileHandler("logs/app.log", encoding="utf-8")
fh.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(message)s"))
logger.addHandler(fh)
logger.setLevel(logging.INFO)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    SKIP_PATHS = {"/health", "/", "/docs", "/openapi.json", "/redoc"}

    async def dispatch(self, request, call_next):
        if request.url.path in self.SKIP_PATHS:
            return await call_next(request)
        start = time.perf_counter()
        user_id, user_role = None, None
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            try:
                from app.core.security import verify_access_token
                p = verify_access_token(auth[7:])
                if p:
                    user_id, user_role = p.sub, p.role
            except Exception:
                pass
        response = await call_next(request)
        ms = round((time.perf_counter() - start) * 1000, 2)
        logger.info("%s %s | user=%s role=%s | status=%s | %sms",
            request.method, request.url.path, user_id or "anon", user_role or "-", response.status_code, ms)
        return response
