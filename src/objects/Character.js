
export class Character {
    constructor(scene, startX, startY) {
        this.scene = scene;
        this.x = startX;
        this.y = startY;
        this.tileSize = 40;  // Assuming each tile is 40x40 pixels as previous examples

        // Create a sprite for the character using its image from the assets
        this.sprite = this.scene.physics.add.sprite(this.x * this.tileSize, this.y * this.tileSize, 'character');
        this.sprite.setScale(0.17777); 
        this.sprite.setOrigin(0);
    }

    move(direction) {
        let newX = this.x;
        let newY = this.y;

        switch(direction) {
            case 'left':
                newX--;
                break;
            case 'right':
                newX++;
                break;
            case 'up':
                newY--;
                break;
            case 'down':
                newY++;
                break;
        }

        // Check for collisions with the edge of the board
        if (newX < 0 || newY < 0 || newX >= 20 || newY >= 20) {
            this.scene.sound.play('game-over');
            this.scene.scene.start('GameOver');  // Assuming a 'GameOver' scene exists
            return;
        }

        // Move the character
        this.sprite.setPosition(newX * this.tileSize, newY * this.tileSize);
        this.x = newX;
        this.y = newY;
    }

    // Public API
    getPosition() {
        return { x: this.x, y: this.y };
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.sprite.setPosition(this.x * this.tileSize, this.y * this.tileSize);
    }
}

export default Character;