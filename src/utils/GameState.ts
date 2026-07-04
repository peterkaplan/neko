import Box from "../objects/Box";
import Character from "../objects/Character";
import Tile from "../objects/Tile";
import Wall from "../objects/Wall";
import { BOARD_PADDING, GAME_HEIGHT, GAME_WIDTH, HUD_BOTTOM_HEIGHT, HUD_TOP_HEIGHT, MAX_TILE_SIZE, SPRITE_SIZE, WALL_THICKNESS } from "./Constants";

export interface Position {
    x: number;
    y: number;
}

export interface Level {
    id: number;
    // Grid positions
    playerStartPositionIndex: Position;
    boxPositionsIndex: Position[];
}

export interface LevelConfig {
    level_number: number;
    board_width: number;
    board_height: number;
    number_of_boxes: number;
}

export interface GameState {
    currentLevel: number;
    score: number;
    lives: number;
    maxLives: number;
    levels: Level[];
    levelConfigs: LevelConfig[];
    character?: Character;
    boxes: Box[];
    board: (Tile|Wall)[][];
    walls: Wall[];
    canPlayerMove: boolean;
    currentlyColliding: boolean;
    regenBoard: boolean;
    lastDirection: 'left' | 'right' | 'up' | 'down';
    // A move pressed while the cat is mid-slide, replayed as soon as it lands
    bufferedMove?: 'left' | 'right' | 'up' | 'down';
    // Hold-to-continue is disarmed on death/level change until all keys are
    // released, so a held key can't chain into an accidental death
    holdInputArmed: boolean;
    // 'endless' plays generated levels forever; 'daily' plays today's fixed puzzle.
    // Set by the Start scene and preserved across resets so Retry stays in-mode.
    mode: 'endless' | 'daily';
    // Endless-only: 'hard' starts bigger/denser and ramps faster. Preserved
    // across resets like mode so Retry keeps the chosen difficulty.
    difficulty: 'normal' | 'hard';
    dailyConfig?: LevelConfig;
    // Set before a resize-triggered Play restart so the run survives the
    // re-layout: the current level is rebuilt but score/lives/level carry over
    resumeSnapshot?: { score: number; lives: number; currentLevel: number };
}

export const GAME_STATE: GameState & { debug?: string[] } = {
    currentLevel: 1,
    score: 0,
    lives: 3,
    maxLives: 3,
    canPlayerMove: false,
    currentlyColliding: false,
    lastDirection: 'right',
    holdInputArmed: true,
    mode: 'endless',
    difficulty: 'normal',
    boxes: [],
    board: [],
    walls: [],
    levels: [],
    regenBoard: false,
    levelConfigs: [],
};

// Handy for debugging and driving the game from tests
(globalThis as any).GAME_STATE = GAME_STATE;

export function resetGameState(): void {
    const resume = GAME_STATE.resumeSnapshot;
    GAME_STATE.resumeSnapshot = undefined;
    GAME_STATE.regenBoard = false;
    GAME_STATE.currentLevel = 1;
    GAME_STATE.score = 0;
    GAME_STATE.lives = GAME_STATE.maxLives;
    GAME_STATE.canPlayerMove = false;
    GAME_STATE.currentlyColliding = false;
    GAME_STATE.lastDirection = 'right';
    GAME_STATE.bufferedMove = undefined;
    GAME_STATE.holdInputArmed = true;
    // Object references belong to the previous Play scene instance; a fresh
    // scene must rebuild them or it would touch destroyed sprites.
    GAME_STATE.character = undefined;
    GAME_STATE.boxes = [];
    GAME_STATE.board = [];
    GAME_STATE.walls = [];
    GAME_STATE.levels = [];
    GAME_STATE.levelConfigs = [];
    GAME_STATE.dailyConfig = undefined;
    // mode and difficulty are deliberately NOT reset: Retry/Play re-enter what was chosen on the Start scene
    if (resume) {
        GAME_STATE.score = resume.score;
        GAME_STATE.lives = resume.lives;
        GAME_STATE.currentLevel = resume.currentLevel;
    }
}

export function getLevelConfig(): LevelConfig {
    if (GAME_STATE.mode === 'daily' && GAME_STATE.dailyConfig) {
        return GAME_STATE.dailyConfig;
    }
    const index = Math.min(GAME_STATE.currentLevel, GAME_STATE.levelConfigs.length) - 1;
    return GAME_STATE.levelConfigs[index];
}

// Interior cells (indices 1..n-2) are full tiles; the border walls (indices 0
// and n-1) are thin strips. Tile size and origin are computed from the canvas
// size, so the layout follows the level config instead of hand-tuned margins.
export function GET_TILE_SIZE(): number {
    const config = getLevelConfig();
    const availableWidth = GAME_WIDTH - BOARD_PADDING * 2 - WALL_THICKNESS * 2;
    const availableHeight = GAME_HEIGHT - HUD_TOP_HEIGHT - HUD_BOTTOM_HEIGHT - BOARD_PADDING * 2 - WALL_THICKNESS * 2;
    return Math.min(
        availableWidth / (config.board_width - 2),
        availableHeight / (config.board_height - 2),
        MAX_TILE_SIZE,
    );
}

export function GET_BOARD_PIXEL_SIZE(): { width: number, height: number } {
    const config = getLevelConfig();
    const tile = GET_TILE_SIZE();
    return {
        width: (config.board_width - 2) * tile + WALL_THICKNESS * 2,
        height: (config.board_height - 2) * tile + WALL_THICKNESS * 2,
    };
}

export function GET_BOARD_ORIGIN(): Position {
    const board = GET_BOARD_PIXEL_SIZE();
    const x = (GAME_WIDTH - board.width) / 2;
    const y = HUD_TOP_HEIGHT + (GAME_HEIGHT - HUD_TOP_HEIGHT - HUD_BOTTOM_HEIGHT - board.height) / 2;
    return { x, y };
}

export function GET_SCALE_SIZE(): number {
    return GET_TILE_SIZE() / SPRITE_SIZE;
}

export function GET_X_FROM_INDEX(xIndex: number): number {
    const originX = GET_BOARD_ORIGIN().x;
    return xIndex === 0 ? originX : originX + WALL_THICKNESS + (xIndex - 1) * GET_TILE_SIZE();
}

export function GET_Y_FROM_INDEX(yIndex: number): number {
    const originY = GET_BOARD_ORIGIN().y;
    return yIndex === 0 ? originY : originY + WALL_THICKNESS + (yIndex - 1) * GET_TILE_SIZE();
}

export function GET_X_FROM_INDEX_WITH_OFFSET(xIndex: number): number {
    return GET_X_FROM_INDEX(xIndex) + GET_TILE_SIZE() / 2;
}

export function GET_Y_FROM_INDEX_WITH_OFFSET(yIndex: number): number {
    return GET_Y_FROM_INDEX(yIndex) + GET_TILE_SIZE() / 2;
}