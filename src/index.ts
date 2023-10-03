import Boot from './states/Boot';
import Play from './states/Play';

import 'phaser';

const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'gameCanvas',
    width: 640,  // adjust based on your preference
    height: 640,
    scene: [Boot, Play],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
};

const game = new Phaser.Game(gameConfig);
