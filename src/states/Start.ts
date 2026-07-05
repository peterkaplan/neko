import Phaser from 'phaser';
import buttonDark from '../../assets/generated/button_dark.png';
import buttonRed from '../../assets/generated/button_red.png';
import catIdle from '../../assets/images/cat_right_idle.png';
import fishImg from '../../assets/generated/fish.png';
import logo from '../../assets/images/logo.png';
import grassA from '../../assets/generated/grass_a.png';
import grassB from '../../assets/generated/grass_b.png';
import keyRight from '../../assets/generated/key_right.png';
import particleImg from '../../assets/generated/particle.png';
import heartImg from '../../assets/generated/heart.png';
import { GAME_HEIGHT, GAME_WIDTH } from '../utils/Constants';
import { GAME_STATE } from '../utils/GameState';
import { todayDateLabel } from '../utils/Daily';
import { addSky, preloadSky } from '../utils/Sky';
import { getEndlessBest } from '../utils/HighScores';
import { posthog, distinctId } from '../utils/posthog';

// Mini board for the How to Play demo
const DEMO_TILE = 48;
const DEMO_COLS = 7;
const DEMO_ROWS = 3;

interface DemoParts {
    step: Phaser.GameObjects.Text;
    caption: Phaser.GameObjects.Text;
    cat: Phaser.GameObjects.Image;
    fishA: Phaser.GameObjects.Image;
    fishB: Phaser.GameObjects.Image;
    hearts: Phaser.GameObjects.Image[];
    cellX: (col: number) => number;
    rowY: (row: number) => number;
    tile: number;
    pulse: (dir: 'right' | 'up') => void;
}

class Start extends Phaser.Scene {
    constructor() {
        super({ key: 'Start' });
    }

    preload(): void {
        preloadSky(this);
        if (!this.textures.exists('button_dark')) this.load.image('button_dark', buttonDark);
        if (!this.textures.exists('button_red')) this.load.image('button_red', buttonRed);
        if (!this.textures.exists('grass_a')) this.load.image('grass_a', grassA);
        if (!this.textures.exists('grass_b')) this.load.image('grass_b', grassB);
        if (!this.textures.exists('particle')) this.load.image('particle', particleImg);
        if (!this.textures.exists('heart')) this.load.image('heart', heartImg);
        this.load.image('title_cat', catIdle);
        this.load.image('title_fish', fishImg);
        this.load.image('logo', logo);
        this.load.image('key_right', keyRight);
    }

    create(): void {
        this.cameras.main.fadeIn(400, 0, 0, 0);

        addSky(this);

        const centerX = GAME_WIDTH / 2;

        const logoImage = this.add.image(centerX, 170, 'logo');
        logoImage.setScale(Math.min(340, GAME_WIDTH - 40) / logoImage.width);

        const cat = this.add.image(centerX - 55, 360, 'title_cat');
        cat.setScale(0.85);
        this.add.image(centerX + 90, 390, 'title_fish').setScale(3.5);

        // Gentle idle bob so the title screen feels alive
        this.tweens.add({
            targets: cat,
            y: 350,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.addButton(centerX, GAME_HEIGHT - 250, 'button_red', `DAILY · ${todayDateLabel()}`, () => this.startGame('daily'));
        this.addButton(centerX, GAME_HEIGHT - 180, 'button_dark', 'ENDLESS', () => this.showEndlessChooser());
        this.addButton(centerX, GAME_HEIGHT - 110, 'button_dark', 'HOW TO PLAY', () => this.showHowToPlay());

        this.add.text(centerX, GAME_HEIGHT - 50, 'M TO MUTE', {
            fontFamily: 'PixelFont',
            fontSize: '11px',
            color: '#1f4e6e',
        }).setOrigin(0.5);

        // First visit: open the instructions unprompted, Wordle-style
        try {
            if (!localStorage.getItem('neko-help-seen')) {
                localStorage.setItem('neko-help-seen', '1');
                this.showHowToPlay();
            }
        } catch {
            // storage unavailable — the button is still there
        }
    }

    // Full-screen dark layer that swallows clicks; tapping it closes the overlay
    private makeOverlay(): Phaser.GameObjects.Container {
        const overlay = this.add.container(0, 0).setDepth(100);
        const dim = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0c100a, 0.96)
            .setOrigin(0)
            .setInteractive({ useHandCursor: true });
        dim.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => overlay.destroy());
        overlay.add(dim);
        return overlay;
    }

    private showEndlessChooser(): void {
        const overlay = this.makeOverlay();
        const centerX = GAME_WIDTH / 2;

        overlay.add(this.add.text(centerX, 230, 'ENDLESS', {
            fontFamily: 'PixelFont',
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
            fontSize: '10px',
            color: '#93ab88',
        }).setOrigin(0.5));

        overlay.add(this.add.text(centerX, GAME_HEIGHT - 60, 'TAP ANYWHERE ELSE TO GO BACK', {
            fontFamily: 'PixelFont',
            fontSize: '11px',
            color: '#93ab88',
        }).setOrigin(0.5));
    }

    private showHowToPlay(): void {
        posthog.capture({ distinctId, event: 'how to play viewed' });
        const overlay = this.makeOverlay();
        const centerX = GAME_WIDTH / 2;
        const isTouch = navigator.maxTouchPoints > 0;

        overlay.add(this.add.text(centerX, 90, 'HOW TO PLAY', {
            fontFamily: 'PixelFont',
            fontSize: '26px',
            color: '#f2d032',
            stroke: '#0c100a',
            strokeThickness: 6,
        }).setOrigin(0.5));

        const step = this.add.text(centerX, 140, '', {
            fontFamily: 'PixelFont',
            fontSize: '11px',
            color: '#f2d032',
        }).setOrigin(0.5);
        overlay.add(step);

        const caption = this.add.text(centerX, 190, '', {
            fontFamily: 'PixelFont',
            fontSize: '14px',
            color: '#f4efe2',
            align: 'center',
            lineSpacing: 8,
            wordWrap: { width: GAME_WIDTH - 32 },
        }).setOrigin(0.5);
        overlay.add(caption);

        // Mini board: checkered grass framed by a wall, one cat, one fish.
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

        // Two fish so "catch every fish" is visibly true: one in the cat's
        // path, one out of it (it survives the crash and wins the finale)
        const fishA = this.add.image(cellX(4), rowY(1), 'title_fish').setScale(1.4 * (tile / DEMO_TILE));
        const fishB = this.add.image(cellX(4), rowY(0), 'title_fish').setScale(1.4 * (tile / DEMO_TILE));
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
        // swipe on touch screens; both follow the direction of the next move
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

        overlay.add(this.add.text(centerX, GAME_HEIGHT - 105, 'A NEW DAILY PUZZLE EVERY DAY AT MIDNIGHT', {
            fontFamily: 'PixelFont',
            fontSize: '11px',
            color: '#93ab88',
            align: 'center',
            wordWrap: { width: GAME_WIDTH - 32 },
        }).setOrigin(0.5));
        overlay.add(this.add.text(centerX, GAME_HEIGHT - 55, 'TAP ANYWHERE TO CLOSE', {
            fontFamily: 'PixelFont',
            fontSize: '11px',
            color: '#93ab88',
        }).setOrigin(0.5));

        this.runDemo(overlay, { step, caption, cat, fishA, fishB, hearts, cellX, rowY, tile, pulse });
    }

    // One slow, spelled-out loop: how to move, that the cat slides, that fish
    // stop him, that walls crash and cost a heart — then he recovers and
    // catches the last fish to clear the level. Every async hop checks the
    // overlay is still alive so closing it stops the show.
    private runDemo(overlay: Phaser.GameObjects.Container, parts: DemoParts): void {
        if (!overlay.active) return;
        const { step, caption, cat, fishA, fishB, hearts, cellX, rowY, tile, pulse } = parts;
        const fishScale = 1.4 * (tile / DEMO_TILE);

        // reset for this loop
        cat.setPosition(cellX(0), rowY(1)).setAlpha(1);
        fishA.setPosition(cellX(4), rowY(1)).setScale(fishScale);
        fishB.setPosition(cellX(4), rowY(0)).setScale(fishScale);
        hearts.forEach(h => h.setAlpha(1));

        const at = (ms: number, fn: () => void) => this.time.delayedCall(ms, () => {
            if (overlay.active) fn();
        });

        step.setText('STEP 1 OF 4');
        caption.setText(navigator.maxTouchPoints > 0
            ? 'SWIPE YOUR FINGER IN ANY DIRECTION\nTO MOVE NEKO THE CAT'
            : 'PRESS AN ARROW KEY\nTO MOVE NEKO THE CAT');
        at(700, () => pulse('right'));
        at(1800, () => pulse('right'));

        at(3000, () => {
            step.setText('STEP 2 OF 4');
            caption.setText('NEKO SLIDES ALL THE WAY —\nHE ONLY STOPS WHEN HE HITS SOMETHING');
        });
        at(3900, () => {
            pulse('right');
            this.tweens.add({ targets: cat, x: cellX(4), duration: 900, ease: 'Linear' });
        });
        at(4800, () => {
            step.setText('STEP 3 OF 4');
            caption.setText('HE CAUGHT A FISH! FISH STOP HIM.\nCATCH EVERY FISH TO WIN THE LEVEL');
            this.burst(overlay, cellX(4), rowY(1));
            this.tweens.add({ targets: fishA, scale: 0, duration: 150 });
        });

        at(8300, () => {
            step.setText('STEP 4 OF 4');
            caption.setText('BUT BE CAREFUL! NO FISH THAT WAY?\nNEKO CRASHES INTO THE WALL...');
        });
        at(9700, () => {
            pulse('right');
            this.tweens.add({ targets: cat, x: cellX(6) + tile / 2 - 10, duration: 350, ease: 'Linear' });
        });
        at(10050, () => {
            cat.setAlpha(0);
            this.burst(overlay, cellX(6) + tile / 2, rowY(1), 0xff7d6a);
            hearts[2].setAlpha(0.2);
        });
        at(10700, () => {
            caption.setText('A CRASH COSTS ONE HEART.\nLOSE ALL 3 HEARTS = GAME OVER');
        });

        // finale: recover and catch the remaining fish to clear the level
        at(13800, () => {
            step.setText('');
            caption.setText('ONE FISH LEFT — GO GET IT!');
            cat.setPosition(cellX(4), rowY(1)).setAlpha(1);
        });
        at(15000, () => {
            pulse('up');
            this.tweens.add({ targets: cat, y: rowY(0), duration: 350, ease: 'Linear' });
        });
        at(15400, () => {
            this.burst(overlay, cellX(4), rowY(0));
            this.tweens.add({ targets: fishB, scale: 0, duration: 150 });
            caption.setText('ALL FISH CAUGHT — LEVEL CLEAR!\nGOOD LUCK OUT THERE');
        });
        at(19000, () => this.runDemo(overlay, parts));
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
        GAME_STATE.mode = mode;
        posthog.capture({
            distinctId,
            event: 'game started',
            properties: {
                mode,
                difficulty: mode === 'endless' ? GAME_STATE.difficulty : undefined,
            },
        });
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('Play');
        });
    }
}

export default Start;
