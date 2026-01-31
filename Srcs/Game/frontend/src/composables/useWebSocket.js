/**
 * WEBSOCKET COMPOSABLE
 * 
 * Vue Composable for managing WebSocket connection with Socket.IO.
 * 
 * COMPOSABLE PATTERN:
 * - Reusable function that handles specific logic
 * - Returns refs/reactive and methods
 * - Can be used in any component
 * 
 * LIFECYCLE:
 * 1. setup() → create socket connection
 * 2. Attach event listeners
 * 3. onUnmounted() → cleanup and disconnect
 */

import { ref, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import { GAME_CONFIG } from '../config/gameConfig.js';

export function useWebSocket() {
  // Connection state
  const connected = ref(false);
  const myPlayer = ref(null);         // Player info when in game
  const gameState = ref(null);        // Game state from server
  const lastEvent = ref(null);        // Last event received
  const isSpectator = ref(false);     // Whether client is spectating
  const inLobby = ref(false);         // Whether client is in lobby
  const lobbyState = ref({            // Lobby state
    players: [],
    spectators: [],
    canStart: false,
  });
  const myName = ref(null);           // Client's name
  
  // Create Socket.IO connection
  const socket = io(GAME_CONFIG.SOCKET_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });
  
  // ============================================================
  // EVENT LISTENERS
  // ============================================================
  
  /**
   * Connection established
   */
  socket.on('connect', () => {
    console.log('✅ WebSocket connected:', socket.id);
    connected.value = true;
  });
  
  /**
   * Disconnection
   */
  socket.on('disconnect', (reason) => {
    console.log('❌ WebSocket disconnected:', reason);
    connected.value = false;
  });
  
  /**
   * Joined lobby successfully
   */
  socket.on('lobbyJoined', (data) => {
    console.log('🎮 Joined lobby:', data);
    inLobby.value = true;
    isSpectator.value = false;
    myName.value = data.name;
  });
  
  /**
   * Lobby state updated
   */
  socket.on('lobbyUpdate', (data) => {
    console.log('📋 Lobby update:', data);
    lobbyState.value = {
      players: data.players || [],
      spectators: data.spectators || [],
      canStart: data.canStart || false,
    };
  });
  
  /**
   * Server assigned player slot (game starting/reconnecting)
   */
  socket.on('playerAssigned', (data) => {
    console.log('🎮 Player assigned:', data);
    myPlayer.value = {
      id: data.playerId,
      side: data.side,
      name: data.name,
      roomId: data.roomId,
    };
    inLobby.value = false;
    isSpectator.value = false;
  });
  
  /**
   * Assigned as spectator
   */
  socket.on('spectatorAssigned', (data) => {
    console.log('👁️ Spectator assigned:', data);
    isSpectator.value = true;
    inLobby.value = false;
    myPlayer.value = null;
    myName.value = data.name;
  });
  
  /**
   * Receive game state from server (every tick = 60 times/sec)
   */
  socket.on('gameState', (state) => {
    gameState.value = state;
  });
  
  /**
   * Special events (score, collision, gameOver, etc)
   */
  socket.on('gameEvent', (event) => {
    console.log('🎯 Game Event:', event);
    lastEvent.value = event;
    
    // Handle specific events
    if (event.type === 'gameAbandoned' || event.type === 'gameReset') {
      // Game reset to lobby
      myPlayer.value = null;
      inLobby.value = false;
      isSpectator.value = false;
    }
    
    if (event.type === 'gameStart') {
      console.log(`🎮 Game started with ${event.data.playerCount} players`);
    }
    
    if (event.type === 'gameOver') {
      console.log(`🏆 Winner: Player ${event.data.winner}`);
    }
  });
  
  /**
   * Server errors
   */
  socket.on('error', (error) => {
    console.error('❌ Server error:', error);
    lastEvent.value = { type: 'error', data: error };
  });
  
  // ============================================================
  // PUBLIC METHODS
  // ============================================================
  
  /**
   * Join lobby with a name
   */
  function joinLobby(playerName) {
    console.log('🎮 Joining lobby as:', playerName);
    socket.emit('joinLobby', { playerName });
  }
  
  /**
   * Join as spectator
   */
  function spectate(name = null) {
    console.log('👁️ Joining as spectator');
    socket.emit('spectate', { name });
  }
  
  /**
   * Request game start (from lobby)
   * @param {boolean} vsAI - If true, start game vs AI
   */
  function startGame(vsAI = false) {
    console.log(`🎮 Requesting game start${vsAI ? ' vs AI' : ''}`);
    socket.emit('startGame', { vsAI });
  }
  
  /**
   * Send input to server
   * @param {string} input - 'UP' | 'DOWN' | null
   */
  function sendInput(input) {
    socket.emit('playerInput', { input });
  }
  
  /**
   * Vote to abandon current game
   */
  function voteAbandon() {
    console.log('🗳️ Voting to abandon');
    socket.emit('voteAbandon');
  }
  
  /**
   * Request game restart
   */
  function restartGame() {
    socket.emit('restartGame');
  }
  
  /**
   * Cleanup when component unmounts
   */
  onUnmounted(() => {
    // Check if socket is connected before disconnecting to avoid warning
    if (socket.connected) {
      console.log('🔌 Disconnecting socket...');
      socket.disconnect();
    } else {
      console.log('🔌 Socket already disconnected, skipping cleanup');
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
    
    // Raw socket (for advanced cases)
    socket,
  };
}
