import { LEFT_MARGIN, TILE_SIZE, TOP_MARGIN, SCALE_RATIO } from '../utils/Constants';

export class Tile {
    private scene: any;
    private x: number;
    private y: number;
    private tile: any;

    constructor(scene: any, x: number, y: number) {
        this.scene = scene;
        this.x = x; // x position of the top-left corner
        this.y = y; // y position of the top-left corner

        this.tile = this.scene.add.sprite(this.x * TILE_SIZE + LEFT_MARGIN, this.y * TILE_SIZE + TOP_MARGIN, 'grass');
        this.tile.setOrigin(0);  // Set the origin to top-left for easier positioning
        this.tile.setScale(SCALE_RATIO);
        this.tile.height = 30;
        this.tile.width = 30;

    }
}

export default Tile;
