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
    caption: Phaser.GameObjects.Text;
    cat: Phaser.GameObjects.Image;
    jar: Phaser.GameObjects.Image;
    key: Phaser.GameObjects.Image;
    cellX: (col: number) => number;
    midY: number;
    tile: number;
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

        overlay.add(this.add.text(centerX, 100, 'HOW TO PLAY', {
            fontFamily: 'PixelFont',
            fontSize: '26px',
            color: '#f2d032',
            stroke: '#0c100a',
            strokeThickness: 6,
        }).setOrigin(0.5));

        const caption = this.add.text(centerX, 180, '', {
            fontFamily: 'PixelFont',
            fontSize: '14px',
            color: '#f4efe2',
            align: 'center',
            wordWrap: { width: GAME_WIDTH - 32 },
        }).setOrigin(0.5);
        overlay.add(caption);

        // Mini board: checkered grass framed by a wall, one cat, one jar.
        // Tiles shrink on narrow (phone) screens so the board always fits.
        const tile = Math.min(DEMO_TILE, Math.floor((GAME_WIDTH - 40) / DEMO_COLS));
        const boardX = centerX - (DEMO_COLS * tile) / 2;
        const boardY = 240;
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
        const midY = boardY + tile * 1.5;

        const jar = this.add.image(cellX(4), midY, 'title_fish').setScale(1.4 * (tile / DEMO_TILE));
        const cat = this.add.image(cellX(0), midY, 'title_cat').setScale(0.19 * (tile / DEMO_TILE));
        overlay.add(jar);
        overlay.add(cat);

        const key = this.add.image(centerX, 460, 'key_right').setScale(2.2);
        overlay.add(key);

        overlay.add(this.add.text(centerX, GAME_HEIGHT - 115, 'NEKO SLIDES UNTIL SOMETHING STOPS HIM\nNEW PUZZLE AT MIDNIGHT', {
            fontFamily: 'PixelFont',
            fontSize: '11px',
            color: '#93ab88',
            align: 'center',
            lineSpacing: 8,
            wordWrap: { width: GAME_WIDTH - 32 },
        }).setOrigin(0.5));
        overlay.add(this.add.text(centerX, GAME_HEIGHT - 60, 'TAP ANYWHERE TO CLOSE', {
            fontFamily: 'PixelFont',
            fontSize: '11px',
            color: '#93ab88',
        }).setOrigin(0.5));

        this.runDemo(overlay, { caption, cat, jar, key, cellX, midY, tile });
    }

    // One loop of the demo: slide into the jar (collect), then into the wall
    // (crash), then reset and repeat. Every async hop checks the overlay is
    // still alive so closing it stops the show.
    private runDemo(overlay: Phaser.GameObjects.Container, parts: DemoParts): void {
        if (!overlay.active) return;
        const { caption, cat, jar, key, cellX, midY, tile } = parts;

        cat.setPosition(cellX(0), midY).setAlpha(1);
        jar.setScale(1.4 * (tile / DEMO_TILE));
        caption.setText('SWIPE OR PRESS AN ARROW KEY');

        const pressKey = () => this.tweens.add({ targets: key, scale: 1.8, duration: 90, yoyo: true });

        this.time.delayedCall(800, () => {
            if (!overlay.active) return;
            pressKey();
            this.tweens.add({
                targets: cat,
                x: cellX(4),
                duration: 480,
                ease: 'Linear',
                onComplete: () => {
                    if (!overlay.active) return;
                    caption.setText('COLLECT EVERY FISH TO WIN!');
                    this.burst(overlay, cellX(4), midY);
                    this.tweens.add({ targets: jar, scale: 0, duration: 150 });
                    this.time.delayedCall(1400, () => {
                        if (!overlay.active) return;
                        caption.setText("DON'T HIT THE WALLS!");
                        pressKey();
                        this.tweens.add({
                            targets: cat,
                            x: cellX(6) + tile / 2 - 10,
                            duration: 300,
                            ease: 'Linear',
                            onComplete: () => {
                                if (!overlay.active) return;
                                cat.setAlpha(0);
                                this.burst(overlay, cellX(6) + tile / 2, midY, 0xff7d6a);
                                this.time.delayedCall(1500, () => this.runDemo(overlay, parts));
                            },
                        });
                    });
                },
            });
        });
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
