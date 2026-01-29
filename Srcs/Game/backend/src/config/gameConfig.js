/**
 * GAME CONFIGURATION
 * 
 * Central game constants. By modifying these values you can:
 * - Change field dimensions
 * - Ball speed
 * - Paddle sizes
 * - Server tick rate
 * 
 * IMPORTANT: If you modify CANVAS_WIDTH/HEIGHT, update the frontend config too!
 */

export const GAME_CONFIG = {
  // Game field dimensions (in pixels)
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  // Ball physics
  BALL: {
    RADIUS: 8,                    // Ball radius in pixels
    INITIAL_SPEED: 300,           // Initial speed in pixels/second
    MAX_SPEED: 600,               // Maximum speed
    ACCELERATION: 1.05,           // Multiplier on each bounce (increases speed)
  },
  
  // Paddle properties
  PADDLE: {
    // Vertical paddles (LEFT, RIGHT)
    VERTICAL: {
      WIDTH: 15,
      HEIGHT: 100,
      SPEED: 400,                 // Pixels/second
    },
    // Horizontal paddles (TOP, BOTTOM)
    HORIZONTAL: {
      WIDTH: 100,
      HEIGHT: 15,
      SPEED: 400,
    },
    OFFSET: 20,                   // Distance from field edge
  },
  
  // Game rules
  GAME: {
    MAX_PLAYERS: 4,
    MIN_PLAYERS_TO_START: 2,      // Minimum players to start a game
    WIN_SCORE: 10,                // Points to win
    RECONNECT_TIMEOUT: 30000,     // 30 seconds to reconnect before game is cancelled
  },

  // Server settings
  SERVER: {
    TICK_RATE: 60,                // Updates per second (60 = smooth)
    PORT: parseInt(process.env.PORT) || 3000,  // Read from .env
  },
};

/**
 * INITIAL PADDLE POSITIONS
 * 
 * Calculates centered position for each paddle on its side.
 * Each paddle has:
 * - id: Player identifier (0-3)
 * - side: Field side ('left', 'top', 'right', 'bottom')
 * - x, y: Initial position
 * - width, height: Dimensions
 * - orientation: 'vertical' or 'horizontal'
 */
export const INITIAL_PADDLE_POSITIONS = [
  {
    id: 0,
    side: 'left',
    x: GAME_CONFIG.PADDLE.OFFSET,
    y: (GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PADDLE.VERTICAL.HEIGHT) / 2,
    width: GAME_CONFIG.PADDLE.VERTICAL.WIDTH,
    height: GAME_CONFIG.PADDLE.VERTICAL.HEIGHT,
    orientation: 'vertical',
  },
  {
    id: 1,
    side: 'top',
    x: (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE.HORIZONTAL.WIDTH) / 2,
    y: GAME_CONFIG.PADDLE.OFFSET,
    width: GAME_CONFIG.PADDLE.HORIZONTAL.WIDTH,
    height: GAME_CONFIG.PADDLE.HORIZONTAL.HEIGHT,
    orientation: 'horizontal',
  },
  {
    id: 2,
    side: 'right',
    x: GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE.OFFSET - GAME_CONFIG.PADDLE.VERTICAL.WIDTH,
    y: (GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PADDLE.VERTICAL.HEIGHT) / 2,
    width: GAME_CONFIG.PADDLE.VERTICAL.WIDTH,
    height: GAME_CONFIG.PADDLE.VERTICAL.HEIGHT,
    orientation: 'vertical',
  },
  {
    id: 3,
    side: 'bottom',
    x: (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE.HORIZONTAL.WIDTH) / 2,
    y: GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PADDLE.OFFSET - GAME_CONFIG.PADDLE.HORIZONTAL.HEIGHT,
    width: GAME_CONFIG.PADDLE.HORIZONTAL.WIDTH,
    height: GAME_CONFIG.PADDLE.HORIZONTAL.HEIGHT,
    orientation: 'horizontal',
  },
];

/**
 * DYNAMIC SIDE ASSIGNMENTS
 * 
 * Maps player count to which paddle slots are active:
 * - 2 players: left (0) and right (2) - classic Pong
 * - 3 players: left (0), right (2), bottom (3)
 * - 4 players: all sides
 */
export const SIDE_ASSIGNMENTS = {
  2: [0, 2],          // left, right
  3: [0, 2, 3],       // left, right, bottom
  4: [0, 1, 2, 3],    // all
};

/**
 * ACTIVE SIDES for rebounce logic
 * Returns which sides have players based on player count
 */
export const ACTIVE_SIDES = {
  2: ['left', 'right'],
  3: ['left', 'right', 'bottom'],
  4: ['left', 'top', 'right', 'bottom'],
};
