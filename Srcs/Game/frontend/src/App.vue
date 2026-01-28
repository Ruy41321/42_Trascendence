/**
 * ROOT APP COMPONENT
 * 
 * Componente radice che orchestra tutto:
 * - WebSocket connection
 * - Keyboard input
 * - Rendering canvas
 * - UI stats
 * 
 * COMPOSITION API:
 * - setup() → esegue prima del mount
 * - composables → logica riutilizzabile
 * - template → rendering UI
 */

<template>
  <div class="app-container">
    <!-- Header -->
    <header class="game-header">
      <h1>🎮 PONG 4-PLAYER</h1>
      <p class="subtitle">Multiplayer Real-time Game</p>
    </header>
    
    <!-- Main Game Area -->
    <div class="game-area">
      <!-- Stats Panel (sinistra) -->
      <GameStats
        :connected="connected"
        :myPlayer="myPlayer"
        :gameState="gameState"
        @restart="handleRestart"
      />
      
      <!-- Canvas (centro) -->
      <GameCanvas
        :gameState="gameState"
        :myPlayerId="myPlayer?.id"
      />
      
      <!-- Info Panel (destra) -->
      <div class="info-panel">
        <h3>Come Giocare</h3>
        <ul>
          <li>🎯 Ogni player controlla un paddle</li>
          <li>⚽ Rimbalza la palla nel campo avversario</li>
          <li>❌ Perdi punti se la palla esce dal tuo lato</li>
          <li>🏆 Primo a 10 punti vince!</li>
        </ul>
        
        <h3 style="margin-top: 20px;">Players</h3>
        <div v-if="gameState" class="players-list">
          <div 
            v-for="player in gameState.players" 
            :key="player.id"
            :class="['player-item', { 
              'connected': player.connected,
              'me': player.id === myPlayer?.id 
            }]"
          >
            <span class="player-indicator" :style="{ 
              background: getPaddleColor(player.side) 
            }"></span>
            <span class="player-name">
              Player {{ player.id + 1 }}
              <span v-if="player.id === myPlayer?.id">(TU)</span>
            </span>
            <span class="player-status">
              {{ player.connected ? '✓' : '○' }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <footer class="game-footer">
      <p>
        Fatto con Vue.js + Socket.IO | 
        <a href="https://github.com" target="_blank">GitHub</a>
      </p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import GameCanvas from './components/GameCanvas.vue';
import GameStats from './components/GameStats.vue';
import { useWebSocket } from './composables/useWebSocket.js';
import { useKeyboard } from './composables/useKeyboard.js';
import { PADDLE_COLORS } from './config/gameConfig.js';

// ============================================================
// COMPOSABLES
// ============================================================

// WebSocket connection
const {
  connected,
  myPlayer,
  gameState,
  joinGame,
  sendInput,
  restartGame,
} = useWebSocket();

// Keyboard input (setup dopo che abbiamo myPlayer)
watch(() => myPlayer.value?.side, (side) => {
  if (side) {
    useKeyboard(side, (input) => {
      sendInput(input);
    });
  }
});

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(() => {
  console.log('🎮 App mounted, joining game...');
  joinGame();
});

// ============================================================
// METHODS
// ============================================================

function handleRestart() {
  restartGame();
}

function getPaddleColor(side) {
  return PADDLE_COLORS[side];
}
</script>

<style scoped>
.app-container {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.game-header {
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.game-header h1 {
  font-size: 48px;
  margin: 0;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.8);
  background: linear-gradient(135deg, #00d4ff, #ff006e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8px;
}

.game-area {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
}

.info-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  min-width: 300px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.info-panel h3 {
  margin: 0 0 12px 0;
  color: #00d4ff;
  font-size: 18px;
}

.info-panel ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-panel li {
  padding: 8px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-panel li:last-child {
  border-bottom: none;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  opacity: 0.5;
  transition: opacity 0.3s;
}

.player-item.connected {
  opacity: 1;
}

.player-item.me {
  background: rgba(0, 212, 255, 0.2);
  border: 2px solid #00d4ff;
}

.player-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 10px currentColor;
}

.player-name {
  flex: 1;
  font-weight: 600;
}

.player-status {
  font-size: 18px;
}

.game-footer {
  text-align: center;
  padding: 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.game-footer a {
  color: #00d4ff;
  text-decoration: none;
}

.game-footer a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 1400px) {
  .game-area {
    flex-direction: column;
    align-items: center;
  }
}
</style>
