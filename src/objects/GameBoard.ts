import { Box } from "./Box";
import { Tile } from "./Tile";
import { Wall } from "./Wall";

import { Character } from "./Character";
import { BOARD_HEIGHT, BOARD_LENGTH, TILE_SIZE } from '../utils/Constants';
import { GameState, Position, GAME_STATE, Level } from "../utils/GameState";
import { BoardInitializer } from "../utils/BoardInitializer";
import { LevelManager } from "../utils/LevelManager";

export class GameBoard {
    private scene: Phaser.Scene;
    private boardInitializer: BoardInitializer;
    private levelManager: LevelManager;

    constructor(scene: Phaser.Scene, boardInitializer: BoardInitializer, levelManager: LevelManager) {
        this.scene = scene;
        this.boardInitializer = boardInitializer;
        this.levelManager = levelManager;

        GAME_STATE.character = new Character(scene);
        GAME_STATE.character.initSprite(2, 6);

        this.setUpBoard();
        this.initializeLevel();
    }

    private setUpBoard(){
        this.boardInitializer.setupBoard();
        this.setUpBoardCollisions();
    }

    private initializeLevel(){
        this.levelManager.loadCurrentLevel();
        this.setUpBoxCollisions(); 
    }

    private setUpBoxCollisions(): void {
        GAME_STATE.boxes.forEach(box => {
            this.scene.physics.add.collider(box.sprite, GAME_STATE.character!.sprite, () => this.boxCollisionHandler(box), undefined, this);
        });
    }

    private setUpBoardCollisions(): void {
        GAME_STATE.walls.forEach(wall => {
            this.scene.physics.add.collider(wall.getSprite(), GAME_STATE.character!.sprite, this.wallCollisionHandler, undefined, this);
        });
    }
    
    private wallCollisionHandler(): void { 
        if (GAME_STATE.currentlyColliding) {
            return;
        }

        // Explode the character
        GAME_STATE.character?.collisionEffect();
        
        // Reset the level after a small delay to give some feedback to the player
        this.scene.time.delayedCall(1000, () => { // delay for 1 second
            this.initializeLevel();
        });
    }

    private boxCollisionHandler(box: any): void  {
        // Destroy the box
        box.sprite.destroy();
        GAME_STATE.boxes = GAME_STATE.boxes.filter(b => b !== box);

        GAME_STATE.character?.handleBoxCollision(box);
        console.log(GAME_STATE.boxes.length);
        if (GAME_STATE.boxes.length === 0) {
            this.levelManager.handleLevelComplete();
            this.scene.time.delayedCall(1000, () => { // delay for 1 second
                this.initializeLevel();
            });
        }
    }    
}

export default GameBoard;
