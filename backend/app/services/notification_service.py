import logging
from datetime import datetime, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.notification import Notification

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_notification(self, user_id, title, message,
                                   notif_type="info", priority="medium", action_url=None):
        from app.api.websocket import emit_notification
        notif = Notification(
            user_id=user_id, title=title, message=message,
            type=notif_type, priority=priority,
            action_url=action_url, is_read=False
        )
        self.db.add(notif)
        await self.db.commit()
        await self.db.refresh(notif)
        await emit_notification(user_id, {
            "id": str(notif.id), "title": title, "message": message,
            "type": notif_type, "priority": priority, "action_url": action_url
        })
        logger.info(f"NOTIF créée: user={user_id} type={notif_type}")
        return notif

    async def on_absence_detected(self, student_id, student_name,
                                   class_name, absence_date, director_user_id, parent_user_id=None):
        week_abs = await self._count_week_absences(student_id)
        priority = "high" if week_abs >= 3 else "medium"
        date_str = absence_date.strftime("%d/%m/%Y")
        msg = f"{student_name} ({class_name}) absent(e) le {date_str}."
        if week_abs >= 3:
            msg += f" ⚠️ {week_abs} absences cette semaine."
        await self.create_notification(
            user_id=director_user_id, title=f"Absence — {student_name}",
            message=msg, notif_type="warning", priority=priority,
            action_url=f"/students/{student_id}/attendance"
        )
        if parent_user_id:
            await self.create_notification(
                user_id=parent_user_id, title="Absence de votre enfant",
                message=f"Votre enfant {student_name} était absent(e) le {date_str}.",
                notif_type="info", priority="medium"
            )

    async def on_unknown_person_detected(self, image_base64, timestamp, director_user_id):
        from app.api.websocket import emit_unknown_person
        await self.create_notification(
            user_id=director_user_id,
            title="⚠️ Personne inconnue détectée",
            message=f"Personne non identifiée détectée à {timestamp}. Vérifiez immédiatement.",
            notif_type="alert", priority="urgent", action_url="/face-recognition"
        )
        await emit_unknown_person(image_base64, timestamp)

    async def on_payment_received(self, student_name, amount, secretary_user_id):
        await self.create_notification(
            user_id=secretary_user_id,
            title="Paiement reçu",
            message=f"Paiement de {amount:.2f} MAD reçu pour {student_name}.",
            notif_type="success", priority="low"
        )

    async def on_payment_overdue(self, student_name, amount, days_late,
                                  secretary_user_id, director_user_id=None):
        priority = "urgent" if days_late > 30 else "high"
        msg = f"{student_name} — {amount:.2f} MAD en retard depuis {days_late} jours."
        await self.create_notification(
            user_id=secretary_user_id, title="Retard de paiement",
            message=msg, notif_type="warning", priority=priority, action_url="/finance"
        )
        if director_user_id and days_late > 30:
            await self.create_notification(
                user_id=director_user_id, title="Retard paiement critique",
                message=msg, notif_type="alert", priority="urgent"
            )

    async def on_grade_added(self, student_name, subject_name, score, parent_user_id, student_id):
        if parent_user_id:
            await self.create_notification(
                user_id=parent_user_id,
                title=f"Nouvelle note — {subject_name}",
                message=f"{student_name} a obtenu {score:.1f}/20 en {subject_name}.",
                notif_type="info", priority="low",
                action_url=f"/students/{student_id}/grades"
            )

    async def _count_week_absences(self, student_id):
        from datetime import timedelta
        from app.models.attendance import Attendance
        today = date.today()
        monday = today - timedelta(days=today.weekday())
        result = await self.db.execute(
            select(func.count()).where(
                Attendance.student_id == student_id,
                Attendance.date >= monday,
                Attendance.status == "absent"
            )
        )
        return result.scalar() or 0
