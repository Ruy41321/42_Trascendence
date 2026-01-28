.PHONY: help build up down logs clean dev dev-down prod prod-down restart

help:
	@echo "Pong 4-Player Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start in development mode (hot reload)"
	@echo "  make dev-down     - Stop development containers"
	@echo ""
	@echo "Production:"
	@echo "  make build        - Build production images"
	@echo "  make up           - Start production containers"
	@echo "  make down         - Stop production containers"
	@echo "  make prod         - Build and start production"
	@echo "  make prod-down    - Stop and remove production"
	@echo ""
	@echo "Utils:"
	@echo "  make logs         - View logs"
	@echo "  make restart      - Restart containers"
	@echo "  make clean        - Remove all containers, images, volumes"

# Development
dev:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development servers running:"
	@echo "  Backend:  http://localhost:3000"
	@echo "  Frontend: http://localhost:5173"

dev-down:
	docker-compose -f docker-compose.dev.yml down

# Production
build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

prod: build up
	@echo "Production servers running:"
	@echo "  Backend:  http://localhost:3000"
	@echo "  Frontend: http://localhost:8080"

prod-down: down

# Utils
logs:
	docker-compose logs -f

restart:
	docker-compose restart

clean:
	docker-compose -f docker-compose.yml down -v --rmi all
	docker-compose -f docker-compose.dev.yml down -v --rmi all
	@echo "Cleaned all containers, images, and volumes"
