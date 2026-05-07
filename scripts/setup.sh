#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════
# EduPilot — Setup automatique de l'environnement
# Usage : chmod +x scripts/setup.sh && ./scripts/setup.sh
# ════════════════════════════════════════════════════════════

set -euo pipefail
IFS=$'\n\t'

# ── Couleurs ────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC}    $1"; }
success() { echo -e "${GREEN}[OK]${NC}      $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}    $1"; }
error()   { echo -e "${RED}[ERREUR]${NC}  $1"; exit 1; }
section() { echo ""; echo -e "${CYAN}━━━ $1 ━━━${NC}"; }

# ── Racine du projet ────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   🎓  EduPilot — Setup automatique           ║"
echo "║       ERRIHANI Faiza · ENSET 2025/2026       ║"
echo "╚══════════════════════════════════════════════╝"
info "Répertoire : $PROJECT_ROOT"

# ════════════════════════════════════════════════════════════
# 1/6 — Prérequis
# ════════════════════════════════════════════════════════════
section "1/6 — Vérification des prérequis"

check_cmd() {
    local cmd="$1" name="$2" min="$3"
    if command -v "$cmd" &>/dev/null; then
        local v
        v=$($cmd --version 2>&1 | head -1)
        success "$name : $v"
    else
        error "$name non installé (>= $min requis)"
    fi
}

check_cmd node "Node.js" "20"
check_cmd npm "npm" "10"
check_cmd python3 "Python" "3.12"
check_cmd pip3 "pip" "23"
check_cmd psql "PostgreSQL" "16"
check_cmd git "Git" "2.x"

if command -v redis-cli &>/dev/null; then
    success "Redis : $(redis-cli --version)"
else
    warn "Redis non détecté localement (sera utilisé via Docker)"
fi

if command -v docker &>/dev/null; then
    success "Docker : $(docker --version)"
else
    warn "Docker non détecté (optionnel pour le dev local)"
fi

# ════════════════════════════════════════════════════════════
# 2/6 — Fichier .env
# ════════════════════════════════════════════════════════════
section "2/6 — Configuration .env"

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")
        # macOS sed est différent — ici on cible Linux
        sed -i "s|GENERATE_A_64_CHAR_HEX_KEY|$SECRET|g" .env
        sed -i "s|CHANGE_ME|scolaire123|g" .env
        success ".env créé depuis .env.example (clé secrète générée)"
    else
        error ".env.example introuvable. Crée-le d'abord."
    fi
else
    success ".env déjà présent"
fi

# Charger les variables
set -a
# shellcheck disable=SC1091
source .env
set +a

# ════════════════════════════════════════════════════════════
# 3/6 — Backend (FastAPI)
# ════════════════════════════════════════════════════════════
section "3/6 — Backend FastAPI"

cd "$PROJECT_ROOT/backend"

if [ ! -d "venv" ]; then
    info "Création du venv backend..."
    python3 -m venv venv
    success "venv créé"
else
    success "venv déjà existant"
fi

# shellcheck disable=SC1091
source venv/bin/activate
pip install --upgrade pip --quiet

# requirements.txt minimal pour la Partie 1 — étendu en Partie 2
if [ ! -f "requirements.txt" ]; then
    cat > requirements.txt << 'REQEOF'
# Dépendances minimales (étendues en Partie 2)
fastapi==0.115.5
uvicorn[standard]==0.32.0
python-dotenv==1.0.1
pydantic==2.10.3
pydantic-settings==2.6.1
REQEOF
    success "requirements.txt minimal créé"
fi

info "Installation des dépendances backend..."
pip install -r requirements.txt --quiet
success "Backend prêt"

deactivate

# ════════════════════════════════════════════════════════════
# 4/6 — Frontend (React + Vite)
# ════════════════════════════════════════════════════════════
section "4/6 — Frontend React + Vite"

cd "$PROJECT_ROOT/frontend"

if [ ! -f "package.json" ]; then
    warn "package.json absent — sera initialisé en Partie 6"
else
    info "Installation des dépendances npm..."
    npm install --silent
    success "Frontend prêt"
fi

# ════════════════════════════════════════════════════════════
# 5/6 — ML Service (Flask)
# ════════════════════════════════════════════════════════════
section "5/6 — ML Service Flask"

cd "$PROJECT_ROOT/ml_service"

if [ ! -d "venv" ]; then
    info "Création du venv ml_service..."
    python3 -m venv venv
    success "venv créé"
else
    success "venv déjà existant"
fi

# shellcheck disable=SC1091
source venv/bin/activate
pip install --upgrade pip --quiet

if [ ! -f "requirements.txt" ]; then
    cat > requirements.txt << 'REQEOF'
# Dépendances ML minimales (étendues en Partie 4)
flask==3.0.3
flask-cors==5.0.0
python-dotenv==1.0.1
REQEOF
    success "requirements.txt minimal créé"
fi

pip install -r requirements.txt --quiet
success "ML service prêt"

deactivate

# ════════════════════════════════════════════════════════════
# 6/6 — Base de données PostgreSQL
# ════════════════════════════════════════════════════════════
section "6/6 — Base de données PostgreSQL"

cd "$PROJECT_ROOT"

if PGPASSWORD="${POSTGRES_PASSWORD}" psql -U "${POSTGRES_USER}" -h localhost -d "${POSTGRES_DB}" -c '\q' 2>/dev/null; then
    success "Base '${POSTGRES_DB}' accessible avec user '${POSTGRES_USER}'"
else
    warn "Connexion à '${POSTGRES_DB}' impossible avec '${POSTGRES_USER}'"
    info "Tentative de création..."
    if sudo -n true 2>/dev/null; then
        sudo -u postgres psql -c "CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';" 2>/dev/null || true
        sudo -u postgres psql -c "CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER};" 2>/dev/null || true
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};" 2>/dev/null || true
        success "User et base créés (si nécessaire)"
    else
        warn "Crée manuellement :"
        echo "  sudo -u postgres psql"
        echo "  CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';"
        echo "  CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER};"
    fi
fi

# Dossier uploads
mkdir -p "$PROJECT_ROOT/uploads"/{photos,bulletins,faces,documents}
success "Dossier uploads/ prêt"

# ════════════════════════════════════════════════════════════
# Résumé
# ════════════════════════════════════════════════════════════
echo ""
echo "╔══════════════════════════════════════════════╗"
echo -e "║   ${GREEN}✓ INSTALLATION TERMINÉE${NC}                    ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "Pour lancer les services :"
echo ""
echo "  Backend  :  cd backend && source venv/bin/activate"
echo "              uvicorn app.main:app --reload --port 8000"
echo ""
echo "  Frontend :  cd frontend && npm run dev"
echo ""
echo "  ML       :  cd ml_service && source venv/bin/activate"
echo "              python app.py"
echo ""
echo "Ou avec Docker :"
echo "  docker compose up --build"
echo ""
