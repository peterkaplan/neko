import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './Constants';

// Deeper blue up top, hazier toward the horizon
const SKY_BANDS = [0x5aa9e2, 0x6cb5e9, 0x7cc0ee, 0x8ecdf4, 0xa5daf8];

export function preloadSky(scene: Phaser.Scene): void {
    if (!scene.textures.exists('cloud_a')) scene.load.image('cloud_a', 'assets/generated/cloud_a.png');
    if (!scene.textures.exists('cloud_b')) scene.load.image('cloud_b', 'assets/generated/cloud_b.png');
    if (!scene.textures.exists('cloud_c')) scene.load.image('cloud_c', 'assets/generated/cloud_c.png');
}

// Full-canvas banded pixel sky with clouds drifting slowly left-to-right,
// tucked behind everything at depth -2
export function addSky(scene: Phaser.Scene): void {
    const bandHeight = Math.ceil(GAME_HEIGHT / SKY_BANDS.length);
    SKY_BANDS.forEach((color, i) => {
        scene.add.rectangle(0, i * bandHeight, GAME_WIDTH, bandHeight, color)
            .setOrigin(0)
            .setDepth(-2);
    });

    const clouds = [
        { key: 'cloud_a', y: 0.07, scale: 3.2, speed: 9 },
        { key: 'cloud_b', y: 0.18, scale: 2.2, speed: 6 },
        { key: 'cloud_c', y: 0.32, scale: 2.8, speed: 7 },
        { key: 'cloud_b', y: 0.48, scale: 1.8, speed: 5 },
        { key: 'cloud_a', y: 0.63, scale: 2.6, speed: 8 },
        { key: 'cloud_c', y: 0.78, scale: 2.2, speed: 6 },
        { key: 'cloud_b', y: 0.90, scale: 2.0, speed: 5 },
    ];
    clouds.forEach((cloud, i) => {
        // Deterministic scatter across the width so the sky never loads empty
        const img = scene.add.image(((i * 0.37 + 0.15) % 1) * GAME_WIDTH, cloud.y * GAME_HEIGHT, cloud.key)
            .setScale(cloud.scale)
            .setDepth(-2)
            .setAlpha(0.9);
        drift(scene, img, cloud.speed);
    });
}

function drift(scene: Phaser.Scene, img: Phaser.GameObjects.Image, speed: number): void {
    const margin = img.displayWidth / 2 + 4;
    scene.tweens.add({
        targets: img,
        x: GAME_WIDTH + margin,
        duration: ((GAME_WIDTH + margin - img.x) / speed) * 1000,
        ease: 'Linear',
        onComplete: () => {
            if (!img.active) return;
            img.x = -margin;
            drift(scene, img, speed);
        },
    });
}
