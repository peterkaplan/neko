import Phaser from 'phaser';
import play from '../../assets/images/start.png';
import character from '../../assets/images/cow.png';
import playbutton from '../../assets/images/button.png';
import Button from '../objects/Button';

class Boot extends Phaser.Scene {
    constructor() {
        super({ key: 'Start' });
    }

    preload(): void {
        // Load game assets
        this.load.image('play', play);
        this.load.image('button', playbutton);

    }

    create(): void {
        let centerX = this.cameras.main.width / 2;
        let centerY = this.cameras.main.height / 2;
        let background = this.add.image(centerX, centerY, 'play').setOrigin(0.5, 0.5);
        background.setScale(.36);

        let button = new Button(this, centerX, centerY + 170, 'button', 0xffffff, this.startGame.bind(this));
        button.setScale(.36);
        this.add.existing(button)
    }

    startGame(): void {
        // Create a black rectangle to cover the screen
        const blackBox = this.add.graphics();
        blackBox.fillStyle(0x000000); // Set the fill color to black (hexadecimal)
        blackBox.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        blackBox.alpha = 0;
    
        console.log('start game');
        this.tweens.add({
            targets: blackBox,
            alpha: 1,
            duration: 1000, // Adjust the duration as needed.
            onComplete: () => {
              // Transition to the next scene once the fade-out is complete.
              this.scene.start('Play');
            },
          });
    }
}

export default Boot;