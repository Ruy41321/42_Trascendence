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

    <div class="stat-item">
      <span class="label">Connection:</span>
      <span :class="['status', connected ? 'connected' : 'disconnected']">
        {{ connected ? 'Connected' : 'Disconnected' }}
      </span>
    </div>
    <div v-if="isSpectator" class="stat-item spectator-info">
      <span class="label">Mode:</span>
      <span class="value spectator-badge">Spectator</span>
    </div>
	<div v-else-if="myPlayer" class="stat-item">
      <span class="label">You are:</span>
      <div style="display: flex; align-items: center; gap: 10px;">
        <UserAvatar :name="myPlayer.name || `Player ${myPlayer.id + 1}`" size="sm" />
        <span class="value player-info">
          {{ myPlayer.name || `Player ${myPlayer.id + 1}` }} ({{ getSideLabel(myPlayer.side) }})
        </span>
      </div>
    </div>
    <div v-if="myPlayer && !isSpectator" class="stat-item controls">
      <span class="label">Controls:</span>
      <div class="keys">
        <kbd>{{ getKeyLabel('UP') }}</kbd>
        <span class="separator">/</span>
        <kbd>{{ getKeyLabel('DOWN') }}</kbd>
      </div>
    </div>
    <div v-if="gameState" class="stat-item">
      <span class="label">Status:</span>
      <span :class="['status', gameState.status]">
        {{ getStatusLabel(gameState.status) }}
      </span>
    </div>
    <div v-if="gameState" class="stat-item">
      <span class="label">Players:</span>
      <span class="value">
        {{ connectedPlayersCount }}/{{ gameState.activePlayerCount || 4 }}
      </span>
    </div>
    <div v-if="showAbandonVotes" class="stat-item abandon-votes">
      <span class="label">Abandon Votes:</span>
      <span class="value">
        {{ abandonVoteCount }}/{{ connectedPlayersCount }}
      </span>
    </div>

	<!-- REFACTORING: USING CUSTOM COMPONENTS -->
    <div class="button-group">
	  <div class="button-group">
      <BaseButton v-if="gameState?.status === 'finished'" variant="primary" @click="$emit('restart')"> Play Again
      </BaseButton>
      <BaseButton v-if="canVoteAbandon && !hasVoted" variant="danger" @click="isAbandonModalOpen = true"> Vote to Abandon
      </BaseButton>
      <div v-if="hasVoted" class="voted-badge">You voted to abandon</div>
      <BaseButton v-if="isSpectator || gameState?.status === 'finished'" variant="secondary" @click="$emit('back-to-lobby')"> Back to Lobby
      </BaseButton>
    </div> 
    <ModalDialog :isOpen="isAbandonModalOpen" title="Abandon Match?" @close="isAbandonModalOpen = false" @confirm="handleConfirmAbandon">
      <p>Are you sure you want to vote to abandon the game? If the majority agrees, the match will end immediately.</p>
    </ModalDialog>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { ref } from 'vue';
import UserAvatar from './UserAvatar.vue';
import ModalDialog from './ModalDialog.vue';
import BaseButton from './BaseButton.vue';

const isAbandonModalOpen = ref(false);
function handleConfirmAbandon()
{
  isAbandonModalOpen.value = false;
  emit('vote-abandon');
}

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

const emit = defineEmits(['restart', 'vote-abandon', 'back-to-lobby']);

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
  background: var(--bg-dark-elem);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg, 12px);
  padding: var(--spacing-lg);
  min-width: 300px;
  box-shadow: 0 8px 32px var(--shadow-md, var(--shadow-md, rgba(0, 0, 0, 0.3)));
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--bg-dark-elem);
}

.stat-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.label {
  font-weight: var(--font-weight-semibold);
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--text-sm);
}

.value {
  font-weight: var(--font-weight-bold);
  font-size: var(--text-md);
}

.player-info {
  color: var(--outline-canvas);
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
  gap: var(--spacing-sm);
  align-items: center;
  margin-top: 8px;
}

kbd {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 6px 12px;
  border-radius: 6px;
  font-family: monospace;
  font-weight: var(--font-weight-bold);
  box-shadow: 0 4px 10px var(--shadow-md, var(--shadow-md, rgba(0, 0, 0, 0.3)));
  font-size: var(--text-sm);
  min-width: 40px;
  text-align: center;
}

.separator {
  color: rgba(255, 255, 255, 0.5);
  font-weight: var(--font-weight-bold);
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: 16px;
}



.voted-badge {
  padding: var(--spacing-sm);
  text-align: center;
  color: #ff006e;
  font-size: var(--text-sm);
  border-radius: var(--radius-md);
  background: rgba(255, 0, 110, 0.1);
}

.abandon-votes {
  background: rgba(255, 0, 110, 0.1);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) 12px !important;
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
  color: var(--outline-canvas);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* =========================================
   MOBILE TRANSFORMATION: TALL CARD -> SLIM BAR
   ========================================= */
@media (max-width: 768px) {
  .game-stats {
    /* Reset the card style to be a slim bar */
    min-width: 0;
    width: 100%;
    padding: var(--spacing-sm) 12px;
    margin-bottom: 0;
    border-radius: var(--radius-md);
    background: rgba(0, 0, 0, 0.4); /* Darker background for contrast */

    /* Layout: Horizontal Row */
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  /* 1. Hide less important details to save space */
  .stat-item:nth-child(1), /* Connection Status */
  .stat-item.controls {    /* Keyboard Controls */
    display: none;
  }

  /* 2. Re-style the items to sit in a line, not a list */
  .stat-item {
    border-bottom: none;
    margin-bottom: 0;
    padding: 0;
    font-size: var(--text-xs);
  }

  /* 3. Compact the "You are" text */
  .label {
    display: none; /* Hide labels like "You are:" */
  }

  .value {
    font-size: var(--text-sm);
  }

  /* 4. Fix the Buttons (Make them small and inline) */
  .button-group {
    margin-top: 0;
    flex-direction: row;
    gap: 5px;
  }

  .btn {
    width: auto; /* Let button shrink to text size */
    padding: 6px 12px;
    font-size: var(--text-xs);
  }

  /* Special fix for the Abandon button to not be huge */
  .abandon-btn {
    white-space: nowrap;
  }

  /* 5. Highlight "Status" specifically */
  .status {
    font-size: var(--text-xs);
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    background: var(--bg-dark-elem);
  }
}
</style>
