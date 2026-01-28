/**
 * WEBSOCKET COMPOSABLE
 * 
 * Vue Composable per gestire connessione WebSocket con Socket.IO.
 * 
 * COMPOSABLE PATTERN:
 * - Funzione riutilizzabile che gestisce logica specifica
 * - Ritorna ref/reactive e metodi
 * - Può essere usata in qualsiasi component
 * 
 * LIFECYCLE:
 * 1. setup() → crea connessione socket
 * 2. onMounted() → attach event listeners
 * 3. onUnmounted() → cleanup e disconnect
 */

import { ref, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import { GAME_CONFIG } from '../config/gameConfig.js';

export function useWebSocket() {
  // Stato reattivo della connessione
  const connected = ref(false);
  const myPlayer = ref(null); // Info sul player assegnato
  const gameState = ref(null); // Stato del gioco dal server
  const lastEvent = ref(null); // Ultimo evento ricevuto
  
  // Crea connessione Socket.IO
  const socket = io(GAME_CONFIG.SOCKET_URL, {
    transports: ['websocket'], // Forza WebSocket (no long-polling fallback)
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });
  
  // ============================================================
  // EVENT LISTENERS
  // ============================================================
  
  /**
   * Connessione stabilita
   */
  socket.on('connect', () => {
    console.log('✅ WebSocket connesso:', socket.id);
    connected.value = true;
  });
  
  /**
   * Disconnessione
   */
  socket.on('disconnect', (reason) => {
    console.log('❌ WebSocket disconnesso:', reason);
    connected.value = false;
    myPlayer.value = null;
  });
  
  /**
   * Server assegna player slot
   * Ricevuto dopo aver inviato 'joinGame'
   */
  socket.on('playerAssigned', (data) => {
    console.log('🎮 Player assegnato:', data);
    myPlayer.value = {
      id: data.playerId,
      side: data.side,
      roomId: data.roomId,
    };
  });
  
  /**
   * Ricevi game state dal server (ogni tick = 60 volte/sec)
   * Questo è il cuore della sincronizzazione multiplayer!
   */
  socket.on('gameState', (state) => {
    gameState.value = state;
  });
  
  /**
   * Eventi speciali (score, collision, gameOver, etc)
   */
  socket.on('gameEvent', (event) => {
    console.log('🎯 Game Event:', event);
    lastEvent.value = event;
    
    // Puoi gestire eventi specifici qui
    if (event.type === 'score') {
      console.log(`Player ${event.data.playerId} scored!`);
    }
    
    if (event.type === 'gameOver') {
      console.log(`🏆 Winner: Player ${event.data.winner}`);
    }
  });
  
  /**
   * Errori dal server
   */
  socket.on('error', (error) => {
    console.error('❌ Server error:', error);
    alert(error.message);
  });
  
  // ============================================================
  // METODI PUBBLICI
  // ============================================================
  
  /**
   * Entra in partita (chiamato quando app si monta)
   */
  function joinGame(roomId = 'room-1') {
    console.log('🎮 Joining game...', roomId);
    socket.emit('joinGame', { roomId });
  }
  
  /**
   * Invia input al server
   * @param {string} input - 'UP' | 'DOWN' | null
   */
  function sendInput(input) {
    socket.emit('playerInput', { input });
  }
  
  /**
   * Richiedi restart partita
   */
  function restartGame() {
    socket.emit('restartGame');
  }
  
  /**
   * Cleanup quando component viene unmounted
   */
  onUnmounted(() => {
    console.log('🔌 Disconnecting socket...');
    socket.disconnect();
  });
  
  // Ritorna API pubblica
  return {
    // State
    connected,
    myPlayer,
    gameState,
    lastEvent,
    
    // Methods
    joinGame,
    sendInput,
    restartGame,
    
    // Raw socket (per casi avanzati)
    socket,
  };
}
