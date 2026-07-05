import Phaser from 'phaser';
import { GAME_WIDTH, textResolution } from './Constants';
import { getDailyStats, getTodayResult, isTodayCompleted } from './Daily';

// Wordle-style daily stats block: four big-number tiles plus the
// hearts-remaining distribution with today's result highlighted in gold.
// Shared by the menu's trophy overlay and the daily clear screen.
// Returns the y coordinate just below the rendered block.
export function renderDailyStats(
    scene: Phaser.Scene,
    add: (go: Phaser.GameObjects.GameObject) => void,
    topY: number,
): number {
    const centerX = GAME_WIDTH / 2;
    const stats = getDailyStats();

    const winPct = stats.played > 0 ? Math.round((stats.completed / stats.played) * 100) : 0;
    const tiles: [string, string][] = [
        [String(stats.played), 'PLAYED'],
        [String(winPct), 'WIN %'],
        [String(stats.streak), 'STREAK'],
        [String(stats.maxStreak), 'MAX\nSTREAK'],
    ];
    const spread = Math.min(GAME_WIDTH - 60, 460);
    tiles.forEach(([num, label], i) => {
        const x = centerX + spread * ((i - 1.5) / 4);
        add(scene.add.text(x, topY, num, {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '26px',
            color: '#f4efe2',
            stroke: '#0c100a',
            strokeThickness: 5,
        }).setOrigin(0.5));
        add(scene.add.text(x, topY + 40, label, {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '8px',
            color: '#93ab88',
            align: 'center',
            lineSpacing: 4,
        }).setOrigin(0.5, 0));
    });

    add(scene.add.text(centerX, topY + 105, 'SOLVED WITH HEARTS LEFT', {
        fontFamily: 'PixelFont',
        resolution: textResolution(),
        fontSize: '11px',
        color: '#f2d032',
    }).setOrigin(0.5));

    const maxCount = Math.max(1, ...stats.hearts);
    const todayLives = isTodayCompleted() ? getTodayResult()?.lives ?? 0 : 0;
    const heartsX = centerX - Math.min(GAME_WIDTH / 2 - 20, 170);
    const barX = heartsX + 3 * 24 + 10;
    const barMax = Math.min(230, GAME_WIDTH / 2 + (centerX - barX) - 60);
    [3, 2, 1].forEach((livesCount, row) => {
        const y = topY + 145 + row * 38;
        for (let h = 0; h < 3; h++) {
            add(scene.add.image(heartsX + h * 24, y, 'heart')
                .setScale(1.8)
                .setAlpha(h < livesCount ? 1 : 0.18));
        }
        const count = stats.hearts[livesCount - 1] ?? 0;
        const highlight = todayLives === livesCount;
        const barW = Math.max(20, (count / maxCount) * barMax);
        add(scene.add.rectangle(barX, y, barW, 22, highlight ? 0xf2d032 : 0x4c5c46).setOrigin(0, 0.5));
        add(scene.add.text(barX + barW - 7, y, String(count), {
            fontFamily: 'PixelFont',
            resolution: textResolution(),
            fontSize: '11px',
            color: highlight ? '#0c100a' : '#f4efe2',
        }).setOrigin(1, 0.5));
    });

    return topY + 145 + 2 * 38 + 30;
}
