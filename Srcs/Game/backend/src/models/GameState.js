/**
 * GAME STATE MODEL
 * 
 * Questo è il "cuore" del gioco - contiene TUTTO lo stato della partita.
 * Il server mantiene questo oggetto, lo aggiorna ogni tick, e lo invia ai client.
 * 
 * PATTERN: "Single Source of Truth"
 * - Server è l'unica fonte autoritativa dello stato
 * - Client ricevono copia read-only e renderizzano
 * - Client NON modificano mai lo stato direttamente
 */

import { GAME_CONFIG, INITIAL_PADDLE_POSITIONS } from '../config/gameConfig.js';

export class GameState {
  constructor(roomId) {
    this.roomId = roomId;
    
    // Ball state
    this.ball = {
      x: GAME_CONFIG.CANVAS_WIDTH / 2,    // Centro campo
      y: GAME_CONFIG.CANVAS_HEIGHT / 2,
      vx: 0,                               // Velocità iniziale = 0 (parte dopo countdown)
      vy: 0,
      radius: GAME_CONFIG.BALL.RADIUS,
      speed: GAME_CONFIG.BALL.INITIAL_SPEED,
    };
    
    // Players state (array di 4 paddle)
    this.players = INITIAL_PADDLE_POSITIONS.map(pos => ({
      ...pos,
      score: 0,
      connected: false,         // True quando un client si connette
      socketId: null,           // ID socket del player
      input: null,              // Input corrente: 'UP', 'DOWN', o null
    }));
    
    // Game flow
    this.status = 'waiting';    // 'waiting' | 'countdown' | 'playing' | 'paused' | 'finished'
    this.winner = null,         // Player id del vincitore
    this.startTime = null,      // Timestamp inizio partita
    
    // Performance tracking
    this.tick = 0,              // Frame counter (utile per debug)
    this.lastUpdate = Date.now(),
  }
  
  /**
   * Reset della palla al centro con velocità random
   * Chiamato all'inizio e dopo ogni punto
   */
  resetBall() {
    this.ball.x = GAME_CONFIG.CANVAS_WIDTH / 2;
    this.ball.y = GAME_CONFIG.CANVAS_HEIGHT / 2;
    
    // Direzione random (45° diagonale in uno dei 4 quadranti)
    const angle = (Math.random() * Math.PI / 2) - Math.PI / 4; // -45° a +45°
    const direction = Math.floor(Math.random() * 4); // 0-3 per 4 direzioni
    
    const speed = GAME_CONFIG.BALL.INITIAL_SPEED;
    
    switch(direction) {
      case 0: // Verso top-right
        this.ball.vx = Math.cos(angle) * speed;
        this.ball.vy = -Math.sin(angle) * speed;
        break;
      case 1: // Verso bottom-right
        this.ball.vx = Math.cos(angle) * speed;
        this.ball.vy = Math.sin(angle) * speed;
        break;
      case 2: // Verso bottom-left
        this.ball.vx = -Math.cos(angle) * speed;
        this.ball.vy = Math.sin(angle) * speed;
        break;
      case 3: // Verso top-left
        this.ball.vx = -Math.cos(angle) * speed;
        this.ball.vy = -Math.sin(angle) * speed;
        break;
    }
    
    this.ball.speed = GAME_CONFIG.BALL.INITIAL_SPEED;
  }
  
  /**
   * Serializza lo stato per inviarlo ai client
   * Rimuove info non necessarie per ridurre bandwidth
   */
  serialize() {
    return {
      roomId: this.roomId,
      ball: {
        x: Math.round(this.ball.x * 10) / 10,  // Arrotonda a 1 decimale
        y: Math.round(this.ball.y * 10) / 10,
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
      })),
      status: this.status,
      winner: this.winner,
      tick: this.tick,
    };
  }
  
  /**
   * Check se tutti i 4 player sono connessi
   */
  isReady() {
    return this.players.every(p => p.connected);
  }
  
  /**
   * Trova player per socket ID
   */
  getPlayerBySocketId(socketId) {
    return this.players.find(p => p.socketId === socketId);
  }
}
