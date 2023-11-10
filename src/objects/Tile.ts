import { GET_SCALE_SIZE, GET_TILE_SIZE, GET_X_FROM_INDEX, GET_Y_FROM_INDEX } from '../utils/GameState';

export class Tile {
    private scene: any;
    private x: number;
    private y: number;
    private tile: Phaser.Physics.Arcade.Sprite;

    constructor(scene: any, x: number, y: number) {
        this.scene = scene;
        this.x = x; // x position of the top-left corner
        this.y = y; // y position of the top-left corner

        this.tile = this.scene.add.sprite(GET_X_FROM_INDEX(this.x), GET_Y_FROM_INDEX(this.y), 'grass');
        this.tile.setOrigin(0);  // Set the origin to top-left for easier positioning
        this.tile.setScale(GET_SCALE_SIZE());
    }

    public getSprite() {
        return this.tile;
    }
}

export default Tile;
