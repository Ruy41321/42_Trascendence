/**
 * GAME CONFIG (Frontend)
 * 
 * IMPORTANTE: Deve matchare con backend/src/config/gameConfig.js
 * Se modifichi dimensioni canvas qui, modifica anche nel backend!
 */

export const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  // WebSocket connection
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000',
  
  // Colors (frontend only)
  COLORS: {
    BACKGROUND: '#0a0e27',
    BALL: '#00d4ff',
    PADDLE_LEFT: '#ff006e',    // Player 1 (rosa)
    PADDLE_TOP: '#ffbe0b',     // Player 2 (giallo)
    PADDLE_RIGHT: '#00f5d4',   // Player 3 (cyan)
    PADDLE_BOTTOM: '#8338ec',  // Player 4 (viola)
    TEXT: '#ffffff',
    SCORE: '#00d4ff',
  },
  
  // Input mapping
  KEYS: {
    PLAYER_1: { UP: 'KeyW', DOWN: 'KeyS' },           // W, S
    PLAYER_2: { UP: 'ArrowUp', DOWN: 'ArrowDown' },   // Arrow Up/Down
    PLAYER_3: { UP: 'KeyI', DOWN: 'KeyK' },           // I, K
    PLAYER_4: { UP: 'Numpad8', DOWN: 'Numpad5' },     // Numpad 8, 5
  },
};

// Mappa side → colore paddle
export const PADDLE_COLORS = {
  left: GAME_CONFIG.COLORS.PADDLE_LEFT,
  top: GAME_CONFIG.COLORS.PADDLE_TOP,
  right: GAME_CONFIG.COLORS.PADDLE_RIGHT,
  bottom: GAME_CONFIG.COLORS.PADDLE_BOTTOM,
};
