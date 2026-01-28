# Pong 4-Player Multiplayer Game

Gioco Pong multiplayer per 4 giocatori online (LAN/WAN) costruito da zero con Vue.js e Node.js.

## Architettura

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER                          │
│  ┌─────────────────────────────────────────────┐   │
│  │  Vue.js Frontend                            │   │
│  │  - Canvas 2D Rendering (60fps)              │   │
│  │  - Input capture                            │   │
│  │  - WebSocket client (Socket.IO)             │   │
│  └─────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────┘
                   │ WebSocket
                   │ (gameState, playerInput)
                   │
┌──────────────────▼──────────────────────────────────┐
│                    SERVER                           │
│  ┌─────────────────────────────────────────────┐   │
│  │  Node.js Backend                            │   │
│  │  - Game Loop Autoritativo (60 tick/sec)     │   │
│  │  - Physics Engine                           │   │
│  │  - Collision Detection                      │   │
│  │  - WebSocket server (Socket.IO)             │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Stack Tecnologico

### Frontend
- **Vue 3**: Framework UI con Composition API
- **Canvas API**: Rendering 2D game
- **Socket.IO Client**: WebSocket per comunicazione real-time
- **Vite**: Build tool e dev server

### Backend
- **Node.js**: Runtime JavaScript server-side
- **Express**: Web framework minimale
- **Socket.IO**: WebSocket server per multiplayer

## Struttura Progetto

```
Game/
├── frontend/              # Vue.js app
│   ├── src/
│   │   ├── components/    # Componenti Vue
│   │   │   ├── GameCanvas.vue      # Rendering canvas principale
│   │   │   ├── GameLobby.vue       # Matchmaking/waiting room
│   │   │   ├── GameStats.vue       # Scoreboard
│   │   │   └── GameControls.vue    # UI controlli
│   │   ├── composables/            # Vue composables (logic reusabile)
│   │   │   ├── useGameLoop.js      # requestAnimationFrame loop
│   │   │   ├── useWebSocket.js     # Socket.IO connection
│   │   │   └── useKeyboard.js      # Input handling
│   │   ├── stores/                 # State management
│   │   │   └── gameStore.js        # Game state globale
│   │   └── App.vue                 # Root component
│   ├── public/
│   └── package.json
│
├── backend/               # Node.js server
│   ├── src/
│   │   ├── server.js                    # Entry point
│   │   ├── services/
│   │   │   ├── GameService.js           # Game logic principale
│   │   │   ├── PhysicsService.js        # Physics ball + movement
│   │   │   ├── CollisionService.js      # Collision detection
│   │   │   └── PlayerService.js         # Player management
│   │   ├── models/
│   │   │   └── GameState.js             # Schema game state
│   │   └── config/
│   │       └── gameConfig.js            # Costanti gioco
│   └── package.json
│
└── README.md              # Questo file
```

## Game Design: Pong 4-Player

### Layout Campo

```
        ┌─────────────────────────────────┐
        │       P2 (TOP)                  │
        │      ███████ (paddle)           │
        │                                 │
        │                                 │
  P1 ███│          ● (ball)            ███│ P3
(LEFT)  │                              (RIGHT)
        │                                 │
        │                                 │
        │      ███████ (paddle)           │
        │       P4 (BOTTOM)               │
        └─────────────────────────────────┘
```

### Meccaniche

1. **4 Giocatori**: Ogni giocatore controlla un paddle su un lato (top, right, bottom, left)
2. **Controlli**:
   - **P1 (Left)**: `W` (su), `S` (giù)
   - **P2 (Top)**: `Arrow Up` (sinistra), `Arrow Down` (destra)
   - **P3 (Right)**: `I` (su), `K` (giù)
   - **P4 (Bottom)**: `Numpad 8` (sinistra), `Numpad 5` (destra)
3. **Obiettivo**: Impedire alla palla di uscire dal tuo lato. Chi lascia passare perde punti.
4. **Win condition**: Primo a 10 punti vince (configurabile)

## Concetti Chiave da Imparare

### 1. Vue.js Composition API
- **Ref e Reactive**: Gestione stato reattivo
- **Lifecycle hooks**: `onMounted`, `onUnmounted`
- **Composables**: Funzioni riutilizzabili per logica
- **Template refs**: Accedere a elementi DOM

### 2. Canvas API
- **Context 2D**: `getContext('2d')`
- **Drawing primitives**: `fillRect`, `arc`, `stroke`
- **Animation loop**: `requestAnimationFrame`
- **Coordinate system**: Origine top-left

### 3. WebSocket (Socket.IO)
- **Eventi custom**: `emit()`, `on()`
- **Rooms**: Gestione multiple partite
- **Broadcast**: Inviare a tutti i client
- **Client-Server sync**: Authoritative server pattern

### 4. Game Programming
- **Game loop**: Update → Render cycle
- **Physics**: Posizione, velocità, accelerazione
- **Collision detection**: AABB (Axis-Aligned Bounding Box)
- **Input handling**: Keyboard events → game state
- **Networking**: Client prediction, server reconciliation

## Setup e Avvio

### Prerequisiti
- Node.js 18+ installato
- npm o yarn

### Installazione

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (terminale separato)
cd frontend
npm install
npm run dev
```

### Test Multiplayer Locale

1. Avvia backend su `http://localhost:3000`
2. Avvia frontend su `http://localhost:5173`
3. Apri 4 browser tabs su `http://localhost:5173`
4. Ogni tab = 1 giocatore

### Test LAN

1. Backend deve essere accessibile su rete locale
2. Trova IP locale: `ipconfig` (Windows) / `ifconfig` (Linux/Mac)
3. Frontend: modifica URL WebSocket in `useWebSocket.js` con `ws://YOUR_IP:3000`
4. Altri dispositivi: apri browser su `http://YOUR_IP:5173`

## Roadmap Sviluppo

- [x] Setup progetto (frontend + backend)
- [x] Backend: Server Express + Socket.IO
- [x] Backend: Game loop + Physics engine
- [x] Backend: Collision detection
- [x] Frontend: Vue app + Canvas component
- [x] Frontend: Rendering loop
- [x] Frontend: WebSocket integration
- [x] Input handling + sync
- [x] UI: Lobby + Scoreboard
- [ ] Polish: Lag compensation
- [ ] Polish: Sound effects
- [ ] Deploy: Hosting production

## Note per la Review

Quando fai code review, cerca di capire:

1. **Separazione responsabilità**: Frontend renderizza, Backend calcola
2. **Flusso dati**: Input → Client → Server → Physics → Broadcast → Client → Render
3. **Perché authoritative server**: Evita cheating, sincronizza tutti i client
4. **requestAnimationFrame vs setInterval**: Per rendering smooth
5. **Socket.IO event names**: Convenzioni naming `playerInput`, `gameState`, etc.

Buona review! 🎮
