.PHONY: help prod prod-down prod-logs prod-rebuild logs clean rebuild certs status build up down restart

# --- rilevamento senza eseguire uname su cmd.exe ---
IS_WINDOWS := $(filter Windows_NT,$(OS))

ifeq ($(IS_WINDOWS),Windows_NT)
  UNAME_S :=
else
  UNAME_S := $(shell uname -s 2>/dev/null)
endif

IS_MINGW := $(findstring MINGW,$(UNAME_S))
IS_MSYS  := $(findstring MSYS,$(UNAME_S))
IS_CYGWIN:= $(findstring CYGWIN,$(UNAME_S))

# --- shell di default e flags ---
SHELL := /bin/sh
.SHELLFLAGS := -c

# --- preferisci bash quando disponibile (Git Bash / MSYS / WSL) ---
ifeq ($(IS_WINDOWS),Windows_NT)
  # su Windows prova a trovare bash (where è disponibile su cmd)
  ifneq ($(strip $(shell where bash 2>nul)),)
    SHELL := bash
    .SHELLFLAGS := -lc
  endif
else ifneq ($(IS_MINGW),)
  SHELL := /usr/bin/bash
  .SHELLFLAGS := -lc
else ifneq ($(IS_MSYS),)
  SHELL := /usr/bin/bash
  .SHELLFLAGS := -lc
else ifneq ($(IS_CYGWIN),)
  SHELL := /usr/bin/bash
  .SHELLFLAGS := -lc
endif



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

# SSL CERTIFICATES (cross-platform)
certs:
	@echo "🔐 Generating SSL certificates (cross-platform)..."
ifeq ($(OS),Windows_NT)
	@echo "Detected Windows environment."
	@powershell -NoProfile -Command "if (-not (Test-Path 'docker/certs/server.crt') -or -not (Test-Path 'docker/certs/server.key')) { Write-Host '⚠️  SSL certificates not found. Generating...'; exit 0 } else { Write-Host '✅ SSL certificates found.'; exit 1 }" 2>nul || true
	@powershell -NoProfile -Command "if (-not (Test-Path 'docker/certs/server.crt') -or -not (Test-Path 'docker/certs/server.key')) { \
        if (Get-Command bash -ErrorAction SilentlyContinue) { \
            Write-Host 'Using bash to generate certs...'; bash -lc 'chmod +x docker/certs/generate-certs.sh && docker/certs/generate-certs.sh'; \
        } else { \
            if (Test-Path 'docker/certs/generate-certs.ps1') { \
                Write-Host 'Using PowerShell script to generate certs...'; \
                powershell -NoProfile -ExecutionPolicy Bypass -File 'docker/certs/generate-certs.ps1'; \
            } else if (Test-Path 'docker/certs/generate-certs.bat') { \
                Write-Host 'Using batch script to generate certs...'; \
                cmd /c 'docker\\certs\\generate-certs.bat'; \
            } else { \
                Write-Error 'No generator script found (bash/ps1/bat).'; exit 1; \
            } \
        } \
    } else { Write-Host 'Certificates already present.' }"
else
	@echo "Detected Unix-like environment."
	@if [ ! -f docker/certs/server.crt ] || [ ! -f docker/certs/server.key ]; then \
		echo "⚠️  SSL certificates not found. Generating..."; \
		chmod +x docker/certs/generate-certs.sh 2>/dev/null || true; \
        if command -v bash >/dev/null 2>&1; then \
            bash docker/certs/generate-certs.sh; \
        elif command -v openssl >/dev/null 2>&1; then \
            # fallback: run the POSIX script with /bin/sh if bash missing \
            sh docker/certs/generate-certs.sh; \
        else \
            echo "❌ openssl not found in PATH."; exit 1; \
        fi; \
    else \
        echo "✅ SSL certificates found."; \
    fi
endif

# ===========================================
# PRODUCTION
# ===========================================

prod: check-certs
	@echo "🚀 Building and starting production environment..."
	docker-compose -f docker/compose.prod.yml --env-file .env up -d --build
	@echo ""
	@echo "✅ Production servers running:"
	@echo "   Frontend:     https://localhost (Nginx + SSL)"
	@echo "   Game Service: wss://localhost:3000 (WebSocket Secure)"
	@echo "   Auth Service: https://localhost:8001 (REST API)"
	@echo "   PostgreSQL:   localhost:5433"
	@echo ""

prod-down:
	@echo "🛑 Stopping production containers..."
	docker-compose -f docker/compose.prod.yml --env-file .env down

prod-logs:
	docker-compose -f docker/compose.prod.yml --env-file .env logs -f

prod-rebuild: check-certs
	@echo "🔄 Rebuilding production environment..."
	docker-compose -f docker/compose.prod.yml --env-file .env down 
	docker-compose -f docker/compose.prod.yml --env-file .env up -d --build

# ===========================================
# UTILITIES
# ===========================================

# check-certs cross-platform (Windows handled entirely inside one PowerShell command)
check-certs:
	@echo "Verifying SSL certificates..."
ifeq ($(OS),Windows_NT)
	@perl docker/certs/check_and_generate_certs.pl
else
	@echo "Detected Unix-like environment."
	@if [ -f docker/certs/server.crt ] && [ -f docker/certs/server.key ]; then \
        echo "✅ SSL certificates found."; \
    else \
        echo "⚠️  SSL certificates not found. Generating..."; \
        chmod +x docker/certs/generate-certs.sh 2>/dev/null || true; \
        if command -v bash >/dev/null 2>&1; then \
            bash docker/certs/generate-certs.sh; \
        elif command -v openssl >/dev/null 2>&1; then \
            sh docker/certs/generate-certs.sh; \
        else \
            echo "❌ openssl not found in PATH."; exit 1; \
        fi; \
    fi
endif



status:
	@echo "📊 Container status:"
	@docker ps --filter "name=pong" --filter "name=transcendence" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

clean:
	@echo "🧹 Cleaning all Docker resources..."
	docker-compose -f docker/compose.prod.yml --env-file .env down -v --rmi all 2>/dev/null || true
	@echo "✅ Cleaned all containers, images, and volumes"

# Alias per retrocompatibilità
build: prod
up: prod
down: prod-down
logs: prod-logs
restart: prod-rebuild
