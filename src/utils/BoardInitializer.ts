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

    // Pixel-style wooden frame: mid-brown band with a light top-left bevel and
    // dark bottom-right bevel — the frame is the (lethal) board boundary
    private drawFrame(): void {
        const origin = GET_BOARD_ORIGIN();
        const { width: boardWidth, height: boardHeight } = GET_BOARD_PIXEL_SIZE();
        const x = origin.x - 3;
        const y = origin.y - 3;
        const w = boardWidth + 6;
        const h = boardHeight + 6;

        this.frame = this.scene.add.graphics();
        this.frame.setDepth(-1);
        // wood band (tiles sit on top of the middle)
        this.frame.fillStyle(0x8a5a2b, 1);
        this.frame.fillRect(x, y, w, h);
        // light bevel: top + left
        this.frame.fillStyle(0xb07f45, 1);
        this.frame.fillRect(x, y, w, 3);
        this.frame.fillRect(x, y, 3, h);
        // dark bevel: bottom + right
        this.frame.fillStyle(0x5c3a1e, 1);
        this.frame.fillRect(x, y + h - 3, w, 3);
        this.frame.fillRect(x + w - 3, y, 3, h);
        // crisp dark outline around the whole frame
        this.frame.lineStyle(2, 0x3a2410, 1);
        this.frame.strokeRect(x - 1, y - 1, w + 2, h + 2);
    }
}

export default BoardInitializer;
