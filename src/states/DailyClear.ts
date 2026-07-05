import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, textResolution } from '../utils/Constants';
import { GAME_STATE } from '../utils/GameState';
import { buildShareMessage, getDailyStats, getTodayResult, todayDateLabel } from '../utils/Daily';
import { addSky } from '../utils/Sky';
import { posthog, distinctId } from '../utils/posthog';

class DailyClear extends Phaser.Scene {
    private shareLabel?: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'DailyClear' });
    }

    create(): void {
        this.cameras.main.fadeIn(400, 0, 0, 0);

        addSky(this);

        const centerX = GAME_WIDTH / 2;

        this.add.text(centerX, 150, `DAILY · ${todayDateLabel()}`, {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '16px',
            color: '#93ab88',
            stroke: '#0c100a',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.add.text(centerX, 215, 'CLEAR!', {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '44px',
            color: '#f2d032',
            stroke: '#0c100a',
            strokeThickness: 8,
        }).setOrigin(0.5);

        const livesLeft = getTodayResult()?.lives ?? GAME_STATE.lives;
        for (let i = 0; i < 3; i++) {
            this.add.image(centerX - 40 + i * 40, 262, 'heart')
                .setScale(3)
                .setAlpha(i < livesLeft ? 1 : 0.25);
        }

        this.add.text(centerX, 305, `SCORE ${GAME_STATE.score}`, {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '20px',
            color: '#f4efe2',
            stroke: '#0c100a',
            strokeThickness: 4,
        }).setOrigin(0.5);

        const stats = getDailyStats();
        this.add.text(centerX, 350, `SOLVED ${stats.completed} · STREAK ${stats.streak}`, {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '14px',
            color: '#f4efe2',
            stroke: '#0c100a',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.add.text(centerX, 390, 'COME BACK TOMORROW!', {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '13px',
            color: '#1f4e6e',
        }).setOrigin(0.5);

        this.shareLabel = this.addButton(centerX, 460, 'button_red', 'SHARE', () => this.share());
        this.addButton(centerX, 530, 'button_dark', 'ENDLESS', () => {
            GAME_STATE.mode = 'endless';
            this.goTo('Play');
        });
        this.addButton(centerX, 600, 'button_dark', 'MENU', () => this.goTo('Start'));
    }

    private async share(): Promise<void> {
        const message = buildShareMessage();
        try {
            // Mobile gets the native share sheet; desktop copies to clipboard
            // (desktop Chrome exposes navigator.share too, but its dialog is clunky)
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isMobile && navigator.share) {
                await navigator.share({ text: message });
                posthog.capture({ distinctId, event: 'result shared', properties: { method: 'native_share', score: GAME_STATE.score } });
                return;
            }
            await navigator.clipboard.writeText(message);
            posthog.capture({ distinctId, event: 'result shared', properties: { method: 'clipboard', score: GAME_STATE.score } });
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
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(sceneKey);
        });
    }
}

export default DailyClear;
