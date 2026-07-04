import { Tile } from "../objects/Tile";
import { Wall } from "../objects/Wall";

import { GAME_STATE, GET_BOARD_ORIGIN, GET_BOARD_PIXEL_SIZE, getLevelConfig } from "../utils/GameState";

export class BoardInitializer {
    private frame?: Phaser.GameObjects.Graphics;

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

        this.drawFrame();

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
        this.frame?.destroy();
        this.frame = undefined;
    }

    // Thin crisp double-border: a light keyline, a dark band, and the tiles
    // sitting inside — the frame itself is the (lethal) board boundary
    private drawFrame(): void {
        const origin = GET_BOARD_ORIGIN();
        const { width: boardWidth, height: boardHeight } = GET_BOARD_PIXEL_SIZE();

        this.frame = this.scene.add.graphics();
        this.frame.setDepth(-1);
        // outer keyline
        this.frame.lineStyle(2, 0x4c5c46, 1);
        this.frame.strokeRect(origin.x - 3, origin.y - 3, boardWidth + 6, boardHeight + 6);
        // dark band under the wall strips
        this.frame.fillStyle(0x10150e, 1);
        this.frame.fillRect(origin.x - 1, origin.y - 1, boardWidth + 2, boardHeight + 2);
    }
}

export default BoardInitializer;
