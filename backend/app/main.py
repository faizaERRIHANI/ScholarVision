import time, logging
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.api import auth, websocket

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s — %(message)s")
logger = logging.getLogger("ScholarVision")

_extra = []
for name in ["students","staff","classrooms","grades","attendance","schedule","finance","notifications","dashboard","face"]:
    try:
        import importlib
        mod = importlib.import_module(f"app.api.{name}")
        if hasattr(mod, "router"): _extra.append(mod)
    except Exception as e:
        logger.warning(f"Router {name} non chargé : {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🎓 ScholarVision v{settings.APP_VERSION} — Démarrage")
    try:
        async with AsyncSessionLocal() as db:
            await db.execute(text("SELECT 1"))
        logger.info("✅ PostgreSQL connecté")
    except Exception as e:
        logger.error(f"❌ DB : {e}")
    yield
    logger.info("🛑 ScholarVision — Arrêt")

app = FastAPI(title="ScholarVision API", description="Gestion Scolaire + Reconnaissance Faciale YOLO",
              version=settings.APP_VERSION, lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS_LIST,
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.middleware("http")
async def log_req(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({round((time.time()-start)*1000,1)}ms)")
    return response

@app.exception_handler(HTTPException)
async def http_handler(request, exc):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})

@app.exception_handler(Exception)
async def global_handler(request, exc):
    logger.error(f"500 {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"error": "Erreur interne"})

app.include_router(auth.router, prefix="/api")
app.include_router(websocket.router)
for mod in _extra:
    app.include_router(mod.router, prefix="/api")

@app.get("/", tags=["System"])
async def root():
    return {"status": "online", "app": "ScholarVision API", "version": settings.APP_VERSION, "timestamp": datetime.utcnow().isoformat()}

@app.get("/health", tags=["System"])
async def health():
    db_ok = False
    try:
        async with AsyncSessionLocal() as db:
            await db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        pass
    return {"status": "healthy" if db_ok else "degraded", "database": "connected" if db_ok else "unreachable"}
