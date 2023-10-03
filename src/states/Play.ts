import Phaser from 'phaser';
import { GameBoard } from '../objects/GameBoard';
import box from '../../assets/images/box.png';
import character from '../../assets/images/character.png';
import board from '../../assets/images/board.png';
import grass from '../../assets/images/grass.png';

class Play extends Phaser.Scene {
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private gameBoard?: GameBoard;
    public emitter?: any;
    public movementEmitter?: any;

    constructor() {
        super({ key: 'Play' });
    }

    preload(): void {
        // Enable arrow keys for movement
        this.cursors = this.input?.keyboard?.createCursorKeys();
        console.log("Adsasdas");
        this.load.image('character', character);
        this.load.image('box', box);
        this.load.image('board', board);
        this.load.image('grass', grass);
    }

    customRandomZone: Phaser.Types.GameObjects.Particles.RandomZoneSource = {
        getRandomPoint: (point) => {
          if (!point) {
            point = new Phaser.Math.Vector2();
          }
      
          // Calculate a random point within the specified rectangle
          point.x = Phaser.Math.Between(0, 800); // Adjust the range as needed
          point.y = Phaser.Math.Between(0, 600); // Adjust the range as needed
      
          return point;
        },
      };
      

    create(): void {

    this.emitter = this.add.particles(0, 0, 'box', {
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

    this.movementEmitter = this.add.particles(0, 0, 'box', {
        speed: { min: 400, max: 600 },           // Fast moving particles
        scale: { start: .1, end: 0.1 },         // Start slightly bigger and scale down to be thin
        lifespan: 500,                           // Short lifespan to make it look like a quick laser shot
        blendMode: 'ADD',                        // Additive blend mode to make it bright
        //tint: 0xff0000,                          // Red tint for lasers (change as needed)
        angle: { min: 265, max: 275 },           // Roughly upwards (assuming 0 degree is to the right), tweak for exact direction
        emitZone: {                              // Emitting from a zone to make it look like it's coming from a narrow gun barrel or source
            type: 'edge',
            source: new Phaser.Geom.Rectangle(-5, -5, 10, 10),
            quantity:  2,
            yoyo: false,
            seamless: true
        },
        emitting: false,
    });

    this.gameBoard = new GameBoard(this, 0, 0); // Create the game board at (0, 0)

    this.emitter.setDepth(1);
    this.movementEmitter.setDepth(2);

   
    }

    update(): void {
        if(!this.cursors || !this.gameBoard) return;

        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            this.gameBoard.move('left');
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            this.gameBoard.move('right');
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.gameBoard.move('up');
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            this.gameBoard.move('down');
        }
    }
}

export default Play;
