import os
import logging
from celery import Celery
from celery.schedules import crontab
from datetime import datetime, date, timedelta

logger = logging.getLogger(__name__)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery("ScholarVision", broker=REDIS_URL, backend=REDIS_URL)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Africa/Casablanca",
    enable_utc=True,
    beat_schedule={
        "rapport-quotidien-17h": {
            "task": "app.workers.tasks.generate_daily_report",
            "schedule": crontab(hour=17, minute=0),
        },
        "nettoyage-logs-detection": {
            "task": "app.workers.tasks.cleanup_old_face_logs",
            "schedule": crontab(hour=2, minute=0),
        },
        "relances-paiements-lundi": {
            "task": "app.workers.tasks.send_overdue_payment_reminders",
            "schedule": crontab(hour=8, minute=0, day_of_week="mon"),
        },
    }
)

@celery_app.task(name="app.workers.tasks.send_absence_email", bind=True, max_retries=3)
def send_absence_email(self, parent_email, student_name, date_str, reason=None, class_name=""):
    try:
        logger.info(f"[EMAIL ABSENT] To={parent_email} | {student_name} | {date_str}")
        return {"status": "sent", "to": parent_email}
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)

@celery_app.task(name="app.workers.tasks.send_fee_reminder_email", bind=True, max_retries=3)
def send_fee_reminder_email(self, family_email, student_name, amount, days_late):
    try:
        logger.info(f"[EMAIL RELANCE] To={family_email} | {amount:.2f} MAD | {days_late}j")
        return {"status": "sent", "to": family_email}
    except Exception as exc:
        raise self.retry(exc=exc, countdown=120)

@celery_app.task(name="app.workers.tasks.generate_daily_report")
def generate_daily_report():
    today = date.today().strftime("%d/%m/%Y")
    logger.info(f"[RAPPORT QUOTIDIEN] Génération pour {today}")
    return {"date": today, "status": "generated"}

@celery_app.task(name="app.workers.tasks.cleanup_old_face_logs")
def cleanup_old_face_logs():
    cutoff = datetime.now() - timedelta(days=30)
    logger.info(f"[CLEANUP] Logs avant {cutoff.strftime('%d/%m/%Y')}")
    return {"status": "cleaned", "cutoff": cutoff.isoformat()}

@celery_app.task(name="app.workers.tasks.send_overdue_payment_reminders")
def send_overdue_payment_reminders():
    logger.info("[RELANCES] Envoi relances paiements en retard")
    return {"status": "queued", "timestamp": datetime.now().isoformat()}
