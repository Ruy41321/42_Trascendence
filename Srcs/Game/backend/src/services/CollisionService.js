/**
 * COLLISION SERVICE
 * 
 * Handles all game collisions:
 * - Ball vs Paddle (AABB collision)
 * - Bounce mechanics
 * - Spin effect (ball acquires paddle velocity)
 * 
 * COLLISION DETECTION: AABB (Axis-Aligned Bounding Box)
 * Simple but effective algorithm for rectangles:
 * 1. Check overlap on X axis
 * 2. Check overlap on Y axis
 * 3. If both overlap → COLLISION!
 */

import { GAME_CONFIG } from '../config/gameConfig.js';
import { PhysicsService } from './PhysicsService.js';

export class CollisionService {
  /**
   * Check ball collision with all paddles
   * Returns true if collision occurred
   * 
   * @param {Object} ball - Ball state
   * @param {Array} players - Array of players/paddles
   */
  static checkPaddleCollisions(ball, players) {
    let collisionDetected = false;
    
    for (const player of players) {
      if (!player.connected) continue; // Skip disconnected players
      
      if (this.checkBallPaddleCollision(ball, player)) {
        this.handlePaddleHit(ball, player);
        collisionDetected = true;
        break; // One collision per frame is sufficient
      }
    }
    
    return collisionDetected;
  }
  
  /**
   * AABB Collision Detection between ball (circle) and paddle (rectangle)
   * 
   * Converts circle to bounding box for simplicity:
   * - Ball box: (x - radius, y - radius) to (x + radius, y + radius)
   * - Paddle box: (x, y) to (x + width, y + height)
   * 
   * Overlap if:
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
    
    // Check overlap on both axes
    const xOverlap = ballRight > paddleLeft && ballLeft < paddleRight;
    const yOverlap = ballBottom > paddleTop && ballTop < paddleBottom;
    
    return xOverlap && yOverlap;
  }
  
  /**
   * Handle bounce when ball hits paddle
   * 
   * MECHANICS:
   * 1. Invert velocity on main axis (X for vertical, Y for horizontal)
   * 2. Slightly increase speed (acceleration)
   * 3. Add "spin" based on where ball hits the paddle
   * 4. Push ball out of paddle to avoid getting stuck
   */
  static handlePaddleHit(ball, paddle) {
    // Determine which axis to invert based on paddle orientation
    if (paddle.orientation === 'vertical') {
      // Vertical paddles: invert X velocity
      ball.vx = -ball.vx;
      
      // Push ball out of paddle
      if (paddle.side === 'left') {
        ball.x = paddle.x + paddle.width + ball.radius + 1;
      } else { // right
        ball.x = paddle.x - ball.radius - 1;
      }
      
      // Add spin based on Y offset (where ball hits the paddle)
      const hitOffset = ball.y - (paddle.y + paddle.height / 2);
      const maxOffset = paddle.height / 2;
      const spinFactor = (hitOffset / maxOffset) * 0.5; // Max 50% spin
      
      ball.vy += spinFactor * Math.abs(ball.vx);
      
    } else {
      // Horizontal paddles: invert Y velocity
      ball.vy = -ball.vy;
      
      // Push ball out
      if (paddle.side === 'top') {
        ball.y = paddle.y + paddle.height + ball.radius + 1;
      } else { // bottom
        ball.y = paddle.y - ball.radius - 1;
      }
      
      // Spin based on X offset
      const hitOffset = ball.x - (paddle.x + paddle.width / 2);
      const maxOffset = paddle.width / 2;
      const spinFactor = (hitOffset / maxOffset) * 0.5;
      
      ball.vx += spinFactor * Math.abs(ball.vy);
    }
    
    // Increase speed on each bounce
    ball.vx *= GAME_CONFIG.BALL.ACCELERATION;
    ball.vy *= GAME_CONFIG.BALL.ACCELERATION;
    
    // Normalize to avoid weird angles
    PhysicsService.normalizeBallVelocity(ball);
    PhysicsService.clampBallSpeed(ball);
  }
  
  /**
   * Calculate distance between point (ball) and rectangle (paddle)
   * Useful for more precise collision detection
   */
  static pointRectDistance(px, py, rx, ry, rw, rh) {
    const dx = Math.max(rx - px, 0, px - (rx + rw));
    const dy = Math.max(ry - py, 0, py - (ry + rh));
    return Math.sqrt(dx * dx + dy * dy);
  }
}
