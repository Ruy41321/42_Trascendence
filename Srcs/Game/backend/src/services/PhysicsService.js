/**
 * PHYSICS SERVICE
 * 
 * Gestisce tutta la fisica del gioco:
 * - Movimento palla (integrazione velocità)
 * - Movimento paddle (input → posizione)
 * - Bounce palla (inversione velocità)
 * - Boundary checking (limiti campo)
 * 
 * CONCETTO CHIAVE: Delta Time (dt)
 * - Per movimento smooth indipendente da framerate
 * - velocity * deltaTime = distanza percorsa
 * - Es: 300 px/s * 0.016s = 4.8 pixel per frame a 60fps
 */

import { GAME_CONFIG } from '../config/gameConfig.js';

export class PhysicsService {
  /**
   * Aggiorna posizione palla basandosi su velocità
   * 
   * @param {Object} ball - Ball object da gameState
   * @param {number} dt - Delta time in secondi (es: 0.016 per 60fps)
   */
  static updateBall(ball, dt) {
    // Integrazione Euler: position += velocity * time
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
  }
  
  /**
   * Muove paddle basandosi su input del player
   * 
   * @param {Object} player - Player object da gameState
   * @param {number} dt - Delta time
   */
  static updatePaddle(player, dt) {
    if (!player.input) return; // Nessun input = fermo
    
    const speed = player.orientation === 'vertical' 
      ? GAME_CONFIG.PADDLE.VERTICAL.SPEED 
      : GAME_CONFIG.PADDLE.HORIZONTAL.SPEED;
    
    const distance = speed * dt;
    
    if (player.orientation === 'vertical') {
      // Paddle verticali: muovono su/giù (Y axis)
      if (player.input === 'UP') {
        player.y = Math.max(0, player.y - distance);
      } else if (player.input === 'DOWN') {
        player.y = Math.min(
          GAME_CONFIG.CANVAS_HEIGHT - player.height,
          player.y + distance
        );
      }
    } else {
      // Paddle orizzontali: muovono sinistra/destra (X axis)
      // Input 'UP' = sinistra, 'DOWN' = destra (logica mappata da frontend)
      if (player.input === 'UP') {
        player.x = Math.max(0, player.x - distance);
      } else if (player.input === 'DOWN') {
        player.x = Math.min(
          GAME_CONFIG.CANVAS_WIDTH - player.width,
          player.x + distance
        );
      }
    }
  }
  
  /**
   * Bounce palla contro bordi del campo (NON paddle)
   * Ritorna il side che ha perso il punto, o null se no out
   * 
   * MECCANICA: Se palla esce da un lato, quel player perde punto
   */
  static checkBallBounds(ball) {
    let missedSide = null;
    
    // Left boundary (player 0 perde)
    if (ball.x - ball.radius <= 0) {
      missedSide = 'left';
    }
    // Right boundary (player 2 perde)
    else if (ball.x + ball.radius >= GAME_CONFIG.CANVAS_WIDTH) {
      missedSide = 'right';
    }
    // Top boundary (player 1 perde)
    else if (ball.y - ball.radius <= 0) {
      missedSide = 'top';
    }
    // Bottom boundary (player 3 perde)
    else if (ball.y + ball.radius >= GAME_CONFIG.CANVAS_HEIGHT) {
      missedSide = 'bottom';
    }
    
    return missedSide;
  }
  
  /**
   * Normalizza velocità palla per evitare velocità troppo orizzontali/verticali
   * Questo previene palla "stuck" che va perfettamente orizzontale
   */
  static normalizeBallVelocity(ball) {
    const MIN_ANGLE = 0.3; // ~17° minimo
    
    const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
    const angle = Math.atan2(ball.vy, ball.vx);
    
    // Se troppo orizzontale, aggiungi componente verticale
    if (Math.abs(Math.sin(angle)) < MIN_ANGLE) {
      const sign = ball.vy >= 0 ? 1 : -1;
      ball.vy = sign * speed * MIN_ANGLE;
      ball.vx = Math.sign(ball.vx) * Math.sqrt(speed ** 2 - ball.vy ** 2);
    }
    
    // Se troppo verticale, aggiungi componente orizzontale
    if (Math.abs(Math.cos(angle)) < MIN_ANGLE) {
      const sign = ball.vx >= 0 ? 1 : -1;
      ball.vx = sign * speed * MIN_ANGLE;
      ball.vy = Math.sign(ball.vy) * Math.sqrt(speed ** 2 - ball.vx ** 2);
    }
  }
  
  /**
   * Limita velocità palla al massimo consentito
   */
  static clampBallSpeed(ball) {
    const currentSpeed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
    
    if (currentSpeed > GAME_CONFIG.BALL.MAX_SPEED) {
      const ratio = GAME_CONFIG.BALL.MAX_SPEED / currentSpeed;
      ball.vx *= ratio;
      ball.vy *= ratio;
    }
  }
}
