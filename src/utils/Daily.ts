import { DAILY_PUZZLES, DailyPuzzle } from './dailyPuzzles';

// Days since the local-time epoch day; stable across the day, ticks at local midnight
export function todayNumber(): number {
    const now = new Date();
    const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.floor(localMidnight.getTime() / 86400000);
}

export function todayDateLabel(): string {
    const now = new Date();
    return `${now.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${now.getDate()}`;
}

export function todayPuzzle(): DailyPuzzle {
    return DAILY_PUZZLES[todayNumber() % DAILY_PUZZLES.length];
}

function storageKey(): string {
    return `neko-daily-${todayNumber()}`;
}

export function isTodayCompleted(): boolean {
    try {
        return localStorage.getItem(storageKey()) !== null;
    } catch {
        return false;
    }
}

export interface DailyStats {
    completed: number;
    streak: number;
    lastDay: number;
}

const STATS_KEY = 'neko-daily-stats';

export function getDailyStats(): DailyStats {
    try {
        const raw = localStorage.getItem(STATS_KEY);
        if (raw) return JSON.parse(raw);
    } catch {
        // storage unavailable — treat as a fresh player
    }
    return { completed: 0, streak: 0, lastDay: -1 };
}

export function markTodayCompleted(score: number, lives: number): void {
    try {
        // Stats only advance on the first clear of the day, so replays can't
        // inflate the counters
        if (!isTodayCompleted()) {
            const stats = getDailyStats();
            const today = todayNumber();
            stats.completed += 1;
            stats.streak = stats.lastDay === today - 1 ? stats.streak + 1 : 1;
            stats.lastDay = today;
            localStorage.setItem(STATS_KEY, JSON.stringify(stats));
        }
        localStorage.setItem(storageKey(), JSON.stringify({ score, lives }));
    } catch {
        // storage unavailable (private mode etc.) — completion just isn't remembered
    }
}

// Today's finished run, if any: score and how many hearts survived
export function getTodayResult(): { score: number; lives: number } | null {
    try {
        const raw = localStorage.getItem(storageKey());
        if (raw) {
            const parsed = JSON.parse(raw);
            return { score: parsed.score ?? 0, lives: parsed.lives ?? 3 };
        }
    } catch {
        // storage unavailable
    }
    return null;
}

// Wordle-style share: the hearts you finished with ARE the result — the
// score stays off the share message on purpose
export function buildShareMessage(): string {
    const stats = getDailyStats();
    const lives = getTodayResult()?.lives ?? 3;
    const hearts = '❤️'.repeat(lives) + '🖤'.repeat(Math.max(0, 3 - lives));
    const date = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric' });
    return [
        `🐱 Neko Daily · ${date}`,
        hearts,
        `🔥 Streak: ${stats.streak}`,
        'https://peterkaplan.github.io/neko/',
    ].join('\n');
}
