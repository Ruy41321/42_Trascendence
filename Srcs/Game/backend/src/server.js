/**
 * SERVER ENTRY POINT
 * 
 * Setup and startup of Node.js server with:
 * - Express: Web server for serving frontend (optional)
 * - Socket.IO: WebSocket server for real-time multiplayer
 * - Game Loop: 60fps tick that updates game state
 * 
 * ARCHITECTURE:
 * 1. Client connects via WebSocket
 * 2. Client joins lobby or spectates
 * 3. When enough players ready, game starts
 * 4. Game loop ticks every 16ms (60fps)
 * 5. Server broadcasts state to all clients
 * 
 * SOCKET.IO EVENTS:
 * Client → Server:
 *   - 'joinLobby': Client wants to join lobby with a name
 *   - 'spectate': Client wants to watch without playing
 *   - 'startGame': Lobby players request game start
 *   - 'playerInput': Client sends input (UP/DOWN)
 *   - 'voteAbandon': Player votes to abandon current game
 *   - 'restartGame': Request game restart after finish
 *   - 'disconnect': Client disconnects
 * 
 * Server → Client:
 *   - 'gameState': Broadcast state every tick
 *   - 'lobbyUpdate': Lobby state changed
 *   - 'playerAssigned': Confirm connection + player assignment
 *   - 'spectatorAssigned': Confirm spectator status
 *   - 'gameEvent': Special events (score, collision, etc)
 */

import express from 'express';
import { createServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { readFileSync, existsSync } from 'fs';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameState } from './models/GameState.js';
import { GameService } from './services/GameService.js';
import { GAME_CONFIG } from './config/gameConfig.js';

// Setup Express
const app = express();
app.use(cors());
app.use(express.json());

// Check for SSL certificates
const SSL_CERT_PATH = '/app/certs/server.crt';
const SSL_KEY_PATH = '/app/certs/server.key';
const useHttps = existsSync(SSL_CERT_PATH) && existsSync(SSL_KEY_PATH);

// Create HTTP or HTTPS server based on certificate availability
let server;
if (useHttps) {
  const sslOptions = {
    cert: readFileSync(SSL_CERT_PATH),
    key: readFileSync(SSL_KEY_PATH),
  };
  server = createHttpsServer(sslOptions, app);
  console.log('🔒 HTTPS/WSS enabled');
} else {
  server = createServer(app);
  console.log('⚠️  Running in HTTP mode (no SSL certificates found)');
}

// Socket.IO server with permissive CORS (for local development)
const io = new Server(server, {
  cors: {
    origin: '*', // In production, specify exact origin
    methods: ['GET', 'POST'],
  },
});

// ============================================================
// GAME STATE MANAGEMENT
// ============================================================

const games = new Map();
const MAIN_ROOM = 'room-1';

// Create main game
games.set(MAIN_ROOM, new GameState(MAIN_ROOM));

/**
 * Get or create game room
 */
function getGame(roomId = MAIN_ROOM) {
  if (!games.has(roomId)) {
    games.set(roomId, new GameState(roomId));
  }
  return games.get(roomId);
}

// ============================================================
// GAME LOOP - THE HEART OF THE SERVER
// ============================================================

/**
 * Authoritative game loop running at 60 ticks/sec
 * 
 * RESPONSIBILITIES:
 * 1. Calls GameService.update() for each active game
 * 2. Collects events (score, collision)
 * 3. Broadcasts new state to all connected clients
 * 
 * WHY AUTHORITATIVE SERVER?
 * - Prevents cheating (client cannot modify state)
 * - Synchronizes all players (single source of truth)
 * - Handles latency issues centrally
 */
function gameLoop() {
  const gameState = getGame();
  
  // Check if reconnection timeout expired
  if (gameState._timeoutExpired) {
    gameState._timeoutExpired = false;  // Reset flag
    io.to(MAIN_ROOM).emit('gameEvent', {
      type: 'gameReset',
      data: { reason: 'Reconnection timeout expired - match cancelled' },
    });
    io.to(MAIN_ROOM).emit('lobbyUpdate', {
      players: [],
      canStart: false,
      spectators: [],  // Spectators also cleared
    });
  }
  
  // Check if finished timeout expired (auto-reset after game over)
  if (gameState._finishedTimeoutExpired) {
    gameState._finishedTimeoutExpired = false;  // Reset flag
    io.to(MAIN_ROOM).emit('gameEvent', {
      type: 'gameReset',
      data: { reason: 'No action taken - returning to lobby' },
    });
    io.to(MAIN_ROOM).emit('lobbyUpdate', {
      players: [],
      canStart: false,
      spectators: [],  // Spectators also cleared
    });
  }
  
  // Update game logic
  const events = GameService.update(gameState);
  
  // Broadcast state to all clients in the room
  io.to(MAIN_ROOM).emit('gameState', gameState.serialize());
  
  // Send special events if they occurred
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
          name: p.name,
        })),
      },
    });
  }
}

// Start game loop at 60 ticks/sec (16.66ms per tick)
const TICK_INTERVAL = 1000 / GAME_CONFIG.SERVER.TICK_RATE;
setInterval(gameLoop, TICK_INTERVAL);

console.log(`🎮 Game loop started at ${GAME_CONFIG.SERVER.TICK_RATE} ticks/sec`);

// ============================================================
// SOCKET.IO EVENT HANDLERS
// ============================================================

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);
  
  // Join the main room immediately for receiving broadcasts
  socket.join(MAIN_ROOM);
  
  // Send current state
  const gameState = getGame(MAIN_ROOM);
  socket.emit('gameState', gameState.serialize());
  
  /**
   * CLIENT WANTS TO JOIN LOBBY WITH NAME
   */
  socket.on('joinLobby', (data) => {
    const { playerName } = data;
    const gameState = getGame(MAIN_ROOM);
    
    if (!playerName || playerName.trim().length === 0) {
      socket.emit('error', { message: 'Player name is required' });
      return;
    }
    
    const result = GameService.joinLobby(gameState, socket.id, playerName.trim());
    
    if (!result) {
      socket.emit('error', { message: 'Lobby is full (max 4 players)' });
      return;
    }
    
    // Check if name was already taken
    if (result.error === 'nameTaken') {
      socket.emit('error', { message: result.message, code: 'NAME_TAKEN' });
      return;
    }
    
    // If player reconnected to active game
    if (result.inGame) {
      socket.emit('playerAssigned', {
        playerId: result.playerId,
        side: result.side,
        name: result.name,
        roomId: MAIN_ROOM,
        gameStatus: gameState.status,
        reconnected: true,
      });
      
      // Notify others
      socket.to(MAIN_ROOM).emit('gameEvent', {
        type: 'playerReconnected',
        data: { name: result.name, side: result.side },
      });
    } else {
      // Player joined lobby
      socket.emit('lobbyJoined', {
        name: result.name,
        reconnected: result.reconnected,
        canStart: gameState.canStartGame(),
        playersInLobby: gameState.lobby.playersReady.length,
      });
      
      // Broadcast lobby update to all
      io.to(MAIN_ROOM).emit('lobbyUpdate', {
        players: gameState.lobby.playersReady.map(p => ({ name: p.name })),
        canStart: gameState.canStartGame(),
        spectators: gameState.spectators.map(s => ({ name: s.name })),
      });
    }
    
    console.log(`🎮 ${result.reconnected ? 'Reconnected' : 'Joined'}: "${result.name}"`);
  });
  
  /**
   * CLIENT WANTS TO SPECTATE
   */
  socket.on('spectate', (data) => {
    const gameState = getGame(MAIN_ROOM);
    const spectator = GameService.addSpectator(gameState, socket.id, data?.name);
    
    socket.emit('spectatorAssigned', {
      name: spectator.name,
      roomId: MAIN_ROOM,
      gameStatus: gameState.status,
    });
    
    // Broadcast update
    io.to(MAIN_ROOM).emit('lobbyUpdate', {
      players: gameState.lobby.playersReady.map(p => ({ name: p.name })),
      canStart: gameState.canStartGame(),
      spectators: gameState.spectators.map(s => ({ name: s.name })),
    });
  });
  
  /**
   * LOBBY PLAYERS REQUEST GAME START
   */
  socket.on('startGame', (data = {}) => {
    const gameState = getGame(MAIN_ROOM);
    const { vsAI } = data;
    
    // Only allow if in lobby status and enough players
    if (gameState.status !== 'lobby') {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }
    
    // For AI mode, need exactly 1 player; for normal mode, need at least 2
    const playersInLobby = gameState.lobby.playersReady.length;
    
    if (vsAI) {
      if (playersInLobby !== 1) {
        socket.emit('error', { message: 'AI mode requires exactly 1 player' });
        return;
      }
    } else {
      if (!gameState.canStartGame()) {
        socket.emit('error', { message: 'Need at least 2 players to start' });
        return;
      }
    }
    
    // Start the game
    const started = GameService.startGame(gameState, vsAI);
    
    if (started) {
      // Notify all lobby players of their assignments
      gameState.players.forEach(player => {
        if (player.connected && player.socketIds.length > 0) {
          player.socketIds.forEach(sid => {
            io.to(sid).emit('playerAssigned', {
              playerId: player.id,
              side: player.side,
              name: player.name,
              roomId: MAIN_ROOM,
              gameStatus: gameState.status,
            });
          });
        }
      });
      
      // Broadcast game start event
      io.to(MAIN_ROOM).emit('gameEvent', {
        type: 'gameStart',
        data: {
          playerCount: gameState.activePlayerCount,
          aiEnabled: gameState.aiEnabled,
          players: gameState.players.filter(p => p.connected).map(p => ({
            id: p.id,
            side: p.side,
            name: p.name,
          })),
        },
      });
      
      // Clear lobby
      gameState.lobby.playersReady = [];
    }
  });
  
  /**
   * CLIENT SENDS INPUT (pressed keys)
   */
  socket.on('playerInput', (data) => {
    const { input } = data;
    const gameState = getGame(MAIN_ROOM);
    
    GameService.handlePlayerInput(gameState, socket.id, input);
  });
  
  /**
   * PLAYER VOTES TO ABANDON GAME
   */
  socket.on('voteAbandon', () => {
    const gameState = getGame(MAIN_ROOM);
    
    const result = GameService.voteToAbandon(gameState, socket.id);
    
    if (result) {
      if (result.abandoned) {
        // Game was abandoned, notify all
        io.to(MAIN_ROOM).emit('gameEvent', {
          type: 'gameAbandoned',
          data: { reason: 'All players voted to abandon' },
        });
        
        io.to(MAIN_ROOM).emit('lobbyUpdate', {
          players: [],
          canStart: false,
          spectators: gameState.spectators.map(s => ({ name: s.name })),
        });
      } else {
        // Broadcast vote update
        io.to(MAIN_ROOM).emit('gameEvent', {
          type: 'abandonVote',
          data: {
            playerName: result.playerName,
            votes: gameState.players.filter(p => p.votedToAbandon).length,
            totalPlayers: gameState.players.filter(p => p.connected).length,
          },
        });
      }
    }
  });
  
  /**
   * CLIENT REQUESTS GAME RESTART
   */
  socket.on('restartGame', () => {
    const gameState = getGame(MAIN_ROOM);
    
    const restarted = GameService.restartGame(gameState);
    
    if (restarted) {
      io.to(MAIN_ROOM).emit('gameEvent', {
        type: 'gameRestart',
        data: {},
      });
    }
  });
  
  /**
   * CLIENT DISCONNECTS
   */
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    
    const gameState = getGame(MAIN_ROOM);
    const result = GameService.removeSocket(gameState, socket.id);
    
    if (result) {
      if (result.allDisconnected || result.finishedReset) {
        // All players disconnected OR player left during finished state - reset for all
        io.to(MAIN_ROOM).emit('gameEvent', {
          type: 'gameReset',
          data: { reason: result.finishedReset ? 'Player left - match ended' : 'All players disconnected' },
        });
        
        io.to(MAIN_ROOM).emit('lobbyUpdate', {
          players: [],
          canStart: false,
          spectators: [],  // Spectators also cleared on reset
        });
      } else if (result.type === 'player' && !result.stillConnected) {
        // Player left (but not all disconnected)
        io.to(MAIN_ROOM).emit('gameEvent', {
          type: 'playerLeft',
          data: {
            name: result.name,
            connectedPlayers: gameState.getConnectedPlayersCount(),
          },
        });
      } else if (result.type === 'lobby') {
        // Lobby player left
        io.to(MAIN_ROOM).emit('lobbyUpdate', {
          players: gameState.lobby.playersReady.map(p => ({ name: p.name })),
          canStart: gameState.canStartGame(),
          spectators: gameState.spectators.map(s => ({ name: s.name })),
        });
      } else if (result.type === 'spectator') {
        // Spectator left
        io.to(MAIN_ROOM).emit('lobbyUpdate', {
          players: gameState.lobby.playersReady.map(p => ({ name: p.name })),
          canStart: gameState.canStartGame(),
          spectators: gameState.spectators.map(s => ({ name: s.name })),
        });
      }
    }
  });
});

// ============================================================
// REST API (optional - for debug/status)
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
      name: p.name,
      connected: p.connected,
      score: p.score,
    })),
    lobby: gameState.lobby.playersReady.map(p => ({ name: p.name })),
    spectators: gameState.spectators.map(s => ({ name: s.name })),
    tick: gameState.tick,
  });
});

// ============================================================
// SERVER START
// ============================================================

const PORT = process.env.PORT || GAME_CONFIG.SERVER.PORT;
const protocol = useHttps ? 'https' : 'http';
const wsProtocol = useHttps ? 'wss' : 'ws';

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🎮 PONG 4-PLAYER SERVER STARTED 🎮     ║
╠═══════════════════════════════════════════╣
║  Port:        ${PORT}                         ║
║  Protocol:    ${protocol.toUpperCase().padEnd(26)}║
║  Tick Rate:   ${GAME_CONFIG.SERVER.TICK_RATE} fps                      ║
║  Max Players: ${GAME_CONFIG.GAME.MAX_PLAYERS}                          ║
║  Min to Start: ${GAME_CONFIG.GAME.MIN_PLAYERS_TO_START}                         ║
╚═══════════════════════════════════════════╝

Server ready for connections!
WebSocket URL: ${wsProtocol}://localhost:${PORT}
  `);
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n👋 Server shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
