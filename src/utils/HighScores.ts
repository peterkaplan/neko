const STORAGE_KEY = 'neko-endless-best';

type Difficulty = 'normal' | 'hard';

function readScores(): Record<Difficulty, number> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return { normal: 0, hard: 0, ...JSON.parse(raw) };
    } catch {
        // storage unavailable (private mode etc.)
    }
    return { normal: 0, hard: 0 };
}

export function getEndlessBest(difficulty: Difficulty): number {
    return readScores()[difficulty];
}

// Returns true when the score sets a new record
export function recordEndlessScore(difficulty: Difficulty, score: number): boolean {
    const scores = readScores();
    if (score <= scores[difficulty]) return false;
    scores[difficulty] = score;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
        return true;
    } catch {
        return false;
    }
}
