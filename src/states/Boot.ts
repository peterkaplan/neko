import Phaser from 'phaser';

class Boot extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    preload(): void {
        // Load game assets
    }

    create(): void {
        this.scene.start('Play');  // After loading assets, start the Play state
    }
}

export default Boot;