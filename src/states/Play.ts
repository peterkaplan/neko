import Phaser from 'phaser';
import { GameBoard } from '../objects/GameBoard';
import box from '../../assets/generated/honey_jar.png';
import catIdleLeft from '../../assets/images/cat_left_idle.png';
import catIdleRight from '../../assets/images/cat_right_idle.png';
import catJumpLeft from '../../assets/images/cat_jump_left.png';
import catJumpRight from '../../assets/images/cat_jump_right.png';
import grassA from '../../assets/generated/grass_a.png';
import grassB from '../../assets/generated/grass_b.png';
import grassC from '../../assets/generated/grass_c.png';
import grassD from '../../assets/generated/grass_d.png';
import wall from '../../assets/generated/wall.png';
import particle from '../../assets/generated/particle.png';
import heart from '../../assets/generated/heart.png';
import buttonDark from '../../assets/generated/button_dark.png';
import { addSky, preloadSky } from '../utils/Sky';
import sfxJump from '../../assets/generated/sfx_jump.wav';
import sfxCollect from '../../assets/generated/sfx_collect.wav';
import sfxDeath from '../../assets/generated/sfx_death.wav';
import sfxClear from '../../assets/generated/sfx_clear.wav';
import { GAME_STATE, resetGameState } from '../utils/GameState';
import { LevelManager } from '../utils/LevelManager';
import BoardInitializer from '../utils/BoardInitializer';
import Scoreboard from '../utils/Scoreboard';
import { GAME_HEIGHT, GAME_WIDTH } from '../utils/Constants';

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
        this.load.image('cat_idle_left', catIdleLeft);
        this.load.image('cat_idle_right', catIdleRight);
        this.load.image('box', box);
        this.load.image('grass_a', grassA);
        this.load.image('grass_b', grassB);
        this.load.image('grass_c', grassC);
        this.load.image('grass_d', grassD);
        this.load.image('wall', wall);
        this.load.image('particle', particle);
        this.load.image('heart', heart);
        preloadSky(this);
        if (!this.textures.exists('button_dark')) this.load.image('button_dark', buttonDark);
        this.load.audio('sfx_jump', sfxJump);
        this.load.audio('sfx_collect', sfxCollect);
        this.load.audio('sfx_death', sfxDeath);
        this.load.audio('sfx_clear', sfxClear);
        this.add.text(0, 0, "preloadFont", {fontFamily: 'PixelFont', fontSize: '0px'});
        this.load.spritesheet('catJumpLeft', catJumpLeft, { frameWidth: 225, frameHeight: 225 });
        this.load.spritesheet('catJumpRight', catJumpRight, { frameWidth: 225, frameHeight: 225 });
    }

    create(): void {
        resetGameState();
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.drawBackdrop();
        this.setupSwipeInput();
        this.input.keyboard?.on('keydown-M', () => {
            this.sound.mute = !this.sound.mute;
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
        const y = GAME_HEIGHT - 48;
        this.addPill(GAME_WIDTH / 2 - 110, y, 'MENU', () => {
            this.scene.start('Start');
        });
        const otherMode = GAME_STATE.mode === 'daily' ? 'endless' : 'daily';
        this.addPill(GAME_WIDTH / 2 + 110, y, otherMode.toUpperCase(), () => {
            GAME_STATE.mode = otherMode;
            this.scene.restart();
        });
    }

    private addPill(x: number, y: number, label: string, onClick: () => void): void {
        const pill = this.add.image(x, y, 'button_dark').setScale(1.6).setInteractive({ useHandCursor: true });
        pill.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, onClick);
        pill.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => pill.setTint(0xbbddaa));
        pill.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => pill.clearTint());
        this.add.text(x, y, label, {
            fontFamily: 'PixelFont',
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
        const dragThreshold = 32; // px of drag that commits a move immediately
        const flickThreshold = 18; // px for a quick tap-flick released early
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

        // Fire as soon as the drag crosses the threshold — not on release — and
        // re-anchor so continued dragging chains moves without lifting
        this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            if (!pointer.isDown) return;
            const dx = pointer.x - anchorX;
            const dy = pointer.y - anchorY;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < dragThreshold) return;

            GAME_STATE.character?.move(directionFrom(dx, dy));
            anchorX = pointer.x;
            anchorY = pointer.y;
            movedThisGesture = true;
        });

        // Fallback so a short, fast flick released before the drag threshold still counts
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
