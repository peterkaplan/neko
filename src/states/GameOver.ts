import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../utils/Constants';
import { GAME_STATE } from '../utils/GameState';
import { todayDateLabel } from '../utils/Daily';
import { addSky } from '../utils/Sky';

class GameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOver' });
    }

    create(): void {
        this.cameras.main.fadeIn(400, 0, 0, 0);

        addSky(this);
        // dusky red veil over the sky so the defeat screen still reads as somber
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x3a1620, 0.5).setOrigin(0);

        const centerX = GAME_WIDTH / 2;

        this.add.text(centerX, 190, 'GAME OVER', {
            fontFamily: 'PixelFont',
            fontSize: '40px',
            color: '#e8384f',
            stroke: '#0c100a',
            strokeThickness: 8,
        }).setOrigin(0.5);

        this.add.text(centerX, 290, `SCORE ${GAME_STATE.score}`, {
            fontFamily: 'PixelFont',
            fontSize: '20px',
            color: '#f4efe2',
            stroke: '#0c100a',
            strokeThickness: 4,
        }).setOrigin(0.5);

        const context = GAME_STATE.mode === 'daily' ? `DAILY · ${todayDateLabel()}` : `LEVEL ${GAME_STATE.currentLevel}`;
        this.add.text(centerX, 330, context, {
            fontFamily: 'PixelFont',
            fontSize: '14px',
            color: '#93ab88',
        }).setOrigin(0.5);

        this.addButton(centerX, 440, 'button_red', 'RETRY', () => this.goTo('Play'));
        this.addButton(centerX, 510, 'button_dark', 'MENU', () => this.goTo('Start'));
    }

    private addButton(x: number, y: number, texture: string, label: string, onClick: () => void): void {
        const pill = this.add.image(x, y, texture).setScale(1.8).setInteractive({ useHandCursor: true });
        pill.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, onClick);
        pill.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => pill.setTint(0xddeecc));
        pill.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => pill.clearTint());
        this.add.text(x, y, label, {
            fontFamily: 'PixelFont',
            fontSize: '15px',
            color: '#f4efe2',
            stroke: '#0c100a',
            strokeThickness: 4,
        }).setOrigin(0.5);
    }

    private goTo(sceneKey: string): void {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(sceneKey);
        });
    }
}

export default GameOver;
