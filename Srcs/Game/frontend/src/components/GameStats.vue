/**
 * GAME STATS COMPONENT
 * 
 * Shows game information:
 * - Connection status
 * - Assigned player
 * - Keyboard controls
 * - Connected players
 * - Abandon vote button
 */

<template>
  <div class="game-stats">
    <!-- Connection Status -->
    <div class="stat-item">
      <span class="label">Connection:</span>
      <span :class="['status', connected ? 'connected' : 'disconnected']">
        {{ connected ? 'Connected ✓' : 'Disconnected ✗' }}
      </span>
    </div>
    
    <!-- Spectator Info -->
    <div v-if="isSpectator" class="stat-item spectator-info">
      <span class="label">Mode:</span>
      <span class="value spectator-badge">👁️ Spectator</span>
    </div>
    
    <!-- Player Info -->
    <div v-else-if="myPlayer" class="stat-item">
      <span class="label">You are:</span>
      <span class="value player-info">
        {{ myPlayer.name || `Player ${myPlayer.id + 1}` }} ({{ getSideLabel(myPlayer.side) }})
      </span>
    </div>
    
    <!-- Keyboard Controls -->
    <div v-if="myPlayer && !isSpectator" class="stat-item controls">
      <span class="label">Controls:</span>
      <div class="keys">
        <kbd>{{ getKeyLabel('UP') }}</kbd>
        <span class="separator">/</span>
        <kbd>{{ getKeyLabel('DOWN') }}</kbd>
      </div>
    </div>
    
    <!-- Game Status -->
    <div v-if="gameState" class="stat-item">
      <span class="label">Status:</span>
      <span :class="['status', gameState.status]">
        {{ getStatusLabel(gameState.status) }}
      </span>
    </div>
    
    <!-- Connected Players Count -->
    <div v-if="gameState" class="stat-item">
      <span class="label">Players:</span>
      <span class="value">
        {{ connectedPlayersCount }}/{{ gameState.activePlayerCount || 4 }}
      </span>
    </div>
    
    <!-- Abandon Vote Progress -->
    <div v-if="showAbandonVotes" class="stat-item abandon-votes">
      <span class="label">Abandon Votes:</span>
      <span class="value">
        {{ abandonVoteCount }}/{{ connectedPlayersCount }}
      </span>
    </div>
    
    <!-- Buttons -->
    <div class="button-group">
      <!-- Restart Button (when finished) -->
      <button 
        v-if="gameState?.status === 'finished'" 
        @click="$emit('restart')"
        class="btn restart-btn"
      >
        🔄 Play Again
      </button>
      
      <!-- Vote Abandon Button (when playing/paused, not spectator) -->
      <button 
        v-if="canVoteAbandon && !hasVoted"
        @click="$emit('vote-abandon')"
        class="btn abandon-btn"
      >
        🚪 Vote to Abandon
      </button>
      
      <div v-if="hasVoted" class="voted-badge">
        ✓ You voted to abandon
      </div>
      
      <!-- Back to Lobby Button (spectators or after game ends) -->
      <button 
        v-if="isSpectator || gameState?.status === 'finished'"
        @click="$emit('back-to-lobby')"
        class="btn lobby-btn"
      >
        ← Back to Lobby
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { GAME_CONFIG } from '../config/gameConfig.js';

// ============================================================
// PROPS & EMITS
// ============================================================

const props = defineProps({
  connected: {
    type: Boolean,
    default: false,
  },
  myPlayer: {
    type: Object,
    default: null,
  },
  gameState: {
    type: Object,
    default: null,
  },
  isSpectator: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['restart', 'vote-abandon', 'back-to-lobby']);

// ============================================================
// COMPUTED
// ============================================================

const connectedPlayersCount = computed(() => {
  if (!props.gameState?.players) return 0;
  return props.gameState.players.filter(p => p.connected).length;
});

const abandonVoteCount = computed(() => {
  if (!props.gameState?.players) return 0;
  return props.gameState.players.filter(p => p.connected && p.votedToAbandon).length;
});

const showAbandonVotes = computed(() => {
  return abandonVoteCount.value > 0 && 
         (props.gameState?.status === 'playing' || props.gameState?.status === 'paused');
});

const canVoteAbandon = computed(() => {
  return !props.isSpectator && 
         props.myPlayer && 
         (props.gameState?.status === 'playing' || props.gameState?.status === 'paused');
});

const hasVoted = computed(() => {
  if (!props.myPlayer || !props.gameState?.players) return false;
  const me = props.gameState.players.find(p => p.id === props.myPlayer.id);
  return me?.votedToAbandon || false;
});

// ============================================================
// HELPERS
// ============================================================

function getSideLabel(side) {
  const labels = {
    left: 'Left ←',
    top: 'Top ↑',
    right: 'Right →',
    bottom: 'Bottom ↓',
  };
  return labels[side] || side;
}

function getStatusLabel(status) {
  const labels = {
    lobby: 'Lobby',
    waiting: 'Waiting...',
    countdown: 'Countdown!',
    playing: 'Playing',
    paused: 'Paused',
    finished: 'Finished',
  };
  return labels[status] || status;
}

function getKeyLabel(direction) {
  if (!props.myPlayer) return '';
  
  // Vertical paddles (left, right): ↑↓ or W/S
  // Horizontal paddles (top, bottom): ←→ or A/D
  const keyMappings = {
    left: { UP: '↑/W', DOWN: '↓/S' },
    right: { UP: '↑/W', DOWN: '↓/S' },
    top: { UP: '←/A', DOWN: '→/D' },
    bottom: { UP: '←/A', DOWN: '→/D' },
  };
  
  return keyMappings[props.myPlayer.side]?.[direction] || '';
}
</script>

<style scoped>
.game-stats {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  min-width: 300px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.value {
  font-weight: 700;
  font-size: 16px;
}

.player-info {
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.spectator-badge {
  color: #ffbe0b;
}

.controls {
  flex-direction: column;
  align-items: flex-start;
}

.keys {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
}

kbd {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 6px 12px;
  border-radius: 6px;
  font-family: monospace;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  min-width: 40px;
  text-align: center;
}

.separator {
  color: rgba(255, 255, 255, 0.5);
  font-weight: bold;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.btn {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.restart-btn {
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  color: white;
}

.restart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4);
}

.abandon-btn {
  background: rgba(255, 0, 110, 0.2);
  color: #ff006e;
  border: 2px solid #ff006e;
}

.abandon-btn:hover {
  background: rgba(255, 0, 110, 0.3);
}

.lobby-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.lobby-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.voted-badge {
  padding: 8px;
  text-align: center;
  color: #ff006e;
  font-size: 14px;
  border-radius: 8px;
  background: rgba(255, 0, 110, 0.1);
}

.abandon-votes {
  background: rgba(255, 0, 110, 0.1);
  border-radius: 8px;
  padding: 8px 12px !important;
}

.status.playing {
  color: #00ff88;
}

.status.paused {
  color: #ffbe0b;
}

.status.finished {
  color: #ff006e;
}

.status.countdown {
  color: #00d4ff;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
