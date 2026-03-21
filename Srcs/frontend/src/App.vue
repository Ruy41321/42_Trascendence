<template>
	<div class="app-container">
	  <header class="game-header">
		<h1>PONG 4-PLAYER</h1>
		<p class="subtitle">Multiplayer Real-time Game</p>
	  </header>
  
	  <main class="game-area">

		<LobbyScreen v-if="showLobby"
		  :lobbyState="lobbyState" :isInLobby="inLobby" :isSpectator="isSpectator"
		  :myName="myName" :gameStatus="gameState?.status" :errorMessage="lobbyError"
		  @join-lobby="handleJoinLobby" @spectate="handleSpectate"
		  @start-game="handleStartGame" @start-vs-ai="handleStartVsAI" @clear-error="handleClearError"/>
  
		<template v-else>

		  <GameStats
			:connected="connected" :myPlayer="myPlayer" :gameState="gameState":isSpectator="isSpectator"
			@restart="handleRestart" @vote-abandon="handleVoteAbandon" @back-to-lobby="handleBackToLobby"/>
  
		  <GameCanvas
			:gameState="gameState" :myPlayerId="myPlayer?.id":isSpectator="isSpectator"
			:playerSide="myPlayer?.side"@touchInput="handleTouchInput"/>
  
		  <GameInfoPanel 
			:myPlayer="myPlayer" 
			:gameState="gameState" />

		</template>
	  </main>
  
	  <footer class="game-footer">
		<p>Made By Luigi, Tobia, Abdalla and Alessio</p>
		<GameBadge :variant="connected ? 'success' : 'danger'">
		  {{ connected ? 'Connected' : 'Disconnected' }}
		</GameBadge>
	  </footer>
	</div>
  </template>
  
  <script setup>
  import { computed, watch, ref } from 'vue';
  
  // Components
  import GameCanvas from './components/GameCanvas.vue';
  import GameStats from './components/GameStats.vue';
  import LobbyScreen from './components/LobbyScreen.vue';
  import GameInfoPanel from './components/GameInfoPanel.vue';
  import GameBadge from './components/GameBadge.vue';
  
  // Composables
  import { useWebSocket } from './composables/useWebSocket.js';
  import { useKeyboard } from './composables/useKeyboard.js';
  
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
  backToLobby,
  leaveSpectator,
  } = useWebSocket();
  
  const lobbyError = ref(null);
  
  // Error Handling
  watch(lastEvent, (event) => {
	if (event?.type === 'error' && event.data?.code === 'NAME_TAKEN') {
	  lobbyError.value = event.data.message;
	}
  });
  
  // Input handling
  useKeyboard(computed(() => myPlayer.value?.side), (input) => sendInput(input));
  const handleTouchInput = (input) => sendInput(input);
  
  // CORE LOGIC: Determines if we show the Lobby or the Game
  const showLobby = computed(() => {
	const status = gameState.value?.status;
	
	// Show lobby if the server says we're in lobby mode
	if (status === 'lobby' || status === 'waiting') return true;
	
	// Show lobby if the user hasn't identified themselves yet
	if (!myPlayer.value && !isSpectator.value && !inLobby.value) return true;
	
	return false;
  });
  
  // Event Handlers
  const handleJoinLobby = (name) => { lobbyError.value = null; joinLobby(name); };
  const handleSpectate = () => { lobbyError.value = null; spectate(); };
  const handleStartGame = () => startGame(false);
  const handleStartVsAI = () => startGame(true);
  const handleRestart = () => restartGame();
  const handleVoteAbandon = () => voteAbandon();
  const handleBackToLobby = () => {
	if (isSpectator.value) {
	  leaveSpectator();
	  return;
	}
	backToLobby();
  };
  const handleClearError = () => { lobbyError.value = null; };
  </script>
  
  <style scoped>
  .app-container
  {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	align-items: center;
	gap: 20px;
	padding: 20px;
  }
  .game-area
  {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: flex-start; /* Aligns all three boxes to the top */
  flex-direction: row;     /* Explicitly define it as a row (Desktop) */
}
  .game-header, .game-footer
  {
	text-align: center;
  }


  /* ============================================================
   RESPONSIVE & MOBILE STYLES
   ============================================================ */

@media (max-width: 768px) {
  /* 1. Shrink gaps and header padding */
  .app-container {
    gap: 10px;
  }
  
  .game-header {
    padding: 10px;
  }
  
  .game-header h1 {
    font-size: 24px;
  }
  
  .subtitle {
    display: none;
  }

  /* 2. FLIP THE LAYOUT: Row -> Column */
  .game-area {
    flex-direction: column; 
    align-items: stretch; /* Make items stretch to full width on mobile */
  }

  /* 3. Force canvas to be responsive */
  /* will double check this part */
  :deep(canvas) {
    width: 100% !important;
    height: auto !important;
    max-width: 100% !important;
    aspect-ratio: 4/3;
  }
}
  </style>