import { Tile } from "../objects/Tile";
import { Wall } from "../objects/Wall";

import { BOARD_HEIGHT, BOARD_LENGTH } from '../utils/Constants';
import { GAME_STATE,  } from "../utils/GameState";

export class BoardInitializer {
    constructor(private scene: Phaser.Scene) {}

    private isBorderPosition(i: number, j: number): boolean {
        return i === 0 || i === BOARD_HEIGHT - 1 || j === 0 || j === BOARD_LENGTH - 1;
    }

    private createBoardTile(i: number, j: number): Tile | Wall {
        if (this.isBorderPosition(i, j)) {
            const wall = new Wall(this.scene, j, i);
            GAME_STATE.walls.push(wall);
            return wall;
        }
        return new Tile(this.scene, j, i);
    }
    
    public setupBoard(): void {
        GAME_STATE.board = [];
        
        for (let i = 0; i < BOARD_HEIGHT; i++) {
            let row: (Tile | Wall)[] = [];
            for (let j = 0; j < BOARD_LENGTH; j++) {
                row.push(this.createBoardTile(i, j));
            }
            GAME_STATE.board.push(row);
        }
    }
}

export default BoardInitializer;