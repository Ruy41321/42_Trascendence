<template>
	<div class="app-container">
	  <header class="game-header">
		<h1>PONG 4-PLAYER</h1>
    <p class="subtitle">Multiplayer Real-time Game</p>
    <div class="auth-meta">
      <button v-if="showLobby && !isAuthenticated" class="logout-button" type="button" @click="handleToggleAuthView">{{ authViewOpen ? 'Back to Lobby' : 'Login / Signup' }}</button>
      <span v-if="isAuthenticated && authUser" class="auth-user">Signed in as {{ authUser.username }}</span>
      <button v-if="isAuthenticated" class="logout-button" type="button" @click="handleLogout">Logout</button>
    </div>
	  </header>
  
    <main :class="['game-area', { 'is-auth-view': authViewOpen }]">

    <AuthScreen
      v-if="showLobby && authViewOpen"
      :loading="authLoading"
      :backendError="authError"
      :showBackButton="true"
      :resetKey="authViewResetKey"
      @login="handleLogin"
      @signup="handleSignup"
      @back="handleCloseAuth" />

    <LobbyScreen v-else-if="showLobby"
		  :lobbyState="lobbyState" :isInLobby="inLobby" :isSpectator="isSpectator"
		  :myName="myName" :gameStatus="gameState?.status" :errorMessage="lobbyError"
      :canManualJoin="false"
		  :requiresLoginToPlay="true"
		  :authUsername="authUser?.username"
		  @join-lobby="handleJoinLobby" @spectate="handleSpectate"
		  @start-game="handleStartGame" @start-vs-ai="handleStartVsAI" @clear-error="handleClearError"
      @require-login="handleRequireLogin" @leave-spectator="handleLeaveSpectator" @leave-lobby="handleLeaveLobby"/>
  
		<template v-else>

		  <GameStats
      :connected="connected"
      :myPlayer="myPlayer"
      :gameState="gameState"
      :isSpectator="isSpectator"
			@restart="handleRestart" @vote-abandon="handleVoteAbandon" @back-to-lobby="handleBackToLobby"/>
  
		  <GameCanvas
      :gameState="gameState"
      :myPlayerId="myPlayer?.id"
      :isSpectator="isSpectator"
      :playerSide="myPlayer?.side"
      @touchInput="handleTouchInput"/>
  
		  <GameInfoPanel 
			:myPlayer="myPlayer" 
			:gameState="gameState" />

		</template>
	  </main>
  
	<footer class="game-footer">
	  <div class="footer-content">
	    <p>Made By Luigi, Tobia, Abdalla and Alessio</p>
	    <div class="footer-links">
	      <button class="link-btn" @click="activeModal = 'about'; console.log('Active Modal is now:', activeModal)">About Us</button>
		  
	      <span class="separator">|</span>
	      <button class="link-btn" @click="activeModal = 'tos'">Terms of Service</button>
	      <span class="separator">|</span>
	      <button class="link-btn" @click="activeModal = 'privacy'">Privacy Policy</button>
	    </div>
	    <GameBadge :variant="connected ? 'success' : 'danger'">
	      {{ connected ? 'Connected' : 'Disconnected' }}
	    </GameBadge>
	  </div>
	</footer>

	<ModalDialog :is-open="!!activeModal" :title="activeModal ? modalContent[activeModal].title : ''" @close="activeModal = null">
	  <div class="legal-content" v-if="activeModal">
	    <div v-html="modalContent[activeModal].body"></div>
	  </div>
	  <template #footer>
	    <button class="logout-button" @click="activeModal = null" style="width: 100%">
	      Close
	    </button>
	  </template>
	</ModalDialog>

	</div>
  </template>
  
  <script setup>
  import { computed, watch, ref, onMounted } from 'vue';
  
  // Components
  import GameCanvas from './components/GameCanvas.vue';
  import GameStats from './components/GameStats.vue';
  import LobbyScreen from './components/LobbyScreen.vue';
  import GameInfoPanel from './components/GameInfoPanel.vue';
  import GameBadge from './components/GameBadge.vue';
  import AuthScreen from './components/AuthScreen.vue';
  //TODO:
  import ModalDialog from './components/ModalDialog.vue';
  
  // Composables
  import { useWebSocket } from './composables/useWebSocket.js';
  import { useKeyboard } from './composables/useKeyboard.js';
  import { useAuth } from './composables/useAuth.js';
  
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
  leaveLobby,
  leaveSpectator,
  } = useWebSocket();

  const {
  user: authUser,
  loading: authLoading,
  error: authServiceError,
  isAuthenticated,
  token,
  signup,
  login,
  fetchMe,
  logout,
  } = useAuth();
  
  const lobbyError = ref(null);
  const authError = ref(null);
  const authViewOpen = ref(false);
  const authViewResetKey = ref(0);
  
  // Error Handling
  watch(lastEvent, (event) => {
	if (event?.type === 'error' && event.data?.code === 'NAME_TAKEN') {
	  lobbyError.value = event.data.message;
	}
  if (event?.type === 'error' && (event.data?.code === 'AUTH_REQUIRED' || event.data?.code === 'INVALID_TOKEN')) {
    authError.value = event.data.message;
    authViewResetKey.value += 1;
    authViewOpen.value = true;
  }
  });

  watch(authServiceError, (value) => {
  authError.value = value;
  });
  
  // Input handling
  useKeyboard(computed(() => myPlayer.value?.side), (input) => sendInput(input));
  const handleTouchInput = (input) => sendInput(input);
  
  // CORE LOGIC: Determines if we show the Lobby or the Game
  const showLobby = computed(() => {
	// Show lobby if the user hasn't identified themselves yet
	if (!myPlayer.value && !isSpectator.value && !inLobby.value) return true;

	const status = gameState.value?.status;
  const activeGameStatuses = new Set(['countdown', 'playing', 'paused', 'finished']);

  // Show game only when backend explicitly reports an active match status.
  if (activeGameStatuses.has(status)) return false;

  // If we are still in lobby flow, keep lobby visible even if player is already assigned.
  if (inLobby.value && !isSpectator.value) return true;

  // While waiting first state sync, keep user on lobby instead of showing canvas "Connecting...".
  if (!status) return true;
	
	// Show lobby if the server says we're in lobby mode
	if (status === 'lobby' || status === 'waiting') return true;
	
	return false;
  });

  async function bootstrapAuth() {
  if (!isAuthenticated.value) return;

  try {
    await fetchMe();
  } catch {
    // fetchMe already resets local auth session on 401/invalid token
  }

  }

  onMounted(() => {
  bootstrapAuth();
  });
  
  // Event Handlers
  const handleSignup = async (payload) => {
  authError.value = null;
  try {
    await signup(payload);
    await login({ email: payload.email, password: payload.password });
    await fetchMe();
    authViewOpen.value = false;
  } catch (error) {
    authError.value = error.message;
  }
  };

  const handleLogin = async (payload) => {
  authError.value = null;
  try {
    await login(payload);
    await fetchMe();
    authViewOpen.value = false;
  } catch (error) {
    authError.value = error.message;
  }
  };

  const handleLogout = () => {
  if (isSpectator.value) {
    leaveSpectator();
  } else {
    leaveLobby();
  }
  logout();
  authError.value = null;
  lobbyError.value = null;
  authViewOpen.value = false;
  };

  const handleRequireLogin = () => {
  authError.value = null;
  authViewResetKey.value += 1;
  authViewOpen.value = true;
  };

  const handleOpenAuth = () => {
  authError.value = null;
  authViewResetKey.value += 1;
  authViewOpen.value = true;
  };

  const handleCloseAuth = () => {
  authViewOpen.value = false;
  authError.value = null;
  };

  const handleToggleAuthView = () => {
  if (authViewOpen.value) {
    handleCloseAuth();
    return;
  }
  handleOpenAuth();
  };

  const handleJoinLobby = (name) => {
  lobbyError.value = null;
  if (!isAuthenticated.value || !authUser.value) {
    handleRequireLogin();
    return;
  }
  joinLobby(name, token.value);
  };
  const handleLeaveLobby = () => { lobbyError.value = null; leaveLobby(); };
  const handleLeaveSpectator = () => { leaveSpectator(); };
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


//TODO: FIXING THE ISSUE

// 2. State for the modals
const activeModal = ref(null); // 'tos', 'privacy', or 'about'

// 3. Relevant Content (To avoid rejection for "placeholder" content)
const modalContent = {
  about: {
    title: "About Pong 4-Player",
    body: `
      <p>This project is a high-performance, real-time multiplayer Pong game developed as part of our web development curriculum.</p>
      <p><strong>The Team:</strong> Luigi (Backend), Tobia (Frontend), Abdalla (DevOps), and Alessio (UI/UX).</p>
      <p>Built with Vue 3, WebSockets, and a custom physics engine to ensure 60FPS gameplay across multiple clients.</p>
    `
  },
  tos: {
    title: "Terms of Service",
    body: `
      <p>By using Pong 4-Player, you agree to the following:</p>
      <ul>
        <li><strong>Fair Play:</strong> Cheating, botting, or exploiting bugs to gain an unfair advantage is prohibited.</li>
        <li><strong>Accountability:</strong> Users are responsible for the security of their accounts and any activity performed under their username.</li>
        <li><strong>Service Availability:</strong> We provide this game "as-is" and do not guarantee 100% uptime during this evaluation phase.</li>
      </ul>
    `
  },
  privacy: {
    title: "Privacy Policy",
    body: `
      <p>We value your privacy. Here is how we handle your data:</p>
      <ul>
        <li><strong>Data Collection:</strong> We collect only your username and encrypted password for authentication purposes.</li>
        <li><strong>Game Stats:</strong> Winning/losing history is stored to provide leaderboard functionality.</li>
        <li><strong>Cookies:</strong> We use local storage (JWT tokens) strictly to keep you logged in. We do not use tracking or third-party advertising cookies.</li>
      </ul>
    `
  }
};
  </script>
  
  <style scoped>
  .app-container
  {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	align-items: center;
	gap: 20px;
	padding: var(--spacing-lg);
  }
  .game-area
  {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: flex-start; /* Aligns all three boxes to the top */
  flex-direction: row;     /* Explicitly define it as a row (Desktop) */
}

.game-area.is-auth-view {
  align-items: center;
  flex-direction: column;
}

.auth-meta {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.auth-user {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.85);
}

.auth-meta .auth-user:empty {
  display: none;
}

.logout-button {
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(0, 0, 0, 0.25);
  color: var(--text-main);
  padding: 6px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
}

.logout-button:hover {
  border-color: var(--outline-canvas);
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
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
    font-size: var(--text-2xl);
  }
  
  .subtitle {
    display: none;
  }

  /* 2. FLIP THE LAYOUT: Row -> Column */
  .game-area {
    flex-direction: column; 
    align-items: stretch; /* Make items stretch to full width on mobile */
  }

  .auth-meta {
    flex-direction: column;
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

/*TODO: FOOTER*/
.game-footer {
  margin-top: auto; /* Pushes footer to bottom */
  padding: 30px 20px;
  width: 100%;
  border-top: 1px solid var(--bg-dark-elem);
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.footer-links {
  display: flex;
  gap: 15px;
  align-items: center;
  font-size: 0.9rem;
}

.link-btn {
  background: none;
  border: none;
  color: var(--outline-canvas);
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  font-family: inherit;
  transition: color 0.2s;
}

.link-btn:hover {
  color: var(--text-main);
}

.separator {
  color: var(--bg-dark-elem-active, rgba(255, 255, 255, 0.3));
}

/* Legal text styling inside the modal */
.legal-content {
  text-align: left;
  line-height: 1.6;
  color: #e0e0e0;
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}

.legal-content p {
  margin-bottom: 15px;
}

.legal-content ul {
  margin-bottom: 15px;
  padding-left: 20px;
}

/* Ensure footer stays at the bottom on mobile */
@media (max-width: 768px) {
  .footer-links {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  .separator {
    display: none;
  }
}
  </style>
