import Phaser from 'phaser';

export class Character {
    private scene: any;
    private x: number;
    private y: number;
    private tileSize: number;
    public sprite: Phaser.Physics.Arcade.Sprite;
    public isMoving: boolean = false;

    constructor(scene: any, startX: number, startY: number) {
        this.scene = scene;
        this.x = startX;
        this.y = startY;
        this.tileSize = 40;  // Assuming each tile is 40x40 pixels as previous examples

        // Create a sprite for the character using its image from the assets
        this.sprite = this.scene.physics.add.sprite(this.x * this.tileSize, this.y * this.tileSize, 'character');
        this.sprite.setScale(0.17777);
        this.sprite.setOrigin(0);
        console.log(this.scene.emitter.emitting);
        this.scene.movementEmitter.startFollow(this.sprite);

        this.scene.emitter.startFollow(this.sprite);

    }

    move(direction: 'left' | 'right' | 'up' | 'down'): void {
        console.log(direction, this.isMoving);
        if (this.isMoving) {
            return;
        }

        this.isMoving = true;
        console.log(this.scene.emitter.emitting);
        this.scene.emitter.emitting = true;

        this.scene.movementEmitter.emitting = true;

        switch(direction) {
            case 'left':
                this.sprite.setVelocity(-100, 0);
                break;
            case 'right':
                this.sprite.setVelocity(100, 0);
                break;
            case 'up':
                this.sprite.setVelocity(0, -100);
                break;
            case 'down':
                this.sprite.setVelocity(0, 100);
                break;
        }

        // check for collisions
    }

    // Public API
    getPosition(): { x: number, y: number } {
        return { x: this.x, y: this.y };
    }

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.sprite.setPosition(this.x * this.tileSize, this.y * this.tileSize);
    }

    handleBoxCollision(box: any): void {  // You might want to specify a type for `box`
        this.isMoving = false;
        this.setPosition(box.x, box.y);
        this.scene.emitter.emitting = true;
        this.scene.movementEmitter.emitting = false;
        this.scene.emitter.explode(10, this.scene.emitter.x, this.scene.emitter.y); // Explode 10 particles from the emitter
    }
}

export default Character;
