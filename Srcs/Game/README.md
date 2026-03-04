# 🎮 Pong 4-Player - Game Documentation

## 1. Game Overview

### Objective
First player to reach **10 points** wins. Points are scored when an opponent misses the ball.

### Rules
- 4 players, each controls a paddle on one side of the field
- Ball bounces off paddles and walls
- If ball exits through your side → all other players score 1 point
- Ball speed increases with each paddle hit

### Controls
| Platform | Keys |
|----------|------|
| Computer | Arrow keys or `WASD` keys |
| Mobile | Touch Finger Dragging |

---

## 2. Folder Structure

```
Game/
├── Makefile                 # Docker commands
├── backend/                 # Python/FastAPI server
│   ├── main.py              # Entry point: WebSocket handler, game loop, game logic
│   └── requirements.txt     # Python dependencies
│
├── frontend/                # Vue.js client
│   └── src/
│       ├── main.js          # Vue entry point
│       ├── App.vue          # Root component
│       ├── config/
│       │   └── gameConfig.js    # Frontend config
│       ├── composables/
│       │   ├── useWebSocket.js  # WebSocket client logic
│       │   └── useKeyboard.js   # Keyboard input handling
│       └── components/
│           ├── GameCanvas.vue   # Canvas rendering
│           ├── GameStats.vue    # UI stats panel
│           └── LobbyScreen.vue  # Lobby interface
│
└── docker/                  # Docker configuration
    ├── compose.dev.yml
    ├── compose.prod.yml
    └── ...
```

---

## 3. Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | Python 3.12 + FastAPI | Web server + WebSocket |
| **Backend** | Uvicorn | ASGI server (60fps game loop) |
| **Backend** | Pydantic | Message validation |
| **Frontend** | Vue.js 3 | Reactive UI framework |
| **Frontend** | Vite | Build tool + dev server + WS proxy |
| **Frontend** | Canvas 2D | Game rendering |
| **Infrastructure** | Docker + Nginx | Containerization + static serving |

---

## 4. Module Responsibilities

### Backend

| Module | Responsibility |
|--------|----------------|
| `main.py` | WebSocket endpoint, game loop (60 ticks/sec), player connections, physics, collision, scoring |

All game logic lives in `main.py` as classes:
- `Ball` — position, velocity, reset
- `Player` — paddle state, movement
- `PongGameState` — authoritative game state, physics update, goal detection, winner check

### Frontend Composables

| Module | Responsibility |
|--------|----------------|
| `useWebSocket.js` | Native WebSocket connection, send/receive events |
| `useKeyboard.js` | Keyboard input → direction mapping |
| `GameCanvas.vue` | Canvas rendering at 60fps, normalized→pixel coordinate conversion |

---

## 5. Input → Server → Client Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        INPUT FLOW                               │
└─────────────────────────────────────────────────────────────────┘

1. PLAYER PRESSES KEY
   ↓
   useKeyboard.js detects keydown (e.g., ArrowUp)
   ↓
   Translates to direction: 'UP'

2. CLIENT SENDS INPUT
   ↓
   useWebSocket.js emits: socket.emit('playerInput', { direction: 'UP' })
   ↓
   WebSocket message sent to server

3. SERVER PROCESSES INPUT
   ↓
   main.py receives 'move' message
   ↓
   Updates player.current_direction in PongGameState

4. GAME LOOP TICK (every 16ms @ 60fps)
   ↓
   PongGameState.update_physics()
   ↓
   Ball.update() → moves ball
   ↓
   check_collisions() → AABB ball vs paddles
   ↓
   Player.move() → moves paddle based on current_direction

5. SERVER BROADCASTS STATE
   ↓
   world_loop() serializes PongGameState.get_payload()
   ↓
   asyncio.gather sends JSON to all connected clients

6. CLIENT RENDERS
   ↓
   useWebSocket.js updates gameState ref
   ↓
   GameCanvas.vue renders new positions on canvas
```

---

## 6. Quick Start (Makefile)

```bash
# First time: generate SSL certificates
make certs

# Development (hot reload)
make dev            # Start
make dev-logs       # View logs
make dev-down       # Stop

# Production (optimized)
make prod           # Start
make prod-down      # Stop

# Cleanup
make clean          # Remove all containers/images
```

**Access URLs:**
- Dev: https://localhost:5173
- Prod: https://localhost
