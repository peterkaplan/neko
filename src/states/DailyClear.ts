import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, textResolution } from '../utils/Constants';
import { GAME_STATE } from '../utils/GameState';
import { buildShareMessage, getTodayResult, todayDateLabel } from '../utils/Daily';
import { renderDailyStats } from '../utils/StatsPanel';
import { addSky } from '../utils/Sky';
import { posthog, distinctId } from '../utils/posthog';

class DailyClear extends Phaser.Scene {
    private shareLabel?: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'DailyClear' });
    }

    create(): void {
        this.cameras.main.fadeIn(200, 0, 0, 0);

        addSky(this);

        const centerX = GAME_WIDTH / 2;

        this.add.text(centerX, 85, `DAILY · ${todayDateLabel()}`, {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '15px',
            color: '#93ab88',
            stroke: '#0c100a',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.add.text(centerX, 135, 'CLEAR!', {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '36px',
            color: '#f2d032',
            stroke: '#0c100a',
            strokeThickness: 8,
        }).setOrigin(0.5);

        const livesLeft = getTodayResult()?.lives ?? GAME_STATE.lives;
        for (let i = 0; i < 3; i++) {
            this.add.image(centerX - 40 + i * 40, 186, 'heart')
                .setScale(3)
                .setAlpha(i < livesLeft ? 1 : 0.25);
        }

        this.add.text(centerX, 224, `SCORE ${GAME_STATE.score}`, {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '12px',
            color: '#93ab88',
            stroke: '#0c100a',
            strokeThickness: 3,
        }).setOrigin(0.5);

        // The Wordle moment: your record, right when you finish
        renderDailyStats(this, () => undefined, 272);

        this.shareLabel = this.addButton(centerX, 552, 'button_red', 'SHARE', () => this.share());
        this.addButton(centerX, 614, 'button_dark', 'ENDLESS', () => {
            GAME_STATE.mode = 'endless';
            // This path skips Start.startGame, so it captures its own start
            posthog.capture({
                distinctId,
                event: 'game started',
                properties: { mode: 'endless', difficulty: GAME_STATE.difficulty, entry: 'daily_clear' },
            });
            this.goTo('Play');
        });
        this.addButton(centerX, 676, 'button_dark', 'MENU', () => this.goTo('Start'));
    }

    private async share(): Promise<void> {
        const message = buildShareMessage();
        try {
            // Mobile gets the native share sheet; desktop copies to clipboard
            // (desktop Chrome exposes navigator.share too, but its dialog is clunky)
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isMobile && navigator.share) {
                await navigator.share({ text: message });
                posthog.capture({ distinctId, event: 'result shared', properties: { mode: 'daily', method: 'native_share', score: GAME_STATE.score }, instant: true });
                return;
            }
            await navigator.clipboard.writeText(message);
            posthog.capture({ distinctId, event: 'result shared', properties: { mode: 'daily', method: 'clipboard', score: GAME_STATE.score }, instant: true });
            this.shareLabel?.setText('COPIED!');
            this.time.delayedCall(1500, () => this.shareLabel?.setText('SHARE'));
        } catch {
            // user dismissed the share sheet, or clipboard is unavailable
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

export default DailyClear;
