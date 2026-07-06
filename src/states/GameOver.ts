import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, textResolution } from '../utils/Constants';
import { GAME_STATE } from '../utils/GameState';
import { todayDateLabel } from '../utils/Daily';
import { addSky } from '../utils/Sky';
import { getEndlessBest, recordEndlessScore } from '../utils/HighScores';
import { buildEndlessShareMessage } from '../utils/Share';
import { posthog, distinctId } from '../utils/posthog';

class GameOver extends Phaser.Scene {
    private shareLabel?: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'GameOver' });
    }

    create(): void {
        this.cameras.main.fadeIn(200, 0, 0, 0);

        addSky(this);
        // dusky red veil over the sky so the defeat screen still reads as somber
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x3a1620, 0.5).setOrigin(0);

        const centerX = GAME_WIDTH / 2;

        this.add.text(centerX, 190, 'GAME OVER', {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '40px',
            color: '#e8384f',
            stroke: '#0c100a',
            strokeThickness: 8,
        }).setOrigin(0.5);

        this.add.text(centerX, 290, `SCORE ${GAME_STATE.score}`, {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '20px',
            color: '#f4efe2',
            stroke: '#0c100a',
            strokeThickness: 4,
        }).setOrigin(0.5);

        const context = GAME_STATE.mode === 'daily' ? `DAILY · ${todayDateLabel()}` : `LEVEL ${GAME_STATE.currentLevel}`;
        this.add.text(centerX, 330, context, {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '14px',
            color: '#93ab88',
        }).setOrigin(0.5);

        posthog.capture({
            distinctId,
            event: 'game over',
            properties: {
                score: GAME_STATE.score,
                level: GAME_STATE.currentLevel,
                mode: GAME_STATE.mode,
                difficulty: GAME_STATE.difficulty,
            },
        });

        let nextY = 440;
        if (GAME_STATE.mode === 'endless') {
            const isNewBest = recordEndlessScore(GAME_STATE.difficulty, GAME_STATE.score);
            if (isNewBest) {
                posthog.capture({
                    distinctId,
                    event: 'endless high score set',
                    properties: {
                        score: GAME_STATE.score,
                        level: GAME_STATE.currentLevel,
                        difficulty: GAME_STATE.difficulty,
                    },
                });
            }
            const label = isNewBest ? 'NEW BEST!' : `BEST ${getEndlessBest(GAME_STATE.difficulty)}`;
            this.add.text(centerX, 375, label, {
                fontFamily: 'PixelFont',
                resolution: textResolution(),
                fontSize: '15px',
                color: isNewBest ? '#f2d032' : '#cfe3c2',
                stroke: '#0c100a',
                strokeThickness: 4,
            }).setOrigin(0.5);

            this.shareLabel = this.addButton(centerX, nextY, 'button_dark', isNewBest ? 'SHARE NEW BEST' : 'SHARE', () => {
                void this.shareEndless(isNewBest);
            });
            nextY += 70;
        }

        this.addButton(centerX, nextY, 'button_red', 'RETRY', () => {
            posthog.capture({
                distinctId,
                event: 'game retried',
                properties: { mode: GAME_STATE.mode, difficulty: GAME_STATE.difficulty, score: GAME_STATE.score },
            });
            this.goTo('Play');
        });
        this.addButton(centerX, nextY + 70, 'button_dark', 'MENU', () => this.goTo('Start'));
    }

    private async shareEndless(isNewBest: boolean): Promise<void> {
        const message = buildEndlessShareMessage(GAME_STATE.score, GAME_STATE.difficulty, isNewBest);
        const properties = {
            mode: 'endless',
            score: GAME_STATE.score,
            difficulty: GAME_STATE.difficulty,
            new_best: isNewBest,
        };
        try {
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isMobile && navigator.share) {
                await navigator.share({ text: message });
                posthog.capture({ distinctId, event: 'result shared', properties: { ...properties, method: 'native_share' }, instant: true });
                return;
            }
            await navigator.clipboard.writeText(message);
            posthog.capture({ distinctId, event: 'result shared', properties: { ...properties, method: 'clipboard' }, instant: true });
            this.shareLabel?.setText('COPIED!');
            this.time.delayedCall(1500, () => this.shareLabel?.setText(isNewBest ? 'SHARE NEW BEST' : 'SHARE'));
        } catch {
            // share sheet dismissed or clipboard denied — nothing to record
        }
    }

    private addButton(x: number, y: number, texture: string, label: string, onClick: () => void): Phaser.GameObjects.Text {
        const pill = this.add.image(x, y, texture).setScale(1.8).setInteractive({ useHandCursor: true });
        // Taps only: a leftover swipe from gameplay must not click through
        pill.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, (pointer: Phaser.Input.Pointer) => {
            if (Math.max(Math.abs(pointer.upX - pointer.downX), Math.abs(pointer.upY - pointer.downY)) > 12) return;
            onClick();
        });
        pill.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => pill.setTint(0xddeecc));
        pill.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => pill.clearTint());
        return this.add.text(x, y, label, {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '15px',
            color: '#f4efe2',
            stroke: '#0c100a',
            strokeThickness: 4,
        }).setOrigin(0.5);
    }

    private goTo(sceneKey: string): void {
        this.cameras.main.fadeOut(150, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(sceneKey);
        });
    }
}

export default GameOver;
