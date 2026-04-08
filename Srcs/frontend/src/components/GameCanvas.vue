/**
 * GAME CANVAS COMPONENT
 * 
 * Main component that handles:
 * - HTML5 Canvas 2D rendering
 * - Client-side game loop (60fps)
 * - Paddle, ball, score rendering
 * - Visual effects
 * 
 * RESPONSIBILITIES:
 * - Receives gameState from parent (via props)
 * - ONLY renders (doesn't calculate physics)
 * - Smooth rendering with requestAnimationFrame
 * 
 * CANVAS API BASICS:
 * - getContext('2d') → get context for drawing
 * - fillRect() → draw filled rectangle
 * - arc() → draw circle
 * - fillText() → draw text
 */

<template>
  <div class="game-canvas-container">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      tabindex="0"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @touchcancel="handleTouchEnd"
    />
    
	<!--REFACTORING: USING THE COMPONENTS -->
	<div v-if="overlayText" class="overlay">
      <LoadingSpinner v-if="['lobby', 'waiting'].includes(gameState?.status) || !gameState"  size="lg" style="margin-bottom: var(--spacing-lg);" />
      <h2>{{ overlayText }}</h2>
      <div v-if="showCountdown" class="countdown">{{ countdown }}</div>
      <GameBadge v-if="isSpectator" variant="warning" style="margin-top: var(--spacing-lg);"> You are spectating</GameBadge>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { GAME_CONFIG, PADDLE_COLORS } from '../config/gameConfig.js';

import GameBadge from './GameBadge.vue';
import LoadingSpinner from './LoadingSpinner.vue';

// ============================================================
// PROPS
// ============================================================

const props = defineProps({
  gameState: {
    type: Object,
    default: null,
  },
  myPlayerId: {
    type: Number,
    default: null,
  },
  isSpectator: {
    type: Boolean,
    default: false,
  },
  playerSide: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['touchInput']);

// ============================================================
// STATE
// ============================================================

const canvasRef = ref(null);
const ctx = ref(null);
const canvasWidth = GAME_CONFIG.CANVAS_WIDTH;
const canvasHeight = GAME_CONFIG.CANVAS_HEIGHT;
const isFocused = ref(true);
const countdown = ref(3);
let countdownInterval = null; // Store interval to clear it properly

// Touch input state
let touchStartY = null;
let touchStartX = null;
let lastTouchDirection = null;
const TOUCH_THRESHOLD = 10; // Minimum pixels to trigger movement

// Ball interpolation state for smooth rendering
let interpolatedBall = { x: 0, y: 0, vx: 0, vy: 0, radius: 8 };
let lastBallUpdate = Date.now();
let lastRenderTime = Date.now();

// ============================================================
// COMPUTED
// ============================================================

/**
 * Overlay text based on game status
 */
const overlayText = computed(() => {
  if (!props.gameState) return 'Connecting...';
  
  switch (props.gameState.status) {
    case 'lobby':
      return 'Waiting in Lobby...';
    case 'waiting':
      return 'Waiting for players...';
    case 'countdown':
      return 'Get Ready!';
    case 'paused':
      const disconnPlayer = props.gameState?.players.find(p => !p.connected && p.name && p.name !== 'Anonymous');
      if (disconnPlayer) {
        return `PAUSED - ${disconnPlayer.name} disconnected`;
      }
      return 'PAUSED - Player disconnected';
    case 'finished':
      // Check if the current player is the winner
      if (props.gameState.winner === props.myPlayerId) {
        return 'You Won!';
      }
      const winner = props.gameState.players?.find(p => p.id === props.gameState.winner);
      return `GAME OVER - Winner: ${winner?.name || `Player ${props.gameState.winner + 1}`}`;
    default:
      return null;
  }
});

const showCountdown = computed(() => {
  return props.gameState?.status === 'countdown';
});

// ============================================================
// GAME LOOP & RENDERING
// ============================================================

let animationFrameId = null;

/**
 * Update interpolated ball position based on velocity
 * This smooths out movement between server updates
 */
function updateInterpolatedBall() {
  const now = Date.now();
  const dt = (now - lastRenderTime) / 1000;
  lastRenderTime = now;
  
  // Cap dt to prevent huge jumps (max 50ms = 20fps minimum)
  const cappedDt = Math.min(dt, 0.05);
  
  // Move ball based on velocity
  interpolatedBall.x += interpolatedBall.vx * cappedDt;
  interpolatedBall.y += interpolatedBall.vy * cappedDt;
  
  // Keep ball within bounds (basic clamp to avoid visual glitches)
  const r = interpolatedBall.radius;
  interpolatedBall.x = Math.max(r, Math.min(canvasWidth - r, interpolatedBall.x));
  interpolatedBall.y = Math.max(r, Math.min(canvasHeight - r, interpolatedBall.y));
}

/**
 * Sync interpolated ball with server state
 * Called when new gameState is received
 */
function syncBallWithServer(serverBall) {
  if (!serverBall) return;
  
  // Backend sends normalized coordinates (0-1) and per-tick velocities.
  // Convert to pixel coordinates and per-second velocities for rendering.
  const TICK_RATE = 60;
  
  // Update velocity: normalized per-tick → pixel per-second
  interpolatedBall.vx = (serverBall.vx || 0) * canvasWidth * TICK_RATE;
  interpolatedBall.vy = (serverBall.vy || 0) * canvasHeight * TICK_RATE;
  interpolatedBall.radius = (serverBall.radius || 0.013) * canvasWidth;
  
  // Convert normalized position to pixels
  const serverX = (serverBall.x || 0) * canvasWidth;
  const serverY = (serverBall.y || 0) * canvasHeight;
  
  // Snap to server position if difference is too large (>30px = missed collision/reset)
  const dx = serverX - interpolatedBall.x;
  const dy = serverY - interpolatedBall.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > 30) {
    // Teleport to server position (ball was reset or collision missed)
    interpolatedBall.x = serverX;
    interpolatedBall.y = serverY;
  } else {
    // Smoothly blend toward server position (90% server, 10% interpolated)
    interpolatedBall.x = interpolatedBall.x * 0.1 + serverX * 0.9;
    interpolatedBall.y = interpolatedBall.y * 0.1 + serverY * 0.9;
  }
  
  lastBallUpdate = Date.now();
}

/**
 * Main render loop
 * Called 60 times per second by requestAnimationFrame
 */
function render() {
  if (!ctx.value || !props.gameState) {
    animationFrameId = requestAnimationFrame(render);
    return;
  }
  
  // Update interpolated ball position for smooth rendering
  if (props.gameState.status === 'playing') {
    updateInterpolatedBall();
  }
  
  // Sync with server ball state (velocity and position correction)
  syncBallWithServer(props.gameState.ball);
  
  // 1. Clear canvas
  ctx.value.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
  ctx.value.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // 2. Draw field lines (aesthetic)
  drawFieldLines();
  
  // 3. Draw paddles
  drawPaddles(props.gameState.players);
  
  // 4. Draw ball (use interpolated position for smooth rendering)
  drawBall(interpolatedBall);
  
  // 5. Draw scores
  drawScores(props.gameState.players);
  
  // 6. Draw player indicators
  drawPlayerIndicators(props.gameState.players);
  
  // Next frame
  animationFrameId = requestAnimationFrame(render);
}

/**
 * Draw field lines (center + dividers)
 */
function drawFieldLines() {
  ctx.value.strokeStyle = 'var(--bg-dark-elem)';
  ctx.value.lineWidth = 2;
  ctx.value.setLineDash([10, 10]);
  
  // Center vertical line
  ctx.value.beginPath();
  ctx.value.moveTo(canvasWidth / 2, 0);
  ctx.value.lineTo(canvasWidth / 2, canvasHeight);
  ctx.value.stroke();
  
  // Center horizontal line
  ctx.value.beginPath();
  ctx.value.moveTo(0, canvasHeight / 2);
  ctx.value.lineTo(canvasWidth, canvasHeight / 2);
  ctx.value.stroke();
  
  ctx.value.setLineDash([]);
}

/**
 * Draw all paddles
 */
function drawPaddles(players) {
  players.forEach((player) => {
    if (!player.connected) return;
    
    // Color based on side
    ctx.value.fillStyle = PADDLE_COLORS[player.side];
    
    // Glow effect for our player (or all if spectating)
    if (player.id === props.myPlayerId || props.isSpectator) {
      ctx.value.shadowBlur = 15;
      ctx.value.shadowColor = PADDLE_COLORS[player.side];
    }
    
    // Draw paddle — convert normalized coordinates (0-1) to pixels
    ctx.value.fillRect(
      player.x * canvasWidth,
      player.y * canvasHeight,
      player.width * canvasWidth,
      player.height * canvasHeight
    );
    
    // Reset shadow
    ctx.value.shadowBlur = 0;
  });
}

/**
 * Draw ball
 */
function drawBall(ball) {
  if (!ball) return;
  
  // Glow effect
  ctx.value.shadowBlur = 15;
  ctx.value.shadowColor = GAME_CONFIG.COLORS.BALL;
  
  ctx.value.fillStyle = GAME_CONFIG.COLORS.BALL;
  ctx.value.beginPath();
  ctx.value.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.value.fill();
  
  // Reset shadow
  ctx.value.shadowBlur = 0;
}

/**
 * Draw scores for each player
 */
function drawScores(players) {
  ctx.value.fillStyle = GAME_CONFIG.COLORS.SCORE;
  ctx.value.font = 'bold 24px monospace';
  ctx.value.textAlign = 'center';
  
  players.forEach((player) => {
    if (!player.connected) return;
    
    let x, y;
    
    // Position score near player's edge
    switch (player.side) {
      case 'left':
        x = 60;
        y = canvasHeight / 2;
        break;
      case 'top':
        x = canvasWidth / 2;
        y = 40;
        break;
      case 'right':
        x = canvasWidth - 60;
        y = canvasHeight / 2;
        break;
      case 'bottom':
        x = canvasWidth / 2;
        y = canvasHeight - 20;
        break;
    }
    
    // Score color = paddle color
    ctx.value.fillStyle = PADDLE_COLORS[player.side];
    
    // Highlight if it's our player
    if (player.id === props.myPlayerId) {
      ctx.value.font = 'bold 28px monospace';
    }
    
    // Use player name if available
    const displayName = player.name ? player.name.substring(0, 8) : `P${player.id + 1}`;
    ctx.value.fillText(`${displayName}: ${player.score}`, x, y);
    
    // Reset font
    ctx.value.font = 'bold 24px monospace';
  });
}

/**
 * Draw player indicators (YOU, CONNECTED, etc)
 */
function drawPlayerIndicators(players) {
  ctx.value.font = '14px monospace';
  ctx.value.textAlign = 'center';
  
  players.forEach((player) => {
    // Skip players that were never assigned to the game (empty slots in 2-3 player games)
    // Only show indicators for players that have a name (were actually part of the game)
    if (!player.name && !player.connected) return;
    
    let x, y;
    
    switch (player.side) {
      case 'left':
        x = 60;
        y = canvasHeight / 2 + 30;
        break;
      case 'top':
        x = canvasWidth / 2;
        y = 70;
        break;
      case 'right':
        x = canvasWidth - 60;
        y = canvasHeight / 2 + 30;
        break;
      case 'bottom':
        x = canvasWidth / 2;
        y = canvasHeight - 50;
        break;
    }
    
    // If it's our player
    if (player.id === props.myPlayerId && !props.isSpectator) {
      ctx.value.fillStyle = '#00ff00';
      ctx.value.fillText('YOU', x, y);
    }
    // If player was part of the game but disconnected (has a name but not connected)
    else if (!player.connected && player.name && player.name !== 'Anonymous') {
      ctx.value.fillStyle = '#ff0000';
      ctx.value.fillText('DISCONNECTED', x, y);
    }
  });
}

// ============================================================
// TOUCH INPUT HANDLERS
// ============================================================

/**
 * Get paddle orientation based on side
 */
function getPaddleOrientation(side) {
  if (side === 'left' || side === 'right') return 'vertical';
  if (side === 'top' || side === 'bottom') return 'horizontal';
  return null;
}

/**
 * Handle touch start - record initial position
 */
function handleTouchStart(event) {
  // Always prevent scroll when touching the canvas
  event.preventDefault();
  
  if (!props.playerSide || props.isSpectator) return;
  
  const touch = event.touches[0];
  touchStartY = touch.clientY;
  touchStartX = touch.clientX;
  lastTouchDirection = null;
  
  // Focus the canvas when touched
  canvasRef.value?.focus();
}

/**
 * Handle touch move - calculate direction and emit input
 */
function handleTouchMove(event) {
  // Always prevent scroll when dragging on the canvas
  event.preventDefault();
  
  if (!props.playerSide || props.isSpectator) return;
  if (touchStartY === null || touchStartX === null) return;
  
  const touch = event.touches[0];
  const orientation = getPaddleOrientation(props.playerSide);
  
  let direction = null;
  
  if (orientation === 'vertical') {
    // Vertical paddle: use Y axis movement
    const deltaY = touch.clientY - touchStartY;
    
    if (Math.abs(deltaY) > TOUCH_THRESHOLD) {
      direction = deltaY > 0 ? 'DOWN' : 'UP';
      touchStartY = touch.clientY;
    }
  } else if (orientation === 'horizontal') {
    // Horizontal paddle: use X axis movement
    const deltaX = touch.clientX - touchStartX;
    
    if (Math.abs(deltaX) > TOUCH_THRESHOLD) {
      direction = deltaX > 0 ? 'DOWN' : 'UP';
      touchStartX = touch.clientX;
    }
  }
  
  if (direction) {
    if (direction !== lastTouchDirection) {
      lastTouchDirection = direction;
    }
    emit('touchInput', direction);
  }
}

/**
 * Handle touch end - stop paddle movement
 */
function handleTouchEnd(event) {
  if (!props.playerSide || props.isSpectator) return;
  
  touchStartY = null;
  touchStartX = null;
  lastTouchDirection = null;
  
  emit('touchInput', null);
}

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(() => {
  // Get canvas context
  const canvas = canvasRef.value;
  if (!canvas) {
    console.error('Canvas ref not found');
    return;
  }
  
  ctx.value = canvas.getContext('2d');
  
  // Focus canvas for keyboard input (if playing)
  if (!props.isSpectator) {
    canvas.focus();
  }
  
  // Start render loop
  render();
  
  console.log('✅ Canvas mounted and render loop started');
});

onUnmounted(() => {
  // Stop render loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  // Clear countdown interval if running
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  
  console.log('🛑 Canvas unmounted, render loop stopped');
});

// Watch countdown for animation - use immediate to catch initial state
watch(() => props.gameState?.status, (newStatus, oldStatus) => {
  // Clear any existing countdown interval
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  
  if (newStatus === 'countdown') {
    countdown.value = 3;
    
    countdownInterval = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
    }, 1000);
  }
}, { immediate: true });
</script>

<style scoped>
.game-canvas-container {
  position: relative;
  display: inline-block;
}

canvas {
  border-radius: var(--radius-md);
  box-shadow: 0 8px 32px var(--shadow-dark, var(--shadow-dark, rgba(0, 0, 0, 0.5)));
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  pointer-events: none;
}

.overlay h2 {
  font-size: 36px;
  margin-bottom: var(--spacing-lg);
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.8);
}

.countdown {
  font-size: 72px;
  font-weight: var(--font-weight-bold);
  color: var(--outline-canvas);
  text-shadow: 0 0 40px rgba(0, 212, 255, 1);
  animation: pulse 1s infinite;
}



@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
</style>
