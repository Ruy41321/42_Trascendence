/**
 * GAME STATE MODEL
 * 
 * This is the "heart" of the game - contains ALL game state.
 * The server maintains this object, updates it every tick, and sends it to clients.
 * 
 * PATTERN: "Single Source of Truth"
 * - Server is the only authoritative source of state
 * - Clients receive read-only copy and render
 * - Clients NEVER modify state directly
 */

import { GAME_CONFIG, INITIAL_PADDLE_POSITIONS } from '../config/gameConfig.js';

export class GameState {
  constructor(roomId) {
    this.roomId = roomId;
    
    // Ball state
    this.ball = {
      x: GAME_CONFIG.CANVAS_WIDTH / 2,
      y: GAME_CONFIG.CANVAS_HEIGHT / 2,
      vx: 0,
      vy: 0,
      radius: GAME_CONFIG.BALL.RADIUS,
      speed: GAME_CONFIG.BALL.INITIAL_SPEED,
      spawnedTick: 0,           // Tick when ball was spawned
      hasBeenHit: false,        // Whether ball has been hit by any paddle
    };
    
    // Players state (array of 4 paddles)
    this.players = INITIAL_PADDLE_POSITIONS.map(pos => ({
      ...pos,
      score: 0,
      connected: false,
      name: null,                   // Player name for identification
      socketIds: [],                // Array of socket IDs (supports multiple connections)
      input: null,                  // Current input: 'UP', 'DOWN', or null
      votedToAbandon: false,        // Has this player voted to abandon the game
    }));
    
    // Spectators (viewers not playing)
    this.spectators = [];           // Array of { socketId, name }
    
    // Lobby state - tracks players waiting to start
    this.lobby = {
      playersReady: [],             // Array of { name, socketId } waiting in lobby
    };
    
    // Game flow
    this.status = 'lobby';          // 'lobby' | 'countdown' | 'playing' | 'paused' | 'finished'
    this.winner = null;             // Winner player id
    this.startTime = null;          // Game start timestamp
    this.activePlayerCount = 0;     // Number of players in current game (2-4)
    this.reconnectTimeout = null;   // Timer for reconnection deadline
    this.finishedTimeout = null;    // Timer for auto-reset after game over (10s)
    
    // AI Mode
    this.aiEnabled = false;         // Whether AI mode is active
    this.aiPlayerSlot = null;       // Which player slot the AI controls (usually 2 = right)
    
    // Performance tracking
    this.tick = 0;
    this.lastUpdate = Date.now();
  }
  
  /**
   * Reset ball to center with random velocity
   * Called at start and after each score
   */
  resetBall() {
    this.ball.x = GAME_CONFIG.CANVAS_WIDTH / 2;
    this.ball.y = GAME_CONFIG.CANVAS_HEIGHT / 2;
    
    // Track spawn for grace period (no unfair goals)
    this.ball.spawnedTick = this.tick;
    this.ball.hasBeenHit = false;
    
    // Random direction (45° diagonal in one of 4 quadrants)
    const angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
    const direction = Math.floor(Math.random() * 4);
    
    const speed = GAME_CONFIG.BALL.INITIAL_SPEED;
    
    switch(direction) {
      case 0: // Toward top-right
        this.ball.vx = Math.cos(angle) * speed;
        this.ball.vy = -Math.sin(angle) * speed;
        break;
      case 1: // Toward bottom-right
        this.ball.vx = Math.cos(angle) * speed;
        this.ball.vy = Math.sin(angle) * speed;
        break;
      case 2: // Toward bottom-left
        this.ball.vx = -Math.cos(angle) * speed;
        this.ball.vy = Math.sin(angle) * speed;
        break;
      case 3: // Toward top-left
        this.ball.vx = -Math.cos(angle) * speed;
        this.ball.vy = -Math.sin(angle) * speed;
        break;
    }
    
    this.ball.speed = GAME_CONFIG.BALL.INITIAL_SPEED;
  }
  
  /**
   * Serialize state for sending to clients
   * Removes unnecessary info to reduce bandwidth
   */
  serialize() {
    return {
      roomId: this.roomId,
      ball: {
        x: Math.round(this.ball.x * 10) / 10,
        y: Math.round(this.ball.y * 10) / 10,
        vx: Math.round(this.ball.vx * 10) / 10,  // Include velocity for client-side interpolation
        vy: Math.round(this.ball.vy * 10) / 10,
        radius: this.ball.radius,
      },
      players: this.players.map(p => ({
        id: p.id,
        side: p.side,
        x: Math.round(p.x * 10) / 10,
        y: Math.round(p.y * 10) / 10,
        width: p.width,
        height: p.height,
        score: p.score,
        connected: p.connected,
        name: p.name,
        votedToAbandon: p.votedToAbandon,
      })),
      spectators: this.spectators.map(s => ({ name: s.name })),
      lobby: {
        playersReady: this.lobby.playersReady.map(p => ({ name: p.name })),
      },
      status: this.status,
      winner: this.winner,
      tick: this.tick,
      activePlayerCount: this.activePlayerCount,
      aiEnabled: this.aiEnabled,
      aiPlayerSlot: this.aiPlayerSlot,
    };
  }
  
  /**
   * Check if minimum players are ready in lobby
   */
  canStartGame() {
    return this.lobby.playersReady.length >= GAME_CONFIG.GAME.MIN_PLAYERS_TO_START;
  }
  
  /**
   * Get count of connected players (not spectators)
   */
  getConnectedPlayersCount() {
    return this.players.filter(p => p.connected && p.socketIds.length > 0).length;
  }
  
  /**
   * Find player by socket ID
   */
  getPlayerBySocketId(socketId) {
    return this.players.find(p => p.socketIds.includes(socketId));
  }
  
  /**
   * Find player by name
   */
  getPlayerByName(name) {
    return this.players.find(p => p.name === name);
  }
  
  /**
   * Find spectator by socket ID
   */
  getSpectatorBySocketId(socketId) {
    return this.spectators.find(s => s.socketId === socketId);
  }
  
  /**
   * Check if all remaining connected players voted to abandon
   * Only counts players who are actually connected (have socketIds)
   */
  checkAllVotedToAbandon() {
    const connectedPlayers = this.players.filter(p => p.connected && p.socketIds.length > 0);
    if (connectedPlayers.length === 0) return false;
    return connectedPlayers.every(p => p.votedToAbandon);
  }
  
  /**
   * Reset game to lobby state
   */
  resetToLobby() {
    this.status = 'lobby';
    this.winner = null;
    this.startTime = null;
    this.activePlayerCount = 0;
    
    // Reset AI mode
    this.aiEnabled = false;
    this.aiPlayerSlot = null;
    
    // Clear any pending reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // Clear any pending finished timeout
    if (this.finishedTimeout) {
      clearTimeout(this.finishedTimeout);
      this.finishedTimeout = null;
    }
    
    // Reset ball
    this.ball.x = GAME_CONFIG.CANVAS_WIDTH / 2;
    this.ball.y = GAME_CONFIG.CANVAS_HEIGHT / 2;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.spawnedTick = 0;
    this.ball.hasBeenHit = false;
    
    // Reset players
    this.players.forEach((player, index) => {
      const initialPos = INITIAL_PADDLE_POSITIONS[index];
      player.score = 0;
      player.connected = false;
      player.name = null;
      player.socketIds = [];
      player.input = null;
      player.votedToAbandon = false;
      player.x = initialPos.x;
      player.y = initialPos.y;
    });
    
    // Clear lobby
    this.lobby.playersReady = [];
    
    // Clear spectators too (everyone must rejoin)
    this.spectators = [];
  }
}

