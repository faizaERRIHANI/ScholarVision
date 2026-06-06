#!/bin/bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$PROJECT_DIR/infra/backups"
docker compose -f "$PROJECT_DIR/docker-compose.yml" exec -T postgres \
  pg_dump -U scolaire gestion_scolaire | \
  gzip > "$PROJECT_DIR/infra/backups/postgres_$TIMESTAMP.sql.gz"
echo "Backup sauvegarde : postgres_$TIMESTAMP.sql.gz"
