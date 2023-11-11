import { Tile } from "../objects/Tile";
import { Wall } from "../objects/Wall";

import { GAME_STATE, getLevelConfig,  } from "../utils/GameState";

export class BoardInitializer {
    constructor(private scene: Phaser.Scene) {}

    private isBorderPosition(i: number, j: number): boolean {
        return i === 0 || i === getLevelConfig().board_height - 1 || j === 0 || j === getLevelConfig().board_width - 1;
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
        
        for (let i = 0; i < getLevelConfig().board_height; i++) {
            let row: (Tile | Wall)[] = [];
            for (let j = 0; j < getLevelConfig().board_width; j++) {
                row.push(this.createBoardTile(i, j));
            }
            GAME_STATE.board.push(row);
        }
    }

    public tearDownBoard(): void {
        GAME_STATE.board.forEach(row => row.forEach(tile => tile.getSprite().destroy()));
        GAME_STATE.board = [];
        GAME_STATE.walls = [];
    }
}

export default BoardInitializer;