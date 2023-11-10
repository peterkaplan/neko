import Phaser from 'phaser';
import { GET_SCALE_SIZE, GET_TILE_SIZE, GET_X_FROM_INDEX, GET_Y_FROM_INDEX } from '../utils/GameState';

export class Wall {
    private scene: any;
    private x: number;
    private y: number;
    private sprite: Phaser.Physics.Arcade.Sprite;

    constructor(scene: any, x: number, y: number) {
        this.scene = scene;
        this.x = x; // x position of the top-left corner
        this.y = y; // y position of the top-left corner

        this.sprite = this.scene.add.sprite(GET_X_FROM_INDEX(this.x), GET_Y_FROM_INDEX(this.y), 'wall');
        this.sprite.setOrigin(0);  // Set the origin to top-left for easier positioning
        this.sprite.height = GET_TILE_SIZE();
        this.sprite.width = GET_TILE_SIZE();
        this.sprite.setScale(GET_SCALE_SIZE());

        this.scene.physics.world.enable(this.sprite);
        console.log(this.sprite);
        (<Phaser.Physics.Arcade.Body>this.sprite.body).setImmovable(true);
    }

    public getSprite() {
        return this.sprite;
    }
}

export default Wall;
