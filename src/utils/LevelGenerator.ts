import { GAME_STATE, Level, LevelConfig, Position, getLevelConfig } from "./GameState";

// Levels are generated as a chain: each jar shares a row or column with the
// previous stop and has a clear straight path to it, so visiting the jars in
// generation order is always a valid solution.
export function createLevel(): Level {
    const config = getLevelConfig();
    const takenTiles = new Set<string>();
    const boxPositions: Position[] = [];

    const start = getRandomPosition(config);
    takenTiles.add(key(start));

    let current = start;
    for (let i = 0; i < config.number_of_boxes; i++) {
        const next = findNextBoxPosition(config, current, takenTiles, boxPositions);
        if (!next) break; // board too crowded to extend the chain safely
        markSegment(current, next, takenTiles);
        boxPositions.push(next);
        current = next;
    }

    return {
        id: GAME_STATE.currentLevel,
        playerStartPositionIndex: start,
        boxPositionsIndex: boxPositions,
    };
}

function key(position: Position): string {
    return `${position.x},${position.y}`;
}

function findNextBoxPosition(config: LevelConfig, from: Position, takenTiles: Set<string>, boxes: Position[]): Position | undefined {
    for (let attempt = 0; attempt < 60; attempt++) {
        const candidate = Math.random() < 0.5
            ? getRandomPosition(config, from.x, undefined)
            : getRandomPosition(config, undefined, from.y);

        if (key(candidate) === key(from)) continue;
        if (takenTiles.has(key(candidate))) continue;
        // A jar between the previous stop and this one would intercept the
        // slide and break the intended solution path.
        if (boxes.some(box => isStrictlyBetween(from, candidate, box))) continue;

        return candidate;
    }
    return undefined;
}

function isStrictlyBetween(a: Position, b: Position, point: Position): boolean {
    if (a.x === b.x && point.x === a.x) {
        return point.y > Math.min(a.y, b.y) && point.y < Math.max(a.y, b.y);
    }
    if (a.y === b.y && point.y === a.y) {
        return point.x > Math.min(a.x, b.x) && point.x < Math.max(a.x, b.x);
    }
    return false;
}

function markSegment(a: Position, b: Position, takenTiles: Set<string>): void {
    for (let x = Math.min(a.x, b.x); x <= Math.max(a.x, b.x); x++) {
        for (let y = Math.min(a.y, b.y); y <= Math.max(a.y, b.y); y++) {
            takenTiles.add(key({ x, y }));
        }
    }
}

function getRandomPosition(config: LevelConfig, fixedX?: number, fixedY?: number): Position {
    const x = fixedX !== undefined ? fixedX : randomIntFromInterval(1, config.board_width - 2);
    const y = fixedY !== undefined ? fixedY : randomIntFromInterval(1, config.board_height - 2);
    return { x, y };
}

function randomIntFromInterval(min: number, max: number) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}
