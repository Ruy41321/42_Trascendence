# GUIDA INSTALLAZIONE E AVVIO

## Prerequisiti

Prima di avviare il progetto, devi installare **Node.js**.

### Installa Node.js

1. Vai su https://nodejs.org/
2. Scarica la versione **LTS** (Long Term Support) - attualmente 20.x o 22.x
3. Esegui installer e segui procedura guidata
4. Verifica installazione aprendo PowerShell e digitando:
   ```powershell
   node --version
   npm --version
   ```
   Dovresti vedere qualcosa come:
   ```
   v20.11.0
   10.2.4
   ```

## Setup Progetto

### 1. Installa Dipendenze Backend

```powershell
cd "c:\Users\Luigi\Developing\42\42_Trascendence\Srcs\Game\backend"
npm install
```

Questo installerà:
- `express` - Web server
- `socket.io` - WebSocket per multiplayer
- `cors` - Cross-Origin Resource Sharing

### 2. Installa Dipendenze Frontend

```powershell
cd "c:\Users\Luigi\Developing\42\42_Trascendence\Srcs\Game\frontend"
npm install
```

Questo installerà:
- `vue` - Framework frontend
- `socket.io-client` - Client WebSocket
- `vite` - Build tool e dev server
- `@vitejs/plugin-vue` - Plugin Vue per Vite

## Avvio del Gioco

### IMPORTANTE: Devi avviare 2 terminali separati

#### Terminal 1 - Backend Server

```powershell
cd "c:\Users\Luigi\Developing\42\42_Trascendence\Srcs\Game\backend"
npm run dev
```

**Output atteso:**
```
╔═══════════════════════════════════════════╗
║   🎮 PONG 4-PLAYER SERVER AVVIATO 🎮     ║
╠═══════════════════════════════════════════╣
║  Port:        3000                        ║
║  Tick Rate:   60 fps                      ║
║  Max Players: 4                           ║
╚═══════════════════════════════════════════╝

Server pronto per connessioni!
```

**Lascia questo terminale APERTO!** Il server deve girare continuamente.

#### Terminal 2 - Frontend Dev Server

```powershell
cd "c:\Users\Luigi\Developing\42\42_Trascendence\Srcs\Game\frontend"
npm run dev
```

**Output atteso:**
```
  VITE v5.0.11  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

## Test del Gioco

### Test Locale (Single PC)

1. Backend e frontend avviati (vedi sopra)
2. Apri browser su `http://localhost:5173`
3. Apri altre 3 tabs/finestre sullo stesso URL
4. Ogni tab = 1 giocatore
5. Quando 4 player connessi → il gioco parte automaticamente!

### Test su LAN (Multiple PC/Dispositivi)

#### Su PC Server (quello che esegue il codice):

1. Trova il tuo IP locale:
   ```powershell
   ipconfig
   ```
   Cerca "Indirizzo IPv4" sotto la tua connessione di rete, es: `192.168.1.100`

2. Avvia backend e frontend come sopra

#### Su Altri Device (PC, laptop, tablet):

1. Apri browser su `http://[IP_SERVER]:5173`
   Esempio: `http://192.168.1.100:5173`

2. Ogni device = 1 giocatore

**NOTA:** Firewall Windows potrebbe bloccare connessioni. Se non funziona:
- Vai su Windows Defender Firewall
- "Consenti app attraverso Windows Firewall"
- Aggiungi Node.js alle eccezioni

## Comandi Tastiera

Ogni player ha il suo set di comandi:

- **Player 1 (Sinistra - Rosa)**: `W` (su), `S` (giù)
- **Player 2 (Alto - Giallo)**: `↑` (sinistra), `↓` (destra)
- **Player 3 (Destra - Cyan)**: `I` (su), `K` (giù)
- **Player 4 (Basso - Viola)**: `Numpad 8` (sinistra), `Numpad 5` (destra)

## Troubleshooting

### "npm: comando non trovato"
→ Node.js non installato o non nel PATH. Reinstalla Node.js.

### "Port 3000 già in uso"
→ Un altro processo usa porta 3000. Cambia porta in:
- `backend/src/config/gameConfig.js` → `SERVER.PORT`
- `frontend/src/config/gameConfig.js` → `SOCKET_URL`

### "Cannot connect to WebSocket"
→ Backend non avviato o firewall blocca. Controlla che backend sia running.

### "Canvas non renderizza nulla"
→ Apri DevTools (F12), guarda console per errori.

## Struttura per Code Review

Quando fai review, inizia da questi file nell'ordine:

### Backend (Node.js)
1. `backend/src/config/gameConfig.js` - Costanti gioco
2. `backend/src/models/GameState.js` - Struttura dati principale
3. `backend/src/services/PhysicsService.js` - Physics palla/paddle
4. `backend/src/services/CollisionService.js` - Collision detection
5. `backend/src/services/GameService.js` - Orchestrazione game logic
6. `backend/src/server.js` - Server + WebSocket + Game loop

### Frontend (Vue)
1. `frontend/src/config/gameConfig.js` - Config frontend
2. `frontend/src/composables/useWebSocket.js` - WebSocket client
3. `frontend/src/composables/useKeyboard.js` - Input handling
4. `frontend/src/components/GameCanvas.vue` - Rendering Canvas
5. `frontend/src/components/GameStats.vue` - UI statistiche
6. `frontend/src/App.vue` - Root component

## Concetti da Capire nella Review

### Backend
- **Authoritative Server**: Server calcola tutto, client solo renderizza
- **Game Loop**: `setInterval` a 60fps che chiama `GameService.update()`
- **Delta Time**: `dt` per movimento indipendente da framerate
- **Socket.IO Events**: `emit()` per inviare, `on()` per ricevere
- **AABB Collision**: Algoritmo collision detection

### Frontend
- **Vue Composition API**: `ref()`, `reactive()`, composables
- **Composables**: Funzioni riutilizzabili (`useWebSocket`, `useKeyboard`)
- **Canvas API**: `getContext('2d')`, `fillRect()`, `arc()`
- **requestAnimationFrame**: Render loop a 60fps smooth
- **Props & Emits**: Comunicazione parent-child components

## Next Steps

Una volta che hai fatto review e capito il codice, puoi:

1. **Modificare physics**: Cambia velocità palla, dimensioni paddle
2. **Aggiungere powerup**: Items random che cambiano gameplay
3. **Migliorare AI**: Aggiungi bot per giocatori mancanti
4. **Lag compensation**: Client-side prediction per ridurre lag
5. **Sound effects**: Aggiungi audio su collision/score
6. **Multiple rooms**: Sistema matchmaking con multiple partite
7. **Database**: Salva high scores, stats, replay
8. **Deploy**: Pubblica su Heroku/Railway (backend) + Vercel (frontend)

Buon divertimento! 🎮
