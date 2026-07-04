import { Character } from "./Character";
import { GAME_STATE } from "../utils/GameState";
import { getDailyStats, markTodayCompleted } from "../utils/Daily";
import { posthog, distinctId } from '../utils/posthog';
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
            this.setUpBoard();
        }

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
    
    // Character death
    private wallCollisionHandler(): void {
        this.scene.sound.play('sfx_death');

        // Explode the character
        GAME_STATE.character?.collisionEffect();

        GAME_STATE.lives -= 1;

        posthog.capture({
            distinctId,
            event: 'player wall collision',
            properties: {
                score: GAME_STATE.score,
                level: GAME_STATE.currentLevel,
                mode: GAME_STATE.mode,
                difficulty: GAME_STATE.difficulty,
                lives_remaining: GAME_STATE.lives,
            },
        });

        // Reset the level after a small delay to give some feedback to the player
        this.scene.time.delayedCall(1000, () => { // delay for 1 second
            if (GAME_STATE.lives <= 0) {
                this.scene.scene.start('GameOver');
            } else {
                this.initializeLevel();
            }
        });
    }

    private boxCollisionHandler(box: any): void  {
        this.scene.sound.play('sfx_collect');

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
        this.scene.sound.play('sfx_clear');
        this.levelManager.handleLevelComplete();
        GAME_STATE.score += 100;

        if (GAME_STATE.mode === 'daily') {
            GAME_STATE.score += GAME_STATE.lives * 50; // reward surviving lives
            markTodayCompleted(GAME_STATE.score);
            const stats = getDailyStats();
            posthog.capture({
                distinctId,
                event: 'daily puzzle completed',
                properties: {
                    score: GAME_STATE.score,
                    lives_remaining: GAME_STATE.lives,
                    streak: stats.streak,
                    total_completed: stats.completed,
                },
            });
            this.scene.time.delayedCall(1000, () => {
                this.scene.scene.start('DailyClear');
            });
            return;
        }

        posthog.capture({
            distinctId,
            event: 'level completed',
            properties: {
                score: GAME_STATE.score,
                level: GAME_STATE.currentLevel,
                difficulty: GAME_STATE.difficulty,
                lives_remaining: GAME_STATE.lives,
            },
        });

        this.scene.time.delayedCall(1000, () => { // delay for 1 second
            GAME_STATE.currentLevel++;
            this.initializeLevel();
        });
    }
}

export default GameBoard;
