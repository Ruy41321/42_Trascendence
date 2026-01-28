# GUIDA APPRENDIMENTO: Vue + Canvas + WebSocket + Game Programming

Questa guida ti aiuta a capire i concetti chiave del progetto facendo code review.

---

## 1. VUE.JS COMPOSITION API

### Cos'è Vue?
Framework JavaScript reattivo per costruire UI. **Composition API** (Vue 3) organizza logica in funzioni riutilizzabili.

### Concetti Core

#### **Ref e Reactive**
```javascript
import { ref, reactive } from 'vue';

// ref() - per valori primitivi
const count = ref(0);
console.log(count.value); // Accesso con .value

// reactive() - per oggetti
const state = reactive({
  name: 'Luigi',
  score: 100
});
console.log(state.name); // Accesso diretto
```

**Nel progetto:** Vedi `useWebSocket.js` → `connected`, `gameState`, ecc.

#### **Computed Properties**
```javascript
const fullName = computed(() => {
  return firstName.value + ' ' + lastName.value;
});
```
Auto-aggiornata quando dipendenze cambiano.

**Nel progetto:** Vedi `GameCanvas.vue` → `overlayText`, `showCountdown`

#### **Lifecycle Hooks**
```javascript
onMounted(() => {
  console.log('Component montato nel DOM');
  // Setup iniziale, fetch dati, etc
});

onUnmounted(() => {
  console.log('Component rimosso');
  // Cleanup: rimuovi listeners, chiudi connessioni
});
```

**Nel progetto:** Ogni component usa `onMounted` per setup.

#### **Composables**
Funzioni riutilizzabili che incapsulano logica + stato.

```javascript
// composables/useCounter.js
export function useCounter() {
  const count = ref(0);
  
  function increment() {
    count.value++;
  }
  
  return { count, increment };
}

// Uso in component
const { count, increment } = useCounter();
```

**Nel progetto:** `useWebSocket.js`, `useKeyboard.js`

### Esercizio Code Review

1. Apri `frontend/src/App.vue`
2. Trova dove vengono usati i composables
3. Identifica:
   - Quali sono `ref`?
   - Dove sono i lifecycle hooks?
   - Come comunicano parent-child? (props/emits)

---

## 2. CANVAS API 2D

### Cos'è Canvas?
Elemento HTML per disegnare grafica 2D/3D via JavaScript.

### Concetti Core

#### **Context 2D**
```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d'); // Context per disegnare
```

#### **Disegnare Forme**
```javascript
// Rettangolo
ctx.fillStyle = '#ff0000'; // Colore
ctx.fillRect(x, y, width, height);

// Cerchio
ctx.beginPath();
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.fill();

// Testo
ctx.font = '20px Arial';
ctx.fillText('Hello', x, y);
```

#### **Clear Canvas**
```javascript
ctx.clearRect(0, 0, canvas.width, canvas.height);
// Oppure riempire con colore di sfondo
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

#### **Animation Loop**
```javascript
function render() {
  // 1. Clear
  ctx.clearRect(0, 0, width, height);
  
  // 2. Update state
  ballX += velocityX;
  
  // 3. Draw
  ctx.fillRect(ballX, ballY, 10, 10);
  
  // 4. Next frame
  requestAnimationFrame(render);
}

render(); // Avvia loop
```

**Perché `requestAnimationFrame`?**
- Sincronizza con refresh rate monitor (~60fps)
- Pausa quando tab non visibile (risparmio CPU)
- Smoother di `setInterval`

### Esercizio Code Review

1. Apri `frontend/src/components/GameCanvas.vue`
2. Trova la funzione `render()`
3. Identifica:
   - Dove viene fatto il clear?
   - Quali metodi Canvas API sono usati?
   - Come viene disegnata la palla? E i paddle?
   - Dove parte il loop?

---

## 3. WEBSOCKET CON SOCKET.IO

### Cos'è WebSocket?
Protocollo full-duplex per comunicazione real-time client↔server.

**HTTP** = Request-Response (client chiede, server risponde)
**WebSocket** = Bidirezionale persistente (entrambi possono inviare sempre)

### Socket.IO vs WebSocket Nativo

Socket.IO aggiunge:
- Auto-reconnect
- Fallback a long-polling se WS non supportato
- Rooms/Namespaces
- Acknowledgements

### Concetti Core

#### **Eventi Custom**
```javascript
// CLIENT
socket.emit('eventName', { data: 'value' }); // Invia
socket.on('eventName', (data) => { ... });   // Ricevi

// SERVER
io.on('connection', (socket) => {
  socket.on('eventName', (data) => { ... }); // Ricevi da client
  socket.emit('eventName', { ... });         // Invia a client
});
```

#### **Broadcast**
```javascript
// Invia a TUTTI i client tranne mittente
socket.broadcast.emit('message', data);

// Invia a TUTTI (incluso mittente)
io.emit('message', data);

// Invia a tutti in una room
io.to('room-1').emit('message', data);
```

#### **Rooms**
```javascript
socket.join('room-1'); // Client entra in room
io.to('room-1').emit('gameState', state); // Broadcast a room
```

### Esercizio Code Review

#### Backend (Server)
1. Apri `backend/src/server.js`
2. Trova:
   - Dove viene creato server Socket.IO?
   - Quali eventi ascolta il server? (`socket.on(...)`)
   - Dove viene fatto broadcast del `gameState`?
   - Come viene gestita disconnessione?

#### Frontend (Client)
1. Apri `frontend/src/composables/useWebSocket.js`
2. Trova:
   - Dove viene creata connessione?
   - Quali eventi ascolta il client?
   - Come viene inviato input al server?
   - Dove viene salvato `gameState` ricevuto?

---

## 4. GAME PROGRAMMING CONCEPTS

### Game Loop

**Pattern fondamentale di ogni gioco:**

```
while (gameRunning) {
  1. INPUT    - Leggi input player
  2. UPDATE   - Calcola nuove posizioni/stati
  3. RENDER   - Disegna frame
}
```

**Nel progetto:**
- **Server Loop** (backend): Update physics, broadcast stato
- **Client Loop** (frontend): Render canvas

#### Server Loop (Authoritative)
```javascript
// backend/src/server.js
setInterval(() => {
  const events = GameService.update(gameState);
  io.emit('gameState', gameState.serialize());
}, 16); // 60 fps
```

#### Client Loop (Rendering)
```javascript
// frontend/src/components/GameCanvas.vue
function render() {
  // Clear → Draw → Next frame
  requestAnimationFrame(render);
}
```

### Delta Time (dt)

**Problema:** Se game loop gira a velocità variabile, movimento è inconsistente.

**Soluzione:** Moltiplica velocità per tempo passato.

```javascript
// MALE - Dipende da framerate
ball.x += 5; // 5 pixel OGNI frame

// BENE - Indipendente da framerate
const dt = (now - lastTime) / 1000; // Secondi
ball.x += velocity * dt; // velocity = pixel/secondo

// Es: 300 px/s * 0.016s = 4.8 pixel per frame @ 60fps
```

**Nel progetto:** Vedi `PhysicsService.js` → parametro `dt`

### Physics Basics

#### Posizione & Velocità
```javascript
// Velocità = rate of change di posizione
position += velocity * deltaTime;

// Accelerazione = rate of change di velocità
velocity += acceleration * deltaTime;
```

#### Velocity Vector (vx, vy)
```javascript
ball = {
  x: 400,
  y: 300,
  vx: 200,  // pixel/sec verso destra
  vy: -100, // pixel/sec verso alto (Y cresce verso basso!)
};

// Update
ball.x += ball.vx * dt;
ball.y += ball.vy * dt;
```

#### Bounce (Inversione Velocità)
```javascript
// Bounce orizzontale (muro sinistra/destra)
if (ball.x <= 0 || ball.x >= width) {
  ball.vx = -ball.vx; // Inverti direzione X
}

// Bounce verticale
if (ball.y <= 0 || ball.y >= height) {
  ball.vy = -ball.vy;
}
```

### Collision Detection: AABB

**AABB** = Axis-Aligned Bounding Box

Algoritmo per collision tra rettangoli:

```javascript
function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}
```

**Visualizzazione:**
```
Overlap X:  [---rect1---]
               [---rect2---]
            TRUE

No overlap: [---rect1---]
                           [---rect2---]
            FALSE
```

**Nel progetto:** Vedi `CollisionService.js` → `checkBallPaddleCollision()`

### Esercizio Code Review

1. **Physics:**
   - Apri `PhysicsService.js`
   - Come viene aggiornata posizione palla?
   - Come viene gestito boundary checking?
   - Dove viene usato `dt`?

2. **Collision:**
   - Apri `CollisionService.js`
   - Come funziona AABB tra ball e paddle?
   - Cosa succede quando c'è collision? (bounce + spin)

3. **Game Loop:**
   - Apri `server.js` e cerca `setInterval`
   - Cosa viene chiamato ogni tick?
   - Dove viene fatto broadcast?

---

## 5. NETWORKING: AUTHORITATIVE SERVER

### Modelli Multiplayer

#### **Peer-to-Peer**
- Ogni client comunica con tutti gli altri
- Pro: No server centrale
- Contro: Difficile sincronizzare, facile fare cheat

#### **Client-Server Authoritative** (Il nostro)
- Server è "source of truth"
- Client inviano input, server calcola tutto
- Server broadcasta stato a tutti
- Pro: No cheating, sincronizzato
- Contro: Richiede server sempre online

### Flow nel Progetto

```
CLIENT 1                 SERVER                  CLIENT 2
   │                        │                        │
   ├──[playerInput: UP]────>│                        │
   │                        ├─[Physics Update]       │
   │                        ├─[Collision Check]      │
   │                        │                        │
   │<───[gameState]─────────┴───[gameState]────────>│
   │                                                 │
   ├─[Render new state]                             ├─[Render]
```

1. Client preme tasto → invia `playerInput`
2. Server aggiorna `gameState` con input
3. Server calcola physics/collision
4. Server broadcasta nuovo `gameState` a TUTTI
5. Ogni client riceve e renderizza

### Perché Server Calcola Tutto?

**Anti-cheat:** Se client calcolasse, potrebbe mentire (es: "non mi hai colpito!").

**Sincronizzazione:** Un unico stato garantisce che tutti vedano la stessa cosa.

### Esercizio Code Review

1. Traccia flow di un input:
   - Premi tasto in `useKeyboard.js`
   - Input va a `useWebSocket.js` → `sendInput()`
   - Server riceve in `server.js` → `socket.on('playerInput')`
   - Server aggiorna in `GameService.handlePlayerInput()`
   - Physics applica input in `PhysicsService.updatePaddle()`
   - Server broadcasta in `gameLoop()`
   - Client riceve in `useWebSocket.js` → `socket.on('gameState')`
   - Canvas renderizza in `GameCanvas.vue` → `render()`

---

## 6. MODULARITÀ E ARCHITECTURE

### Separazione Responsabilità

#### Backend
```
server.js
  ├─ Networking (Socket.IO)
  ├─ Game Loop
  └─ Chiama services ↓

GameService.js
  ├─ Orchestrazione
  └─ Chiama ↓

PhysicsService.js      CollisionService.js
  ├─ Calcoli physics      ├─ Collision detection
```

**Perché?** Ogni file ha una responsabilità. Facile testare, modificare, debuggare.

#### Frontend
```
App.vue
  ├─ Composables (useWebSocket, useKeyboard)
  └─ Components ↓

GameCanvas.vue         GameStats.vue
  ├─ Rendering            ├─ UI info
```

### Service Pattern

**Service** = Classe/modulo con metodi statici per logica specifica.

```javascript
export class PhysicsService {
  static updateBall(ball, dt) { ... }
  static updatePaddle(paddle, dt) { ... }
}

// Uso
PhysicsService.updateBall(gameState.ball, dt);
```

**Pro:**
- Organizzato
- Testabile
- No dipendenze circolari

### Esercizio Code Review

Disegna diagramma architettura:
- Quali file chiamano quali?
- Dove fluiscono i dati?
- Chi ha responsabilità di cosa?

---

## 7. DEBUGGING E DEVTOOLS

### Chrome DevTools

**Console (F12 → Console):**
- Vedi `console.log()` del progetto
- Controlla errori JavaScript

**Network (F12 → Network → WS):**
- Mostra messaggi WebSocket in real-time
- Utile per vedere `gameState` packets

**Sources (F12 → Sources):**
- Setta breakpoints nel codice
- Step through execution

### Debugging Specifico

#### Backend
```javascript
// Aggiungi in server.js
socket.on('playerInput', (data) => {
  console.log('Input ricevuto:', data);
  // ...
});
```

#### Frontend
```javascript
// In useWebSocket.js
socket.on('gameState', (state) => {
  console.log('GameState:', state.tick, state.ball);
  gameState.value = state;
});
```

---

## ROADMAP APPRENDIMENTO

### Settimana 1-2: Vue Basics
- [ ] Completa tutorial ufficiale Vue: https://vuejs.org/tutorial/
- [ ] Sperimenta con ref, computed, watchers
- [ ] Crea mini-project: Todo list

### Settimana 3: Canvas
- [ ] MDN Canvas tutorial: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial
- [ ] Disegna forme, animazioni semplici
- [ ] Mini-project: Bouncing ball

### Settimana 4: WebSocket
- [ ] Socket.IO getting started: https://socket.io/get-started/chat
- [ ] Chat app semplice client-server
- [ ] Capire events, broadcast, rooms

### Settimana 5-6: Game Programming
- [ ] Leggi "Game Programming Patterns" (libro free online)
- [ ] Implementa game loop semplice
- [ ] Physics: velocità, accelerazione, collision

### Settimana 7-8: Code Review Questo Progetto
- [ ] Leggi ogni file nell'ordine di questa guida
- [ ] Aggiungi commenti dove non capisci
- [ ] Modifica valori (velocità, dimensioni) e vedi effetto
- [ ] Aggiungi feature semplici (es: cambia colori)

### Settimana 9+: Estensioni
- [ ] Powerups
- [ ] Sound effects
- [ ] Particle effects
- [ ] AI bots
- [ ] Leaderboard

---

## RISORSE UTILI

### Documentazione Ufficiale
- **Vue 3:** https://vuejs.org/
- **Socket.IO:** https://socket.io/docs/
- **Canvas API:** https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

### Tutorial Video
- Vue Mastery (Vue avanzato)
- Fireship.io (concetti rapidi)
- The Net Ninja (playlists complete)

### Libri/Guide
- "Game Programming Patterns" by Robert Nystrom (free online)
- "Eloquent JavaScript" (free online)
- MDN Web Docs (reference completo)

---

## DOMANDE PER VERIFICARE COMPRENSIONE

Dopo code review, prova a rispondere:

1. **Vue:**
   - Differenza tra `ref` e `reactive`?
   - Quando usare `computed` vs `watch`?
   - Cosa sono i composables?

2. **Canvas:**
   - Perché `requestAnimationFrame` invece di `setInterval`?
   - Come funziona coordinate system (dove è 0,0)?
   - Come disegni un cerchio?

3. **WebSocket:**
   - Differenza tra `emit` e `broadcast`?
   - Come funzionano le rooms?
   - Cosa succede quando client disconnette?

4. **Game Programming:**
   - Cos'è delta time e perché serve?
   - Come funziona AABB collision?
   - Perché server è authoritative?

5. **Architettura:**
   - Responsabilità di `GameService`?
   - Perché separare Physics e Collision in services diversi?
   - Flow completo di un input da tastiera a rendering?

Se riesci a rispondere, hai capito! 🎉

---

**Buona review e buon apprendimento!** 🚀
