function Player(name)
{
    let score = 0;

    const getName = () => name;
    const setName = (newName) => name = newName;
    const getScore = () => score;

    const increaseScore = () => score++;
    const resetScore = () => score = 0;

    return { getName, setName, getScore, increaseScore, resetScore };
}

function GameBoard(doc)
{
    const playerIdToMark = ['X', 'O'];

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
    const getMarkFromPlayerId = (type) => playerIdToMark[type];
    const getPlayerIdFromMark = (mark) => playerIdToMark.indexOf(mark);

    const getLineType = (line) => {
        let classNames = line[0].className.split(' ');

        if( !classNames.includes(getMarkFromPlayerId(0)) && !classNames.includes(getMarkFromPlayerId(1)) )
            return -1;

        let mark = classNames.pop();

        if( !line.every(cell => mark === cell.className.split(' ').pop()) )
            return -1;

        line.forEach((cell, id) => { 
            cell.classList.add(`shine-${mark}`);
            cell.style.setProperty("--i", `${id + 1}`);
        });

        return getPlayerIdFromMark(mark);
    }

    const checkWinner = () => {
        let lines = [cells.map((row, i) => row[i]), cells.map((row, i) => row[cells.length - i - 1])];

        for( let i = 0; i < cells.length; i++ ) {
            lines.push(cells.map((row) => row[i]));
            lines.push(cells[i]);
        }

        for( const line of lines ) {
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
        
            return !classNames.includes(getMarkFromPlayerId(0)) && !classNames.includes(getMarkFromPlayerId(1))
        });

        if( emptyCells.length === 0 )
            return;

        // Make it take time to think, as if it really does...
        setTimeout(() => {
            let buttonElement = emptyCells[getRandom(emptyCells.length)];

            buttonElement.classList.add(getMarkFromPlayerId(currMove));

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

        if( classNames.includes(getMarkFromPlayerId(0)) || classNames.includes(getMarkFromPlayerId(1)) ) {
            console.log(`Cannot click on the cell at (${x}, ${y}), as it is already filled.`);
            return;
        }

        buttonElement.classList.add(getMarkFromPlayerId(currMove));

        if( onGameMove !== null )
            onGameMove(currMove, {x, y});

        playCounter++;
        currMove = 1 - currMove;

        let winner = checkWinner();

        if( winner === -1 )
            computerMakeMove();
    };

    return { createCells, clear, getBoardElement, getMarkFromPlayerId, getPlayerIdFromMark };
};

let human = Player("DS");
let computer = Player("Elon");

const gameController = (function (doc, board, players) {
    let consoleElement = doc.querySelector("#console");
    consoleElement.innerHTML = "";

    let tiesScoreElement = doc.querySelector("#score-ties .score + div");
    let playerScoreElements = [doc.querySelector("#score-X .score + div"),
        doc.querySelector("#score-O .score + div")];

    const changeNameElement = doc.querySelector("#change-name-dialog");
    const playerNameElement = doc.querySelector("#player-name");

    doc.querySelector("#change-name-dialog button[value='ok'").addEventListener("click", () => {
        changeNameElement.returnValue = "ok";
    });

    doc.querySelector("#change-name-dialog button[value='cancel'").addEventListener("click", () => {
        changeNameElement.returnValue = "cancel";
    });

    doc.querySelector("#change-name-dialog > form").addEventListener("submit", (event) => {
        event.preventDefault();

        if( changeNameElement.returnValue === "ok" ) {
            const newName = playerNameElement.value.trim();
            const playerId = board.getPlayerIdFromMark(playerNameElement.name);
            
            if (newName.length > 0)
                players[playerId].setName(newName);
        }

        changeNameElement.close();
    });

    for( const scoreDiv of doc.querySelectorAll(".score") ) {
        scoreDiv.addEventListener("click", event => {
            let parent = event.target.parentNode;

            switch( parent.id ) {
                case "score-X":
                    playerNameElement.value = players[0].getName();
                    playerNameElement.name = board.getMarkFromPlayerId(0);
                    playerNameElement.style.color = "var(--color-X)";
                    changeNameElement.showModal();
                    break;
                
                case "score-O":
                    playerNameElement.value = players[1].getName();
                    playerNameElement.name = board.getMarkFromPlayerId(1);
                    playerNameElement.style.color = "var(--color-O)";
                    changeNameElement.showModal();
                    break;

                default:
                    break;
            }
        });
    }

    let roundCounter = 0;
    let tiesCounter = 0;

    const startNewRound = () => {
        board.clear();
        board.createCells(onRoundMove, onRoundEnd, roundCounter % 2);

        consoleElement.innerHTML += `$  Round ${++roundCounter}\n`;
        consoleElement.scrollTop = consoleElement.scrollHeight;
    }

    doc.querySelector("#button-start").addEventListener("click", () => startNewRound());

    const onRoundMove = (mover, pos) => {
        consoleElement.innerHTML += `$  ${players[mover].getName()} played the position (${pos.x}, ${pos.y}).\n`;
        consoleElement.scrollTop = consoleElement.scrollHeight;
    };

    const onRoundEnd = winner => {
        if( winner === -1 ) {
            tiesScoreElement.textContent = `${++tiesCounter}`;
            consoleElement.innerHTML += `$  No one won the game! we have a tie.\n\n`;
        } else {
            players[winner].increaseScore();
            playerScoreElements[winner].textContent = `${players[winner].getScore()}`;
            consoleElement.innerHTML += `$  ${players[winner].getName()} won the game. Chicken dinner, we have a winner!\n\n`;
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