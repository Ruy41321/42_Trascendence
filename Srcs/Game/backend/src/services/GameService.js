/**
 * GAME SERVICE
 * 
 * Main game orchestrator. Manages:
 * - Game loop (called every tick)
 * - Scoring logic
 * - State transitions (lobby → playing → finished)
 * - Coordination between Physics and Collision services
 * 
 * PATTERN: Service Layer
 * - Separates business logic from networking (server.js)
 * - Independently testable
 * - Reusable
 */

import { PhysicsService } from './PhysicsService.js';
import { CollisionService } from './CollisionService.js';
import { AIService } from './AIService.js';
import { GAME_CONFIG, INITIAL_PADDLE_POSITIONS, SIDE_ASSIGNMENTS, ACTIVE_SIDES } from '../config/gameConfig.js';

export class GameService {
  /**
   * Main update called every tick (60 times per second)
   * 
   * @param {GameState} gameState - Current game state
   * @returns {Object} - Events that occurred this tick (scores, collision, etc)
   */
  static update(gameState) {
    const now = Date.now();
    let dt = (now - gameState.lastUpdate) / 1000;
    gameState.lastUpdate = now;
    gameState.tick++;
    
    // Cap delta time to prevent ball teleportation on lag spikes
    // Max dt = 2 ticks worth (about 33ms at 60fps)
    const maxDt = 2 / GAME_CONFIG.SERVER.TICK_RATE;
    if (dt > maxDt) {
      dt = maxDt;
    }
    
    const events = {
      scored: null,
      collision: false,
      gameOver: false,
    };
    
    // Only update if game is in "playing" state
    if (gameState.status !== 'playing') {
      return events;
    }
    
    // 0. UPDATE AI (if AI mode is enabled)
    if (gameState.aiEnabled && gameState.aiPlayerSlot !== null) {
      AIService.updateAI(gameState, gameState.aiPlayerSlot);
    }
    
    // 1. UPDATE PADDLES (based on player input)
    for (const player of gameState.players) {
      if (player.connected) {
        PhysicsService.updatePaddle(player, dt);
      }
    }
    
    // 2. UPDATE BALL
    PhysicsService.updateBall(gameState.ball, dt);
    
    // 3. CHECK COLLISION BALL vs PADDLE
    const paddleHit = CollisionService.checkPaddleCollisions(
      gameState.ball, 
      gameState.players
    );
    
    if (paddleHit) {
      events.collision = true;
      gameState.ball.hasBeenHit = true;  // Mark ball as touched
    }
    
    // 4. CHECK BALL OUT OF BOUNDS (scoring or rebounce)
    const boundResult = PhysicsService.checkBallBounds(
      gameState.ball,
      gameState.activePlayerCount
    );
    
    if (boundResult) {
      if (boundResult.type === 'rebounce') {
        // Ball hit an empty side - rebounce instead of scoring
        PhysicsService.reboundBall(gameState.ball, boundResult.side);
        events.collision = true;
      } else if (boundResult.type === 'miss') {
        // Player missed - all other connected players score
        const scoringPlayers = gameState.players.filter(
          p => p.connected && p.side !== boundResult.side
        );
        
        scoringPlayers.forEach(player => {
          player.score += 1;
        });
        
        events.scored = {
          missedSide: boundResult.side,
          scoringPlayers: scoringPlayers.map(p => ({ id: p.id, newScore: p.score })),
        };
        
        // Reset ball to center
        gameState.resetBall();
        
        // Check win condition
        const winner = this.checkWinCondition(gameState);
        if (winner) {
          gameState.status = 'finished';
          gameState.winner = winner.id;
          events.gameOver = true;
          
          // Start auto-reset timeout (10 seconds)
          if (!gameState.finishedTimeout) {
            console.log('⏱️ Starting 10s auto-reset timer after game over...');
            gameState.finishedTimeout = setTimeout(() => {
              if (gameState.status === 'finished') {
                console.log('⏱️ Auto-reset timeout expired - returning to lobby');
                gameState.resetToLobby();
                gameState._finishedTimeoutExpired = true;  // Flag for server to detect
              }
            }, 10000);  // 10 seconds
          }
        }
      }
    }
    
    return events;
  }
  
  /**
   * Check if any player has reached winning score
   * 
   * WIN CONDITION: First to reach WIN_SCORE points
   */
  static checkWinCondition(gameState) {
    const winner = gameState.players.find(
      p => p.score >= GAME_CONFIG.GAME.WIN_SCORE
    );
    
    return winner || null;
  }
  
  /**
   * Start new game from lobby
   * - Assign lobby players to paddle slots
   * - Reset all scores
   * - Reset paddle positions
   * - Reset ball
   * - Start countdown
   * 
   * @param {GameState} gameState
   * @param {boolean} vsAI - If true, start a 1v1 game against AI
   */
  static startGame(gameState, vsAI = false) {
    const lobbyPlayers = gameState.lobby.playersReady;
    
    // For AI mode, only need 1 player
    const minPlayers = vsAI ? 1 : GAME_CONFIG.GAME.MIN_PLAYERS_TO_START;
    
    if (lobbyPlayers.length < minPlayers) {
      return false;
    }
    
    // Reset AI state
    gameState.aiEnabled = false;
    gameState.aiPlayerSlot = null;
    
    if (vsAI && lobbyPlayers.length === 1) {
      // AI Mode: 1 player vs AI
      gameState.aiEnabled = true;
      gameState.activePlayerCount = 2;  // Player + AI
      
      // Player gets left side (slot 0)
      const lobbyPlayer = lobbyPlayers[0];
      const player = gameState.players[0];  // Left paddle
      
      player.connected = true;
      player.name = lobbyPlayer.name;
      player.socketIds = [lobbyPlayer.socketId];
      player.score = 0;
      player.input = null;
      player.votedToAbandon = false;
      
      const initialPosPlayer = INITIAL_PADDLE_POSITIONS[0];
      player.x = initialPosPlayer.x;
      player.y = initialPosPlayer.y;
      
      // AI gets right side (slot 2)
      const aiPlayer = gameState.players[2];  // Right paddle
      gameState.aiPlayerSlot = 2;
      
      aiPlayer.connected = true;
      aiPlayer.name = 'AI';
      aiPlayer.socketIds = [];  // AI has no socket
      aiPlayer.score = 0;
      aiPlayer.input = null;
      aiPlayer.votedToAbandon = false;
      
      const initialPosAI = INITIAL_PADDLE_POSITIONS[2];
      aiPlayer.x = initialPosAI.x;
      aiPlayer.y = initialPosAI.y;
      
      // Reset AI service state
      AIService.resetAI();
      
      console.log(`🤖 AI Game started: ${lobbyPlayer.name} vs AI`);
    } else {
      // Normal multiplayer mode
      gameState.activePlayerCount = Math.min(lobbyPlayers.length, GAME_CONFIG.GAME.MAX_PLAYERS);
      const slotAssignments = SIDE_ASSIGNMENTS[gameState.activePlayerCount];
      
      // Assign lobby players to the correct paddle slots based on player count
      // 2 players: left/right, 3 players: left/right/bottom, 4 players: all
      for (let i = 0; i < gameState.activePlayerCount; i++) {
        const lobbyPlayer = lobbyPlayers[i];
        const slotIndex = slotAssignments[i];  // Get the correct slot (0,2 for 2p; 0,2,3 for 3p; etc)
        const player = gameState.players[slotIndex];
        
        player.connected = true;
        player.name = lobbyPlayer.name;
        player.socketIds = [lobbyPlayer.socketId];
        player.score = 0;
        player.input = null;
        player.votedToAbandon = false;
        
        // Reset position
        const initialPos = INITIAL_PADDLE_POSITIONS[slotIndex];
        player.x = initialPos.x;
        player.y = initialPos.y;
      }
      
      console.log(`🎮 Game started with ${gameState.activePlayerCount} players`);
    }
    
    // Reset ball
    gameState.resetBall();
    
    // Start countdown
    gameState.status = 'countdown';
    gameState.startTime = Date.now();
    
    // After 3 seconds, status → 'playing'
    setTimeout(() => {
      if (gameState.status === 'countdown') {
        gameState.status = 'playing';
        gameState.resetBall();
      }
    }, 3000);
    
    return true;
  }
  
  /**
   * Handle player input
   * 
   * @param {GameState} gameState
   * @param {string} socketId - Socket ID of the player
   * @param {string} input - 'UP' | 'DOWN' | null
   */
  static handlePlayerInput(gameState, socketId, input) {
    const player = gameState.getPlayerBySocketId(socketId);
    
    if (!player) {
      return;
    }
    
    // Validate input
    if (input !== 'UP' && input !== 'DOWN' && input !== null) {
      console.warn(`Invalid input: ${input}`);
      return;
    }
    
    player.input = input;
  }
  
  /**
   * Add player to lobby
   * @returns {Object|null} - Player info or null if name taken/lobby full
   */
  static joinLobby(gameState, socketId, playerName) {
    // Check if name already exists in lobby (with active socket)
    const existingInLobby = gameState.lobby.playersReady.find(
      p => p.name.toLowerCase() === playerName.toLowerCase()
    );
    
    if (existingInLobby) {
      // Check if this is the same socket reconnecting or a different person
      if (existingInLobby.socketId === socketId) {
        // Same socket, just return success
        return { name: playerName, reconnected: true };
      }
      // Different socket trying to use same name in lobby - REJECT
      console.log(`❌ Name "${playerName}" already taken in lobby`);
      return { error: 'nameTaken', message: 'This name is already in use' };
    }
    
    // Check if this player was in an active/paused game
    const existingPlayer = gameState.getPlayerByName(playerName);
    if (existingPlayer && existingPlayer.connected) {
      // Check if player is actually connected (has sockets)
      if (existingPlayer.socketIds.length > 0) {
        // Player is actively playing with this name - check if it's a reconnect
        // Allow reconnect only if they have 0 sockets (disconnected)
        console.log(`❌ Name "${playerName}" is in active game`);
        return { error: 'nameTaken', message: 'This name is already in use' };
      }
      
      // Player disconnected (0 sockets) - allow reconnection
      existingPlayer.socketIds.push(socketId);
      console.log(`🔄 Player "${playerName}" reconnected to game`);
      
      // If game was paused due to disconnect, check if we can resume
      if (gameState.status === 'paused') {
        this.checkAndResumeGame(gameState);
      }
      
      return { 
        name: playerName, 
        reconnected: true, 
        playerId: existingPlayer.id,
        side: existingPlayer.side,
        inGame: true
      };
    }
    
    // Check lobby full
    if (gameState.lobby.playersReady.length >= GAME_CONFIG.GAME.MAX_PLAYERS) {
      return null; // Lobby full
    }
    
    // Add new player to lobby
    gameState.lobby.playersReady.push({
      name: playerName,
      socketId: socketId,
    });
    
    console.log(`➕ Player "${playerName}" joined lobby (${gameState.lobby.playersReady.length} players)`);
    return { name: playerName, reconnected: false };
  }
  
  /**
   * Add spectator
   */
  static addSpectator(gameState, socketId, name = null) {
    // Check if already spectating
    const existing = gameState.spectators.find(s => s.socketId === socketId);
    if (existing) return existing;
    
    const spectator = {
      socketId,
      name: name || `Spectator-${gameState.spectators.length + 1}`,
    };
    
    gameState.spectators.push(spectator);
    console.log(`👁️ Spectator "${spectator.name}" joined`);
    return spectator;
  }
  
  /**
   * Remove socket from game (handles both players and spectators)
   */
  static removeSocket(gameState, socketId) {
    // Check if spectator
    const spectatorIndex = gameState.spectators.findIndex(s => s.socketId === socketId);
    if (spectatorIndex !== -1) {
      const spectator = gameState.spectators[spectatorIndex];
      gameState.spectators.splice(spectatorIndex, 1);
      console.log(`👁️ Spectator "${spectator.name}" left`);
      return { type: 'spectator', name: spectator.name };
    }
    
    // Check if in lobby
    const lobbyIndex = gameState.lobby.playersReady.findIndex(p => p.socketId === socketId);
    if (lobbyIndex !== -1) {
      const lobbyPlayer = gameState.lobby.playersReady[lobbyIndex];
      gameState.lobby.playersReady.splice(lobbyIndex, 1);
      console.log(`➖ Player "${lobbyPlayer.name}" left lobby`);
      return { type: 'lobby', name: lobbyPlayer.name };
    }
    
    // Check if active player
    const player = gameState.getPlayerBySocketId(socketId);
    if (player) {
      // Remove this socket from player
      player.socketIds = player.socketIds.filter(id => id !== socketId);
      
      // If player has no more sockets, they're disconnected
      if (player.socketIds.length === 0) {
        console.log(`❌ Player "${player.name}" (${player.side}) disconnected`);
        
        // If game is finished and a player leaves, reset lobby for everyone
        if (gameState.status === 'finished') {
          console.log('🔄 Player left during finished state - resetting lobby for all');
          gameState.resetToLobby();
          return { type: 'player', name: player.name, allDisconnected: true, finishedReset: true };
        }
        
        // Pause game if playing
        if (gameState.status === 'playing') {
          gameState.status = 'paused';
          console.log('⏸️ Game paused - player disconnected');
          
          // Start reconnection timeout (30 seconds)
          if (!gameState.reconnectTimeout) {
            console.log(`⏱️ Starting ${GAME_CONFIG.GAME.RECONNECT_TIMEOUT / 1000}s reconnection timer...`);
            gameState.reconnectTimeout = setTimeout(() => {
              if (gameState.status === 'paused') {
                console.log('⏱️ Reconnection timeout expired - cancelling match');
                gameState.resetToLobby();
                // Note: The server.js will need to broadcast this reset
                gameState._timeoutExpired = true;  // Flag for server to detect
              }
            }, GAME_CONFIG.GAME.RECONNECT_TIMEOUT);
          }
        }
        
        // Check if all players disconnected
        if (this.checkAllPlayersDisconnected(gameState)) {
          console.log('🔄 All players disconnected - resetting to lobby');
          gameState.resetToLobby();
          return { type: 'player', name: player.name, allDisconnected: true };
        }
        
        return { type: 'player', name: player.name, allDisconnected: false };
      }
      
      return { type: 'player', name: player.name, stillConnected: true };
    }
    
    return null;
  }
  
  /**
   * Check if all active players have disconnected
   */
  static checkAllPlayersDisconnected(gameState) {
    const connectedPlayers = gameState.players.filter(
      p => p.connected && p.socketIds.length > 0
    );
    return connectedPlayers.length === 0;
  }
  
  /**
   * Check if game can resume after reconnection
   */
  static checkAndResumeGame(gameState) {
    if (gameState.status !== 'paused') return;
    
    // Check if all originally connected players have at least one socket
    const activePlayers = gameState.players.filter(p => p.connected);
    const allConnected = activePlayers.every(p => p.socketIds.length > 0);
    
    if (allConnected && activePlayers.length >= GAME_CONFIG.GAME.MIN_PLAYERS_TO_START) {
      // Clear reconnection timeout
      if (gameState.reconnectTimeout) {
        clearTimeout(gameState.reconnectTimeout);
        gameState.reconnectTimeout = null;
        console.log('⏱️ Reconnection timer cancelled');
      }
      
      gameState.status = 'playing';
      console.log('▶️ Game resumed - all players reconnected');
      return true;
    }
    
    return false;
  }
  
  /**
   * Handle vote to abandon game
   */
  static voteToAbandon(gameState, socketId) {
    const player = gameState.getPlayerBySocketId(socketId);
    if (!player) return null;
    
    player.votedToAbandon = true;
    console.log(`🗳️ Player "${player.name}" voted to abandon`);
    
    // Check if all players voted
    if (gameState.checkAllVotedToAbandon()) {
      console.log('🛑 All players voted to abandon - resetting to lobby');
      gameState.resetToLobby();
      return { abandoned: true };
    }
    
    return { abandoned: false, playerName: player.name };
  }
  
  /**
   * Restart game (after finish)
   */
  static restartGame(gameState) {
    if (gameState.status !== 'finished') return false;
    
    // Clear auto-reset timeout since players chose to continue
    if (gameState.finishedTimeout) {
      clearTimeout(gameState.finishedTimeout);
      gameState.finishedTimeout = null;
      console.log('⏱️ Auto-reset timer cancelled - players restarting');
    }
    
    // Reset AI state if AI mode is active
    if (gameState.aiEnabled) {
      AIService.resetAI();
    }
    
    // Reset scores and positions
    gameState.players.forEach((player, index) => {
      if (player.connected) {
        player.score = 0;
        player.input = null;
        player.votedToAbandon = false;
        const initialPos = INITIAL_PADDLE_POSITIONS[index];
        player.x = initialPos.x;
        player.y = initialPos.y;
      }
    });
    
    // Reset ball and start countdown
    gameState.resetBall();
    gameState.status = 'countdown';
    gameState.winner = null;
    gameState.startTime = Date.now();
    
    setTimeout(() => {
      if (gameState.status === 'countdown') {
        gameState.status = 'playing';
        gameState.resetBall();
      }
    }, 3000);
    
    console.log('🔄 Game restarted');
    return true;
  }
}
