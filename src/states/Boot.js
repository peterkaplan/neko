class Boot extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    preload() {
        // Load game assets
        this.load.image('character', 'assets/images/character.png');
        this.load.image('box', 'assets/images/box.png');
        this.load.image('board', 'assets/images/board.png');
    }

    create() {
        this.scene.start('Play');  // After loading assets, start the Play state
    }
}

export default Boot;