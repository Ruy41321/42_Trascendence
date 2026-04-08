<template>
  <div class="lobby-container">
	<!-- REFACTORING CODE -->
	<BaseCard>
      <template #header>
        <h2 class="lobby-title">Lobby</h2>
      </template>
      <!-- Join Form now use COMPONENTS: BaseInput -->
        <div v-if="!isInLobby && !isSpectator" class="join-section">
          <p v-if="requiresLoginToPlay && !authUsername" class="hint full-lobby-hint">Login required to play. You can still spectate without logging in.</p>
          <p v-else-if="requiresLoginToPlay && authUsername" class="hint full-lobby-hint">You will join as <strong>{{ authUsername }}</strong>.</p>
   	    	<BaseInput
  			v-if="canManualJoin && canJoinGame"
  			v-model="playerName"
  			label="Enter your name:"
  			placeholder="Your name"
  			:error="errorMessage"
  			@keyup.enter="handleJoinLobby" />
          <p v-else-if="!canJoinGame" class="hint full-lobby-hint">Lobby full: 4/4 players already in game or waiting.</p>
          <p v-else class="hint full-lobby-hint">Joining lobby with your account username...</p>
          <div :class="['button-group', { 'is-full': !canJoinGame }]">
  	    	<BaseButton v-if="canJoinGame" variant="primary" :disabled="joinDisabled" @click="handleJoinLobby">{{ joinButtonLabel }}</BaseButton>
          <BaseButton variant="secondary" @click="handleSpectate">Spectate</BaseButton>
        </div>
      </div>
      <!-- Lobby Status now use COMPONENTS: GameBadge -->
      <div v-else class="lobby-status">
		<GameBadge v-if="isSpectator" variant="warning"> Watching as Spectator</GameBadge>
        <GameBadge v-else variant="success"> Ready as <strong>{{ myName }}</strong></GameBadge>
        <div v-if="isSpectator" class="spectator-actions">
          <BaseButton variant="secondary" @click="handleLeaveSpectator">Leave Spectate</BaseButton>
        </div>
        <div v-if="isInLobby && !isSpectator" class="player-actions">
          <BaseButton variant="secondary" @click="handleLeaveLobby">Leave Lobby</BaseButton>
        </div>
      </div>
      
	  <!-- List of player now use COMPONENTS: BaseList -->
	  <BaseList :title="`Players Ready (${lobbyState.players.length}/4)`" layout="grid">
        <div v-for="(player, index) in lobbyState.players" :key="index" :class="['player-slot', { 'is-me': player.name === myName }]">
          <span class="player-number">P{{ index + 1 }}</span>
          <span class="player-name">{{ player.name }}</span>
          <span v-if="player.name === myName" class="you-badge">(YOU)</span>
        </div>
        <div v-for="i in (4 - lobbyState.players.length)" :key="'empty-' + i" class="player-slot empty">
          <span class="player-number">P{{ lobbyState.players.length + i }}</span>
          <span class="waiting">Waiting...</span>
        </div>
      </BaseList>
      
	  <!-- List of spectators now use COMPONENTS: BaseList -->
      <BaseList v-if="lobbyState.spectators.length > 0" :title="`Spectators (${lobbyState.spectators.length})`" layout="flex" boxed>
        <span v-for="(spec, index) in lobbyState.spectators" :key="index" class="spectator-tag">
          {{ spec.name }}
        </span>
      </BaseList>
      
      <!-- Start Game Button -->
      <div v-if="isInLobby && !isSpectator" class="start-section">
		<!-- <BaseButton v-if="lobbyState.players.length === 1" variant="secondary" @click="handleStartVsAI">Play vs AI</BaseButton> -->
      <BaseButton variant="primary" :disabled="!lobbyState.canStart" @click="handleStartGame">Start Game</BaseButton>
        <p v-if="lobbyState.players.length === 1" class="hint"> Waiting for more players</p>
        <p v-else-if="!lobbyState.canStart" class="hint"> Need at least 2 players to start </p>
      </div>
      
      <!-- Game Status Info -->
      <div v-if="gameStatus && gameStatus !== 'lobby'" class="game-status">
        <p>Game in progress: <strong>{{ gameStatus }}</strong></p>
        <p v-if="isSpectator">You're watching the current game</p>
      </div>
	</BaseCard>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
// REFACTORING: implementing a components based architecture
import BaseCard from './BaseCard.vue';
import BaseInput from './BaseInput.vue';
import BaseButton from './BaseButton.vue';
import GameBadge from './GameBadge.vue';
import BaseList from './BaseList.vue';

const props = defineProps({
  lobbyState: {
    type: Object,
    default: () => ({ players: [], spectators: [], canStart: false }),
  },
  isInLobby: {
    type: Boolean,
    default: false,
  },
  isSpectator: {
    type: Boolean,
    default: false,
  },
  myName: {
    type: String,
    default: null,
  },
  gameStatus: {
    type: String,
    default: 'lobby',
  },
  errorMessage: {
    type: String,
    default: null,
  },
  canManualJoin: {
    type: Boolean,
    default: true,
  },
  requiresLoginToPlay: {
    type: Boolean,
    default: false,
  },
  authUsername: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['join-lobby', 'spectate', 'start-game', 'start-vs-ai', 'clear-error', 'require-login', 'leave-spectator', 'leave-lobby']);

const playerName = ref('');
const MAX_PLAYERS = 4;
const isLobbyFull = computed(() => props.lobbyState.players.length >= MAX_PLAYERS);
const canJoinGame = computed(() => !isLobbyFull.value && (props.gameStatus === 'lobby' || props.gameStatus === 'waiting' || props.gameStatus === 'paused'));
const joinDisabled = computed(() => {
  if (!canJoinGame.value) return true;

  if (props.requiresLoginToPlay && !props.authUsername) return false;
  if (props.canManualJoin) return !playerName.value.trim();
  return false;
});

const joinButtonLabel = computed(() => {
  if (props.requiresLoginToPlay && !props.authUsername) return 'Login to Play';
  return 'Join Game';
});

function handleJoinLobby() {
  if (!canJoinGame.value) return;

  if (props.requiresLoginToPlay && !props.authUsername) {
    emit('require-login');
    return;
  }

  if (props.requiresLoginToPlay && props.authUsername) {
    emit('clear-error');
    emit('join-lobby', props.authUsername);
    return;
  }

  if (playerName.value.trim()) {
    emit('clear-error');  // Clear any previous error
    emit('join-lobby', playerName.value.trim());
  }
}

function handleSpectate() {
  emit('spectate');
}

function handleLeaveSpectator() {
  emit('leave-spectator');
}

function handleLeaveLobby() {
  emit('leave-lobby');
}

function handleStartGame() {
  emit('start-game');
}

function handleStartVsAI() {
  emit('start-vs-ai');
}
</script>

<style scoped>
.lobby-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: var(--spacing-lg);
}

.join-section {
  margin-bottom: 24px;
}

.button-group {
  display: flex;
  gap: 12px;
}

.button-group.is-full {
  justify-content: center;
}

.lobby-status {
  text-align: center;
  margin-bottom: 24px;
}

.spectator-actions {
  margin-top: 12px;
}

.player-actions {
  margin-top: 12px;
}

.player-slot {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 12px;
  border-radius: var(--radius-md);
  background: rgba(black);
  border: 2px solid var(--bg-dark-elem);
}

.player-slot.is-me {
  background: rgba(0, 212, 255, 0.1);
  border-color: var(--outline-canvas);
}

.player-slot.empty {
  opacity: 0.5;
}

.player-number {
  font-weight: var(--font-weight-bold);
  color: var(--outline-canvas);
}

.player-name {
  flex: 1;
  font-weight: var(--font-weight-semibold);
}

.you-badge {
  font-size: var(--text-xs);
  color: #00ff88;
}

.waiting {
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
}

.spectator-tag {
  padding: 4px 10px;
  border-radius: var(--radius-lg, 12px);
  font-size: var(--text-xs);
  background: rgba(255, 190, 11, 0.2);
  color: #ffbe0b;
}

.start-section {
  text-align: center;
}

.hint {
  margin-top: 8px;
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.5);
}

.full-lobby-hint {
  text-align: left;
  margin-bottom: 12px;
}

.game-status {
  margin-top: 16px;
  padding: 12px;
  text-align: center;
  background: rgba(255, 0, 110, 0.1);
  border-radius: var(--radius-md);
  color: rgba(255, 255, 255, 0.8);
}

.game-status strong {
  color: #ff006e;
  text-transform: uppercase;
}

/* Mobile Optimization */
@media (max-width: 600px) {
  .lobby-container {
    padding: 10px; /* Less padding around the edge */
    min-height: auto; /* Allow height to fit content */
  }

  .lobby-card {
    padding: var(--spacing-lg); /* Reduce internal padding (was 32px) */
  }

  .lobby-card h2 {
    font-size: var(--text-2xl); /* Slightly smaller title */
    margin-bottom: var(--spacing-md);
  }

  /* .btn {
    padding: 14px 16px;
    font-size: 15px;
  } */

  /* Stack the player slots vertically if the screen is VERY small */
  /* OR keep them 2-column but with smaller text. Let's try 2-column first. */
  .player-slot {
    padding: var(--spacing-sm);
    font-size: var(--text-sm);
  }

  /* Stack the join buttons if needed (optional) */
  .button-group {
    flex-direction: column; /* Stack 'Join' and 'Spectate' vertically on mobile */
  }
}
</style>
