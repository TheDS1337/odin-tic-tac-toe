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

    const createCells = (startingMove = 0, size = 3) => {
        boardElement.style.display = "grid";
        boardElement.style.gridTemplate = `repeat(${size}, 1fr) / repeat(${size}, 1fr)`
        boardElement.style.gap = `${4 / size}vh`;

        for( let i = 0; i < size; i++ ) {
            let j = 0;

            cells.push(Array.from(Array(size), () => {
                    let cell = doc.createElement("button");

                    cell.id = `cell-${i}-${j++}`;
                    cell.classList.add("cell");

                    cell.addEventListener("click", onCellClick);

                    boardElement.appendChild(cell);

                    return cell;
            }));
        }

        currMove = startingMove;
    };

    const removeCells = () => {
        let boardParentElement = boardElement.parentNode;
        let boardElementType = boardElement.tagName;

        boardElement.remove();

        boardElement = doc.createElement(boardElementType);
        boardElement.id = "board";
        cells = [];

        boardParentElement.insertBefore(boardElement, boardParentElement.firstChild);
    };

    const checkConsecutiveMarks = (arr) => {
        let lastType = arr[0].textContent;

        for( let i = 1; i < arr.length; i++ ) {
            let currType = arr[i].textContent;

            if( currType.length === 0 )
                return -1;

            if( currType !== lastType )
                return -1;

            lastType = currType;
        }

        return typeToMark.indexOf(lastType);
    }

    const checkWinner = () => {
        let lines = [cells.map((row, i) => row[i]), cells.map((row, i) => row[cells.length - i - 1])];

        for( let i = 0; i < cells.length; i++ ) {
            lines.push(cells.map((row) => row[i]));
            lines.push(cells[i]);
        }

        for( line of lines ) {
            let winner = checkConsecutiveMarks(line);

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
            console.log(`Cannot click on the cell at (${x}, ${y}), as it is already filled.`);
            return;
        }

        buttonElement.textContent = typeToMark[currMove];
        buttonElement.style.backgroundColor = typeToColor[currMove];

        currMove = 1 - currMove;

        let winner = checkWinner();

        if( winner !== -1 ) {
            console.log("Chicken dinner, we have a winner!");
            console.log(`Player ${winner} won the game.`);
        }
    };

    return { createCells, removeCells, checkWinner };
};

let human = Player("Amine");
let computer = Player("Computer");

const gameController = (function (doc, board, players) {
    let roundCounter = 0;

    const startRound = () => {
        board.removeCells();
        board.createCells(roundCounter % 2);
    }

    doc.querySelector("#button-start").addEventListener("click", () => startRound());
})(document, GameBoard(document), [ human, computer ]);