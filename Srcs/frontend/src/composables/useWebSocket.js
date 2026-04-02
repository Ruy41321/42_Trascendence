/**
 * WEBSOCKET COMPOSABLE
 * 
 * Vue Composable for managing native WebSocket connection.
 * 
 * PROTOCOL:
 * All messages are JSON: { type: "<type>", payload: { ... } }
 * 
 * Client → Server:
 *   { type: "joinLobby",    payload: { playerName, token } }
 *   { type: "spectate",     payload: { name } }
 *   { type: "startGame",    payload: { vsAI } }
 *   { type: "move",         payload: { direction, inputId } }
 *   { type: "voteAbandon",  payload: {} }
 *   { type: "restartGame",  payload: {} }
 *   { type: "backToLobby",  payload: {} }
 *   { type: "leaveSpectator", payload: {} }
 *   { type: "leaveLobby",   payload: {} }
 * 
 * Server → Client:
 *   { type: "lobbyJoined",       payload: { name } }
 *   { type: "lobbyUpdate",       payload: { players[], spectators[], canStart } }
 *   { type: "playerAssigned",    payload: { playerId, side, name, roomId, gameStatus } }
 *   { type: "spectatorAssigned", payload: { name } }
 *   { type: "gameState",         payload: { ball, players[], ... } }
 *   { type: "gameEvent",         payload: { type, data } }
 *   { type: "error",             payload: { message, code } }
 * 
 * LIFECYCLE:
 * 1. setup() → create WebSocket connection
 * 2. Attach message handler (JSON parse + type switch)
 * 3. Auto-reconnect with exponential backoff
 * 4. onUnmounted() → cleanup and close
 */

import { ref, watch, onUnmounted } from 'vue';
import { GAME_CONFIG } from '../config/gameConfig.js';

export function useWebSocket() {
  // ============================================================
  // STATE
  // ============================================================

  const connected = ref(false);
  const myPlayer = ref(null);
  const gameState = ref(null);
  const lastEvent = ref(null);
  const isSpectator = ref(false);
  const inLobby = ref(false);
  const lobbyState = ref({
    players: [],
    spectators: [],
    canStart: false,
  });
  const myName = ref(null);

  // Input tracking
  let inputId = 0;
  let lastGameStatus = null;

  // Reconnection state
  let ws = null;
  let reconnectAttempts = 0;
  let reconnectTimer = null;
  let intentionalClose = false;
  let joinToken = null;
  const MAX_RECONNECT_ATTEMPTS = 5;
  const BASE_RECONNECT_DELAY = 1000;

  // ============================================================
  // WEBSOCKET CONNECTION
  // ============================================================

  /**
   * Create and connect WebSocket
   */
  function connect() {
    if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
      return;
    }

    const url = GAME_CONFIG.SOCKET_URL;
    console.log('🔌 Connecting to WebSocket:', url);
    ws = new WebSocket(url);

    ws.addEventListener('open', () => {
      console.log('✅ WebSocket connected');
      connected.value = true;
      reconnectAttempts = 0;

      // Re-join on reconnect if we had a name
      if (myName.value) {
        send('joinLobby', { playerName: myName.value, token: joinToken });
      }
    });

    ws.addEventListener('close', (event) => {
      console.log('❌ WebSocket closed:', event.code, event.reason);
      connected.value = false;

      if (!intentionalClose) {
        scheduleReconnect();
      }
    });

    ws.addEventListener('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    ws.addEventListener('message', (event) => {
      handleMessage(event.data);
    });
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  function scheduleReconnect() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log('❌ Max reconnect attempts reached');
      return;
    }

    const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts);
    reconnectAttempts++;
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);

    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      connect();
    }, delay);
  }

  // ============================================================
  // MESSAGE HANDLING
  // ============================================================

  /**
   * Parse and route incoming messages by type
   */
  function handleMessage(raw) {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (e) {
      console.error('❌ Failed to parse message:', raw);
      return;
    }

    const { type, payload } = msg;

    switch (type) {
      case 'lobbyJoined':
        console.log('🎮 Joined lobby:', payload);
        inLobby.value = true;
        isSpectator.value = false;
        myName.value = payload.name;
        break;

      case 'lobbyUpdate':
        console.log('📋 Lobby update:', payload);
        lobbyState.value = {
          players: payload.players || [],
          spectators: payload.spectators || [],
          canStart: payload.canStart || false,
        };
        break;

      case 'playerAssigned':
        console.log('🎮 Player assigned:', payload);
        myPlayer.value = {
          id: payload.playerId,
          side: payload.side,
          name: payload.name,
          roomId: payload.roomId,
        };
        isSpectator.value = false;
        break;

      case 'spectatorAssigned':
        console.log('👁️ Spectator assigned:', payload);
        isSpectator.value = true;
        inLobby.value = false;
        myPlayer.value = null;
        myName.value = payload.name;
        break;

      case 'gameState':
        // Reset inputId when game status transitions to 'playing'
        if (payload.status !== lastGameStatus) {
          if (payload.status === 'playing') {
            inputId = 0;
          }
          lastGameStatus = payload.status;
        }
        gameState.value = payload;
        break;

      case 'gameEvent':
        // Filter game events if the user has not yet joined as a player, spectator, or entered the lobby
        if (!myPlayer.value && !isSpectator.value && !inLobby.value) {
          break;
        }

        console.log('🎯 Game Event:', payload);
        lastEvent.value = payload;

        if (payload.type === 'gameAbandoned' || payload.type === 'gameReset') {
          myPlayer.value = null;
          inLobby.value = false;
          isSpectator.value = false;
        }
        if (payload.type === 'gameStart') {
          inLobby.value = false;  // Transition out of lobby when game begins
          console.log(`🎮 Game started with ${payload.data.playerCount} players`);
        }
        if (payload.type === 'gameOver') {
          console.log(`🏆 Winner: Player ${payload.data.winner}`);
        }
        break;

      case 'error':
        console.error('❌ Server error:', payload);
        lastEvent.value = { type: 'error', data: payload };
        break;

      default:
        console.warn('⚠️ Unknown message type:', type, payload);
    }
  }

  // ============================================================
  // SEND HELPERS
  // ============================================================

  /**
   * Send a JSON message to the server
   */
  function send(type, payload = {}) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket not connected, cannot send:', type);
      return;
    }
    ws.send(JSON.stringify({ type, payload }));
  }

  // ============================================================
  // PUBLIC METHODS
  // ============================================================

  function joinLobby(playerName, token = null) {
    console.log('🎮 Joining lobby as:', playerName);
    myName.value = playerName;
    joinToken = token;
    send('joinLobby', { playerName, token });
  }

  function spectate(name = null) {
    console.log('👁️ Joining as spectator');
    send('spectate', { name });
  }

  function startGame(vsAI = false) {
    console.log(`🎮 Requesting game start${vsAI ? ' vs AI' : ''}`);
    send('startGame', { vsAI });
  }

  /**
   * Send player input (move) to server
   * @param {string|null} direction - 'UP' | 'DOWN' | null (stop)
   */
  function sendInput(direction) {
    send('move', { direction, inputId: inputId++ });
  }

  function voteAbandon() {
    console.log('🗳️ Voting to abandon');
    send('voteAbandon', {});
  }

  function restartGame() {
    send('restartGame', {});
  }

  function backToLobby() {
    send('backToLobby', {});
  }

  function leaveSpectator() {
    send('leaveSpectator', {});
    isSpectator.value = false;
    inLobby.value = false;
    myPlayer.value = null;
  }

  function leaveLobby() {
    send('leaveLobby', {});
    myPlayer.value = null;
    inLobby.value = false;
    isSpectator.value = false;
    myName.value = null;
    joinToken = null;
  }

  // ============================================================
  // LIFECYCLE
  // ============================================================

  // Connect immediately
  connect();

  onUnmounted(() => {
    intentionalClose = true;
    clearTimeout(reconnectTimer);
    if (ws) {
      console.log('🔌 Closing WebSocket...');
      ws.close();
      ws = null;
    }
  });

  // Return public API
  return {
    // State
    connected,
    myPlayer,
    gameState,
    lastEvent,
    isSpectator,
    inLobby,
    lobbyState,
    myName,

    // Methods
    joinLobby,
    spectate,
    startGame,
    sendInput,
    voteAbandon,
    restartGame,
    backToLobby,
    leaveSpectator,
    leaveLobby,
  };
}
