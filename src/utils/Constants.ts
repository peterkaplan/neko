// Logical canvas size — height is fixed and width matches the window's aspect
// ratio, so Phaser's FIT scaling fills the screen edge-to-edge with no
// letterboxing. Layout anchors to the center and edges, so variable width is
// safe; the aspect is clamped so ultrawide/portrait extremes stay reasonable.
export const GAME_HEIGHT = 720;

function computeWidth(): number {
    const aspect = typeof window !== 'undefined'
        ? window.innerWidth / Math.max(1, window.innerHeight)
        : 4 / 3;
    // portrait floor is below modern phone aspects (390/844 ≈ 0.46) so the
    // canvas fills tall screens with no letterbox bars
    return Math.round(GAME_HEIGHT * Math.min(2.4, Math.max(0.42, aspect)));
}

// `let` on purpose: importers see a live binding, and index.ts refreshes it
// when the window is resized so layout code always reads the current width
export let GAME_WIDTH = computeWidth();

export function refreshGameWidth(): number {
    GAME_WIDTH = computeWidth();
    return GAME_WIDTH;
}

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

// Text is rendered into its own texture; matching that texture to the real
// device resolution keeps the pixel font crisp on retina/mobile screens where
// the 720-tall logical canvas gets stretched up.
export function textResolution(): number {
    if (typeof window === 'undefined') return 1;
    const upscale = window.innerHeight / GAME_HEIGHT;
    const dpr = window.devicePixelRatio || 1;
    return Math.min(4, Math.max(1, upscale * dpr));
}
