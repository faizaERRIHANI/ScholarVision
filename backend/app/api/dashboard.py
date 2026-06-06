from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.student import Student
from app.models.staff import Staff
from app.models.attendance import Attendance
from app.models.fee import Fee
from app.models.grade import Grade

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/kpis")
async def get_kpis(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    today = date.today()
    total_students = (await db.execute(select(func.count(Student.id)).where(Student.is_active==True))).scalar_one()
    total_staff = (await db.execute(select(func.count(Staff.id)).where(Staff.is_active==True))).scalar_one()
    present_today = (await db.execute(select(func.count(Attendance.id)).where(Attendance.date==today, Attendance.status=="present"))).scalar_one()
    avg = (await db.execute(select(func.avg(Grade.score)))).scalar_one()
    overdue = (await db.execute(select(func.count(Fee.id)).where(Fee.status.in_(["overdue","pending"])))).scalar_one()
    monthly_paid = (await db.execute(select(func.sum(Fee.paid_amount)).where(
        extract("month",Fee.paid_date)==today.month, extract("year",Fee.paid_date)==today.year))).scalar_one()
    return {"total_students":{"label":"Élèves inscrits","value":total_students,"icon":"👨‍🎓","color":"blue"},
        "present_today":{"label":"Présents aujourd'hui","value":present_today,"icon":"✅","color":"green"},
        "general_average":{"label":"Moyenne générale","value":round(float(avg or 0),2),"icon":"📊","color":"gold"},
        "monthly_revenue":{"label":"Encaissé ce mois","value":float(monthly_paid or 0),"icon":"💰","color":"emerald"},
        "total_staff":{"label":"Personnel actif","value":total_staff,"icon":"👩‍🏫","color":"violet"},
        "overdue_fees":{"label":"Paiements en retard","value":overdue,"icon":"⚠️","color":"rose"}}

@router.get("/activity-feed")
async def get_activity_feed(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    r = await db.execute(select(Attendance).order_by(Attendance.created_at.desc()).limit(20))
    records = r.scalars().all()
    activities = []
    for rec in records:
        sr = await db.execute(select(Student).where(Student.id == rec.student_id))
        s = sr.scalar_one_or_none()
        if s:
            activities.append({"id":str(rec.id),"type":"attendance",
                "message":f"{s.first_name} {s.last_name} — {rec.status}",
                "timestamp":str(rec.created_at),"icon":"✅" if rec.status=="present" else "❌"})
    return {"items": activities, "total": len(activities)}

@router.get("/alerts")
async def get_alerts(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    overdue = (await db.execute(select(func.count(Fee.id)).where(Fee.status=="overdue"))).scalar_one()
    alerts = []
    if overdue > 0:
        alerts.append({"type":"payment","priority":"high","title":f"{overdue} paiement(s) en retard","message":"Des familles ont des frais impayés"})
    return {"items":alerts,"urgent_count":0,"unresolved_count":len(alerts)}

@router.get("/attendance-chart")
async def attendance_chart(period: str=Query("month"), db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    today = date.today()
    data = []
    months = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"]
    for m in range(1, today.month+1):
        total = (await db.execute(select(func.count(Attendance.id)).where(
            extract("year",Attendance.date)==today.year, extract("month",Attendance.date)==m))).scalar_one()
        present = (await db.execute(select(func.count(Attendance.id)).where(
            extract("year",Attendance.date)==today.year, extract("month",Attendance.date)==m,
            Attendance.status=="present"))).scalar_one()
        data.append({"label":months[m-1],"value":round(present/total*100 if total else 0,1),"secondary_value":total})
    return {"period":period,"data":data,"average_rate":round(sum(d["value"] for d in data)/len(data) if data else 0,1)}

@router.get("/level-distribution")
async def level_distribution(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    r = await db.execute(select(Student.level, func.count(Student.id).label("cnt"))
        .where(Student.is_active==True).group_by(Student.level))
    rows = r.all()
    total = sum(row.cnt for row in rows)
    return {"data":[{"label":row.level or "Non défini","value":row.cnt} for row in rows],"total":total}
