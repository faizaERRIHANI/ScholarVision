import logging
from app.core.config import settings
logger = logging.getLogger(__name__)

async def send_absence_alert(parent_email: str, student_name: str, date: str):
    logger.info(f"[EMAIL] Absence → {parent_email} | {student_name} | {date}")
    return True

async def send_fee_reminder(family_email: str, amount: float, days_late: int):
    logger.info(f"[EMAIL] Relance → {family_email} | {amount} MAD | {days_late}j")
    return True

async def send_bulletin(parent_email: str, student_name: str, pdf_path: str):
    logger.info(f"[EMAIL] Bulletin → {parent_email} | {student_name}")
    return True
