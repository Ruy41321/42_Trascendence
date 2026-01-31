/**
 * PHYSICS SERVICE
 * 
 * Handles all game physics:
 * - Ball movement (velocity integration)
 * - Paddle movement (input → position)
 * - Ball bounce (velocity inversion)
 * - Boundary checking (field limits)
 * 
 * KEY CONCEPT: Delta Time (dt)
 * - For smooth movement independent of framerate
 * - velocity * deltaTime = distance traveled
 * - E.g.: 300 px/s * 0.016s = 4.8 pixels per frame at 60fps
 */

import { GAME_CONFIG, ACTIVE_SIDES } from '../config/gameConfig.js';

export class PhysicsService {
  /**
   * Update ball position based on velocity
   * 
   * @param {Object} ball - Ball object from gameState
   * @param {number} dt - Delta time in seconds (e.g.: 0.016 for 60fps)
   */
  static updateBall(ball, dt) {
    // Euler integration: position += velocity * time
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
  }
  
  /**
   * Move paddle based on player input
   * 
   * @param {Object} player - Player object from gameState
   * @param {number} dt - Delta time
   */
  static updatePaddle(player, dt) {
    if (!player.input) return; // No input = stationary
    
    const speed = player.orientation === 'vertical' 
      ? GAME_CONFIG.PADDLE.VERTICAL.SPEED 
      : GAME_CONFIG.PADDLE.HORIZONTAL.SPEED;
    
    const distance = speed * dt;
    
    if (player.orientation === 'vertical') {
      // Vertical paddles: move up/down (Y axis)
      if (player.input === 'UP') {
        player.y = Math.max(0, player.y - distance);
      } else if (player.input === 'DOWN') {
        player.y = Math.min(
          GAME_CONFIG.CANVAS_HEIGHT - player.height,
          player.y + distance
        );
      }
    } else {
      // Horizontal paddles: move left/right (X axis)
      // Input 'UP' = left, 'DOWN' = right (mapped from frontend)
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
   * Check ball bounds against field edges (NOT paddles)
   * Returns object with type ('miss' or 'rebounce') and side
   * 
   * MECHANIC: 
   * - If ball exits from a side WITH a player, that player misses (others score)
   * - If ball exits from a side WITHOUT a player, it rebounds
   * 
   * @param {Object} ball - Ball object
   * @param {number} activePlayerCount - Number of players in game (2-4)
   * @returns {Object|null} - { type: 'miss'|'rebounce', side: string } or null
   */
  static checkBallBounds(ball, activePlayerCount) {
    const activeSides = ACTIVE_SIDES[activePlayerCount] || ACTIVE_SIDES[4];
    let hitSide = null;
    
    // Left boundary
    if (ball.x - ball.radius <= 0) {
      hitSide = 'left';
    }
    // Right boundary
    else if (ball.x + ball.radius >= GAME_CONFIG.CANVAS_WIDTH) {
      hitSide = 'right';
    }
    // Top boundary
    else if (ball.y - ball.radius <= 0) {
      hitSide = 'top';
    }
    // Bottom boundary
    else if (ball.y + ball.radius >= GAME_CONFIG.CANVAS_HEIGHT) {
      hitSide = 'bottom';
    }
    
    if (!hitSide) return null;
    
    // Check if this side has an active player
    if (activeSides.includes(hitSide)) {
      return { type: 'miss', side: hitSide };
    } else {
      return { type: 'rebounce', side: hitSide };
    }
  }
  
  /**
   * Rebound ball off a wall (for sides without players)
   * @param {Object} ball - Ball object
   * @param {string} side - Which side hit ('left', 'right', 'top', 'bottom')
   */
  static reboundBall(ball, side) {
    switch (side) {
      case 'left':
        ball.x = ball.radius + 1;  // Push ball back inside
        ball.vx = Math.abs(ball.vx);  // Ensure moving right
        break;
      case 'right':
        ball.x = GAME_CONFIG.CANVAS_WIDTH - ball.radius - 1;
        ball.vx = -Math.abs(ball.vx);  // Ensure moving left
        break;
      case 'top':
        ball.y = ball.radius + 1;
        ball.vy = Math.abs(ball.vy);  // Ensure moving down
        break;
      case 'bottom':
        ball.y = GAME_CONFIG.CANVAS_HEIGHT - ball.radius - 1;
        ball.vy = -Math.abs(ball.vy);  // Ensure moving up
        break;
    }
  }
  
  /**
   * Normalize ball velocity to avoid too horizontal/vertical trajectories
   * This prevents ball getting "stuck" moving perfectly horizontal
   */
  static normalizeBallVelocity(ball) {
    const MIN_ANGLE = 0.3; // ~17° minimum
    
    const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
    const angle = Math.atan2(ball.vy, ball.vx);
    
    // If too horizontal, add vertical component
    if (Math.abs(Math.sin(angle)) < MIN_ANGLE) {
      const sign = ball.vy >= 0 ? 1 : -1;
      ball.vy = sign * speed * MIN_ANGLE;
      ball.vx = Math.sign(ball.vx) * Math.sqrt(speed ** 2 - ball.vy ** 2);
    }
    
    // If too vertical, add horizontal component
    if (Math.abs(Math.cos(angle)) < MIN_ANGLE) {
      const sign = ball.vx >= 0 ? 1 : -1;
      ball.vx = sign * speed * MIN_ANGLE;
      ball.vy = Math.sign(ball.vy) * Math.sqrt(speed ** 2 - ball.vx ** 2);
    }
  }
  
  /**
   * Clamp ball speed to maximum allowed
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
