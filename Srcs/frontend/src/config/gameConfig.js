/**
 * GAME CONFIG (Frontend)
 * 
 * IMPORTANT: Must match backend/src/config/gameConfig.js
 * If you modify canvas dimensions here, also update them in the backend!
 */

// Determine protocol based on current page (http→ws, https→wss)
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

export const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  SOCKET_URL: `${wsProtocol}//${window.location.host}/ws`,
  
  // Colors (frontend only)
  COLORS: {
    BACKGROUND: '#0a0e27',
    BALL: '#00d4ff',
    PADDLE_LEFT: '#ff006e',    // Player 1 (pink)
    PADDLE_TOP: '#ffbe0b',     // Player 2 (yellow)
    PADDLE_RIGHT: '#00f5d4',   // Player 3 (cyan)
    PADDLE_BOTTOM: '#8338ec',  // Player 4 (purple)
    TEXT: '#ffffff',
    SCORE: '#00d4ff',
  },
  
  // Input mapping
  // All players use the same keys since they play on different devices/browsers
  // Vertical paddles (left, right): Arrow Up/Down or W/S
  // Horizontal paddles (top, bottom): Arrow Left/Right or A/D
  KEYS: {
    VERTICAL: { 
      UP: ['ArrowUp', 'KeyW'],      // Arrow Up or W
      DOWN: ['ArrowDown', 'KeyS'],  // Arrow Down or S
    },
    HORIZONTAL: { 
      UP: ['ArrowLeft', 'KeyA'],    // Arrow Left or A (moves paddle "up" direction)
      DOWN: ['ArrowRight', 'KeyD'], // Arrow Right or D (moves paddle "down" direction)
    },
  },
};

// Map side → paddle color
export const PADDLE_COLORS = {
  left: GAME_CONFIG.COLORS.PADDLE_LEFT,
  top: GAME_CONFIG.COLORS.PADDLE_TOP,
  right: GAME_CONFIG.COLORS.PADDLE_RIGHT,
  bottom: GAME_CONFIG.COLORS.PADDLE_BOTTOM,
};
