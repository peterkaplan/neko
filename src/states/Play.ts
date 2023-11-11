import Phaser from 'phaser';
import { GameBoard } from '../objects/GameBoard';
import box from '../../assets/images/honey.png';
import character from '../../assets/images/cow.png';
import board from '../../assets/images/board.png';
import grass from '../../assets/images/grass.png';
import wall from '../../assets/images/wall.png';
import background from '../../assets/images/background.png';
import { GAME_STATE, Level } from '../utils/GameState';
import { createLevel } from '../utils/LevelGenerator';
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
        this.load.image('box', box);
        this.load.image('board', board);
        this.load.image('grass', grass);
        this.load.image('wall', wall);
        this.load.image('background', background);
        this.add.text(0, 0, "preloadFont", {fontFamily: 'PixelFont', fontSize: '0px'});
        
    }

    create(): void {
    //this.physics.world.createDebugGraphic();
    const background = this.add.sprite(180, 320, 'background');
    background.setScale(.333);
    const lvl: Level = createLevel();
    GAME_STATE.currentLevel = lvl.id;
    GAME_STATE.levels.push(lvl);

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

    const levelManager = new LevelManager(this);
    const boardInitializer = new BoardInitializer(this);
    this.gameBoard = new GameBoard(this, boardInitializer, levelManager);
    this.scoreBoard = new Scoreboard(this);

    this.emitter.setDepth(1);
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
}

export default Play;
