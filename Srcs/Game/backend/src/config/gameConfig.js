/**
 * GAME CONFIGURATION
 * 
 * Costanti centrali del gioco. Modificando questi valori puoi:
 * - Cambiare dimensioni campo
 * - Velocità palla
 * - Dimensioni paddle
 * - Tick rate del server
 * 
 * IMPORTANTE: Se modifichi CANVAS_WIDTH/HEIGHT, aggiorna anche nel frontend!
 */

export const GAME_CONFIG = {
  // Dimensioni campo da gioco (in pixel)
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  // Fisica palla
  BALL: {
    RADIUS: 8,                    // Raggio palla in pixel
    INITIAL_SPEED: 300,           // Velocità iniziale in pixel/secondo
    MAX_SPEED: 600,               // Velocità massima
    ACCELERATION: 1.05,           // Moltiplicatore ad ogni bounce (aumenta velocità)
  },
  
  // Paddle properties
  PADDLE: {
    // Paddle verticali (LEFT, RIGHT)
    VERTICAL: {
      WIDTH: 15,
      HEIGHT: 100,
      SPEED: 400,                 // Pixel/secondo
    },
    // Paddle orizzontali (TOP, BOTTOM)
    HORIZONTAL: {
      WIDTH: 100,
      HEIGHT: 15,
      SPEED: 400,
    },
    OFFSET: 20,                   // Distanza dal bordo del campo
  },
  
  // Game rules
  GAME: {
    MAX_PLAYERS: 4,
    WIN_SCORE: 10,                // Punti per vincere
    POINTS_ON_MISS: -1,           // Punti persi se la palla esce dal tuo lato
  },
  
  // Server settings
  SERVER: {
    TICK_RATE: 60,                // Update al secondo (60 = smooth)
    PORT: 3000,
  },
};

/**
 * POSIZIONI INIZIALI PADDLE
 * 
 * Calcola posizione centrata per ogni paddle sul suo lato.
 * Ogni paddle ha:
 * - id: Identificatore player (0-3)
 * - side: Lato del campo ('left', 'top', 'right', 'bottom')
 * - x, y: Posizione iniziale
 * - width, height: Dimensioni
 * - orientation: 'vertical' o 'horizontal'
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
