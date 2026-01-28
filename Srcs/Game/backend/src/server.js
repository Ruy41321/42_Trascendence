/**
 * SERVER ENTRY POINT
 * 
 * Setup e avvio del server Node.js con:
 * - Express: Web server per servire frontend (opzionale)
 * - Socket.IO: WebSocket server per real-time multiplayer
 * - Game Loop: Tick a 60fps che aggiorna game state
 * 
 * ARCHITETTURA:
 * 1. Client connette via WebSocket
 * 2. Server assegna player a una room/game
 * 3. Game loop tick ogni 16ms (60fps)
 * 4. Server broadcasta stato a tutti i client
 * 5. Client ricevono stato e renderizzano
 * 
 * EVENTI SOCKET.IO:
 * Client → Server:
 *   - 'joinGame': Client vuole entrare in partita
 *   - 'playerInput': Client invia input (UP/DOWN)
 *   - 'disconnect': Client disconnette
 * 
 * Server → Client:
 *   - 'gameState': Broadcast stato ogni tick
 *   - 'playerAssigned': Conferma connessione + assegnazione player
 *   - 'gameEvent': Eventi speciali (score, collision, etc)
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameState } from './models/GameState.js';
import { GameService } from './services/GameService.js';
import { GAME_CONFIG } from './config/gameConfig.js';

// Setup Express
const app = express();
app.use(cors());
app.use(express.json());

// HTTP server
const httpServer = createServer(app);

// Socket.IO server con CORS permissive (per sviluppo locale)
const io = new Server(httpServer, {
  cors: {
    origin: '*', // In produzione, specifica origine esatta
    methods: ['GET', 'POST'],
  },
});

// ============================================================
// GAME STATE MANAGEMENT
// ============================================================

/**
 * Per ora: una singola game room
 * TODO: Implementa multiple rooms per partite simultane
 */
const games = new Map();
const MAIN_ROOM = 'room-1';

// Crea game principale
games.set(MAIN_ROOM, new GameState(MAIN_ROOM));

/**
 * Get o crea game room
 */
function getGame(roomId = MAIN_ROOM) {
  if (!games.has(roomId)) {
    games.set(roomId, new GameState(roomId));
  }
  return games.get(roomId);
}

// ============================================================
// GAME LOOP - IL CUORE DEL SERVER
// ============================================================

/**
 * Game loop autoritativo che gira a 60 tick/sec
 * 
 * RESPONSABILITÀ:
 * 1. Chiama GameService.update() per ogni game attiva
 * 2. Raccoglie eventi (score, collision)
 * 3. Broadcasta nuovo stato a tutti i client connessi
 * 
 * PERCHÉ AUTHORITATIVE SERVER?
 * - Previene cheating (client non può modificare stato)
 * - Sincronizza tutti i player (single source of truth)
 * - Gestisce latency issues centralmente
 */
function gameLoop() {
  const gameState = getGame();
  
  // Update game logic
  const events = GameService.update(gameState);
  
  // Broadcast stato a tutti i client nella room
  io.to(MAIN_ROOM).emit('gameState', gameState.serialize());
  
  // Invia eventi speciali se accaduti
  if (events.scored) {
    io.to(MAIN_ROOM).emit('gameEvent', {
      type: 'score',
      data: events.scored,
    });
  }
  
  if (events.gameOver) {
    io.to(MAIN_ROOM).emit('gameEvent', {
      type: 'gameOver',
      data: {
        winner: gameState.winner,
        finalScores: gameState.players.map(p => ({
          id: p.id,
          side: p.side,
          score: p.score,
        })),
      },
    });
  }
}

// Avvia game loop a 60 tick/sec (16.66ms per tick)
const TICK_INTERVAL = 1000 / GAME_CONFIG.SERVER.TICK_RATE;
setInterval(gameLoop, TICK_INTERVAL);

console.log(`🎮 Game loop avviato a ${GAME_CONFIG.SERVER.TICK_RATE} tick/sec`);

// ============================================================
// SOCKET.IO EVENT HANDLERS
// ============================================================

io.on('connection', (socket) => {
  console.log(`✅ Client connesso: ${socket.id}`);
  
  /**
   * CLIENT VUOLE ENTRARE IN PARTITA
   * 
   * Flow:
   * 1. Client invia 'joinGame'
   * 2. Server assegna primo slot libero
   * 3. Server risponde con 'playerAssigned'
   * 4. Client sa quale player è e può iniziare a giocare
   */
  socket.on('joinGame', (data) => {
    const roomId = data?.roomId || MAIN_ROOM;
    const gameState = getGame(roomId);
    
    // Connetti player
    const player = GameService.connectPlayer(gameState, socket.id);
    
    if (!player) {
      // Room piena
      socket.emit('error', {
        message: 'Game room piena. Max 4 player.',
      });
      return;
    }
    
    // Aggiungi socket alla room
    socket.join(roomId);
    
    // Conferma a client con info player assegnato
    socket.emit('playerAssigned', {
      playerId: player.id,
      side: player.side,
      roomId: roomId,
      gameStatus: gameState.status,
    });
    
    // Notifica altri player
    socket.to(roomId).emit('gameEvent', {
      type: 'playerJoined',
      data: {
        playerId: player.id,
        side: player.side,
        connectedPlayers: gameState.players.filter(p => p.connected).length,
      },
    });
    
    console.log(`🎮 Player ${player.id} (${player.side}) assegnato a ${socket.id}`);
    
    // Invia stato corrente immediatamente
    socket.emit('gameState', gameState.serialize());
  });
  
  /**
   * CLIENT INVIA INPUT (tasti premuti)
   * 
   * Flow:
   * 1. Client preme tasto (es: W)
   * 2. Frontend invia 'playerInput' con direction: 'UP'
   * 3. Server aggiorna player.input nel gameState
   * 4. Al prossimo tick, PhysicsService muove il paddle
   * 
   * INPUT TYPES:
   * - 'UP': Muove verso alto/sinistra
   * - 'DOWN': Muove verso basso/destra
   * - null: Stop movimento
   */
  socket.on('playerInput', (data) => {
    const { input } = data; // 'UP' | 'DOWN' | null
    const gameState = getGame(MAIN_ROOM);
    
    GameService.handlePlayerInput(gameState, socket.id, input);
  });
  
  /**
   * CLIENT VUOLE RESTART PARTITA
   */
  socket.on('restartGame', () => {
    const gameState = getGame(MAIN_ROOM);
    
    // Solo se tutti i player sono ancora connessi
    if (gameState.isReady()) {
      GameService.startGame(gameState);
      
      io.to(MAIN_ROOM).emit('gameEvent', {
        type: 'gameRestart',
        data: {},
      });
    }
  });
  
  /**
   * CLIENT DISCONNETTE
   * 
   * Automatico quando:
   * - Client chiude browser
   * - Perde connessione internet
   * - Refresh pagina
   */
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnesso: ${socket.id}`);
    
    const gameState = getGame(MAIN_ROOM);
    GameService.disconnectPlayer(gameState, socket.id);
    
    // Notifica altri player
    io.to(MAIN_ROOM).emit('gameEvent', {
      type: 'playerLeft',
      data: {
        connectedPlayers: gameState.players.filter(p => p.connected).length,
      },
    });
  });
});

// ============================================================
// REST API (opzionale - per debug/status)
// ============================================================

app.get('/', (req, res) => {
  res.json({
    message: 'Pong 4-Player Server',
    version: '1.0.0',
    status: 'running',
  });
});

app.get('/api/game/status', (req, res) => {
  const gameState = getGame();
  res.json({
    status: gameState.status,
    players: gameState.players.map(p => ({
      id: p.id,
      side: p.side,
      connected: p.connected,
      score: p.score,
    })),
    tick: gameState.tick,
  });
});

// ============================================================
// SERVER START
// ============================================================

const PORT = process.env.PORT || GAME_CONFIG.SERVER.PORT;

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🎮 PONG 4-PLAYER SERVER AVVIATO 🎮     ║
╠═══════════════════════════════════════════╣
║  Port:        ${PORT}                         ║
║  Tick Rate:   ${GAME_CONFIG.SERVER.TICK_RATE} fps                      ║
║  Max Players: ${GAME_CONFIG.GAME.MAX_PLAYERS}                          ║
╚═══════════════════════════════════════════╝

Server pronto per connessioni!
Frontend URL: http://localhost:5173
WebSocket URL: ws://localhost:${PORT}

Per testare su LAN, usa l'IP locale:
  ws://YOUR_LOCAL_IP:${PORT}
  `);
});

// Gestione errori graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Server shutting down...');
  httpServer.close(() => {
    console.log('✅ Server chiuso');
    process.exit(0);
  });
});
