import { Level, Position } from "./GameState";
import { BOARD_HEIGHT, BOARD_LENGTH } from "./Constants";

export function createLevel(): Level {
    let takenPositions = new Set();
    let position = getRandomPosition();
    takenPositions.add(JSON.stringify(position));
    const level: Level = {
        id: 2,
        playerStartPosition: position,
        boxPositions: [],
    };

    //console.log(`Start position: (${position.x}, ${position.y})`);
    const turns = 4;
    for (let i = 0; i < turns; i++) {
        let currentPosition = position;
        
        do {
            position = getNextPosition(currentPosition);
        } while (takenPositions.has(JSON.stringify(position))); 
        //console.log(`Current position: ${currentPosition.x}, ${currentPosition.y})`);
        //console.log(`Next position: (${position.x}, ${position.y})`);
        for (let j = Math.min(currentPosition.x, position.x); j <= Math.max(currentPosition.x, position.x); j++) {
            for (let k = Math.min(currentPosition.y, position.y); k <= Math.max(currentPosition.y, position.y); k++) {
                //console.log('taking position', j, k);
                takenPositions.add(JSON.stringify({x: j, y: k}));
            }
        }

        level.boxPositions.push(position);
        takenPositions.add(JSON.stringify(position));
    }

    return level;
}

function getNextPosition(position: Position): Position {
    return Math.random() < 0.5 ? getRandomPosition(position.x, undefined) : getRandomPosition(undefined, position.y);
}

function getRandomPosition(fixedX?: number, fixedY?: number): Position {
    let x = fixedX !== undefined ? fixedX : randomIntFromInterval(1, BOARD_LENGTH - 2);
    let y = fixedY !== undefined ? fixedY : randomIntFromInterval(1, BOARD_HEIGHT - 2);

    //console.log(`fixed position: (${fixedX}, ${fixedY}) => (${x}, ${y})`);

    return {x, y};
}

function randomIntFromInterval(min: number, max: number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

function isBorderPosition(i: number, j: number): boolean {
    return i === 0 || i === BOARD_HEIGHT - 1 || j === 0 || j === BOARD_LENGTH - 1;
}
