import { Box } from "./Box";
import { Tile } from "./Tile";
import { Wall } from "./Wall";

import { Character } from "./Character";
import { BOARD_HEIGHT, BOARD_LENGTH, TILE_SIZE } from '../utils/Constants';
import { GameState, Position, GAME_STATE, Level } from "../utils/GameState";

export class GameBoard {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        GAME_STATE.character = new Character(scene);
        this.setupBoard();
        this.loadCurrentLevel(); 
    }

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
    
    private setupBoard(): void {
        GAME_STATE.board = [];
        
        for (let i = 0; i < BOARD_HEIGHT; i++) {
            let row: (Tile | Wall)[] = [];
            for (let j = 0; j < BOARD_LENGTH; j++) {
                row.push(this.createBoardTile(i, j));
            }
            GAME_STATE.board.push(row);
        }
    }
    
    
    private loadCurrentLevel(): void {
        const level = this.getLevelById(GAME_STATE.currentLevel);
        if (!level) {
            console.error(`No level found with id: ${GAME_STATE.currentLevel}`);
            return;
        }
        this.createLevel(level);
    }
    
    private getLevelById(id: number): Level | undefined {
        return GAME_STATE.levels.find(lvl => lvl.id === id);
    }

    private createLevel(level: Level): void {
        GAME_STATE.boxes.forEach(box => box.sprite.destroy());
        GAME_STATE.boxes = [];

        GAME_STATE.character?.initSprite(level.playerStartPosition.x, level.playerStartPosition.y);
        this.handleWallCollisions();

        level.boxPositions.forEach(pos => GAME_STATE.boxes.push(new Box(this.scene, pos.x, pos.y, GAME_STATE.character)));
    }

    getTileAt(row: number, col: number): Tile | Wall | null {
        if (row >= 0 && row < GAME_STATE.board.length && col >= 0 && col < GAME_STATE.board[row].length) {
            return GAME_STATE.board[row][col];
        }
        return null;
    }

    move(direction: 'left' | 'right' | 'up' | 'down'): void {
        if (!GAME_STATE.character) {
            console.error("Character not initialized.");
            return;
        }
        GAME_STATE.character.move(direction);
    }
    

    private handleWallCollisions(): void {
        GAME_STATE.walls.forEach(wall => {
            this.scene.physics.add.collider(wall.getSprite(), GAME_STATE.character!.sprite, this.wallCollisionHandler, undefined, this);
        });
    }
    
    private wallCollisionHandler(): void { 
        if (GAME_STATE.character?.isColliding) {
            return; // If a collision is already being handled, return early
        }
        
        GAME_STATE.character!.isColliding = true;
    
        // Explode the character
       // this.character.sprite.destroy(); // or you can play an explosion animation
       GAME_STATE.character?.collisionEffect();

        
        // Reset the level after a small delay to give some feedback to the player
        this.scene.time.delayedCall(1000, () => { // delay for 1 second
            this.loadCurrentLevel();
        });
    }
    
}

export default GameBoard;
