/**
 * GAME CANVAS COMPONENT
 * 
 * Componente principale che gestisce:
 * - Canvas HTML5 2D rendering
 * - Game loop client-side (60fps)
 * - Rendering paddle, ball, score
 * - Visual effects
 * 
 * RESPONSABILITÀ:
 * - Riceve gameState dal parent (via props)
 * - Renderizza SOLO (non calcola physics)
 * - Smooth rendering con requestAnimationFrame
 * 
 * CANVAS API BASICS:
 * - getContext('2d') → ottiene context per disegnare
 * - fillRect() → disegna rettangolo pieno
 * - arc() → disegna cerchio
 * - fillText() → disegna testo
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
    />
    
    <!-- Overlay per status non-playing -->
    <div v-if="overlayText" class="overlay">
      <h2>{{ overlayText }}</h2>
      <div v-if="showCountdown" class="countdown">{{ countdown }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { GAME_CONFIG, PADDLE_COLORS } from '../config/gameConfig.js';

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
});

// ============================================================
// STATE
// ============================================================

const canvasRef = ref(null);
const ctx = ref(null);
const canvasWidth = GAME_CONFIG.CANVAS_WIDTH;
const canvasHeight = GAME_CONFIG.CANVAS_HEIGHT;
const isFocused = ref(true);
const countdown = ref(3);

// ============================================================
// COMPUTED
// ============================================================

/**
 * Testo overlay basandosi su game status
 */
const overlayText = computed(() => {
  if (!props.gameState) return 'Connessione...';
  
  switch (props.gameState.status) {
    case 'waiting':
      return 'In attesa di giocatori...';
    case 'countdown':
      return 'Preparati!';
    case 'paused':
      return 'PAUSA - Giocatore disconnesso';
    case 'finished':
      return `GAME OVER - Vincitore: Player ${props.gameState.winner}`;
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
 * Main render loop
 * Chiamato 60 volte al secondo da requestAnimationFrame
 */
function render() {
  if (!ctx.value || !props.gameState) {
    animationFrameId = requestAnimationFrame(render);
    return;
  }
  
  // 1. Clear canvas
  ctx.value.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
  ctx.value.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // 2. Draw field lines (estetico)
  drawFieldLines();
  
  // 3. Draw paddles
  drawPaddles(props.gameState.players);
  
  // 4. Draw ball
  drawBall(props.gameState.ball);
  
  // 5. Draw scores
  drawScores(props.gameState.players);
  
  // 6. Draw player indicators
  drawPlayerIndicators(props.gameState.players);
  
  // Next frame
  animationFrameId = requestAnimationFrame(render);
}

/**
 * Disegna linee campo (centro + divisori)
 */
function drawFieldLines() {
  ctx.value.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.value.lineWidth = 2;
  ctx.value.setLineDash([10, 10]); // Linea tratteggiata
  
  // Linea verticale centro
  ctx.value.beginPath();
  ctx.value.moveTo(canvasWidth / 2, 0);
  ctx.value.lineTo(canvasWidth / 2, canvasHeight);
  ctx.value.stroke();
  
  // Linea orizzontale centro
  ctx.value.beginPath();
  ctx.value.moveTo(0, canvasHeight / 2);
  ctx.value.lineTo(canvasWidth, canvasHeight / 2);
  ctx.value.stroke();
  
  ctx.value.setLineDash([]); // Reset dash
}

/**
 * Disegna tutti i paddle
 */
function drawPaddles(players) {
  players.forEach((player) => {
    if (!player.connected) return; // Skip disconnessi
    
    // Colore basandosi su side
    ctx.value.fillStyle = PADDLE_COLORS[player.side];
    
    // Glow effect per il nostro player
    if (player.id === props.myPlayerId) {
      ctx.value.shadowBlur = 20;
      ctx.value.shadowColor = PADDLE_COLORS[player.side];
    }
    
    // Draw paddle
    ctx.value.fillRect(player.x, player.y, player.width, player.height);
    
    // Reset shadow
    ctx.value.shadowBlur = 0;
  });
}

/**
 * Disegna palla
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
 * Disegna scores di ogni player
 */
function drawScores(players) {
  ctx.value.fillStyle = GAME_CONFIG.COLORS.SCORE;
  ctx.value.font = 'bold 24px monospace';
  ctx.value.textAlign = 'center';
  
  players.forEach((player) => {
    let x, y;
    
    // Posiziona score vicino al bordo del player
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
    
    // Colore score = colore paddle
    ctx.value.fillStyle = PADDLE_COLORS[player.side];
    
    // Highlight se è il nostro player
    if (player.id === props.myPlayerId) {
      ctx.value.font = 'bold 28px monospace';
    }
    
    ctx.value.fillText(`P${player.id + 1}: ${player.score}`, x, y);
    
    // Reset font
    ctx.value.font = 'bold 24px monospace';
  });
}

/**
 * Disegna indicatori player (YOU, CONNECTED, etc)
 */
function drawPlayerIndicators(players) {
  ctx.value.font = '14px monospace';
  ctx.value.textAlign = 'center';
  
  players.forEach((player) => {
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
    
    // Se è il nostro player
    if (player.id === props.myPlayerId) {
      ctx.value.fillStyle = '#00ff00';
      ctx.value.fillText('YOU', x, y);
    }
    // Se non connesso
    else if (!player.connected) {
      ctx.value.fillStyle = '#ff0000';
      ctx.value.fillText('WAITING', x, y);
    }
  });
}

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(() => {
  // Ottieni canvas context
  const canvas = canvasRef.value;
  if (!canvas) {
    console.error('Canvas ref non trovato');
    return;
  }
  
  ctx.value = canvas.getContext('2d');
  
  // Focus canvas per keyboard input
  canvas.focus();
  
  // Avvia render loop
  render();
  
  console.log('✅ Canvas mounted e render loop avviato');
});

onUnmounted(() => {
  // Stop render loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  console.log('🛑 Canvas unmounted, render loop fermato');
});

// Watch countdown per animazione
watch(() => props.gameState?.status, (newStatus) => {
  if (newStatus === 'countdown') {
    countdown.value = 3;
    
    const interval = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }
});
</script>

<style scoped>
.game-canvas-container {
  position: relative;
  display: inline-block;
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
  border-radius: 8px;
  pointer-events: none;
}

.overlay h2 {
  font-size: 36px;
  margin-bottom: 20px;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.8);
}

.countdown {
  font-size: 72px;
  font-weight: bold;
  color: #00d4ff;
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
