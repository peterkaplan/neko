import Phaser from 'phaser';

class Boot extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    create(): void {
        // Canvas text drawn before the webfont finishes downloading silently
        // falls back to a system font, so block on the font (with a timeout so
        // a missing font can't wedge the game) before showing any text.
        const start = () => this.scene.start('Start');
        if (typeof document !== 'undefined' && document.fonts?.load) {
            Promise.race([
                document.fonts.load('16px PixelFont'),
                new Promise(resolve => setTimeout(resolve, 2000)),
            ]).then(start, start);
        } else {
            start();
        }
    }
}

export default Boot;
