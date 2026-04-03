# Docker Infrastructure

## Overview

This project now uses a single production-grade Docker stack.

Core services:
- frontend (Nginx + HTTPS on 443)
- game-service (WebSocket backend)
- auth-service (FastAPI auth)
- postgres (database)

The stack is defined in `docker/compose.prod.yml`.

## Commands

```bash
make certs         # Generate SSL certs (first run)
make prod          # Build and start stack
make prod-down     # Stop stack
make prod-logs     # Follow logs
make prod-rebuild  # Rebuild and restart

make status        # Running containers
make clean         # Remove containers/images/volumes
```

## Access

- Frontend: `https://localhost`
- WebSocket endpoint (from frontend): `wss://localhost/ws`
- Auth API (host exposed): `https://localhost:8001`

## Structure

```text
docker/
├── compose.prod.yml
├── certs/
└── prod/
```
