"""
Seed — peuple la base avec :
1 admin + 5 enseignants + 6 classes + 10 matieres + 20 eleves +
15 frais + emploi du temps complet 3eme B.
Usage : python -m scripts.seed_data
"""
import asyncio
import random
import sys
from datetime import date, time, timedelta
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from passlib.context import CryptContext
from sqlalchemy import select

from app.core.database import AsyncSessionLocal, engine
from app.models import (
    User, UserRole,
    Classroom, EducationLevel,
    Student, Gender,
    Staff, StaffRole, ContractType,
    Subject,
    Schedule,
    Fee, FeeType, FeeStatus,
)


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ACADEMIC_YEAR = "2025-2026"


def hash_password(p): return pwd_context.hash(p)


TEACHER_DATA = [
    {"first": "Khadija", "last": "El Amrani", "email": "k.elamrani@ecole.ma",
     "spec": "Mathematiques", "diploma": "Master Mathematiques", "exp": 12},
    {"first": "Rachid", "last": "Bennani", "email": "r.bennani@ecole.ma",
     "spec": "Francais", "diploma": "Licence Lettres", "exp": 8},
    {"first": "Samira", "last": "Tazi", "email": "s.tazi@ecole.ma",
     "spec": "SVT", "diploma": "Master Biologie", "exp": 6},
    {"first": "Youssef", "last": "Alaoui", "email": "y.alaoui@ecole.ma",
     "spec": "Histoire-Geo", "diploma": "Master Histoire", "exp": 15},
    {"first": "Fatima", "last": "Benkirane", "email": "f.benkirane@ecole.ma",
     "spec": "Anglais", "diploma": "Licence Anglais", "exp": 4},
]

CLASSROOM_DATA = [
    {"name": "CE2 A",     "level": EducationLevel.CE2,       "section": "A",    "room": "P-101"},
    {"name": "CM2 B",     "level": EducationLevel.CM2,       "section": "B",    "room": "P-205"},
    {"name": "3eme B",    "level": EducationLevel.TROISIEME, "section": "B",    "room": "C-301"},
    {"name": "2eme A",    "level": EducationLevel.SECONDE,   "section": "A",    "room": "L-202"},
    {"name": "1ere Tech", "level": EducationLevel.PREMIERE,  "section": "Tech", "room": "L-305"},
    {"name": "Term S",    "level": EducationLevel.TERMINALE, "section": "S",    "room": "L-410"},
]

SUBJECT_DATA = [
    {"name": "Mathematiques",       "code": "MATH", "coef": 4, "hours": 5, "color": "#1a56db"},
    {"name": "Francais",            "code": "FR",   "coef": 4, "hours": 5, "color": "#dc2626"},
    {"name": "Anglais",             "code": "ANG",  "coef": 2, "hours": 3, "color": "#059669"},
    {"name": "SVT",                 "code": "SVT",  "coef": 3, "hours": 3, "color": "#16a34a"},
    {"name": "Physique-Chimie",     "code": "PC",   "coef": 3, "hours": 4, "color": "#7c3aed"},
    {"name": "Histoire-Geographie", "code": "HG",   "coef": 2, "hours": 3, "color": "#ea580c"},
    {"name": "Arabe",               "code": "AR",   "coef": 3, "hours": 4, "color": "#0891b2"},
    {"name": "Education Islamique", "code": "EI",   "coef": 2, "hours": 2, "color": "#65a30d"},
    {"name": "Sport (EPS)",         "code": "EPS",  "coef": 1, "hours": 2, "color": "#f59e0b"},
    {"name": "Informatique",        "code": "INFO", "coef": 1, "hours": 2, "color": "#6366f1"},
]

NAMES_M = ["Karim", "Mehdi", "Yassine", "Anas", "Adam", "Omar", "Hamza", "Ayoub", "Ilyas", "Ismail"]
NAMES_F = ["Salma", "Imane", "Nour", "Sara", "Lina", "Yasmine", "Aya", "Hiba", "Maryam", "Zineb"]
LAST = ["Mansouri", "El Idrissi", "Cherkaoui", "Berrada", "Lahlou", "Benjelloun",
        "Fassi", "Squalli", "Tahiri", "Naciri", "Ouazzani", "Hassani"]
CITIES = ["Fes", "Casablanca", "Rabat", "Meknes", "Marrakech", "Tanger"]


async def seed_admin(s):
    if await s.scalar(select(User).where(User.email == "admin@ecole.ma")):
        print("  - admin existant"); return
    s.add(User(
        email="admin@ecole.ma", hashed_password=hash_password("admin123"),
        role=UserRole.DIRECTEUR, first_name="Mohammed", last_name="El Hassani",
        phone="+212661234567", is_active=True, is_verified=True,
    ))
    await s.flush()
    print("  + Directeur : admin@ecole.ma / admin123")


async def seed_teachers(s):
    teachers = []
    for i, d in enumerate(TEACHER_DATA, 1):
        existing = await s.scalar(select(User).where(User.email == d["email"]))
        if existing:
            t = await s.scalar(select(Staff).where(Staff.user_id == existing.id))
            if t: teachers.append(t); continue
        u = User(email=d["email"], hashed_password=hash_password("teacher123"),
                 role=UserRole.ENSEIGNANT, first_name=d["first"], last_name=d["last"],
                 phone=f"+21266{random.randint(1000000, 9999999)}",
                 is_active=True, is_verified=True)
        s.add(u); await s.flush()
        t = Staff(
            user_id=u.id, employee_number=f"PROF-2025-{i:03d}",
            first_name=d["first"], last_name=d["last"],
            role=StaffRole.ENSEIGNANT, department="Pedagogie",
            specialization=d["spec"], contract_type=ContractType.CDI,
            contract_start=date(2018, 9, 1), monthly_salary=Decimal("8500.00"),
            hire_date=date(2018, 9, 1), phone=u.phone,
            address=f"Av. Hassan II, {random.choice(CITIES)}",
            diploma=d["diploma"], years_experience=d["exp"], is_active=True,
        )
        s.add(t); await s.flush(); teachers.append(t)
        print(f"  + Prof : {t.full_name} ({d['spec']})")
    return teachers


async def seed_classrooms(s, teachers):
    rooms = []
    for i, d in enumerate(CLASSROOM_DATA):
        existing = await s.scalar(select(Classroom).where(
            Classroom.name == d["name"], Classroom.academic_year == ACADEMIC_YEAR))
        if existing: rooms.append(existing); continue
        c = Classroom(name=d["name"], level=d["level"], section=d["section"],
                      capacity=30, room_number=d["room"],
                      head_teacher_id=teachers[i % len(teachers)].id,
                      academic_year=ACADEMIC_YEAR)
        s.add(c); await s.flush(); rooms.append(c)
        print(f"  + Classe : {c.name}")
    return rooms


async def seed_subjects(s):
    subjects = []
    for d in SUBJECT_DATA:
        existing = await s.scalar(select(Subject).where(Subject.code == d["code"]))
        if existing: subjects.append(existing); continue
        sub = Subject(name=d["name"], code=d["code"], coefficient=d["coef"],
                      hours_per_week=d["hours"], color_hex=d["color"])
        s.add(sub); await s.flush(); subjects.append(sub)
        print(f"  + Matiere : {sub.name} (coef {sub.coefficient})")
    return subjects


async def seed_students(s, classrooms):
    students = []
    counter = 1
    age_map = {EducationLevel.CE2: 8, EducationLevel.CM2: 10,
               EducationLevel.TROISIEME: 14, EducationLevel.SECONDE: 15,
               EducationLevel.PREMIERE: 16, EducationLevel.TERMINALE: 17}
    for c in classrooms:
        n = 4 if counter <= 8 else 3
        for _ in range(n):
            if counter > 20: break
            male = random.choice([True, False])
            first = random.choice(NAMES_M if male else NAMES_F)
            last = random.choice(LAST)
            age = age_map.get(c.level, 13)
            dob = date.today() - timedelta(days=age * 365 + random.randint(0, 364))
            st = Student(
                student_number=f"EL-2025-{counter:04d}",
                first_name=first, last_name=last, date_of_birth=dob,
                gender=Gender.M if male else Gender.F,
                address=f"Rue {random.randint(1, 99)}",
                city=random.choice(CITIES), nationality="Marocaine",
                class_id=c.id, level=c.level.value,
                parent1_name=f"M./Mme {last}",
                parent1_phone=f"+21266{random.randint(1000000, 9999999)}",
                parent1_email=f"parent.{last.lower().replace(' ', '')}@gmail.com",
                enrollment_date=date(2025, 9, 1), is_active=True,
            )
            s.add(st); await s.flush(); students.append(st)
            print(f"  + {st.student_number} {st.full_name} -> {c.name}")
            counter += 1
    return students


async def seed_fees(s, students):
    dist = [FeeStatus.PAID]*7 + [FeeStatus.PARTIAL]*4 + [FeeStatus.PENDING]*3 + [FeeStatus.OVERDUE]*1
    for i, st in enumerate(students[:15]):
        status = dist[i]; total = Decimal("3500.00")
        if status == FeeStatus.PAID:
            paid = total; rem = Decimal("0")
            pdate = date.today() - timedelta(days=random.randint(5, 30))
        elif status == FeeStatus.PARTIAL:
            paid = Decimal("1500.00"); rem = total - paid
            pdate = date.today() - timedelta(days=random.randint(10, 25))
        else:
            paid = Decimal("0"); rem = total; pdate = None
        s.add(Fee(student_id=st.id, academic_year=ACADEMIC_YEAR,
                  fee_type=FeeType.SCOLARITE, total_amount=total,
                  paid_amount=paid, remaining_amount=rem,
                  due_date=date(2025, 10, 15), paid_date=pdate, status=status,
                  receipt_number=f"REC-2025-{i+1:04d}" if paid > 0 else None))
        print(f"  + Frais : {st.full_name} -> {status.value}")
    await s.flush()


async def seed_schedule(s, classroom, teachers, subjects):
    sp = {t.specialization: t for t in teachers}
    sb = {sub.code: sub for sub in subjects}
    plan = [
        (1, time(8, 0),  time(9, 0),  "MATH", "Mathematiques"),
        (1, time(9, 0),  time(10, 0), "FR",   "Francais"),
        (1, time(10, 15), time(11, 15), "ANG", "Anglais"),
        (1, time(11, 15), time(12, 15), "SVT", "SVT"),
        (1, time(14, 0), time(15, 0), "HG",   "Histoire-Geo"),
        (2, time(8, 0),  time(9, 0),  "FR",   "Francais"),
        (2, time(9, 0),  time(10, 0), "MATH", "Mathematiques"),
        (2, time(10, 15), time(11, 15), "AR",  "Francais"),
        (2, time(11, 15), time(12, 15), "EI",  "Histoire-Geo"),
        (2, time(14, 0), time(15, 0), "INFO", "SVT"),
        (3, time(8, 0),  time(9, 0),  "MATH", "Mathematiques"),
        (3, time(9, 0),  time(10, 0), "PC",   "SVT"),
        (3, time(10, 15), time(11, 15), "FR",  "Francais"),
        (3, time(11, 15), time(12, 15), "ANG", "Anglais"),
        (4, time(8, 0),  time(9, 0),  "SVT",  "SVT"),
        (4, time(9, 0),  time(10, 0), "MATH", "Mathematiques"),
        (4, time(10, 15), time(11, 15), "HG",  "Histoire-Geo"),
        (4, time(11, 15), time(12, 15), "AR",  "Francais"),
        (4, time(14, 0), time(15, 0), "PC",   "SVT"),
        (5, time(8, 0),  time(9, 0),  "FR",   "Francais"),
        (5, time(9, 0),  time(10, 0), "MATH", "Mathematiques"),
        (5, time(10, 15), time(11, 15), "ANG", "Anglais"),
        (5, time(11, 15), time(12, 15), "EI",  "Histoire-Geo"),
        (6, time(8, 0),  time(9, 0),  "MATH", "Mathematiques"),
        (6, time(9, 0),  time(10, 0), "FR",   "Francais"),
        (6, time(10, 15), time(11, 15), "SVT", "SVT"),
    ]
    for day, start, end, code, spec in plan:
        sub = sb.get(code); t = sp.get(spec) or teachers[0]
        if not sub: continue
        s.add(Schedule(classroom_id=classroom.id, subject_id=sub.id, staff_id=t.id,
                       day_of_week=day, start_time=start, end_time=end,
                       room=classroom.room_number, academic_year=ACADEMIC_YEAR,
                       semester=1, is_active=True))
    await s.flush()
    print(f"  + Emploi du temps {classroom.name} ({len(plan)} creneaux)")


async def main():
    print("=" * 60); print("  SEED DATA - School Platform"); print("=" * 60)
    async with AsyncSessionLocal() as session:
        try:
            print("\n[1/7] Admin..."); await seed_admin(session)
            print("\n[2/7] Enseignants..."); teachers = await seed_teachers(session)
            print("\n[3/7] Matieres..."); subjects = await seed_subjects(session)
            print("\n[4/7] Classes..."); classrooms = await seed_classrooms(session, teachers)
            print("\n[5/7] Eleves..."); students = await seed_students(session, classrooms)
            print("\n[6/7] Frais..."); await seed_fees(session, students)
            print("\n[7/7] Emploi du temps 3eme B...")
            c3b = next((c for c in classrooms if c.name == "3eme B"), None)
            if c3b: await seed_schedule(session, c3b, teachers, subjects)
            await session.commit()
            print("\n" + "=" * 60); print("  SEED OK"); print("=" * 60)
            print("\n  Connexion :")
            print("    admin@ecole.ma / admin123")
            print("    k.elamrani@ecole.ma (et autres profs) / teacher123\n")
        except Exception as e:
            await session.rollback(); print(f"\nERREUR : {e}"); raise
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
