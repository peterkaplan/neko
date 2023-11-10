import Phaser from 'phaser';
import { LEFT_MARGIN, TOP_MARGIN } from '../utils/Constants';
import Character from './Character';
import { GET_SCALE_SIZE, GET_X_FROM_INDEX, GET_Y_FROM_INDEX } from '../utils/GameState';

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
        this.sprite = this.scene.physics.add.sprite(GET_X_FROM_INDEX(x), GET_Y_FROM_INDEX(y), 'box');

        this.sprite.setOrigin(0);
        this.sprite.setScale( GET_SCALE_SIZE() - .01); 

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
