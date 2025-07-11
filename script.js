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

        if( currMove === 1 )
            computerMakeMove();
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

    const getBoardElement = () => boardElement;

    const getLineType = (line) => {
        let classNames = line[0].className.split(' ');

        if( !classNames.includes(typeToMark[0]) && !classNames.includes(typeToMark[1]) )
            return -1;

        let type = classNames.pop();

        if( !line.every(cell => type === cell.className.split(' ').pop()) )
            return -1;

        line.forEach((cell, id) => { 
            cell.classList.add(`shine-${type}`);
            cell.style.setProperty("--i", `${id + 1}`);
        });

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
        const getRandom = (max, min = 0) => min + Math.floor(Math.random() * (max - min));

        let emptyCells = cells.flat().filter(cell => {
            let classNames = cell.className.split(' ');
        
            return !classNames.includes(typeToMark[0]) && !classNames.includes(typeToMark[1])
        });

        if( emptyCells.length === 0 )
            return;

        // Make it take time to think, as if it really does...
        setTimeout(() => {
            let buttonElement = emptyCells[getRandom(emptyCells.length)];

            buttonElement.classList.add(typeToMark[currMove]);

            let idToStr = buttonElement.id.split('-');
            let x = parseInt(idToStr[1]) + 1;
            let y = parseInt(idToStr[2]) + 1;
            
            if( onGameMove !== null )
                onGameMove(currMove, {x, y});

            playCounter++;
            currMove = 1 - currMove;

            checkWinner();
        }, getRandom(2500, 250));
    };

    const onCellClick = (event) => {
        // Makes sure the player cant click while computer is still thinking
        if( currMove !== 0 )
            return;

        let buttonElement = event.target;

        let idToStr = buttonElement.id.split('-');
        let x = parseInt(idToStr[1]) + 1;
        let y = parseInt(idToStr[2]) + 1;

        let classNames = buttonElement.className.split(' ');

        if( classNames.includes(typeToMark[0]) || classNames.includes(typeToMark[1]) ) {
            console.log(`Cannot click on the cell at (${x}, ${y}), as it is already filled.`);
            return;
        }

        buttonElement.classList.add(typeToMark[currMove]);

        if( onGameMove !== null )
            onGameMove(currMove, {x, y});

        playCounter++;
        currMove = 1 - currMove;

        let winner = checkWinner();

        if( winner === -1 )
            computerMakeMove();
    };

    return { createCells, clear, getBoardElement };
};

let human = Player("Amine");
let computer = Player("Elon Musk");

const gameController = (function (doc, board, players) {
    let consoleElement = doc.querySelector("#console");
    consoleElement.innerHTML = "";

    let tiesScoreElement = doc.querySelector("#score-ties .score + div");

    players[0].setScoreElement(doc.querySelector("#score-human .score + div"));
    players[1].setScoreElement(doc.querySelector("#score-computer .score + div"));

    let roundCounter = 0;
    let tiesCounter = 0;

    const startNewRound = () => {
        board.clear();
        board.createCells(onRoundMove, onRoundEnd, roundCounter % 2);

        consoleElement.innerHTML += `> Round ${++roundCounter}\n\n`;
        consoleElement.scrollTop = consoleElement.scrollHeight;
    }

    doc.querySelector("#button-start").addEventListener("click", () => startNewRound());

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
        
        setTimeout(() => {
            let blurElement = doc.createElement("div");
            blurElement.id = "blur";

            let restartButtonElement = doc.createElement("button");

            restartButtonElement.id = "button-restart";
            restartButtonElement.addEventListener("click", () => startNewRound());

            blurElement.appendChild(restartButtonElement);
            board.getBoardElement().appendChild(blurElement);
        }, 2000);
    };
})(document, GameBoard(document), [ human, computer ]);