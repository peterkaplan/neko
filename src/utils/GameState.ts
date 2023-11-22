import Box from "../objects/Box";
import Character from "../objects/Character";
import Tile from "../objects/Tile";
import Wall from "../objects/Wall";
import { GAME_WIDTH, LEFT_MARGIN, TOP_MARGIN, WALL_WIDTH } from "./Constants";

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
}

export const GAME_STATE: GameState = {
    currentLevel: 1,
    score: 0,
    lives: 3,
    maxLives: 3,
    canPlayerMove: false,
    currentlyColliding: false,
    lastDirection: 'right',
    boxes: [],
    board: [],
    walls: [],
    levels: [],
    regenBoard: false,
    levelConfigs: [],
};

export function resetGameState(): void {
    GAME_STATE.regenBoard = true;
    GAME_STATE.currentLevel = 1;
    GAME_STATE.score = 0;
    GAME_STATE.lives = 3;
    GAME_STATE.canPlayerMove = false;
}

export function getLevelConfig(): LevelConfig {
    return GAME_STATE.levelConfigs[GAME_STATE.currentLevel];
}

export function GET_TILE_SIZE(): number {
    const size =  ((GAME_WIDTH - (GET_WALL_WIDTH() * 2)) / (getLevelConfig().board_width - 2));
    return size;
}

export function GET_WALL_WIDTH(): number {
    return WALL_WIDTH;
}

export function GET_SCALE_SIZE(): number {
    const scale = GET_TILE_SIZE() / 225;
    return scale
}

export function GET_X_FROM_INDEX(xIndex: number): number {
    if(xIndex === 0) {
        return 0 + LEFT_MARGIN;
    }  

    return (xIndex - 1) * GET_TILE_SIZE() + GET_WALL_WIDTH() + LEFT_MARGIN;
}

export function GET_Y_FROM_INDEX(yIndex: number): number {
    if (yIndex === 0) {
        return TOP_MARGIN;
    }

    return (yIndex -1) * GET_TILE_SIZE() + GET_WALL_WIDTH() + TOP_MARGIN;
}

export function GET_X_FROM_INDEX_WITH_OFFSET(xIndex: number): number {
    return GET_X_FROM_INDEX(xIndex) + GET_TILE_SIZE() / 2;
}

export function GET_Y_FROM_INDEX_WITH_OFFSET(yIndex: number): number {
    return GET_Y_FROM_INDEX(yIndex) + GET_TILE_SIZE() / 2;
}