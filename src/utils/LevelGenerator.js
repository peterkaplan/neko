
createLevel(playerPosition, boxPositions) {
    if(this.character) {
        this.character.sprite.destroy();
        this.character = null;
    }

    this.boxes.forEach(box => { box.sprite.destroy(); box = null; });
    this.boxes = [];

    this.character = new Character(this.scene, playerPosition.x, playerPosition.y);
    boxPositions.forEach(box => this.boxes.push(new Box(this.scene, box.x, box.y, this.character)));
    console.log(this.boxes);
}

levelOne() {
   const boxPositions = 
   [
    {
        "x": 9,
        "y": 6
    },
    {
        "x": 9,
        "y": 12
    },
    {
        "x": 6,
        "y": 12
    },
    {
        "x": 11,
        "y": 12
    },
    {
        "x": 7,
        "y": 14
    }
];

   const playerPosition =  {
        "x": 7,
        "y": 6
    };

    this.createLevel(playerPosition, boxPositions);
}

getTileAt(row, col) {
    if (row >= 0 && row < this.map.length && col >= 0 && col < this.map[row].length) {
        return this.map[row][col];
    }
    return null; // Return null if the indices are out of bounds
}

isLevelSolvable(characterPosition, boxPositions) {
    let visited = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));
    let boxesLeft = new Set(boxPositions.map(pos => `${pos.x},${pos.y}`));
    console.log(characterPosition, boxPositions);

    if(this.character) {
        this.character.sprite.destroy();
        this.character = null;
    }

    this.boxes.forEach(box => box.sprite.destroy());

    this.character = new Character(this.scene, characterPosition.x, characterPosition.y);
    boxPositions.forEach(box => this.boxes.push(new Box(this.scene, box.x, box.y, this.character)));

    function moveUntilBoxOrWall(x, y, dx, dy) {
        while (true) {
            x += dx;
            y += dy;

            if (x < 0 || y < 0 || x >= BOARD_SIZE || y >= BOARD_SIZE) {
                // Hit a wall
                return null;
            }

            let posKey = `${x},${y}`;
            if (boxesLeft.has(posKey)) {
                // Found a box
                boxesLeft.delete(posKey);
                return {x, y};
            }
        }
    }

    function dfs(x, y) {
        if (visited[y][x] || boxesLeft.size === 0) {
            return;
        }

        visited[y][x] = true;

        // Try to move in each direction
        let directions = [
            {dx: 1, dy: 0},   // right
            {dx: -1, dy: 0},  // left
            {dx: 0, dy: 1},   // down
            {dx: 0, dy: -1}   // up
        ];

        for (let dir of directions) {
            let newPos = moveUntilBoxOrWall(x, y, dir.dx, dir.dy);
            if (newPos) {
                dfs(newPos.x, newPos.y);
            }
        }
    }

    dfs(characterPosition.x, characterPosition.y);

    return boxesLeft.size === 0;
}


generateLevel() {
    const maxBoxes = 20;
    const minBoxes = 10;

 //   const numberOfBoxes = Math.floor(Math.random() * (maxBoxes - minBoxes + 1)) + minBoxes;
    const numberOfBoxes = 5;
    let boxPositions = [];
    let takenPositions = new Set();

    for (let i = 0; i < numberOfBoxes; i++) {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * BOARD_SIZE),
                y: Math.floor(Math.random() * BOARD_SIZE)
            };
        } while (takenPositions.has(JSON.stringify(position))); 

        boxPositions.push(position);
        takenPositions.add(JSON.stringify(position));
    }

    let characterPosition;
    do {
        characterPosition = {
            x: Math.floor(Math.random() * BOARD_SIZE),
            y: Math.floor(Math.random() * BOARD_SIZE)
        };
    } while (takenPositions.has(JSON.stringify(characterPosition))); 

    const level = {
        boxPositions: boxPositions,
        characterPosition: characterPosition
    };


    if (!this.isLevelSolvable(level.characterPosition, level.boxPositions)) {
        let solvableStartPosition = null;

        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                if (!level.boxPositions.some(pos => pos.x === x && pos.y === y)) {
                    if (this.isLevelSolvable({x, y}, level.boxPositions)) {
                        solvableStartPosition = {x, y};
                        break;
                    }
                }
            }

            if (solvableStartPosition) {
                break;
            }
        }

        if (solvableStartPosition) {
            console.log("success??");
            level.characterPosition = solvableStartPosition;
        } else {
            console.log("no luck");
        }
    }

    return level;
}