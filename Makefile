.PHONY: build up down ps logs migrate seed backup deploy test clean

COMPOSE := docker compose

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d && echo "→ http://localhost"

down:
	$(COMPOSE) down

ps:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f

logs-backend:
	$(COMPOSE) logs -f backend

logs-ml:
	$(COMPOSE) logs -f ml_service

migrate:
	$(COMPOSE) exec backend alembic upgrade head

seed:
	$(COMPOSE) exec backend python scripts/seed_data.py

psql:
	$(COMPOSE) exec postgres psql -U scolaire -d gestion_scolaire

backup:
	./infra/scripts/backup.sh

deploy:
	./infra/scripts/deploy.sh

test:
	$(COMPOSE) exec backend pytest tests/ -v

clean:
	$(COMPOSE) down -v --rmi local
