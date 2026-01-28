# Docker Setup

## Quick Start

### Development (Hot Reload)
```bash
make dev
# Backend: http://localhost:3000
# Frontend: http://localhost:5173
```

### Production
```bash
make prod
# Backend: http://localhost:3000
# Frontend: http://localhost:8080
```

## Commands

```bash
# Development
make dev          # Start dev with hot reload
make dev-down     # Stop dev

# Production
make build        # Build images
make up           # Start containers
make down         # Stop containers
make prod         # Build + start
make prod-down    # Stop + remove

# Utils
make logs         # View logs
make restart      # Restart all
make clean        # Remove everything
```

## Manual Docker Compose

### Development
```bash
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
```

### Production
```bash
docker-compose up -d --build
docker-compose down
```

## Environment Variables

Create `.env` from `.env.example`:
```bash
cp .env.example .env
```

Edit for your environment:
- `VITE_SOCKET_URL` - Backend URL for frontend
- `PORT` - Backend port

## Network

Containers communicate via `pong-network` bridge.

Frontend connects to backend via environment variable.

## Volumes

Development mode mounts source code for hot reload.

Production builds static assets into images.

## Ports

- Backend: 3000
- Frontend Dev: 5173
- Frontend Prod: 8080
