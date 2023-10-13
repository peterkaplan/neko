import Phaser from 'phaser';
import { TILE_SIZE, SCALE_RATIO } from '../utils/Constants';
import Character from './Character';

export class Box {
    private scene: Phaser.Scene;
    public x: number;
    public y: number;
    public sprite: Phaser.Physics.Arcade.Sprite;
    private character: Character;

    constructor(scene: Phaser.Scene, x: number, y: number, character: any) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.character = character;

        // Create a sprite for the box using the box image from the assets
        this.sprite = this.scene.physics.add.sprite(this.x * TILE_SIZE, this.y * TILE_SIZE, 'box');

        this.sprite.setOrigin(0);
        this.sprite.setScale(SCALE_RATIO); 

        // Enable physics on the box
        this.scene.physics.world.enable(this.sprite);

        // Adjust any properties if needed
        this.sprite.setImmovable(true); // To ensure that the character stops upon hitting the box

        // Set up collision with the character (This assumes the character is a global object or passed in some manner)
        this.scene.physics.add.collider(this.sprite, character.sprite, this.breakBox, undefined, this);
    }

    breakBox(): void {
        // Play break box sound
        // this.scene.sound.play('break-box');

        // Destroy the box
        this.sprite.destroy();
        console.log(this.isBroken());

        this.character.handleBoxCollision(this);
        // Add any additional logic here, like updating scores, or checking if all boxes are broken
    }

    // Public API
    getPosition(): { x: number, y: number } {
        return { x: this.x, y: this.y };
    }

    isBroken(): boolean {
        return !this.sprite.active;
    }

    destroy(): void {
        this.sprite.destroy();
    }
}

export default Box;
