/**
 * COLLISION SERVICE
 * 
 * Gestisce tutte le collisioni del gioco:
 * - Ball vs Paddle (AABB collision)
 * - Bounce mechanics
 * - Spin effect (palla acquisisce velocità del paddle)
 * 
 * COLLISION DETECTION: AABB (Axis-Aligned Bounding Box)
 * Algoritmo semplice ma efficace per rettangoli:
 * 1. Check overlap sull'asse X
 * 2. Check overlap sull'asse Y
 * 3. Se entrambi overlap → COLLISION!
 */

import { GAME_CONFIG } from '../config/gameConfig.js';
import { PhysicsService } from './PhysicsService.js';

export class CollisionService {
  /**
   * Check collisione palla con tutti i paddle
   * Ritorna true se c'è stata collision
   * 
   * @param {Object} ball - Ball state
   * @param {Array} players - Array di player/paddle
   */
  static checkPaddleCollisions(ball, players) {
    let collisionDetected = false;
    
    for (const player of players) {
      if (!player.connected) continue; // Skip player disconnessi
      
      if (this.checkBallPaddleCollision(ball, player)) {
        this.handlePaddleHit(ball, player);
        collisionDetected = true;
        break; // Una collision per frame è sufficiente
      }
    }
    
    return collisionDetected;
  }
  
  /**
   * AABB Collision Detection tra palla (cerchio) e paddle (rettangolo)
   * 
   * Converte cerchio in bounding box per semplificare:
   * - Ball box: (x - radius, y - radius) a (x + radius, y + radius)
   * - Paddle box: (x, y) a (x + width, y + height)
   * 
   * Overlap se:
   * - ball.right > paddle.left  AND  ball.left < paddle.right  (X overlap)
   * - ball.bottom > paddle.top  AND  ball.top < paddle.bottom  (Y overlap)
   */
  static checkBallPaddleCollision(ball, paddle) {
    // Ball bounding box
    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;
    const ballTop = ball.y - ball.radius;
    const ballBottom = ball.y + ball.radius;
    
    // Paddle bounding box
    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + paddle.width;
    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;
    
    // Check overlap su entrambi gli assi
    const xOverlap = ballRight > paddleLeft && ballLeft < paddleRight;
    const yOverlap = ballBottom > paddleTop && ballTop < paddleBottom;
    
    return xOverlap && yOverlap;
  }
  
  /**
   * Gestisce bounce quando palla colpisce paddle
   * 
   * MECCANICHE:
   * 1. Inverti velocità sull'asse principale (X per vertical, Y per horizontal)
   * 2. Aumenta leggermente speed (acceleration)
   * 3. Aggiungi "spin" basandosi su dove colpisce il paddle
   * 4. Push palla fuori dal paddle per evitare stuck
   */
  static handlePaddleHit(ball, paddle) {
    // Determina quale asse invertire basandosi su orientamento paddle
    if (paddle.orientation === 'vertical') {
      // Paddle verticali: inverti X velocity
      ball.vx = -ball.vx;
      
      // Push palla fuori dal paddle
      if (paddle.side === 'left') {
        ball.x = paddle.x + paddle.width + ball.radius + 1;
      } else { // right
        ball.x = paddle.x - ball.radius - 1;
      }
      
      // Aggiungi spin basandosi su offset Y (dove colpisce il paddle)
      const hitOffset = ball.y - (paddle.y + paddle.height / 2);
      const maxOffset = paddle.height / 2;
      const spinFactor = (hitOffset / maxOffset) * 0.5; // Max 50% di spin
      
      ball.vy += spinFactor * Math.abs(ball.vx);
      
    } else {
      // Paddle orizzontali: inverti Y velocity
      ball.vy = -ball.vy;
      
      // Push palla fuori
      if (paddle.side === 'top') {
        ball.y = paddle.y + paddle.height + ball.radius + 1;
      } else { // bottom
        ball.y = paddle.y - ball.radius - 1;
      }
      
      // Spin basandosi su offset X
      const hitOffset = ball.x - (paddle.x + paddle.width / 2);
      const maxOffset = paddle.width / 2;
      const spinFactor = (hitOffset / maxOffset) * 0.5;
      
      ball.vx += spinFactor * Math.abs(ball.vy);
    }
    
    // Aumenta velocità ad ogni bounce
    ball.vx *= GAME_CONFIG.BALL.ACCELERATION;
    ball.vy *= GAME_CONFIG.BALL.ACCELERATION;
    
    // Normalizza per evitare angoli strani
    PhysicsService.normalizeBallVelocity(ball);
    PhysicsService.clampBallSpeed(ball);
  }
  
  /**
   * Calcola distanza tra punto (palla) e rettangolo (paddle)
   * Utile per collision detection più precisa
   */
  static pointRectDistance(px, py, rx, ry, rw, rh) {
    const dx = Math.max(rx - px, 0, px - (rx + rw));
    const dy = Math.max(ry - py, 0, py - (ry + rh));
    return Math.sqrt(dx * dx + dy * dy);
  }
}
