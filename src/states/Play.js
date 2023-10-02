import { Box } from '/src/objects/Box.js';
import { Character } from '/src/objects/Character.js';
import { GameBoard } from '/src/objects/GameBoard.js';


class Play extends Phaser.Scene {

    constructor() {
        super({ key: 'Play' });
    }

    preload() {
        // Load assets
        this.load.image('character', 'assets/images/character.png');
        this.load.image('box', 'assets/images/box.png');
        this.load.image('board', 'assets/images/board.png');
        this.load.image('grass', 'assets/images/grass.png');
         // Enable arrow keys for movement
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    create() {
       this.gameBoard = new GameBoard(this, 0, 0, 20); // Create the game board at (0, 0)
    }

    update() {
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
