import Boot from './states/Boot';
import Play from './states/Play';

import 'phaser';
import Start from './states/Start';
import GameOver from './states/GameOver';
import DailyClear from './states/DailyClear';
import { GAME_HEIGHT, GAME_WIDTH, refreshGameWidth } from './utils/Constants';
import { GAME_STATE } from './utils/GameState';
import './utils/posthog'; // initializes analytics (exception capture included)

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

// Temporary FPS readout for perf diagnosis
const fpsEl = document.createElement('div');
Object.assign(fpsEl.style, {
    position: 'fixed', right: '6px', bottom: '6px', zIndex: '10',
    font: '12px monospace', color: '#0c100a', background: 'rgba(255,255,255,0.55)',
    padding: '2px 6px', borderRadius: '3px', pointerEvents: 'none',
});
document.body.appendChild(fpsEl);
setInterval(() => {
    fpsEl.textContent = `${Math.round(game.loop.actualFps)} FPS`;
}, 500);

// Keep the canvas truly full-screen when the window changes shape: recompute
// the logical width, resize the game, and restart the active scene so it lays
// out for the new dimensions. Play snapshots its progress first, so a mid-run
// resize rebuilds the current level but keeps score/lives/level.
let resizeTimer: ReturnType<typeof setTimeout> | undefined;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const width = refreshGameWidth();
        if (width === game.scale.gameSize.width) return;
        game.scale.setGameSize(width, GAME_HEIGHT);
        game.scene.getScenes(true).forEach(scene => {
            if (scene.scene.key === 'Play') {
                GAME_STATE.resumeSnapshot = {
                    score: GAME_STATE.score,
                    lives: GAME_STATE.lives,
                    currentLevel: GAME_STATE.currentLevel,
                };
            }
            scene.scene.restart();
        });
    }, 200);
});
