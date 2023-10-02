import { TILE_SIZE } from '/src/utils/Constants.js';


export class Box {

    constructor(scene, x, y, character) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        // Create a sprite for the box using the box image from the assets
        this.sprite = this.scene.physics.add.sprite(this.x * TILE_SIZE, this.y * TILE_SIZE, 'box');

        console.log("generated");
        this.sprite.setOrigin(0);
        this.sprite.setScale(0.17777); 

        // Enable physics on the box
        this.scene.physics.world.enable(this.sprite);

        // Adjust any properties if needed
        this.sprite.setImmovable(true); // To ensure that the character stops upon hitting the box

        // Set up collision with the character (This assumes the character is a global object or passed in some manner)
        this.scene.physics.add.collider(this.sprite, character.sprite, this.breakBox, null, this);
    }

    breakBox() {
        // Play break box sound
        // this.scene.sound.play('break-box');

        // Destroy the box
        this.sprite.destroy();
        console.log(this.isBroken());

        // Add any additional logic here, like updating scores, or checking if all boxes are broken
    }

    // Public API
    getPosition() {
        return { x: this.x, y: this.y };
    }

    isBroken() {
        return !this.sprite.active;
    }

    destroy() {
        this.sprite.destroy();
    }
}

export default Box;