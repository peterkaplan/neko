import Phaser from 'phaser';
import { GAME_STATE, GET_SCALE_SIZE, GET_TILE_SIZE, GET_WALL_WIDTH, GET_X_FROM_INDEX, GET_Y_FROM_INDEX, getLevelConfig } from '../utils/GameState';

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
        
        this.sprite.setScale(GET_SCALE_SIZE());

        if (x == 0 || x == getLevelConfig().board_width - 1) {
            this.sprite.displayWidth = GET_WALL_WIDTH();
            this.sprite.width = GET_WALL_WIDTH();
        } else {
            this.sprite.displayWidth = GET_TILE_SIZE();
            this.sprite.width = GET_TILE_SIZE();
        }

        if (y == 0 || y == getLevelConfig().board_height - 1) {
            this.sprite.height = GET_WALL_WIDTH();
            this.sprite.displayHeight = GET_WALL_WIDTH();
        } else {
            this.sprite.height = GET_TILE_SIZE();
            this.sprite.displayHeight = GET_TILE_SIZE();
        }

        this.scene.physics.world.enable(this.sprite);
        (<Phaser.Physics.Arcade.Body>this.sprite.body).setImmovable(true);
        if (this.sprite.body) {
            this.sprite.body.debugBodyColor = 0x00ff00;
        }

        this.sprite.visible = false;
    }

    public getSprite() {
        return this.sprite;
    }
}

export default Wall;
