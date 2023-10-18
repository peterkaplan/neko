import Box from "../objects/Box";
import { Tile } from "../objects/Tile";
import { Wall } from "../objects/Wall";

import { BOARD_HEIGHT, BOARD_LENGTH } from '../utils/Constants';
import { GAME_STATE, Level,  } from "../utils/GameState";

export class LevelManager {
    constructor(private scene: Phaser.Scene) {}
    
    public loadCurrentLevel(): void {
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
        level.boxPositions.forEach(pos => GAME_STATE.boxes.push(new Box(this.scene, pos.x, pos.y)));
    }

    public handleLevelComplete(): void { 
        console.log("Level complete!");
        GAME_STATE.character?.winEffect();
    }
}