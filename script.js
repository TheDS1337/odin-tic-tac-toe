function Player(name)
{
    let score = 0;
    let scoreElement = null;

    const updateScoreElement = () => {
        if( scoreElement === null )
            return;

        scoreElement.textContent = `${score}`;
    }

    const getName = () => name;
    const setName = (newName) => name = newName;
    const getScore = () => score;

    const setScoreElement = (elm) => scoreElement = elm;

    const increaseScore = () => {
        score++;
        updateScoreElement();
    }

    const resetScore = () => {
        score = 0;
        updateScoreElement();
    }

    return { getName, setName, getScore, setScoreElement, increaseScore, resetScore };
}

function GameBoard(doc)
{
    const typeToMark = ['X', 'O'];
    const typeToColor = ['var(--color-player)', 'var(--color-computer)'];

    let cells = [];
    let boardElement = doc.querySelector("#board");
    let currMove = -1;
    let playCounter = 0;
    let onGameMove = null;
    let onGameEnd = null;

    const createCells = (moveCallback = null, endCallback = null, startingMove = 0, size = 3) => {
        boardElement.style.display = "grid";
        boardElement.style.gridTemplate = `repeat(${size}, 1fr) / repeat(${size}, 1fr)`
        boardElement.style.gap = `${4 / size}vh`;

        cells = Array.from(Array(size), (_, i) => {
            return Array.from(Array(size), (_, j) => {
                    let cell = doc.createElement("button");

                    cell.id = `cell-${i}-${j++}`;
                    cell.classList.add("cell");

                    cell.addEventListener("click", onCellClick);

                    boardElement.appendChild(cell);

                    return cell;
            });
        });

        currMove = startingMove;
        playCounter = 0;
        onGameMove = moveCallback;
        onGameEnd = endCallback;
    };

    const clear = () => {
        let boardParentElement = boardElement.parentNode;
        let boardElementType = boardElement.tagName;

        boardElement.remove();

        boardElement = doc.createElement(boardElementType);
        boardElement.id = "board";
        cells = [];

        boardParentElement.insertBefore(boardElement, boardParentElement.firstChild);
    };

    const getLineType = (line) => {
        let type = line[0].textContent;

        if( type.length === 0 || !line.every(cell => cell.textContent === type) )
            return -1;

        return typeToMark.indexOf(type);
    }

    const checkWinner = () => {
        let lines = [cells.map((row, i) => row[i]), cells.map((row, i) => row[cells.length - i - 1])];

        for( let i = 0; i < cells.length; i++ ) {
            lines.push(cells.map((row) => row[i]));
            lines.push(cells[i]);
        }

        for( line of lines ) {
            let winner = getLineType(line);

            if( winner !== -1 ) {
                if( onGameEnd !== null )
                    onGameEnd(winner);

                cells.forEach(r => r.forEach(cell => cell.removeEventListener("click", onCellClick)));

                return winner;
            }
        }

        if( playCounter === cells.length * cells.length ) {
            if( onGameEnd !== null )
                onGameEnd(-1);
        }

        return -1;
    }

    const computerMakeMove = () => {
        // Just some stupid AI logic here :]

        let emptyCells = cells.flat().filter(cell => cell.textContent.length === 0);

        if( emptyCells.length === 0 ) {
            return;
        }

        let buttonElement = emptyCells[Math.floor(Math.random() * emptyCells.length)];

        buttonElement.textContent = typeToMark[currMove];
        buttonElement.style.backgroundColor = typeToColor[currMove];

        playCounter++;
        currMove = 1 - currMove;
    };

    const onCellClick = (event) => {
        let buttonElement = event.target;

        let idToStr = buttonElement.id.split('-');
        let x = parseInt(idToStr[1]) + 1;
        let y = parseInt(idToStr[2]) + 1; 

        if( buttonElement.textContent.length > 0 ) {
            console.log(`Cannot click on the cell at (${x}, ${y}), as it is already filled.`);
            return;
        }

        buttonElement.textContent = typeToMark[currMove];
        buttonElement.style.backgroundColor = typeToColor[currMove];

        if( onGameMove !== null )
            onGameMove(currMove, {x, y});

        playCounter++;
        currMove = 1 - currMove;

        let winner = checkWinner();

        if( winner === -1 ) {
            computerMakeMove();
            checkWinner();
        }
    };

    return { createCells, clear };
};

let human = Player("Amine");
let computer = Player("Elon Musk");

const gameController = (function (doc, board, players) {
    let consoleElement = doc.querySelector("#console");
    let tiesScoreElement = doc.querySelector("#score-ties .score");

    players[0].setScoreElement(doc.querySelector("#score-human .score"));
    players[1].setScoreElement(doc.querySelector("#score-computer .score"));

    let roundCounter = 0;
    let tiesCounter = 0;

    doc.querySelector("#button-start").addEventListener("click", () => {
        board.clear();
        board.createCells(onRoundMove, onRoundEnd, roundCounter % 2);

        consoleElement.innerHTML += `> Round ${++roundCounter}\n\n`;
        consoleElement.scrollTop = consoleElement.scrollHeight;
    });

    const onRoundMove = (mover, pos) => {
        consoleElement.innerHTML += `> ${players[mover].getName()} played the position (${pos.x}, ${pos.y}).\n`;
        consoleElement.scrollTop = consoleElement.scrollHeight;
    };

    const onRoundEnd = winner => {
        if( winner === -1 ) {
            tiesScoreElement.textContent = `${++tiesCounter}`;
            consoleElement.innerHTML += `> No one won the game! we have a tie.\n\n\n`;
        } else {
            players[winner].increaseScore();
            consoleElement.innerHTML += `> ${players[winner].getName()} won the game. Chicken dinner, we have a winner!\n\n\n`;
        }

        consoleElement.scrollTop = consoleElement.scrollHeight;
    };
})(document, GameBoard(document), [ human, computer ]);