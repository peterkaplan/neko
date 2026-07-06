// Endless share is a score brag — there's no shared board like the daily —
// so the message leads with the number and the difficulty that earned it
export function buildEndlessShareMessage(score: number, difficulty: string, isNewBest: boolean): string {
    const lines = [`🐱 Neko Endless · ${score} on ${difficulty.toUpperCase()}`];
    if (isNewBest) lines.push('🔥 New personal best');
    lines.push('Can you beat it? https://nekopuzzle.com/?utm_source=share&utm_content=endless');
    return lines.join('\n');
}
