import Box from "../objects/Box";
import Character from "../objects/Character";
import Tile from "../objects/Tile";
import Wall from "../objects/Wall";
import { LEFT_MARGIN, TOP_MARGIN } from "./Constants";

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
    character?: Character;
    boxes: Box[];
    board: (Tile|Wall)[][];
    walls: Wall[];
    canPlayerMove: boolean;
    currentlyColliding: boolean;
}

export const GAME_STATE: GameState = {
    currentLevel: 1,
    score: 0,
    lives: 3,
    maxLives: 3,
    canPlayerMove: false,
    currentlyColliding: false,
    boxes: [],
    board: [],
    walls: [],
    levels: [
    ]
};

export function resetGameState(): void {
    GAME_STATE.currentLevel = 1;
    GAME_STATE.score = 0;
    GAME_STATE.lives = 3;
    GAME_STATE.canPlayerMove = false;
}

export function getLevelConfig(): LevelConfig {
    return {
        level_number: GAME_STATE.currentLevel + 1,
        board_width:  6 + GAME_STATE.currentLevel,
        board_height: 7 + GAME_STATE.currentLevel,
        number_of_boxes:  GAME_STATE.currentLevel,
    }
}

export function GET_TILE_SIZE(): number {
    const size = (360 / getLevelConfig().board_width);
    return size;
}

export function GET_SCALE_SIZE(): number {
    console.log( getLevelConfig());

    const scale = (360 / getLevelConfig().board_width) / 225;
    console.log(scale);
    return scale
}

export function GET_X_FROM_INDEX(xIndex: number): number {
    return xIndex * GET_TILE_SIZE() + 0;
}

export function GET_Y_FROM_INDEX(yIndex: number): number {
    return yIndex * GET_TILE_SIZE() + 90;
}

export function GET_X_FROM_INDEX_WITH_OFFSET(xIndex: number): number {
    return GET_X_FROM_INDEX(xIndex) + GET_TILE_SIZE() / 2;
}

export function GET_Y_FROM_INDEX_WITH_OFFSET(yIndex: number): number {
    return GET_Y_FROM_INDEX(yIndex) + GET_TILE_SIZE() / 2;
}