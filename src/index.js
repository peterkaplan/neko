import Boot from '/src/states/Boot.js';
import Play from '/src/states/Play.js';

const gameConfig = {
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