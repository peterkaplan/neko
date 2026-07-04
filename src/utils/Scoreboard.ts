import { GAME_STATE } from "../utils/GameState";
import { GAME_WIDTH } from "../utils/Constants";
import { todayDateLabel } from "./Daily";

const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'PixelFont',
    color: '#cfe3c2',
    stroke: '#0c100a',
    strokeThickness: 4,
};

// Minimal HUD floating over the backdrop: hearts top-left, big gold score
// top-center with a mode/date line under it
export class Scoreboard {

    private scoreText: Phaser.GameObjects.Text;
    private hearts: Phaser.GameObjects.Image[] = [];
    private subtitle: Phaser.GameObjects.Text;

    constructor(private scene: Phaser.Scene) {
        const centerX = GAME_WIDTH / 2;

        scene.add.text(centerX, 30, 'SCORE', { ...TEXT_STYLE, fontSize: '14px' })
            .setOrigin(0.5, 0);
        this.scoreText = scene.add.text(centerX, 54, GAME_STATE.score.toString(), {
            ...TEXT_STYLE,
            fontSize: '30px',
            color: '#f2d032',
            strokeThickness: 6,
        }).setOrigin(0.5, 0);

        this.subtitle = scene.add.text(centerX, 100, this.subtitleText(), { ...TEXT_STYLE, fontSize: '12px', color: '#93ab88' })
            .setOrigin(0.5, 0);

        for (let i = 0; i < GAME_STATE.maxLives; i++) {
            this.hearts.push(scene.add.image(42 + i * 36, 44, 'heart').setScale(2.5));
        }
    }

    private subtitleText(): string {
        if (GAME_STATE.mode === 'daily') {
            return `DAILY · ${todayDateLabel()}`;
        }
        const label = GAME_STATE.difficulty === 'hard' ? 'ENDLESS HARD' : 'ENDLESS';
        return `${label} · LV ${GAME_STATE.currentLevel}`;
    }

    public update(): void {
        this.scoreText.setText(GAME_STATE.score.toString());
        this.hearts.forEach((heart, i) => {
            heart.setAlpha(i < GAME_STATE.lives ? 1 : 0.25);
            heart.setTint(i < GAME_STATE.lives ? 0xffffff : 0x555555);
        });
        this.subtitle.setText(this.subtitleText());
    }
}

export default Scoreboard;
