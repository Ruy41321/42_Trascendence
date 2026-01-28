/**
 * GAME SERVICE
 * 
 * Orchestratore principale del gioco. Gestisce:
 * - Game loop (chiamato ogni tick)
 * - Logica scoring
 * - Transizioni di stato (waiting → playing → finished)
 * - Coordinazione tra Physics e Collision services
 * 
 * PATTERN: Service Layer
 * - Separa logica business da networking (server.js)
 * - Testabile indipendentemente
 * - Riutilizzabile
 */

import { PhysicsService } from './PhysicsService.js';
import { CollisionService } from './CollisionService.js';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class GameService {
  /**
   * Update principale chiamato ogni tick (60 volte al secondo)
   * 
   * @param {GameState} gameState - Stato corrente del gioco
   * @returns {Object} - Eventi accaduti questo tick (scores, collision, etc)
   */
  static update(gameState) {
    const now = Date.now();
    const dt = (now - gameState.lastUpdate) / 1000; // Delta time in secondi
    gameState.lastUpdate = now;
    gameState.tick++;
    
    const events = {
      scored: null,      // { side, playerId }
      collision: false,
      gameOver: false,
    };
    
    // Update solo se gioco è in "playing" state
    if (gameState.status !== 'playing') {
      return events;
    }
    
    // 1. UPDATE PADDLE (basandosi su input player)
    for (const player of gameState.players) {
      if (player.connected) {
        PhysicsService.updatePaddle(player, dt);
      }
    }
    
    // 2. UPDATE BALL
    PhysicsService.updateBall(gameState.ball, dt);
    
    // 3. CHECK COLLISION BALL vs PADDLE
    const paddleHit = CollisionService.checkPaddleCollisions(
      gameState.ball, 
      gameState.players
    );
    
    if (paddleHit) {
      events.collision = true;
    }
    
    // 4. CHECK BALL OUT OF BOUNDS (scoring)
    const missedSide = PhysicsService.checkBallBounds(gameState.ball);
    
    if (missedSide) {
      // Trova player che ha perso punto
      const losingPlayer = gameState.players.find(p => p.side === missedSide);
      
      if (losingPlayer) {
        losingPlayer.score += GAME_CONFIG.GAME.POINTS_ON_MISS; // Di solito -1
        
        events.scored = {
          side: missedSide,
          playerId: losingPlayer.id,
          newScore: losingPlayer.score,
        };
        
        // Reset palla al centro
        gameState.resetBall();
        
        // Check win condition
        const winner = this.checkWinCondition(gameState);
        if (winner) {
          gameState.status = 'finished';
          gameState.winner = winner.id;
          events.gameOver = true;
        }
      }
    }
    
    return events;
  }
  
  /**
   * Check se qualche player ha raggiunto score vincente
   * 
   * WIN CONDITION: Primo a raggiungere WIN_SCORE punti
   * Oppure: Ultimo rimasto con score > threshold
   */
  static checkWinCondition(gameState) {
    // Vince chi arriva a WIN_SCORE per primo
    const winner = gameState.players.find(
      p => p.score >= GAME_CONFIG.GAME.WIN_SCORE
    );
    
    if (winner) return winner;
    
    // Alternativa: Vince chi ha più punti dopo un timeout
    // (Da implementare se vuoi partite con limite di tempo)
    
    return null;
  }
  
  /**
   * Inizia nuova partita
   * - Reset tutti gli score
   * - Reset posizioni paddle
   * - Reset ball
   * - Start countdown
   */
  static startGame(gameState) {
    // Reset scores
    gameState.players.forEach(p => {
      p.score = 0;
      p.input = null;
    });
    
    // Reset posizioni (già fatto da constructor, ma per sicurezza)
    gameState.resetBall();
    
    // Countdown 3 secondi prima di iniziare
    gameState.status = 'countdown';
    gameState.startTime = Date.now();
    
    // Dopo 3 secondi, status → 'playing'
    setTimeout(() => {
      if (gameState.status === 'countdown') {
        gameState.status = 'playing';
        // Lancia palla con velocità random
        gameState.resetBall();
      }
    }, 3000);
  }
  
  /**
   * Gestisce input player
   * 
   * @param {GameState} gameState
   * @param {string} socketId - ID socket del player
   * @param {string} input - 'UP' | 'DOWN' | null
   */
  static handlePlayerInput(gameState, socketId, input) {
    const player = gameState.getPlayerBySocketId(socketId);
    
    if (!player) {
      console.warn(`Player con socketId ${socketId} non trovato`);
      return;
    }
    
    // Valida input
    if (input !== 'UP' && input !== 'DOWN' && input !== null) {
      console.warn(`Input invalido: ${input}`);
      return;
    }
    
    player.input = input;
  }
  
  /**
   * Player si connette alla partita
   */
  static connectPlayer(gameState, socketId) {
    // Trova primo slot libero
    const player = gameState.players.find(p => !p.connected);
    
    if (!player) {
      return null; // Room piena
    }
    
    player.connected = true;
    player.socketId = socketId;
    
    console.log(`Player ${player.id} (${player.side}) connesso - ${socketId}`);
    
    // Se tutti connessi, auto-start
    if (gameState.isReady() && gameState.status === 'waiting') {
      this.startGame(gameState);
    }
    
    return player;
  }
  
  /**
   * Player si disconnette
   */
  static disconnectPlayer(gameState, socketId) {
    const player = gameState.getPlayerBySocketId(socketId);
    
    if (!player) return;
    
    player.connected = false;
    player.socketId = null;
    player.input = null;
    
    console.log(`Player ${player.id} (${player.side}) disconnesso`);
    
    // Pausa gioco se qualcuno disconnette durante partita
    if (gameState.status === 'playing') {
      gameState.status = 'paused';
    }
  }
}
