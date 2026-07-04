import { GET_TILE_SIZE, GET_X_FROM_INDEX, GET_Y_FROM_INDEX } from '../utils/GameState';

export class Tile {
    private scene: any;
    private x: number;
    private y: number;
    private tile: Phaser.GameObjects.Sprite;

    constructor(scene: any, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        // Checker by parity; two textures per shade so detail doesn't repeat in lockstep
        const light = (x + y) % 2 === 0;
        const alt = (x * 7 + y * 13) % 3 === 0;
        this.tile = this.scene.add.sprite(GET_X_FROM_INDEX(this.x), GET_Y_FROM_INDEX(this.y), light ? (alt ? 'grass_c' : 'grass_a') : (alt ? 'grass_d' : 'grass_b'));
        this.tile.setOrigin(0);
        this.tile.setDisplaySize(GET_TILE_SIZE(), GET_TILE_SIZE());
    }

    public getSprite() {
        return this.tile;
    }
}

export default Tile;
