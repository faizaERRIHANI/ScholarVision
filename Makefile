# ════════════════════════════════════════════════════════════
# EduPilot — Raccourcis Make
# Usage : make <commande>
# ════════════════════════════════════════════════════════════

.PHONY: help setup dev backend frontend ml docker-up docker-down logs clean test

help: ## Affiche cette aide
	@echo "Commandes disponibles :"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: ## Installation complète de l'environnement
	@chmod +x scripts/setup.sh
	@./scripts/setup.sh

backend: ## Lance le backend FastAPI
	@cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

frontend: ## Lance le frontend React + Vite
	@cd frontend && npm run dev

ml: ## Lance le service ML Flask
	@cd ml_service && source venv/bin/activate && python app.py

docker-up: ## Lance tous les services en Docker
	@docker compose up -d --build

docker-down: ## Arrête tous les conteneurs
	@docker compose down

logs: ## Affiche les logs Docker en temps réel
	@docker compose logs -f

clean: ## Nettoie les builds et caches
	@find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name node_modules -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name dist -exec rm -rf {} + 2>/dev/null || true
	@echo "✅ Nettoyage terminé"

test: ## Lance les tests pytest
	@cd backend && source venv/bin/activate && pytest tests/ -v
