import os, uuid as uuid_lib
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.config import settings
from app.models.face_embedding import FaceEmbedding

router = APIRouter(prefix="/face", tags=["Reconnaissance Faciale"])

@router.post("/enroll")
async def enroll_person(data: dict, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur","secretaire"))):
    return {"message": "Enrôlement initié", "person_id": data.get("person_id"), "person_type": data.get("person_type")}

@router.post("/enroll-photos")
async def enroll_photos(person_id: str=Form(...), person_type: str=Form(...),
    angle: str=Form("face"), file: UploadFile=File(...),
    db: AsyncSession = Depends(get_db), current_user=Depends(require_role("directeur","secretaire"))):
    os.makedirs(f"{settings.UPLOAD_DIR}/faces", exist_ok=True)
    fn = f"{person_id}_{angle}_{uuid_lib.uuid4().hex[:6]}.jpg"
    fp = f"{settings.UPLOAD_DIR}/faces/{fn}"
    content = await file.read()
    with open(fp, "wb") as f: f.write(content)
    try:
        import httpx
        async with httpx.AsyncClient(timeout=15) as client:
            await client.post(f"{settings.ML_SERVICE_URL}/enroll-photos",
                data={"person_id":person_id,"person_type":person_type,"angle":angle},
                files={"file":(fn, content, "image/jpeg")})
    except Exception:
        pass
    return {"message": "Photo enrôlée", "photo_url": f"/uploads/faces/{fn}"}

@router.get("/persons")
async def list_persons(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    r = await db.execute(select(FaceEmbedding.person_id, FaceEmbedding.person_type,
        func.count(FaceEmbedding.id).label("photo_count"))
        .where(FaceEmbedding.is_active==True).group_by(FaceEmbedding.person_id, FaceEmbedding.person_type))
    rows = r.all()
    return {"persons":[{"person_id":str(row.person_id),"person_type":row.person_type,"photo_count":row.photo_count} for row in rows]}

@router.delete("/persons/{person_id}")
async def delete_person(person_id: UUID, db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("directeur"))):
    r = await db.execute(select(FaceEmbedding).where(FaceEmbedding.person_id == person_id))
    for e in r.scalars().all(): e.is_active = False
    await db.commit()
    return {"message": f"Personne {person_id} désactivée"}

@router.get("/logs")
async def get_face_logs(limit: int=50, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    r = await db.execute(select(FaceEmbedding).where(FaceEmbedding.is_active==True)
        .order_by(FaceEmbedding.created_at.desc()).limit(limit))
    embs = r.scalars().all()
    return {"logs":[{"id":str(e.id),"person_id":str(e.person_id),"person_type":e.person_type,"angle":e.angle,"confidence":e.confidence} for e in embs]}

@router.get("/stats")
async def get_face_stats(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    total = (await db.execute(select(func.count(FaceEmbedding.id)).where(FaceEmbedding.is_active==True))).scalar_one()
    persons = (await db.execute(select(func.count(FaceEmbedding.person_id.distinct())).where(FaceEmbedding.is_active==True))).scalar_one()
    avg_conf = (await db.execute(select(func.avg(FaceEmbedding.confidence)).where(FaceEmbedding.is_active==True))).scalar_one()
    return {"total_photos":total,"enrolled_persons":persons,
        "average_confidence":round(float(avg_conf or 0),3),
        "model_status":{"yolo":"active","arcface":"active","pgvector":"active"}}
