.PHONY: help dev dev-down dev-logs prod prod-down prod-logs logs clean rebuild certs

# ===========================================
# PONG 4-PLAYER - DOCKER COMMANDS
# ===========================================

help:
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║           🏓 PONG 4-PLAYER - Docker Commands                 ║"
	@echo "╠══════════════════════════════════════════════════════════════╣"
	@echo "║                                                              ║"
	@echo "║  SETUP                                                       ║"
	@echo "║    make certs        Generate SSL certificates (first time)  ║"
	@echo "║                                                              ║"
	@echo "║  DEVELOPMENT (hot reload + HTTPS)                            ║"
	@echo "║    make dev          Start dev containers                    ║"
	@echo "║    make dev-down     Stop dev containers                     ║"
	@echo "║    make dev-logs     View dev logs                           ║"
	@echo "║    make dev-rebuild  Rebuild and start dev                   ║"
	@echo "║                                                              ║"
	@echo "║  PRODUCTION (optimized + HTTPS)                              ║"
	@echo "║    make prod         Build and start production              ║"
	@echo "║    make prod-down    Stop production containers              ║"
	@echo "║    make prod-logs    View production logs                    ║"
	@echo "║    make prod-rebuild Rebuild and start production            ║"
	@echo "║                                                              ║"
	@echo "║  UTILITIES                                                   ║"
	@echo "║    make clean        Remove all containers/images/volumes    ║"
	@echo "║    make status       Show running containers                 ║"
	@echo "║                                                              ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""

# ===========================================
# SSL CERTIFICATES
# ===========================================

certs:
	@echo "🔐 Generating SSL certificates..."
	@chmod +x docker/certs/generate-certs.sh
	@docker/certs/generate-certs.sh

# ===========================================
# DEVELOPMENT
# ===========================================

dev: check-certs
	@echo "🚀 Starting development environment..."
	docker-compose -f docker/compose.dev.yml up -d
	@echo ""
	@echo "✅ Development servers running:"
	@echo "   Frontend: https://localhost:5173 (Vite + Hot Reload + HTTPS)"
	@echo "   Backend:  wss://localhost:3000 (WebSocket Secure)"
	@echo ""
	@echo "⚠️  Browser may warn about self-signed certificate - click 'Advanced' → 'Proceed'"
	@echo ""

dev-down:
	@echo "🛑 Stopping development containers..."
	docker-compose -f docker/compose.dev.yml down

dev-logs:
	docker-compose -f docker/compose.dev.yml logs -f

dev-rebuild: check-certs
	@echo "🔄 Rebuilding development environment..."
	docker-compose -f docker/compose.dev.yml up -d --build

# ===========================================
# PRODUCTION
# ===========================================

prod: check-certs
	@echo "🚀 Building and starting production environment..."
	docker-compose -f docker/compose.prod.yml up -d --build
	@echo ""
	@echo "✅ Production servers running:"
	@echo "   Frontend: https://localhost (Nginx + SSL)"
	@echo "   Backend:  wss://localhost:3000 (WebSocket Secure)"
	@echo ""

prod-down:
	@echo "🛑 Stopping production containers..."
	docker-compose -f docker/compose.prod.yml down

prod-logs:
	docker-compose -f docker/compose.prod.yml logs -f

prod-rebuild: check-certs
	@echo "🔄 Rebuilding production environment..."
	docker-compose -f docker/compose.prod.yml up -d --build

# ===========================================
# UTILITIES
# ===========================================

check-certs:
	@if [ ! -f docker/certs/server.crt ] || [ ! -f docker/certs/server.key ]; then \
		echo "⚠️  SSL certificates not found. Generating..."; \
		$(MAKE) certs; \
	fi

status:
	@echo "📊 Container status:"
	@docker ps --filter "name=pong" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

clean:
	@echo "🧹 Cleaning all Docker resources..."
	docker-compose -f docker/compose.prod.yml down -v --rmi all 2>/dev/null || true
	docker-compose -f docker/compose.dev.yml down -v --rmi all 2>/dev/null || true
	@echo "✅ Cleaned all containers, images, and volumes"

# Alias per retrocompatibilità
build: prod
up: prod
down: prod-down
logs: dev-logs
restart: dev-rebuild
