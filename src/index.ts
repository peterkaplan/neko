import Boot from './states/Boot';
import Play from './states/Play';

import 'phaser';
import Start from './states/Start';

const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'canvasWrapper',
    width: 360,
    height: 640,
    scene: [Boot, Start, Play],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
      //  autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(gameConfig);
