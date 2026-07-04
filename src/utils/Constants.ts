// Logical canvas size — height is fixed and width matches the window's aspect
// ratio at load, so Phaser's FIT scaling fills the screen edge-to-edge with no
// letterboxing. Layout anchors to the center and edges, so variable width is
// safe; the aspect is clamped so ultrawide/portrait extremes stay reasonable.
export const GAME_HEIGHT = 720;
const aspect = typeof window !== 'undefined'
    ? window.innerWidth / Math.max(1, window.innerHeight)
    : 4 / 3;
export const GAME_WIDTH = Math.round(GAME_HEIGHT * Math.min(2.4, Math.max(0.5, aspect)));

// Vertical bands reserved above/below the board
export const HUD_TOP_HEIGHT = 130;
export const HUD_BOTTOM_HEIGHT = 96;

// Source art is rendered at 225x225 per sprite/frame
export const SPRITE_SIZE = 225;

// Speed of character
export const MAX_VELOCITY = 800;

export const BOARD_PADDING = 10;

// Border walls are thin invisible physics strips; the drawn frame sits on them
export const WALL_THICKNESS = 10;

// Small boards shouldn't produce comically large tiles
export const MAX_TILE_SIZE = 52;
