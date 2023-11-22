import Phaser from 'phaser';
import { GameBoard } from '../objects/GameBoard';
import box from '../../assets/images/honey.png';
import character from '../../assets/images/cow.png';
import catIdleLeft from '../../assets/images/cat_left_idle.png';
import catIdleRight from '../../assets/images/cat_right_idle.png';
import catJumpLeft from '../../assets/images/cat_jump_left.png';
import catJumpRight from '../../assets/images/cat_jump_right.png';

import board from '../../assets/images/board.png';
import grassTileTwo from '../../assets/images/sprite_background_3.png';
import wall from '../../assets/images/wall.png';
import background from '../../assets/images/gameboardbackground.png';
import { GAME_STATE } from '../utils/GameState';
import { LevelManager } from '../utils/LevelManager';
import BoardInitializer from '../utils/BoardInitializer';
import Scoreboard from '../utils/Scoreboard';

class Play extends Phaser.Scene {
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private gameBoard?: GameBoard;
    private scoreBoard?: Scoreboard;
    public emitter: any;


    constructor() {
        super({ key: 'Play' });
    }

    preload(): void {
        this.cursors = this.input?.keyboard?.createCursorKeys();
        this.load.image('character', character);
        this.load.image('cat_idle_left', catIdleLeft);
        this.load.image('cat_idle_right', catIdleRight);
        this.load.image('box', box);
        this.load.image('board', board);
        this.load.image('grass', grassTileTwo);
        this.load.image('wall', wall);
        this.load.image('background', background);
        this.add.text(0, 0, "preloadFont", {fontFamily: 'PixelFont', fontSize: '0px'});
        this.load.spritesheet('catJumpLeft', catJumpLeft, { frameWidth: 225, frameHeight: 225 });
        this.load.spritesheet('catJumpRight', catJumpRight, { frameWidth: 225, frameHeight: 225 });
    }

    create(): void {
    this.fadeIn();

    this.emitter = this.add.particles(0, 0, 'character', {
        alpha: { start: 1, end: 0 },                  // Fading out over time
        scale: { start: .1, end: .05 },              // Starting small, growing larger
        tint: [0xff0000, 0x00ff00, 0x0000ff],         // Cycling through Red, Green, Blue tints
        speed: 200,                                   // Pretty fast particles
        angle: { min: 0, max: 360 },                  // Emitted in all directions
        rotate: { min: -180, max: 180 },              // Random rotations
        lifespan: { min: 500, max: 2000 },            // Between 0.5 and 2 seconds lifespan
        frequency: 50,                                // Emit a particle every 50ms
        maxParticles: 100,                            // Maximum of 100 particles at once
        blendMode: 'ADD',                             // Additive blend mode for glows
        radial: true,                                 // Emit particles in a radial pattern
        gravityY: 300,                
        emitting: false,
    });

    this.anims.create({
        key: 'jumpLeft',
        frames: this.anims.generateFrameNumbers('catJumpLeft', { start: 0, end: 2 }), // Use frames 0 and 1 for the animation
        frameRate: 10,
        repeat: 0
    });

    this.anims.create({
        key: 'jumpRight',
        frames: this.anims.generateFrameNumbers('catJumpRight', { start: 0, end: 2 }), // Use frames 0 and 1 for the animation
        frameRate: 10,
        repeat: 0
    });

    }

    update(): void {
        if(!this.cursors || !this.gameBoard) return;

        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            GAME_STATE.character?.move('left');
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            GAME_STATE.character?.move('right');
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            GAME_STATE.character?.move('up');
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            GAME_STATE.character?.move('down');
        }

        this.scoreBoard?.update();
    }

    onBackgroundResizeComplete() {
        console.log('Tween completed!');
        const levelManager = new LevelManager(this);
        const boardInitializer = new BoardInitializer(this);
        this.gameBoard = new GameBoard(this, boardInitializer, levelManager);
        this.scoreBoard = new Scoreboard(this);
    
        this.emitter.setDepth(1);
    }

    fadeIn() {
        // Create a black rectangle to cover the screen
        // this.physics.world.createDebugGraphic();
        const blackBox = this.add.graphics();
        blackBox.fillStyle(0x000000); // Set the fill color to black (hexadecimal)
        blackBox.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        blackBox.setDepth(2);

        console.log('start game');

        let centerX = this.cameras.main.width / 2;
        let centerY = this.cameras.main.height / 2;
        let background = this.add.image(centerX, centerY, 'background').setOrigin(0.5, 0.5);
        background.setScale(.353);
        this.tweens.add({
            targets: blackBox,
            alpha: 0,
            ease: 'Linear', // Use a linear easing
            duration: 1000, // Adjust the duration as needed.
            onComplete: () => {
                this.createBackground(background);
                // Transition to the next scene once the fade-out is complete.
            },
        });
    }
    
    createBackground(back: Phaser.GameObjects.Image){
        console.log("Asd");
        this.tweens.add({
            targets: back,
            scaleX: .48, // Scale up to 200%
            scaleY: .55, // Scale up to 200%
            ease: 'Linear', // Use a linear easing
            duration: 1000, // 3000 milliseconds = 3 seconds
            delay: 1000,
            onComplete: this.onBackgroundResizeComplete.bind(this)
        });
    }
}

export default Play;
