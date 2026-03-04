# 🐳 Docker Infrastructure

## Overview

The project uses Docker Compose to orchestrate two containers:

| Container | Technology | Description |
|-----------|------------|-------------|
| **backend** | Node.js | WebSocket server (WSS) on port 3000 |
| **frontend** | Nginx (prod) / Vite (dev) | Dev: Vite dev server / Prod: Nginx serving static files |

Both environments use **HTTPS/WSS** with self-signed SSL certificates.

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
└─────────────────┬───────────────────────────────────┘
                  │ HTTPS / WSS
    ┌─────────────┴─────────────┐
    ▼                           ▼
┌───────────┐             ┌────────────┐
│ Frontend  │             │  Backend   │
│  Nginx    │             │  Node.js   │
│:5173(dev) │             │   :3000    │
│:443(prod) │             │    WSS     │
└───────────┘             └────────────┘
```

---

## Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| **Frontend** | Vite dev server (port 5173) | Nginx (port 443) |
| **Hot Reload** | ✅ Enabled | ❌ No |
| **Source Code** | Mounted as volume | Optimized build baked in image |
| **Build** | Not optimized | Minified + tree-shaking |
| **Debug** | Tools available | Optimized for performance |

### Development
- Source files are mounted as volumes → instant changes without rebuild
- Vite provides HMR (Hot Module Replacement)
- Ideal for active development

### Production
- Compiled and optimized code baked into the image
- Nginx serves static files with caching
- Health checks enabled
- Requires rebuild for every change

---

## Commands (Makefile)

### Initial Setup
```bash
make certs          # Generate SSL certificates (first time only)
```

### Development
```bash
make dev            # Start development environment
make dev-down       # Stop containers
make dev-logs       # View logs
make dev-rebuild    # Rebuild and start
```

### Production
```bash
make prod           # Build and start production
make prod-down      # Stop containers
make prod-logs      # View logs
make prod-rebuild   # Rebuild and start
```

### Utilities
```bash
make status         # Show container status
make clean          # Remove everything (containers, images, volumes)
make help           # Show all available commands
```

---

## Access URLs

| Environment | Frontend | Backend |
|-------------|----------|---------|
| **Dev** | https://localhost:5173 | wss://localhost:3000 |
| **Prod** | https://localhost | wss://localhost:3000 |

> ⚠️ The browser will show a warning for the self-signed certificate. Click "Advanced" → "Proceed" to continue.

---

## Docker Files Structure

```
docker/
├── compose.dev.yml      # Development compose
├── compose.prod.yml     # Production compose
├── certs/               # SSL certificates
│   ├── generate-certs.sh
│   ├── server.crt
│   └── server.key
├── dev/                 # Development Dockerfiles
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
└── prod/                # Production Dockerfiles
    ├── backend.Dockerfile
    └── frontend.Dockerfile
```
