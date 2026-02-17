/**
 * LOBBY SCREEN COMPONENT
 * 
 * Displays the game lobby where players can:
 * - Enter their name and join
 * - Start a game when 2-4 players are ready
 * - Choose to spectate instead of playing
 */

<template>
  <div class="lobby-container">
    <div class="lobby-card">
      <h2>Game Lobby</h2>
      
      <!-- Join Form (if not in lobby yet) -->
      <div v-if="!isInLobby && !isSpectator" class="join-section">
        <div class="input-group">
          <label for="playerName">Enter your name:</label>
          <input
            id="playerName"
            v-model="playerName"
            type="text"
            placeholder="Your name"
            maxlength="20"
            @keyup.enter="handleJoinLobby"
            autofocus
            :class="{ 'input-error': errorMessage }"
          />
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>
        
        <div class="button-group">
          <button
            class="btn btn-primary"
            :disabled="!playerName.trim()"
            @click="handleJoinLobby"
          >
            🎮 Join Game
          </button>
          
          <button
            class="btn btn-secondary"
            @click="handleSpectate"
          >
            👁️ Spectate
          </button>
        </div>
      </div>
      
      <!-- Lobby Status (when in lobby) -->
      <div v-else class="lobby-status">
        <div v-if="isSpectator" class="spectator-badge">
          👁️ Watching as Spectator
        </div>
        <div v-else class="player-badge">
          ✓ Ready as <strong>{{ myName }}</strong>
        </div>
      </div>
      
      <!-- Players List -->
      <div class="players-section">
        <h3>Players Ready ({{ lobbyState.players.length }}/4)</h3>
        <div class="players-grid">
          <div
            v-for="(player, index) in lobbyState.players"
            :key="index"
            :class="['player-slot', { 'is-me': player.name === myName }]"
          >
            <span class="player-number">P{{ index + 1 }}</span>
            <span class="player-name">{{ player.name }}</span>
            <span v-if="player.name === myName" class="you-badge">(YOU)</span>
          </div>
          
          <!-- Empty slots -->
          <div
            v-for="i in (4 - lobbyState.players.length)"
            :key="'empty-' + i"
            class="player-slot empty"
          >
            <span class="player-number">P{{ lobbyState.players.length + i }}</span>
            <span class="waiting">Waiting...</span>
          </div>
        </div>
      </div>
      
      <!-- Spectators List -->
      <div v-if="lobbyState.spectators.length > 0" class="spectators-section">
        <h4>👁️ Spectators ({{ lobbyState.spectators.length }})</h4>
        <div class="spectators-list">
          <span
            v-for="(spec, index) in lobbyState.spectators"
            :key="index"
            class="spectator-tag"
          >
            {{ spec.name }}
          </span>
        </div>
      </div>
      
      <!-- Start Game Button -->
      <div v-if="isInLobby && !isSpectator" class="start-section">
        <!-- Play vs AI button (only shown when exactly 1 player) -->
        <button
          v-if="lobbyState.players.length === 1"
          class="btn btn-ai"
          @click="handleStartVsAI"
        >
          🤖 Play vs AI
        </button>
        
        <!-- Normal Start Game button (shown when 2+ players) -->
        <button
          v-else
          class="btn btn-start"
          :disabled="!lobbyState.canStart"
          @click="handleStartGame"
        >
          🚀 Start Game
        </button>
        
        <p v-if="lobbyState.players.length === 1" class="hint">
          Play against AI or wait for more players
        </p>
        <p v-else-if="!lobbyState.canStart" class="hint">
          Need at least 2 players to start
        </p>
      </div>
      
      <!-- Game Status Info -->
      <div v-if="gameStatus && gameStatus !== 'lobby'" class="game-status">
        <p>Game in progress: <strong>{{ gameStatus }}</strong></p>
        <p v-if="isSpectator">You're watching the current game</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

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
});

const emit = defineEmits(['join-lobby', 'spectate', 'start-game', 'start-vs-ai', 'clear-error']);

const playerName = ref('');

function handleJoinLobby() {
  if (playerName.value.trim()) {
    emit('clear-error');  // Clear any previous error
    emit('join-lobby', playerName.value.trim());
  }
}

function handleSpectate() {
  emit('spectate');
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
  padding: 20px;
}

/*
.lobby-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
*/


.lobby-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px;

  /* NEW: Fluid width */
  width: 95%;
  max-width: 500px;

  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  margin: 0 auto; /* Centers the card if flex parent allows */
}

.lobby-card h2 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 28px;
  color: #00d4ff;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
}

.join-section {
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.input-group input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  transition: border-color 0.3s;
}

.input-group input:focus {
  outline: none;
  border-color: #00d4ff;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
}

.input-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.input-group input.input-error {
  border-color: #ff4444;
  box-shadow: 0 0 15px rgba(255, 68, 68, 0.3);
}

.error-message {
  color: #ff4444;
  font-size: 14px;
  margin-top: 8px;
  text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
}

.button-group {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.btn-start {
  width: 100%;
  padding: 16px;
  font-size: 18px;
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: white;
}

.btn-start:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 255, 136, 0.4);
}

.btn-ai {
  width: 100%;
  padding: 16px;
  font-size: 18px;
  background: linear-gradient(135deg, #a855f7, #7c3aed);
  color: white;
}

.btn-ai:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
}

.lobby-status {
  text-align: center;
  margin-bottom: 24px;
}

.player-badge, .spectator-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.player-badge {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
  border: 1px solid #00ff88;
}

.spectator-badge {
  background: rgba(255, 190, 11, 0.2);
  color: #ffbe0b;
  border: 1px solid #ffbe0b;
}

.players-section {
  margin-bottom: 24px;
}

.players-section h3 {
  margin-bottom: 12px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.player-slot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.player-slot.is-me {
  background: rgba(0, 212, 255, 0.1);
  border-color: #00d4ff;
}

.player-slot.empty {
  opacity: 0.5;
}

.player-number {
  font-weight: bold;
  color: #00d4ff;
}

.player-name {
  flex: 1;
  font-weight: 600;
}

.you-badge {
  font-size: 12px;
  color: #00ff88;
}

.waiting {
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
}

.spectators-section {
  margin-bottom: 24px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.spectators-section h4 {
  margin-bottom: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.spectators-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.spectator-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  background: rgba(255, 190, 11, 0.2);
  color: #ffbe0b;
}

.start-section {
  text-align: center;
}

.hint {
  margin-top: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.game-status {
  margin-top: 16px;
  padding: 12px;
  text-align: center;
  background: rgba(255, 0, 110, 0.1);
  border-radius: 8px;
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
    padding: 20px; /* Reduce internal padding (was 32px) */
  }

  .lobby-card h2 {
    font-size: 24px; /* Slightly smaller title */
    margin-bottom: 16px;
  }

  /* Make buttons easier to tap */
  .btn {
    padding: 14px 16px; /* Taller touch target */
    font-size: 15px;
  }

  /* Stack the player slots vertically if the screen is VERY small */
  /* OR keep them 2-column but with smaller text. Let's try 2-column first. */
  .player-slot {
    padding: 8px;
    font-size: 14px;
  }

  /* Stack the join buttons if needed (optional) */
  .button-group {
    flex-direction: column; /* Stack 'Join' and 'Spectate' vertically on mobile */
  }
}
</style>
