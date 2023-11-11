import { Character } from "./Character";
import { GAME_STATE, resetGameState } from "../utils/GameState";
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
        GAME_STATE.character.initSprite(3, 3);

        this.initializeLevel();
    }

    private setUpBoard(){
        this.boardInitializer.setupBoard();
        this.setUpBoardCollisions();
    }

    private initializeLevel(){
        // To do update this to only teardown board if board changes
        if (!this.levelManager.getLevelById(GAME_STATE.currentLevel)) {
            this.boardInitializer.tearDownBoard();
        }

        this.setUpBoard();
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
    
    private gameOver(): void {
        if (GAME_STATE.lives === 0) {
          resetGameState();
        }
    }

    // Character death
    private wallCollisionHandler(): void { 
        console.log("Wall collision", GAME_STATE.currentlyColliding);
        if (GAME_STATE.currentlyColliding) {
            return;
        }

        // Explode the character
        GAME_STATE.character?.collisionEffect();

        GAME_STATE.lives -= 1;
            
        // Reset the level after a small delay to give some feedback to the player
        this.scene.time.delayedCall(1000, () => { // delay for 1 second
            this.gameOver();
            this.initializeLevel();
        });
    }

    private boxCollisionHandler(box: any): void  {
        // Destroy the box
        box.sprite.destroy();
        GAME_STATE.boxes = GAME_STATE.boxes.filter(b => b !== box);
        GAME_STATE.character?.handleBoxCollision(box);

        GAME_STATE.score += 10;

        if (GAME_STATE.boxes.length === 0) {
            this.winLevel();
        }
    }    

    private winLevel() {
        this.levelManager.handleLevelComplete();
        GAME_STATE.score += 100;
        this.scene.time.delayedCall(1000, () => { // delay for 1 second
            GAME_STATE.currentLevel++;
            this.initializeLevel();
        });
    }
}

export default GameBoard;
