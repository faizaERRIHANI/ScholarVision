from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
async def list_notifications(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Notification).where(Notification.user_id==current_user.id)
        .order_by(Notification.created_at.desc()).limit(50))
    notifs = r.scalars().all()
    return {"notifications":[{"id":str(n.id),"title":n.title,"message":n.message,
        "type":n.type,"is_read":n.is_read,"priority":n.priority,"created_at":str(n.created_at)} for n in notifs],
        "unread_count":sum(1 for n in notifs if not n.is_read)}

@router.put("/{notif_id}/read")
async def mark_read(notif_id: UUID, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Notification).where(Notification.id==notif_id, Notification.user_id==current_user.id))
    n = r.scalar_one_or_none()
    if not n: raise HTTPException(404, "Notification introuvable")
    n.is_read = True; await db.commit()
    return {"message": "Marquée comme lue"}

@router.put("/read-all")
async def mark_all_read(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Notification).where(Notification.user_id==current_user.id, Notification.is_read==False))
    notifs = r.scalars().all()
    for n in notifs: n.is_read = True
    await db.commit()
    return {"message": f"{len(notifs)} notification(s) marquée(s) comme lues"}

@router.delete("/{notif_id}")
async def delete_notif(notif_id: UUID, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Notification).where(Notification.id==notif_id, Notification.user_id==current_user.id))
    n = r.scalar_one_or_none()
    if not n: raise HTTPException(404, "Notification introuvable")
    await db.delete(n); await db.commit()
    return {"message": "Supprimée"}

@router.post("/send")
async def send_notification(data: dict, current_user=Depends(require_role("directeur")), db: AsyncSession = Depends(get_db)):
    from app.models.user import User
    role = data.get("role"); title = data.get("title",""); message = data.get("message","")
    q = select(User).where(User.is_active==True)
    if role: q = q.where(User.role==role)
    r = await db.execute(q); users = r.scalars().all()
    for u in users:
        db.add(Notification(user_id=u.id, title=title, message=message,
            type=data.get("type","info"), priority=data.get("priority","medium")))
    await db.commit()
    return {"message": f"Notification envoyée à {len(users)} utilisateur(s)"}
