/**
 * GAME STATS COMPONENT
 * 
 * Mostra informazioni partita:
 * - Status connessione
 * - Player assegnato
 * - Comandi tastiera
 * - Players connessi
 */

<template>
  <div class="game-stats">
    <!-- Connection Status -->
    <div class="stat-item">
      <span class="label">Connessione:</span>
      <span :class="['status', connected ? 'connected' : 'disconnected']">
        {{ connected ? 'Connesso ✓' : 'Disconnesso ✗' }}
      </span>
    </div>
    
    <!-- Player Info -->
    <div v-if="myPlayer" class="stat-item">
      <span class="label">Sei:</span>
      <span class="value player-info">
        Player {{ myPlayer.id + 1 }} ({{ getSideLabel(myPlayer.side) }})
      </span>
    </div>
    
    <!-- Keyboard Controls -->
    <div v-if="myPlayer" class="stat-item controls">
      <span class="label">Comandi:</span>
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
        {{ connectedPlayersCount }}/4
      </span>
    </div>
    
    <!-- Restart Button -->
    <button 
      v-if="gameState?.status === 'finished'" 
      @click="$emit('restart')"
      class="restart-btn"
    >
      🔄 Rigioca
    </button>
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
});

defineEmits(['restart']);

// ============================================================
// COMPUTED
// ============================================================

const connectedPlayersCount = computed(() => {
  if (!props.gameState?.players) return 0;
  return props.gameState.players.filter(p => p.connected).length;
});

// ============================================================
// HELPERS
// ============================================================

function getSideLabel(side) {
  const labels = {
    left: 'Sinistra ←',
    top: 'Alto ↑',
    right: 'Destra →',
    bottom: 'Basso ↓',
  };
  return labels[side] || side;
}

function getStatusLabel(status) {
  const labels = {
    waiting: 'In attesa...',
    countdown: 'Countdown!',
    playing: 'In gioco',
    paused: 'Pausa',
    finished: 'Terminato',
  };
  return labels[status] || status;
}

function getKeyLabel(direction) {
  if (!props.myPlayer) return '';
  
  const keyMappings = {
    left: { UP: 'W', DOWN: 'S' },
    top: { UP: '↑', DOWN: '↓' },
    right: { UP: 'I', DOWN: 'K' },
    bottom: { UP: 'Num8', DOWN: 'Num5' },
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

.restart-btn {
  width: 100%;
  margin-top: 16px;
  font-size: 18px;
}
</style>
