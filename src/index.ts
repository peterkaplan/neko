import Boot from './states/Boot';
import Play from './states/Play';

import 'phaser';
import Start from './states/Start';
import GameOver from './states/GameOver';
import DailyClear from './states/DailyClear';
import { GAME_HEIGHT, GAME_WIDTH } from './utils/Constants';

const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'canvasWrapper',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    pixelArt: true,
    scene: [Boot, Start, Play, GameOver, DailyClear],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(gameConfig);

// Handy for debugging and driving the game from tests
(window as any).game = game;
