import Box from "../objects/Box";

import { GAME_STATE, Level,  } from "../utils/GameState";
import { createLevel } from "./LevelGenerator";

export class LevelManager {
    constructor(private scene: Phaser.Scene) {
        this.generateLevelConfigs();
    }
    
    public loadCurrentLevel(): void {
        let level = this.getLevelById(GAME_STATE.currentLevel);
        if (!level) {
            level = createLevel();
            GAME_STATE.levels.push(level);
        }
        this.createLevel(level);
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
        for (let i = 0; i < 50; i++) {
            GAME_STATE.levelConfigs.push({
                level_number: i + 1,
                board_width: 6 + i,
                board_height: 7 + i,
                number_of_boxes: i,
            });
        }
    }
}