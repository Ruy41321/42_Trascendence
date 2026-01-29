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
├── backend/                 # Node.js server
│   └── src/
│       ├── server.js        # Entry point + WebSocket + Game Loop
│       ├── config/
│       │   └── gameConfig.js    # Game constants
│       ├── models/
│       │   └── GameState.js     # Game state data structure
│       └── services/
│           ├── GameService.js   # Game orchestration
│           ├── PhysicsService.js    # Movement + velocity
│           ├── CollisionService.js  # Collision detection
│           └── AIService.js         # AI opponent logic
│
├── frontend/                # Vue.js client
│   └── src/
│       ├── main.js          # Vue entry point
│       ├── App.vue          # Root component
│       ├── config/
│       │   └── gameConfig.js    # Frontend config (mirrors backend)
│       ├── composables/
│       │   ├── useWebSocket.js  # Socket.IO client logic
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
| **Backend** | Node.js + Express | Web server |
| **Backend** | Socket.IO | Real-time WebSocket communication |
| **Frontend** | Vue.js 3 | Reactive UI framework |
| **Frontend** | Vite | Build tool + dev server |
| **Frontend** | Canvas 2D | Game rendering |
| **Infrastructure** | Docker + Nginx | Containerization + static serving |

---

## 4. Module Responsibilities

### Backend Services

| Module | Responsibility |
|--------|----------------|
| `server.js` | WebSocket events, game loop (60 ticks/sec), player connections |
| `GameService.js` | Game orchestration, scoring, state transitions |
| `PhysicsService.js` | Ball/paddle movement, velocity, bounds checking |
| `CollisionService.js` | AABB collision detection (ball vs paddles) |
| `AIService.js` | AI paddle behavior for bot players |
| `GameState.js` | Game state data model |

### Frontend Composables

| Module | Responsibility |
|--------|----------------|
| `useWebSocket.js` | Socket.IO connection, send/receive events |
| `useKeyboard.js` | Keyboard input → direction mapping |
| `GameCanvas.vue` | Canvas rendering at 60fps |

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
   server.js receives 'playerInput' event
   ↓
   Updates player.inputDirection = 'UP' in GameState

4. GAME LOOP TICK (every 16ms)
   ↓
   GameService.update(gameState)
   ↓
   PhysicsService.updatePaddle() → moves paddle based on inputDirection
   ↓
   PhysicsService.updateBall() → moves ball
   ↓
   CollisionService.checkPaddleCollisions() → detects hits

5. SERVER BROADCASTS STATE
   ↓
   io.emit('gameState', gameState)
   ↓
   All clients receive updated state

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
