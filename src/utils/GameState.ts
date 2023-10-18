import Box from "../objects/Box";
import Character from "../objects/Character";
import Tile from "../objects/Tile";
import Wall from "../objects/Wall";

export interface Position {
    x: number;
    y: number;
}

export interface Level {
    id: number;
    playerStartPosition: Position;
    boxPositions: Position[];
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
        {
            id: 1,
            playerStartPosition: { x: 2, y: 6 },
            boxPositions: [
                { x: 5, y: 6 },
                { x: 5, y: 12 },
                { x: 2, y: 12 },
                { x: 7, y: 12 },
                { x: 2, y: 14 }
            ]
        },
    ]
};