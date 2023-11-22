import { GAME_STATE, Level, LevelConfig, Position, getLevelConfig } from "./GameState";

export function createLevel(): Level {
    if (GAME_STATE.levels.length === 0) {

    }

    const takenPositions = new Set();
    const config = getLevelConfig();
    let position = getRandomPosition(config);
    takenPositions.add(JSON.stringify(position));
    const level: Level = {
        id: 1,
        playerStartPositionIndex: position,
        boxPositionsIndex: [],
    };

    //console.log(`Start position: (${position.x}, ${position.y})`);
    for (let i = 0; i < config.number_of_boxes; i++) {
        let currentPosition = position;
        
        do {
            position = getNextPosition(config, currentPosition);
        } while (takenPositions.has(JSON.stringify(position))); 

        for (let j = Math.min(currentPosition.x, position.x); j <= Math.max(currentPosition.x, position.x); j++) {
            for (let k = Math.min(currentPosition.y, position.y); k <= Math.max(currentPosition.y, position.y); k++) {
                takenPositions.add(JSON.stringify({x: j, y: k}));
            }
        }

        level.boxPositionsIndex.push(position);
        takenPositions.add(JSON.stringify(position));
    }

    return level;
}

function getNextPosition(config: LevelConfig, position: Position): Position {
    return Math.random() < 0.5 ? getRandomPosition(config, position.x, undefined) : getRandomPosition(config, undefined, position.y);
}

function getRandomPosition(config: LevelConfig, fixedX?: number, fixedY?: number): Position {
    let x = fixedX !== undefined ? fixedX : randomIntFromInterval(1, config.board_width - 2);
    let y = fixedY !== undefined ? fixedY : randomIntFromInterval(1, config.board_height - 2);

    //console.log(`fixed position: (${fixedX}, ${fixedY}) => (${x}, ${y})`);

    return {x, y};
}

function randomIntFromInterval(min: number, max: number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}