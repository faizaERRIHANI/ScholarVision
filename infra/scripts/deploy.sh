#!/bin/bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_DIR"
echo "[1/5] Build images..."
docker compose build --no-cache
echo "[2/5] Restart services..."
docker compose down --remove-orphans
docker compose up -d
echo "[3/5] Waiting PostgreSQL..."
for i in $(seq 1 30); do
  docker compose exec -T postgres pg_isready -U scolaire >/dev/null 2>&1 && break
  sleep 2
done
echo "[4/5] Migrations Alembic..."
docker compose exec -T backend alembic upgrade head
echo "[5/5] Health check..."
sleep 5
curl -sf http://localhost/api/health && echo " Backend OK"
docker compose ps
echo "Deploiement termine → http://localhost"
