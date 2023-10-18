import Phaser from 'phaser';
import { TILE_SIZE, SCALE_RATIO, LEFT_MARGIN, TOP_MARGIN } from '../utils/Constants';
import Character from './Character';

export class Box {
    private scene: Phaser.Scene;
    public x: number;
    public y: number;
    public sprite: Phaser.Physics.Arcade.Sprite;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        // Create a sprite for the box using the box image from the assets
        this.sprite = this.scene.physics.add.sprite(this.x * TILE_SIZE + LEFT_MARGIN, this.y * TILE_SIZE + TOP_MARGIN, 'box');

        this.sprite.setOrigin(0);
        this.sprite.setScale(SCALE_RATIO); 

        // Enable physics on the box
        this.scene.physics.world.enable(this.sprite);

        // Adjust any properties if needed
        this.sprite.setImmovable(true); // To ensure that the character stops upon hitting the box
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
