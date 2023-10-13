import { Box } from "./Box";
import { Tile } from "./Tile";
import { Wall } from "./Wall";

import { Character } from "./Character";
import { BOARD_HEIGHT, BOARD_LENGTH, TILE_SIZE } from '../utils/Constants';

interface Position {
    x: number;
    y: number;
}

export class GameBoard {
    private scene: Phaser.Scene;
    private x: number;
    private y: number;
    private boxes: Box[];
    private walls: Wall[];
    private tiles: (Tile|Wall)[][] = [];
    private character: Character;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x; // x position of the top-left corner
        this.y = y; // y position of the top-left corner
        this.character = new Character(scene);

        this.boxes = [];
        this.walls = [];
        this.generateBackground();
        this.levelOne(); 
    }

    generateBackground(): void {
        this.tiles = [];
        
        for (let i = 0; i < BOARD_HEIGHT; i++) {
            let row: (Tile | Wall)[] = [];  // The row can contain both Tile and Wall objects
            for (let j = 0; j < BOARD_LENGTH; j++) {
                let tileX = this.x + j;
                let tileY = this.y + i;
        
                // Check if it's the first row, last row, first column, or last column
                if (i === 0 || i === BOARD_HEIGHT - 1 || j === 0 || j === BOARD_LENGTH - 1) {
                    const wall = new Wall(this.scene, tileX, tileY);
                    this.walls.push(wall);
                    row.push(wall);
                } else {
                    const tile = new Tile(this.scene, tileX, tileY);
                    row.push(tile);
                }
            }
            this.tiles.push(row);
        }

    }

    createLevel(playerPosition: Position, boxPositions: Position[]): void {
    
        this.boxes.forEach(box => { box.sprite.destroy(); });
        this.boxes = [];

        this.character.initSprite(playerPosition.x, playerPosition.y);
        this.handleWallCollisions();

        boxPositions.forEach(box => this.boxes.push(new Box(this.scene, box.x, box.y, this.character)));
    }

    levelOne(): void {
        console.log("lvl 1");
        const boxPositions: Position[] = [
            { x: 5, y: 6 },
            { x: 5, y: 12 },
            { x: 2, y: 12 },
            { x: 7, y: 12 },
            { x: 2, y: 14 }
        ];

        const playerPosition: Position = { x: 2, y: 6 };

        this.createLevel(playerPosition, boxPositions);
    }

    getTileAt(row: number, col: number): Tile | Wall | null {
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

    handleWallCollisions(): void {
        console.log("ASdas");
        if (!this.character) return;
        console.log("ASdas2");
        // Add collider between character sprite and all wall sprites
        this.walls.forEach(wall => {
            this.scene.physics.add.collider(this.character.sprite, wall.getSprite(), this.wallCollisionHandler, undefined, this);
        });
    }
    
    private wallCollisionHandler(): void { 
        console.log(":hie");
        if (!this.character) return;
    
        // Explode the character
       // this.character.sprite.destroy(); // or you can play an explosion animation
        
       this.character.move("right");
       this.levelOne();

        // Reset the level after a small delay to give some feedback to the player
        this.scene.time.delayedCall(1000, () => { // delay for 1 second
            this.levelOne();
        });
    }
    
}

export default GameBoard;
