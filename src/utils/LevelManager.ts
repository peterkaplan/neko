import Box from "../objects/Box";

import { GAME_STATE, Level,  } from "../utils/GameState";
import { createLevel } from "./LevelGenerator";
import { todayPuzzle } from "./Daily";

export class LevelManager {
    constructor(private scene: Phaser.Scene) {
        this.generateLevelConfigs();
        if (GAME_STATE.mode === 'daily') {
            const puzzle = todayPuzzle();
            GAME_STATE.dailyConfig = {
                level_number: 1,
                board_width: puzzle.board_width,
                board_height: puzzle.board_height,
                number_of_boxes: puzzle.jars.length,
            };
        }
    }

    public loadCurrentLevel(): void {
        let level = this.getLevelById(GAME_STATE.currentLevel);
        if (!level) {
            level = GAME_STATE.mode === 'daily' ? this.dailyLevel() : createLevel();
            GAME_STATE.levels.push(level);
        }
        this.createLevel(level);
    }

    private dailyLevel(): Level {
        const puzzle = todayPuzzle();
        return {
            id: GAME_STATE.currentLevel,
            playerStartPositionIndex: { ...puzzle.start },
            boxPositionsIndex: puzzle.jars.map(j => ({ ...j })),
        };
    }
    
    public getLevelById(id: number): Level | undefined {
        return GAME_STATE.levels.find(lvl => lvl.id === id);
    }

    private createLevel(level: Level): void {
        GAME_STATE.boxes.forEach(box => box.sprite.destroy());
        GAME_STATE.boxes = [];
        GAME_STATE.character?.initSprite(level.playerStartPositionIndex.x, level.playerStartPositionIndex.y);
        level.boxPositionsIndex.forEach(pos => GAME_STATE.boxes.push(new Box(this.scene, pos.x, pos.y)));
    }

    public handleLevelComplete(): void { 
        console.log("Level complete!");
        GAME_STATE.character?.winEffect();
    }

    public generateLevelConfigs(): void {
        if (GAME_STATE.levelConfigs.length > 0) {
            return;
        }
        // Jar count grows faster than board size, so later levels get denser
        // rather than emptier. Hard starts bigger/denser and ramps quicker.
        const hard = GAME_STATE.difficulty === 'hard';
        for (let i = 0; i < 50; i++) {
            const size = hard
                ? Math.min(9 + Math.floor(i / 2), 14)
                : Math.min(8 + Math.floor(i / 3), 12);
            GAME_STATE.levelConfigs.push({
                level_number: i + 1,
                board_width: size,
                board_height: size,
                number_of_boxes: hard
                    ? Math.min(5 + Math.floor((i * 2) / 3), 14)
                    : Math.min(3 + Math.floor(i / 2), 10),
            });
        }
    }
}