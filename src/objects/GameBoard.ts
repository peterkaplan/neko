import { Box } from "./Box";
import { Tile } from "./Tile";
import { Character } from "./Character";
import { BOARD_SIZE, TILE_SIZE } from '../utils/Constants';

interface Position {
    x: number;
    y: number;
}

export class GameBoard {
    private scene: Phaser.Scene;
    private x: number;
    private y: number;
    private BOARD_SIZE: number;
    private board: Phaser.GameObjects.Rectangle;
    private boxes: Box[];
    private tiles: Tile[][] = [];
    private character?: Character;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x; // x position of the top-left corner
        this.y = y; // y position of the top-left corner
        this.BOARD_SIZE = BOARD_SIZE * TILE_SIZE; // 20x20 tiles

        // Create a blue rectangle for the game board
        this.board = this.scene.add.rectangle(this.x, this.y, this.BOARD_SIZE, this.BOARD_SIZE, 0x0000FF);
        this.board.setOrigin(0);  // Set the origin to top-left for easier positioning
        this.boxes = [];
        this.generateBackground();
        this.levelOne(); 
    }

    generateBackground(): void {
        this.tiles = [];
        
        for (let i = 0; i < BOARD_SIZE; i++) {
            let row: Tile[] = [];
            for (let j = 0; j < BOARD_SIZE; j++) {
                let tileX = this.x + j;
                let tileY = this.y + i;
                let tile = new Tile(this.scene, tileX, tileY);
                row.push(tile);
            }
            this.tiles.push(row);
        }
    }

    createLevel(playerPosition: Position, boxPositions: Position[]): void {
        if(this.character) {
            this.character.sprite.destroy();
            this.character = undefined;
        }
    
        this.boxes.forEach(box => { box.sprite.destroy(); });
        this.boxes = [];

        this.character = new Character(this.scene, playerPosition.x, playerPosition.y);
        boxPositions.forEach(box => this.boxes.push(new Box(this.scene, box.x, box.y, this.character)));
    }

    levelOne(): void {
        const boxPositions: Position[] = [
            { x: 9, y: 6 },
            { x: 9, y: 12 },
            { x: 6, y: 12 },
            { x: 11, y: 12 },
            { x: 6, y: 14 }
        ];

        const playerPosition: Position = { x: 6, y: 6 };

        this.createLevel(playerPosition, boxPositions);
    }

    getTileAt(row: number, col: number): Tile | null {
        if (row >= 0 && row < this.tiles.length && col >= 0 && col < this.tiles[row].length) {
            return this.tiles[row][col];
        }
        return null; // Return null if the indices are out of bounds
    }

    move(direction: 'left' | 'right' | 'up' | 'down'): void {
        if (this.character) {
            this.character.move(direction);
        }
    }
}

export default GameBoard;
