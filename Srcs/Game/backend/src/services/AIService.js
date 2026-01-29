/**
 * AI SERVICE
 * 
 * Handles AI player logic for single-player mode (Player vs AI).
 * The AI controls a paddle and attempts to intercept the ball.
 * 
 * DIFFICULTY: Medium - Human-like behavior
 * - AI has variable reaction times (simulates human reflexes)
 * - AI makes prediction errors (doesn't always aim perfectly)
 * - AI occasionally gets distracted or hesitates
 * - AI sometimes overcommits or reacts late
 * - AI can win but is beatable by skilled players
 */

import { GAME_CONFIG } from '../config/gameConfig.js';

export class AIService {
  // AI Configuration - Human-like difficulty
  static AI_CONFIG = {
    // Reaction timing
    REACTION_DELAY_MIN: 100,      // Minimum reaction time (ms)
    REACTION_DELAY_MAX: 300,      // Maximum reaction time (ms)
    
    // Prediction accuracy
    PREDICTION_ERROR_MIN: 20,     // Minimum prediction error (px)
    PREDICTION_ERROR_MAX: 80,     // Maximum prediction error (px)
    
    // Human-like behaviors
    HESITATION_CHANCE: 0.08,      // 8% chance to hesitate each update
    HESITATION_DURATION: 300,     // How long hesitation lasts (ms)
    
    WRONG_DIRECTION_CHANCE: 0.03, // 3% chance to move wrong direction briefly
    WRONG_DIRECTION_DURATION: 200,// Duration of wrong movement (ms)
    
    LATE_REACTION_CHANCE: 0.1,    // 10% chance to react late to direction change
    LATE_REACTION_EXTRA_DELAY: 400,// Extra delay when reacting late (ms)
    
    OVERCOMMIT_CHANCE: 0.05,      // 5% chance to overcommit (keep moving past target)
    OVERCOMMIT_DURATION: 250,     // How long to overcommit (ms)
    
    DISTRACTION_CHANCE: 0.02,     // 2% chance to get "distracted" and return to center
    DISTRACTION_DURATION: 500,    // How long distraction lasts (ms)
    
    // Movement
    SPEED_FACTOR_MIN: 0.7,        // Minimum speed (70% of max)
    SPEED_FACTOR_MAX: 1.0,        // Maximum speed (100% of max)
    
    UPDATE_INTERVAL: 50,          // ms between AI decision updates
    DEADZONE: 15,                 // Don't move if within this range of target
  };
  
  // AI State (per game)
  static aiState = {
    lastUpdateTime: 0,
    lastBallVx: 0,
    reactionEndTime: 0,
    targetY: null,
    currentPredictionError: 0,
    
    // Human-like behavior states
    isHesitating: false,
    hesitationEndTime: 0,
    
    isMovingWrongDirection: false,
    wrongDirectionEndTime: 0,
    wrongDirection: null,
    
    isOvercommitting: false,
    overcommitEndTime: 0,
    overcommitDirection: null,
    
    isDistracted: false,
    distractionEndTime: 0,
    
    currentSpeedFactor: 1.0,
  };
  
  /**
   * Reset AI state when a new game starts
   */
  static resetAI() {
    this.aiState = {
      lastUpdateTime: 0,
      lastBallVx: 0,
      reactionEndTime: 0,
      targetY: null,
      currentPredictionError: this.getRandomPredictionError(),
      
      isHesitating: false,
      hesitationEndTime: 0,
      
      isMovingWrongDirection: false,
      wrongDirectionEndTime: 0,
      wrongDirection: null,
      
      isOvercommitting: false,
      overcommitEndTime: 0,
      overcommitDirection: null,
      
      isDistracted: false,
      distractionEndTime: 0,
      
      currentSpeedFactor: this.getRandomSpeedFactor(),
    };
  }
  
  /**
   * Get random reaction delay
   */
  static getRandomReactionDelay() {
    const { REACTION_DELAY_MIN, REACTION_DELAY_MAX } = this.AI_CONFIG;
    return REACTION_DELAY_MIN + Math.random() * (REACTION_DELAY_MAX - REACTION_DELAY_MIN);
  }
  
  /**
   * Get random prediction error
   */
  static getRandomPredictionError() {
    const { PREDICTION_ERROR_MIN, PREDICTION_ERROR_MAX } = this.AI_CONFIG;
    const magnitude = PREDICTION_ERROR_MIN + Math.random() * (PREDICTION_ERROR_MAX - PREDICTION_ERROR_MIN);
    return (Math.random() - 0.5) * 2 * magnitude;  // Can be positive or negative
  }
  
  /**
   * Get random speed factor
   */
  static getRandomSpeedFactor() {
    const { SPEED_FACTOR_MIN, SPEED_FACTOR_MAX } = this.AI_CONFIG;
    return SPEED_FACTOR_MIN + Math.random() * (SPEED_FACTOR_MAX - SPEED_FACTOR_MIN);
  }
  
  /**
   * Update AI paddle input
   * Called every game tick when AI is enabled
   * 
   * @param {GameState} gameState - Current game state
   * @param {number} aiPlayerSlot - The slot index of the AI paddle (usually 2 = right)
   */
  static updateAI(gameState, aiPlayerSlot) {
    const now = Date.now();
    const aiPlayer = gameState.players[aiPlayerSlot];
    
    if (!aiPlayer || !aiPlayer.connected) return;
    
    // Only update AI decisions at certain intervals (not every tick)
    if (now - this.aiState.lastUpdateTime < this.AI_CONFIG.UPDATE_INTERVAL) {
      return;
    }
    this.aiState.lastUpdateTime = now;
    
    const ball = gameState.ball;
    
    // ============================================================
    // CHECK HUMAN-LIKE BEHAVIOR STATES
    // ============================================================
    
    // Check if hesitating (AI freezes briefly)
    if (this.aiState.isHesitating) {
      if (now > this.aiState.hesitationEndTime) {
        this.aiState.isHesitating = false;
      } else {
        aiPlayer.input = null;
        return;
      }
    }
    
    // Check if moving wrong direction
    if (this.aiState.isMovingWrongDirection) {
      if (now > this.aiState.wrongDirectionEndTime) {
        this.aiState.isMovingWrongDirection = false;
      } else {
        aiPlayer.input = this.aiState.wrongDirection;
        return;
      }
    }
    
    // Check if overcommitting (keeps moving past target)
    if (this.aiState.isOvercommitting) {
      if (now > this.aiState.overcommitEndTime) {
        this.aiState.isOvercommitting = false;
      } else {
        aiPlayer.input = this.aiState.overcommitDirection;
        return;
      }
    }
    
    // Check if distracted (moves toward center)
    if (this.aiState.isDistracted) {
      if (now > this.aiState.distractionEndTime) {
        this.aiState.isDistracted = false;
      } else {
        const paddleCenter = aiPlayer.y + aiPlayer.height / 2;
        const canvasCenter = GAME_CONFIG.CANVAS_HEIGHT / 2;
        if (Math.abs(paddleCenter - canvasCenter) > 20) {
          aiPlayer.input = paddleCenter > canvasCenter ? 'UP' : 'DOWN';
        } else {
          aiPlayer.input = null;
        }
        return;
      }
    }
    
    // ============================================================
    // TRIGGER NEW HUMAN-LIKE BEHAVIORS
    // ============================================================
    
    // Random chance to hesitate
    if (Math.random() < this.AI_CONFIG.HESITATION_CHANCE) {
      this.aiState.isHesitating = true;
      this.aiState.hesitationEndTime = now + this.AI_CONFIG.HESITATION_DURATION;
      aiPlayer.input = null;
      return;
    }
    
    // Random chance to get distracted
    if (Math.random() < this.AI_CONFIG.DISTRACTION_CHANCE) {
      this.aiState.isDistracted = true;
      this.aiState.distractionEndTime = now + this.AI_CONFIG.DISTRACTION_DURATION;
      return;
    }
    
    // ============================================================
    // BALL DIRECTION CHANGE DETECTION
    // ============================================================
    
    // Detect ball direction change
    if (Math.sign(ball.vx) !== Math.sign(this.aiState.lastBallVx) && ball.vx !== 0) {
      // Ball changed direction - set reaction delay
      let reactionDelay = this.getRandomReactionDelay();
      
      // Chance to react late
      if (Math.random() < this.AI_CONFIG.LATE_REACTION_CHANCE) {
        reactionDelay += this.AI_CONFIG.LATE_REACTION_EXTRA_DELAY;
      }
      
      this.aiState.reactionEndTime = now + reactionDelay;
      
      // Get new prediction error for this trajectory
      this.aiState.currentPredictionError = this.getRandomPredictionError();
      
      // Randomize speed for this movement
      this.aiState.currentSpeedFactor = this.getRandomSpeedFactor();
    }
    this.aiState.lastBallVx = ball.vx;
    
    // Don't react until reaction timer expires
    if (now < this.aiState.reactionEndTime) {
      return;
    }
    
    // ============================================================
    // CALCULATE TARGET POSITION
    // ============================================================
    
    let targetY;
    
    if (ball.vx > 0) {
      // Ball is coming towards AI (right side)
      targetY = this.predictBallY(ball, aiPlayer.x);
      
      // Add prediction error (human-like inaccuracy)
      targetY += this.aiState.currentPredictionError;
    } else {
      // Ball is moving away - return to center (with some variation)
      targetY = GAME_CONFIG.CANVAS_HEIGHT / 2 + (Math.random() - 0.5) * 50;
    }
    
    // Clamp target to valid range
    targetY = Math.max(
      aiPlayer.height / 2,
      Math.min(GAME_CONFIG.CANVAS_HEIGHT - aiPlayer.height / 2, targetY)
    );
    
    this.aiState.targetY = targetY;
    
    // ============================================================
    // DETERMINE MOVEMENT
    // ============================================================
    
    const paddleCenter = aiPlayer.y + aiPlayer.height / 2;
    const diff = targetY - paddleCenter;
    
    // Check if close enough to target
    if (Math.abs(diff) < this.AI_CONFIG.DEADZONE) {
      aiPlayer.input = null;
      return;
    }
    
    // Determine direction
    const correctDirection = diff < 0 ? 'UP' : 'DOWN';
    
    // Random chance to move wrong direction briefly
    if (Math.random() < this.AI_CONFIG.WRONG_DIRECTION_CHANCE) {
      this.aiState.isMovingWrongDirection = true;
      this.aiState.wrongDirectionEndTime = now + this.AI_CONFIG.WRONG_DIRECTION_DURATION;
      this.aiState.wrongDirection = correctDirection === 'UP' ? 'DOWN' : 'UP';
      aiPlayer.input = this.aiState.wrongDirection;
      return;
    }
    
    // Random chance to overcommit when close to target
    if (Math.abs(diff) < 40 && Math.random() < this.AI_CONFIG.OVERCOMMIT_CHANCE) {
      this.aiState.isOvercommitting = true;
      this.aiState.overcommitEndTime = now + this.AI_CONFIG.OVERCOMMIT_DURATION;
      this.aiState.overcommitDirection = correctDirection;
      aiPlayer.input = correctDirection;
      return;
    }
    
    // Normal movement
    aiPlayer.input = correctDirection;
  }
  
  /**
   * Predict where the ball will be when it reaches a certain X position
   * Uses simple linear prediction with wall bounces
   * 
   * @param {Object} ball - Ball state
   * @param {number} targetX - X position to predict for
   * @returns {number} - Predicted Y position
   */
  static predictBallY(ball, targetX) {
    if (ball.vx === 0) return ball.y;
    
    // Time to reach target X
    const timeToReach = (targetX - ball.x) / ball.vx;
    
    if (timeToReach < 0) {
      // Ball is moving away
      return GAME_CONFIG.CANVAS_HEIGHT / 2;
    }
    
    // Predict Y with bouncing
    let predictedY = ball.y + ball.vy * timeToReach;
    
    // Simulate bounces off top/bottom walls
    const minY = ball.radius;
    const maxY = GAME_CONFIG.CANVAS_HEIGHT - ball.radius;
    
    // Simple bounce simulation
    let bounces = 0;
    while ((predictedY < minY || predictedY > maxY) && bounces < 10) {
      if (predictedY < minY) {
        predictedY = minY + (minY - predictedY);
      }
      if (predictedY > maxY) {
        predictedY = maxY - (predictedY - maxY);
      }
      bounces++;
    }
    
    return predictedY;
  }
}
