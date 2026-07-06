import Phaser from 'phaser';
import { GameBoard } from '../objects/GameBoard';
import { addSky, preloadSky } from '../utils/Sky';
import { recordEndlessScore } from '../utils/HighScores';
import { GAME_STATE, resetGameState } from '../utils/GameState';
import { markTodayPlayed } from '../utils/Daily';
import { applyMute, toggleMute } from '../utils/Mute';
import { LevelManager } from '../utils/LevelManager';
import BoardInitializer from '../utils/BoardInitializer';
import Scoreboard from '../utils/Scoreboard';
import { GAME_HEIGHT, GAME_WIDTH, textResolution } from '../utils/Constants';

// A held key only re-fires this long after the cat lands (DAS-style repeat
// delay), so an ordinary tap that outlasts a short slide can't double-move
const HOLD_REPEAT_DELAY_MS = 180;

class Play extends Phaser.Scene {
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd?: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    private gameBoard?: GameBoard;
    private scoreBoard?: Scoreboard;
    private wasMovable = false;
    private landedAt = 0;
    public emitter: any;


    constructor() {
        super({ key: 'Play' });
    }

    preload(): void {
        this.cursors = this.input?.keyboard?.createCursorKeys();
        this.wasd = this.input?.keyboard?.addKeys('W,A,S,D') as Play['wasd'];
        this.load.image('cat_idle_left', 'assets/images/cat_left_idle.png');
        this.load.image('cat_idle_right', 'assets/images/cat_right_idle.png');
        if (!this.textures.exists('fish')) this.load.svg('fish', 'assets/generated/fish.svg', { width: 128, height: 128 });
        this.load.image('grass_a', 'assets/generated/grass_a.png');
        this.load.image('grass_b', 'assets/generated/grass_b.png');
        this.load.image('grass_c', 'assets/generated/grass_c.png');
        this.load.image('grass_d', 'assets/generated/grass_d.png');
        this.load.image('wall', 'assets/generated/wall.png');
        this.load.image('particle', 'assets/generated/particle.png');
        this.load.image('heart', 'assets/generated/heart.png');
        preloadSky(this);
        if (!this.textures.exists('button_dark')) this.load.image('button_dark', 'assets/generated/button_dark.png');
        this.load.audio('sfx_jump', 'assets/generated/sfx_jump.wav');
        this.load.audio('sfx_collect', 'assets/generated/sfx_collect.wav');
        this.load.audio('sfx_death', 'assets/generated/sfx_death.wav');
        this.load.audio('sfx_clear', 'assets/generated/sfx_clear.wav');
        this.load.spritesheet('catJumpLeft', 'assets/images/cat_jump_left.png', { frameWidth: 225, frameHeight: 225 });
        this.load.spritesheet('catJumpRight', 'assets/images/cat_jump_right.png', { frameWidth: 225, frameHeight: 225 });
    }

    create(): void {
        resetGameState();
        if (GAME_STATE.mode === 'daily') markTodayPlayed();
        this.cameras.main.fadeIn(250, 0, 0, 0);
        this.drawBackdrop();
        this.setupSwipeInput();
        applyMute(this);
        this.input.keyboard?.on('keydown-M', () => {
            toggleMute(this);
        });

        this.emitter = this.add.particles(0, 0, 'particle', {
            alpha: { start: 1, end: 0 },
            scale: { start: 2, end: 0.5 },
            tint: [0xffffff, 0xffe08a, 0xf2b134],
            speed: 200,
            angle: { min: 0, max: 360 },
            rotate: { min: -180, max: 180 },
            lifespan: { min: 500, max: 2000 },
            frequency: 50,
            maxParticles: 100,
            blendMode: 'ADD',
            radial: true,
            gravityY: 300,
            emitting: false,
        });

        if (!this.anims.exists('jumpLeft')) {
            this.anims.create({
                key: 'jumpLeft',
                frames: this.anims.generateFrameNumbers('catJumpLeft', { start: 0, end: 2 }),
                frameRate: 10,
                repeat: 0
            });

            this.anims.create({
                key: 'jumpRight',
                frames: this.anims.generateFrameNumbers('catJumpRight', { start: 0, end: 2 }),
                frameRate: 10,
                repeat: 0
            });
        }

        const levelManager = new LevelManager(this);
        const boardInitializer = new BoardInitializer(this);
        this.gameBoard = new GameBoard(this, boardInitializer, levelManager);
        this.scoreBoard = new Scoreboard(this);
        this.addBottomButtons();

        this.emitter.setDepth(1);
    }

    private addBottomButtons(): void {
        this.addPill(GAME_WIDTH / 2, GAME_HEIGHT - 48, 'MENU', () => {
            // Quitting mid-run still counts toward the endless high score
            if (GAME_STATE.mode === 'endless') {
                recordEndlessScore(GAME_STATE.difficulty, GAME_STATE.score);
            }
            this.scene.start('Start');
        });
    }

    private addPill(x: number, y: number, label: string, onClick: () => void): void {
        const pill = this.add.image(x, y, 'button_dark').setScale(1.6).setInteractive({ useHandCursor: true });
        // Taps only: a swipe that starts or ends on the button must not click it
        pill.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, (pointer: Phaser.Input.Pointer) => {
            if (Math.max(Math.abs(pointer.upX - pointer.downX), Math.abs(pointer.upY - pointer.downY)) > 12) return;
            onClick();
        });
        pill.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => pill.setTint(0xbbddaa));
        pill.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => pill.clearTint());
        this.add.text(x, y, label, {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '14px',
            color: '#cfe3c2',
            stroke: '#0c100a',
            strokeThickness: 4,
        }).setOrigin(0.5);
    }

    update(): void {
        if(!this.cursors || !this.gameBoard) return;

        const pressed = this.getJustPressedDirection();
        const held = this.getHeldDirection();

        // Releasing all keys re-arms hold-to-continue (it disarms on respawn)
        if (!held) {
            GAME_STATE.holdInputArmed = true;
        }

        // Track when the cat last became movable (landed / respawned)
        if (GAME_STATE.canPlayerMove && !this.wasMovable) {
            this.landedAt = this.time.now;
        }
        this.wasMovable = GAME_STATE.canPlayerMove;

        if (pressed) {
            // Fresh press: moves now, or buffers if the cat is mid-slide
            GAME_STATE.character?.move(pressed);
        } else if (
            held && GAME_STATE.holdInputArmed && GAME_STATE.canPlayerMove
            && this.time.now - this.landedAt > HOLD_REPEAT_DELAY_MS
        ) {
            // Deliberately held past the landing: keep going that way
            GAME_STATE.character?.move(held);
        }

        this.scoreBoard?.update();
    }

    private getJustPressedDirection(): 'left' | 'right' | 'up' | 'down' | undefined {
        // JustDown must be sampled for every key each frame so no press is lost
        const left = Phaser.Input.Keyboard.JustDown(this.cursors!.left) || (this.wasd ? Phaser.Input.Keyboard.JustDown(this.wasd.A) : false);
        const right = Phaser.Input.Keyboard.JustDown(this.cursors!.right) || (this.wasd ? Phaser.Input.Keyboard.JustDown(this.wasd.D) : false);
        const up = Phaser.Input.Keyboard.JustDown(this.cursors!.up) || (this.wasd ? Phaser.Input.Keyboard.JustDown(this.wasd.W) : false);
        const down = Phaser.Input.Keyboard.JustDown(this.cursors!.down) || (this.wasd ? Phaser.Input.Keyboard.JustDown(this.wasd.S) : false);
        if (left) return 'left';
        if (right) return 'right';
        if (up) return 'up';
        if (down) return 'down';
        return undefined;
    }

    private getHeldDirection(): 'left' | 'right' | 'up' | 'down' | undefined {
        if (this.cursors!.left.isDown || this.wasd?.A.isDown) return 'left';
        if (this.cursors!.right.isDown || this.wasd?.D.isDown) return 'right';
        if (this.cursors!.up.isDown || this.wasd?.W.isDown) return 'up';
        if (this.cursors!.down.isDown || this.wasd?.S.isDown) return 'down';
        return undefined;
    }

    private setupSwipeInput(): void {
        // One gesture = one move. Every move can be fatal, so nothing fires
        // until the finger has clearly committed to a direction, and a tap
        // (small wobble included) never moves the cat.
        const dragThreshold = 48; // px of drag that commits the move immediately
        const flickThreshold = 40; // px for a flick released before the drag threshold
        let anchorX = 0;
        let anchorY = 0;
        let movedThisGesture = false;

        const directionFrom = (dx: number, dy: number) =>
            Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' as const : 'left' as const) : (dy > 0 ? 'down' as const : 'up' as const);

        this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            anchorX = pointer.x;
            anchorY = pointer.y;
            movedThisGesture = false;
        });

        // Fire as soon as the drag crosses the threshold — not on release —
        // then ignore the rest of the gesture until the finger lifts
        this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            if (!pointer.isDown || movedThisGesture) return;
            const dx = pointer.x - anchorX;
            const dy = pointer.y - anchorY;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < dragThreshold) return;

            GAME_STATE.character?.move(directionFrom(dx, dy));
            movedThisGesture = true;
        });

        // Fallback so a fast flick released before the drag threshold still counts
        this.input.on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) => {
            if (movedThisGesture) return;
            const dx = pointer.upX - pointer.downX;
            const dy = pointer.upY - pointer.downY;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < flickThreshold) return;
            GAME_STATE.character?.move(directionFrom(dx, dy));
        });
    }

    private drawBackdrop(): void {
        addSky(this);
    }
}

export default Play;
