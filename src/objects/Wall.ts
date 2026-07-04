import Phaser from 'phaser';
import { WALL_THICKNESS } from '../utils/Constants';
import { GET_TILE_SIZE, GET_X_FROM_INDEX, GET_Y_FROM_INDEX, getLevelConfig } from '../utils/GameState';

export class Wall {
    private scene: Phaser.Scene;
    private x: number;
    private y: number;
    private sprite: Phaser.Physics.Arcade.Sprite;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        this.sprite = this.scene.add.sprite(GET_X_FROM_INDEX(this.x), GET_Y_FROM_INDEX(this.y), 'wall') as Phaser.Physics.Arcade.Sprite;
        this.sprite.setOrigin(0);

        const config = getLevelConfig();
        const width = (x === 0 || x === config.board_width - 1) ? WALL_THICKNESS : GET_TILE_SIZE();
        const height = (y === 0 || y === config.board_height - 1) ? WALL_THICKNESS : GET_TILE_SIZE();
        this.sprite.setDisplaySize(width, height);
        // The drawn board frame is the visual boundary; walls are just physics
        this.sprite.setVisible(false);

        this.scene.physics.world.enable(this.sprite);
        (<Phaser.Physics.Arcade.Body>this.sprite.body).setImmovable(true);
    }

    public getSprite() {
        return this.sprite;
    }
}

export default Wall;
