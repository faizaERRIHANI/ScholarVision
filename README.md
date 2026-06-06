# 🎓 ScholarVision — Plateforme de Gestion Scolaire avec IA

> Système web complet de gestion scolaire avec **reconnaissance faciale YOLO + ArcFace**, tableau de bord analytique, gestion des présences en temps réel, bulletins PDF automatiques.

**Auteur :** ERRIHANI Faiza · ENSET Média · 2025/2026

---

## 🛠️ Stack Technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| **Frontend** | React + Vite + TailwindCSS | React 18 / Vite 5 |
| **Backend** | FastAPI (Python) | 3.14 / FastAPI 0.115 |
| **ML Service** | Flask + YOLOv8 + ArcFace | Ultralytics 8.x / insightface |
| **Base de données** | PostgreSQL + pgvector | 18.3 (16 dans Docker) |
| **Cache & Sessions** | Redis | 7 |
| **Reverse Proxy** | Nginx | Alpine |
| **Conteneurs** | Docker + Docker Compose | latest |

---

## 📁 Architecture du Monoreposchool-platform/

```
├── frontend/                  # Application React + Vite
│   ├── public/                # Assets statiques
│   └── src/
│       ├── components/        # Composants UI réutilisables
│       ├── pages/             # Pages / vues
│       ├── hooks/             # Hooks React custom
│       ├── services/          # Appels API (axios)
│       ├── styles/            # CSS / Tailwind
│       └── utils/             # Helpers
│
├── backend/                   # API FastAPI
│   ├── app/
│   │   ├── api/               # Routes / endpoints
│   │   ├── models/            # Modèles SQLAlchemy
│   │   ├── schemas/           # Schémas Pydantic
│   │   ├── services/          # Logique métier
│   │   ├── core/              # Config, sécurité, DB
│   │   └── utils/             # Helpers
│   ├── migrations/            # Migrations Alembic
│   ├── scripts/               # seed_data.py, etc.
│   └── tests/                 # Tests pytest
│
├── ml_service/                # Microservice IA
│   ├── api/                   # Routes Flask
│   ├── routes/                # Blueprints (recognition, stream)
│   ├── services/              # RecognitionService
│   ├── models/                # FaceDetector, FaceEmbedder
│   ├── utils/                 # image_utils, db_utils
│   ├── data/                  # Données / cache
│   └── tests/                 # Tests
│
├── infra/                     # Infrastructure
│   ├── docker/                # Dockerfiles annexes
│   ├── nginx/                 # Config Nginx
│   └── scripts/               # deploy.sh, backup.sh, rollback.sh
│
├── uploads/                   # Photos élèves, bulletins, embeddings
├── docs/                      # Documentation
├── scripts/                   # setup.sh, utilitaires
│
├── docker-compose.yml         # Orchestration des services
├── .env                       # Variables d'environnement (NON committé)
├── .env.example               # Template public
└── README.md                  # Ce fichier---

```
## 🚀 Démarrage rapide

### Mode développement (sans Docker)

```bash
# 1. Installation automatique de tout
chmod +x scripts/setup.sh
./scripts/setup.sh

# 2. Lancer chaque service dans un terminal séparé
# Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm run dev

# ML Service
cd ml_service && source venv/bin/activate && python app.py
```

### Mode Docker (production-like)

```bash
docker compose up --build
```

---

## 🔌 Ports & URLs

| Service | URL locale | Port |
|---------|------------|------|
| Frontend | http://localhost:5173 | 5173 |
| Backend API | http://localhost:8000 | 8000 |
| Backend Docs | http://localhost:8000/docs | 8000 |
| ML Service | http://localhost:5001 | 5001 |
| PostgreSQL | localhost:5432 | 5432 |
| Redis | localhost:6379 | 6379 |
| Nginx (Docker) | http://localhost | 80 |

---

## 📚 Documentation

- [Setup environnement](docs/installation_environnement_st2.docx)
- [Schéma base de données](docs/database_schema.md) *(à venir Partie 2)*
- [API Reference](http://localhost:8000/docs) *(Swagger une fois lancé)*

---

## 🧑‍💻 Crédits

Projet académique réalisé dans le cadre du Master à l'ENSET Mohammedia.
