/**
 * ROOT APP COMPONENT
 * 
 * Root component that orchestrates everything:
 * - WebSocket connection
 * - Lobby system
 * - Keyboard input
 * - Canvas rendering
 * - UI stats
 * 
 * COMPOSITION API:
 * - setup() → executes before mount
 * - composables → reusable logic
 * - template → UI rendering
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
      <!-- Lobby Screen (when in lobby status or not joined) -->
      <template v-if="showLobby">
        <LobbyScreen
          :lobbyState="lobbyState"
          :isInLobby="inLobby"
          :isSpectator="isSpectator"
          :myName="myName"
          :gameStatus="gameState?.status"
          :errorMessage="lobbyError"
          @join-lobby="handleJoinLobby"
          @spectate="handleSpectate"
          @start-game="handleStartGame"
          @start-vs-ai="handleStartVsAI"
          @clear-error="handleClearError"
        />
      </template>
      
      <!-- Game View (when playing, countdown, paused, or finished) -->
      <template v-else>
        <!-- Stats Panel (left) -->
        <GameStats
          :connected="connected"
          :myPlayer="myPlayer"
          :gameState="gameState"
          :isSpectator="isSpectator"
          @restart="handleRestart"
          @vote-abandon="handleVoteAbandon"
          @back-to-lobby="handleBackToLobby"
        />
        
        <!-- Canvas (center) -->
        <GameCanvas
          :gameState="gameState"
          :myPlayerId="myPlayer?.id"
          :isSpectator="isSpectator"
          :playerSide="myPlayer?.side"
          @touchInput="handleTouchInput"
        />
        
        <!-- Info Panel (right) -->
        <div class="info-panel">
          <h3>How to Play</h3>
          <ul>
            <li>🎯 Each player controls a paddle</li>
            <li>⚽ Bounce the ball to your opponents</li>
            <li>🏆 Score points when opponents miss</li>
            <li>🎖️ First to 10 points wins!</li>
          </ul>
          
          <h3 style="margin-top: 20px;">⌨️ Controls</h3>
          <div class="controls-info">
            <div v-if="myPlayer" class="my-controls">
              <p v-if="myPlayer.side === 'left' || myPlayer.side === 'right'">
                <strong>↑↓</strong> or <strong>W/S</strong> to move
              </p>
              <p v-else>
                <strong>←→</strong> or <strong>A/D</strong> to move
              </p>
              <p class="touch-hint">📱 Touch: Drag on canvas to move</p>
            </div>
            <div v-else class="all-controls">
              <p><strong>Left/Right paddles:</strong> ↑↓ or W/S</p>
              <p><strong>Top/Bottom paddles:</strong> ←→ or A/D</p>
              <p class="touch-hint">📱 Mobile: Drag on canvas to move</p>
            </div>
          </div>
          
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
                {{ player.name || `Player ${player.id + 1}` }}
                <span v-if="player.id === myPlayer?.id">(YOU)</span>
              </span>
              <span class="player-status">
                {{ player.connected ? '✓' : '○' }}
              </span>
            </div>
          </div>
          
          <!-- Spectators -->
          <div v-if="gameState?.spectators?.length > 0" class="spectators-info">
            <h4>👁️ Spectators: {{ gameState.spectators.length }}</h4>
          </div>
        </div>
      </template>
    </div>
    
    <!-- Footer -->
    <footer class="game-footer">
      <p>
        Made with Vue.js + Socket.IO | 
        <span v-if="connected" class="status-connected">● Connected</span>
        <span v-else class="status-disconnected">○ Disconnected</span>
      </p>
    </footer>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue';
import GameCanvas from './components/GameCanvas.vue';
import GameStats from './components/GameStats.vue';
import LobbyScreen from './components/LobbyScreen.vue';
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
  isSpectator,
  inLobby,
  lobbyState,
  myName,
  lastEvent,
  joinLobby,
  spectate,
  startGame,
  sendInput,
  voteAbandon,
  restartGame,
} = useWebSocket();

// Error message for lobby
const lobbyError = ref(null);

// Watch for error events
watch(lastEvent, (event) => {
  if (event?.type === 'error' && event.data?.code === 'NAME_TAKEN') {
    lobbyError.value = event.data.message;
  }
});

// Computed: player side ref for keyboard/touch
const playerSide = computed(() => myPlayer.value?.side);

// Keyboard input (watches playerSide for changes)
useKeyboard(playerSide, (input) => {
  sendInput(input);
});

// Handle touch input from canvas
function handleTouchInput(input) {
  sendInput(input);
}

// ============================================================
// COMPUTED
// ============================================================

// Show lobby when: no game in progress, or in lobby status, or not joined yet
const showLobby = computed(() => {
  const status = gameState.value?.status;
  
  // Always show lobby if game is in lobby status
  if (status === 'lobby') return true;
  
  // Show lobby if we haven't joined as player or spectator
  if (!myPlayer.value && !isSpectator.value && !inLobby.value) return true;
  
  // Show game view otherwise
  return false;
});

// ============================================================
// METHODS
// ============================================================

function handleJoinLobby(name) {
  lobbyError.value = null;  // Clear error
  joinLobby(name);
}

function handleSpectate() {
  lobbyError.value = null;
  spectate();
}

function handleStartGame() {
  startGame(false);
}

function handleStartVsAI() {
  startGame(true);
}

function handleRestart() {
  restartGame();
}

function handleVoteAbandon() {
  voteAbandon();
}

function handleBackToLobby() {
  // Refresh page to reset state (simple approach)
  window.location.reload();
}

function handleClearError() {
  lobbyError.value = null;
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

.info-panel h4 {
  margin: 16px 0 8px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
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

.spectators-info {
  margin-top: 16px;
  padding: 8px;
  background: rgba(255, 190, 11, 0.1);
  border-radius: 8px;
  text-align: center;
}

.controls-info {
  padding: 12px;
  background: rgba(0, 212, 255, 0.1);
  border-radius: 8px;
  margin-top: 8px;
}

.controls-info p {
  margin: 6px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.controls-info strong {
  color: #00d4ff;
}

.touch-hint {
  margin-top: 10px !important;
  padding: 6px 10px;
  background: rgba(138, 43, 226, 0.2);
  border-radius: 6px;
  font-size: 13px !important;
  color: #bb86fc !important;
}

/* Show touch hint only on touch devices */
@media (hover: hover) and (pointer: fine) {
  .touch-hint {
    display: none;
  }
}

.game-footer {
  text-align: center;
  padding: 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.status-connected {
  color: #00ff88;
}

.status-disconnected {
  color: #ff006e;
}

/* Responsive */
@media (max-width: 1400px) {
  .game-area {
    flex-direction: column;
    align-items: center;
  }
}
</style>
