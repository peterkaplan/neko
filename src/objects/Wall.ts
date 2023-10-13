import { LEFT_MARGIN, TILE_SIZE, TOP_MARGIN, SCALE_RATIO } from '../utils/Constants';

export class Wall {
    private scene: any;
    private x: number;
    private y: number;
    private sprite: any;

    constructor(scene: any, x: number, y: number) {
        this.scene = scene;
        this.x = x; // x position of the top-left corner
        this.y = y; // y position of the top-left corner

        this.sprite = this.scene.add.sprite(this.x * TILE_SIZE + LEFT_MARGIN, this.y * TILE_SIZE + TOP_MARGIN, 'wall');
        this.sprite.setOrigin(0);  // Set the origin to top-left for easier positioning
        this.sprite.setScale(SCALE_RATIO);
        this.sprite.height = 30;
        this.sprite.width = 30;

    }

    public getSprite() {
        return this.sprite;
    }
}

export default Wall;
