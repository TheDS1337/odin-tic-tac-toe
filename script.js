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
    const typeToMark = ['X', 'O'];
    const typeToColor = ['var(--color-player)', 'var(--color-computer)'];

    let cells = [];
    let boardElement = doc.querySelector("#board");
    let currMove = -1;
    let playCounter = 0;
    let onGameEnd = null;

    const createCells = (callback, startingMove = 0, size = 3) => {
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
        onGameEnd = callback;
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

            if( winner !== -1 )
                return winner;
        }

        return -1;
    }

    const onCellClick = (event) => {
        let buttonElement = event.target;

        let idToStr = buttonElement.id.split('-');
        let x = parseInt(idToStr[1]);
        let y = parseInt(idToStr[2]); 

        if( buttonElement.textContent.length > 0 ) {
            consoleElement.innerHTML += (`> Cannot click on the cell at (${x}, ${y}), as it is already filled.\n`);
            consoleElement.scrollTop = consoleElement.scrollHeight;
            return;
        }

        buttonElement.textContent = typeToMark[currMove];
        buttonElement.style.backgroundColor = typeToColor[currMove];

        currMove = 1 - currMove;

        let winner = checkWinner();

        if( winner !== -1 || ++playCounter === cells.length * cells.length ) {
            if( onGameEnd !== null )
                onGameEnd(winner);

            cells.forEach(r => r.forEach(cell => cell.removeEventListener("click", onCellClick)));
        } 
    };

    return { createCells, clear, checkWinner };
};

let human = Player("Amine");
let computer = Player("Computer");

const gameController = (function (doc, board, players) {
    let roundCounter = 0;
    let tiesCounter = 0;

    doc.querySelector("#button-start").addEventListener("click", () => {
        board.clear();
        board.createCells(onRoundEnd, roundCounter % 2);

        consoleElement.innerHTML += `> Round ${++roundCounter}\n\n`;
        consoleElement.scrollTop = consoleElement.scrollHeight;
    });

    const onRoundEnd = winner => {
        if( winner === -1 ) {
            tiesCounter++;
            consoleElement.innerHTML += `> No one won the game! we have a tie.\n\n\n`;
        } else {
            players[winner].increaseScore();
            consoleElement.innerHTML += `> Player ${winner} won the game. Chicken dinner, we have a winner!\n\n\n`;
        }

        consoleElement.scrollTop = consoleElement.scrollHeight;
    };
})(document, GameBoard(document), [ human, computer ]);

let consoleElement = document.querySelector("#console");