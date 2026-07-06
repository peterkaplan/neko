import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, textResolution } from '../utils/Constants';
import { GAME_STATE } from '../utils/GameState';
import { getDailyStats, getTodayResult, isTodayCompleted, todayDateLabel } from '../utils/Daily';
import { addSky, preloadSky } from '../utils/Sky';
import { getEndlessBest } from '../utils/HighScores';
import { renderDailyStats } from '../utils/StatsPanel';
import { posthog, distinctId } from '../utils/posthog';

// Mini board for the How to Play demo
const DEMO_TILE = 48;
const DEMO_COLS = 7;
const DEMO_ROWS = 3;

class Start extends Phaser.Scene {
    constructor() {
        super({ key: 'Start' });
    }

    preload(): void {
        preloadSky(this);
        if (!this.textures.exists('button_dark')) this.load.image('button_dark', 'assets/generated/button_dark.png');
        if (!this.textures.exists('button_red')) this.load.image('button_red', 'assets/generated/button_red.png');
        if (!this.textures.exists('grass_a')) this.load.image('grass_a', 'assets/generated/grass_a.png');
        if (!this.textures.exists('grass_b')) this.load.image('grass_b', 'assets/generated/grass_b.png');
        if (!this.textures.exists('particle')) this.load.image('particle', 'assets/generated/particle.png');
        if (!this.textures.exists('heart')) this.load.image('heart', 'assets/generated/heart.png');
        this.load.image('title_cat', 'assets/images/cat_right_idle.png');
        if (!this.textures.exists('fish')) this.load.svg('fish', 'assets/generated/fish.svg', { width: 128, height: 128 });
        this.load.image('logo', 'assets/images/logo.png');
        this.load.image('key_right', 'assets/generated/key_right.png');
        if (!this.textures.exists('trophy')) this.load.image('trophy', 'assets/generated/trophy.png');
    }

    create(): void {
        this.cameras.main.fadeIn(200, 0, 0, 0);

        addSky(this);

        const centerX = GAME_WIDTH / 2;

        const logoImage = this.add.image(centerX, 170, 'logo');
        logoImage.setScale(Math.min(340, GAME_WIDTH - 40) / logoImage.width);

        const cat = this.add.image(centerX - 55, 360, 'title_cat');
        cat.setScale(0.85);
        this.add.image(centerX + 90, 390, 'fish').setScale(0.9);

        // Gentle idle bob so the title screen feels alive
        this.tweens.add({
            targets: cat,
            y: 350,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Fires on the menu tap itself (before the tutorial or difficulty
        // chooser), so pageview → click-through is measurable directly
        this.addButton(centerX, GAME_HEIGHT - 250, 'button_red', `DAILY · ${todayDateLabel()}`, () => {
            posthog.capture({ distinctId, event: 'play button clicked', properties: { mode: 'daily' } });
            this.startGame('daily');
        });
        this.addButton(centerX, GAME_HEIGHT - 180, 'button_dark', 'ENDLESS', () => {
            posthog.capture({ distinctId, event: 'play button clicked', properties: { mode: 'endless' } });
            this.showEndlessChooser();
        });
        // New players get the tutorial on their first game start instead;
        // the button is a re-read affordance so it only shows after that
        if (this.helpSeen()) {
            this.addButton(centerX, GAME_HEIGHT - 110, 'button_dark', 'HOW TO PLAY', () => this.showHowToPlay('button'));
        }

        this.add.text(centerX, GAME_HEIGHT - 50, 'M TO MUTE', {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '11px',
            color: '#1f4e6e',
        }).setOrigin(0.5);

        // Trophy in the top-right corner opens the stats screen
        const trophyBtn = this.add.image(GAME_WIDTH - 44, 44, 'trophy')
            .setScale(1.8)
            .setInteractive({ useHandCursor: true });
        trophyBtn.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, (pointer: Phaser.Input.Pointer) => {
            if (Math.max(Math.abs(pointer.upX - pointer.downX), Math.abs(pointer.upY - pointer.downY)) > 12) return;
            this.showStats();
        });
        trophyBtn.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => trophyBtn.setScale(2));
        trophyBtn.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => trophyBtn.setScale(1.8));

    }

    private helpSeen(): boolean {
        try {
            return localStorage.getItem('neko-help-seen') !== null;
        } catch {
            // storage unavailable — treat as seen so the button still exists
            return true;
        }
    }

    // Full-screen dark layer that swallows clicks; optionally tap-to-close
    private makeOverlay(closeOnTap = true): Phaser.GameObjects.Container {
        const overlay = this.add.container(0, 0).setDepth(100);
        const dim = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0c100a, 0.96)
            .setOrigin(0)
            .setInteractive({ useHandCursor: closeOnTap });
        if (closeOnTap) {
            // A pointer that went down before the overlay existed is the tap
            // that opened it — it must not immediately close it again
            const openedAt = performance.now();
            dim.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, (pointer: Phaser.Input.Pointer) => {
                if (pointer.downTime <= openedAt) return;
                overlay.destroy();
            });
        }
        overlay.add(dim);
        return overlay;
    }

    private showStats(): void {
        posthog.capture({ distinctId, event: 'stats viewed' });
        const overlay = this.makeOverlay();
        const centerX = GAME_WIDTH / 2;
        const stats = getDailyStats();

        overlay.add(this.add.image(centerX, 92, 'trophy').setScale(2.5));
        overlay.add(this.add.text(centerX, 148, 'STATS', {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '24px',
            color: '#f2d032',
            stroke: '#0c100a',
            strokeThickness: 6,
        }).setOrigin(0.5));

        renderDailyStats(this, go => overlay.add(go), 225);

        // Endless bests
        overlay.add(this.add.text(centerX, 530, 'ENDLESS BEST', {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '11px',
            color: '#f2d032',
        }).setOrigin(0.5));
        overlay.add(this.add.text(centerX, 568, `NORMAL ${getEndlessBest('normal')} · HARD ${getEndlessBest('hard')}`, {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '14px',
            color: '#f4efe2',
            stroke: '#0c100a',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: GAME_WIDTH - 32 },
        }).setOrigin(0.5));

        overlay.add(this.add.text(centerX, GAME_HEIGHT - 60, 'TAP ANYWHERE TO CLOSE', {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '11px',
            color: '#93ab88',
        }).setOrigin(0.5));
    }

    private showEndlessChooser(): void {
        const overlay = this.makeOverlay();
        const centerX = GAME_WIDTH / 2;

        overlay.add(this.add.text(centerX, 230, 'ENDLESS', {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '26px',
            color: '#f2d032',
            stroke: '#0c100a',
            strokeThickness: 6,
        }).setOrigin(0.5));

        this.addButton(centerX, 330, 'button_red', 'NORMAL', () => {
            GAME_STATE.difficulty = 'normal';
            posthog.capture({ distinctId, event: 'difficulty selected', properties: { difficulty: 'normal' } });
            this.startGame('endless');
        }, overlay);
        const bestNormal = getEndlessBest('normal');
        overlay.add(this.add.text(centerX, 372, bestNormal > 0 ? `EASES YOU IN · BEST ${bestNormal}` : 'EASES YOU IN', {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '10px',
            color: '#93ab88',
        }).setOrigin(0.5));

        this.addButton(centerX, 440, 'button_dark', 'HARD', () => {
            GAME_STATE.difficulty = 'hard';
            posthog.capture({ distinctId, event: 'difficulty selected', properties: { difficulty: 'hard' } });
            this.startGame('endless');
        }, overlay);
        const bestHard = getEndlessBest('hard');
        overlay.add(this.add.text(centerX, 482, bestHard > 0 ? `BIGGER BOARDS, MORE FISH · BEST ${bestHard}` : 'BIGGER BOARDS, MORE FISH', {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '10px',
            color: '#93ab88',
        }).setOrigin(0.5));

        overlay.add(this.add.text(centerX, GAME_HEIGHT - 60, 'TAP ANYWHERE ELSE TO GO BACK', {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '11px',
            color: '#93ab88',
        }).setOrigin(0.5));
    }

    // source: 'auto' = shown on the way into a first game, 'button' = manual
    // tap; lets funnels filter to genuinely new players
    private showHowToPlay(source: 'auto' | 'button'): Phaser.GameObjects.Container {
        posthog.capture({ distinctId, event: 'how to play viewed', properties: { source } });
        const overlay = this.makeOverlay();
        const centerX = GAME_WIDTH / 2;
        const isTouch = navigator.maxTouchPoints > 0;

        overlay.add(this.add.text(centerX, 90, 'HOW TO PLAY', {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '26px',
            color: '#f2d032',
            stroke: '#0c100a',
            strokeThickness: 6,
        }).setOrigin(0.5));

        const caption = this.add.text(centerX, 170, '', {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '14px',
            color: '#f4efe2',
            align: 'center',
            lineSpacing: 8,
            wordWrap: { width: GAME_WIDTH - 32 },
        }).setOrigin(0.5);
        overlay.add(caption);

        // Mini board: checkered grass framed by a wall, one cat, two fish.
        // Tiles shrink on narrow (phone) screens so the board always fits.
        const tile = Math.min(DEMO_TILE, Math.floor((GAME_WIDTH - 40) / DEMO_COLS));
        const boardX = centerX - (DEMO_COLS * tile) / 2;
        const boardY = 250;
        for (let row = 0; row < DEMO_ROWS; row++) {
            for (let col = 0; col < DEMO_COLS; col++) {
                overlay.add(this.add.image(
                    boardX + col * tile + tile / 2,
                    boardY + row * tile + tile / 2,
                    (col + row) % 2 === 0 ? 'grass_a' : 'grass_b',
                ).setScale(tile / 32));
            }
        }
        const frame = this.add.graphics();
        frame.lineStyle(6, 0x2c5e36, 1);
        frame.strokeRect(boardX - 4, boardY - 4, DEMO_COLS * tile + 8, DEMO_ROWS * tile + 8);
        overlay.add(frame);

        const cellX = (col: number) => boardX + col * tile + tile / 2;
        const rowY = (row: number) => boardY + row * tile + tile / 2;
        const fishScale = 0.32 * (tile / DEMO_TILE);

        const fishA = this.add.image(cellX(4), rowY(1), 'fish').setScale(fishScale);
        const fishB = this.add.image(cellX(4), rowY(0), 'fish').setScale(fishScale);
        const cat = this.add.image(cellX(0), rowY(1), 'title_cat').setScale(0.19 * (tile / DEMO_TILE));
        overlay.add(fishA);
        overlay.add(fishB);
        overlay.add(cat);

        // The demo's lives, so "lose a heart" is something you can see happen
        const hearts: Phaser.GameObjects.Image[] = [];
        for (let i = 0; i < 3; i++) {
            const heart = this.add.image(centerX - 36 + i * 36, boardY + DEMO_ROWS * tile + 32, 'heart').setScale(2.5);
            hearts.push(heart);
            overlay.add(heart);
        }

        // Input indicator: a pulsing arrow keycap on desktop, a finger-dot
        // swipe on touch screens; both follow the direction being asked for
        const indicatorY = boardY + DEMO_ROWS * tile + 84;
        let pulse: (dir: 'right' | 'up') => void;
        if (isTouch) {
            const dot = this.add.circle(centerX, indicatorY, 9, 0xf4efe2).setAlpha(0);
            overlay.add(dot);
            pulse = (dir) => {
                if (!overlay.active) return;
                if (dir === 'right') {
                    dot.setPosition(centerX - 55, indicatorY).setAlpha(1);
                    this.tweens.add({ targets: dot, x: centerX + 55, alpha: 0.15, duration: 550, ease: 'Sine.easeOut' });
                } else {
                    dot.setPosition(centerX, indicatorY + 30).setAlpha(1);
                    this.tweens.add({ targets: dot, y: indicatorY - 30, alpha: 0.15, duration: 550, ease: 'Sine.easeOut' });
                }
            };
        } else {
            const key = this.add.image(centerX, indicatorY, 'key_right').setScale(2.2);
            overlay.add(key);
            pulse = (dir) => {
                if (!overlay.active) return;
                key.setRotation(dir === 'up' ? -Math.PI / 2 : 0);
                this.tweens.add({ targets: key, scale: 1.7, duration: 110, yoyo: true });
            };
        }

        overlay.add(this.add.text(centerX, GAME_HEIGHT - 90, 'A NEW DAILY PUZZLE EVERY DAY AT MIDNIGHT', {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '11px',
            color: '#93ab88',
            align: 'center',
            wordWrap: { width: GAME_WIDTH - 32 },
        }).setOrigin(0.5));

        overlay.add(this.add.text(centerX, GAME_HEIGHT - 50, source === 'auto' ? 'TAP ANYWHERE TO PLAY' : 'TAP ANYWHERE TO CLOSE', {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '11px',
            color: '#f2d032',
        }).setOrigin(0.5));

        // ---- self-playing demo: three quick beats, loops until dismissed ----
        const at = (ms: number, fn: () => void) => this.time.delayedCall(ms, () => {
            if (overlay.active) fn();
        });

        const moveWord = isTouch ? 'SWIPE' : 'ARROW KEYS';

        const runDemo = () => {
            if (!overlay.active) return;
            cat.setPosition(cellX(0), rowY(1)).setAlpha(1);
            fishA.setScale(fishScale);
            fishB.setScale(fishScale);
            hearts.forEach(h => h.setAlpha(1));

            caption.setText(`${moveWord} TO MOVE — NEKO SLIDES\nUNTIL A FISH STOPS HIM`);
            pulse('right');
            at(400, () => this.tweens.add({
                targets: cat, x: cellX(4), duration: 450, ease: 'Linear',
                onComplete: () => {
                    if (!overlay.active) return;
                    this.burst(overlay, cellX(4), rowY(1));
                    this.tweens.add({ targets: fishA, scale: 0, duration: 150 });
                },
            }));

            at(2000, () => {
                caption.setText('NO FISH AHEAD? HE CRASHES.\nA CRASH COSTS ONE HEART');
                pulse('right');
            });
            at(2400, () => this.tweens.add({
                targets: cat, x: cellX(6) + tile / 2 - 10, duration: 350, ease: 'Linear',
                onComplete: () => {
                    if (!overlay.active) return;
                    cat.setAlpha(0);
                    this.burst(overlay, cellX(6) + tile / 2, rowY(1), 0xff7d6a);
                    hearts[2].setAlpha(0.2);
                },
            }));

            at(4000, () => {
                cat.setPosition(cellX(4), rowY(1)).setAlpha(1);
                caption.setText('CATCH EVERY FISH\nTO CLEAR THE PUZZLE');
                pulse('up');
            });
            at(4400, () => this.tweens.add({
                targets: cat, y: rowY(0), duration: 350, ease: 'Linear',
                onComplete: () => {
                    if (!overlay.active) return;
                    this.burst(overlay, cellX(4), rowY(0));
                    this.tweens.add({ targets: fishB, scale: 0, duration: 150 });
                },
            }));

            at(6200, runDemo);
        };
        runDemo();

        return overlay;
    }

    private burst(overlay: Phaser.GameObjects.Container, x: number, y: number, tint?: number): void {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const p = this.add.image(x, y, 'particle').setScale(2);
            if (tint !== undefined) p.setTint(tint);
            overlay.add(p);
            this.tweens.add({
                targets: p,
                x: x + Math.cos(angle) * 42,
                y: y + Math.sin(angle) * 42,
                alpha: 0,
                scale: 0.5,
                duration: 380,
                onComplete: () => p.destroy(),
            });
        }
    }

    private addButton(x: number, y: number, texture: string, label: string, onClick: () => void, container?: Phaser.GameObjects.Container): Phaser.GameObjects.Text {
        const pill = this.add.image(x, y, texture).setScale(1.8).setInteractive({ useHandCursor: true });
        // Taps only, so stray swipes don't trigger buttons
        pill.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, (pointer: Phaser.Input.Pointer) => {
            if (Math.max(Math.abs(pointer.upX - pointer.downX), Math.abs(pointer.upY - pointer.downY)) > 12) return;
            onClick();
        });
        pill.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => pill.setTint(0xddeecc));
        pill.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => pill.clearTint());
        const text = this.add.text(x, y, label, {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '15px',
            color: '#f4efe2',
            stroke: '#0c100a',
            strokeThickness: 4,
        }).setOrigin(0.5);
        if (container) {
            container.add(pill);
            container.add(text);
        }
        return text;
    }

    startGame(mode: 'endless' | 'daily'): void {
        // First game ever: the tutorial appears on the way in, and dismissing
        // it continues into the game they asked for
        if (!this.helpSeen()) {
            try {
                localStorage.setItem('neko-help-seen', '1');
            } catch {
                // storage unavailable
            }
            this.showHowToPlay('auto').once(Phaser.GameObjects.Events.DESTROY, () => {
                if (this.scene.isActive()) this.startGame(mode);
            });
            return;
        }
        GAME_STATE.mode = mode;
        posthog.capture({
            distinctId,
            event: 'game started',
            properties: {
                mode,
                difficulty: mode === 'endless' ? GAME_STATE.difficulty : undefined,
            },
        });
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('Play');
        });
    }
}

export default Start;
