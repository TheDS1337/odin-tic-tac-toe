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
    let cells = [];
    let boardElement = doc.querySelector("#board");

    const createCells = (size = 3) => {
        boardElement.style.display = "grid";
        boardElement.style.gridTemplate = `repeat(${size}, 1fr) / repeat(${size}, 1fr)`
        boardElement.style.gap = `${4 / size}vh`;

        for( let i = 0; i < size; i++ ) {
            let j = 0;

            cells.push(Array.from(Array(size), () => {
                    let cell = doc.createElement("button");

                    cell.id = `cell-${i}-${j++}`;
                    cell.classList.add("cell");

                    boardElement.appendChild(cell);

                    return cell;
            }));
        }
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

    const fillCell = (x, y, type) => {
        if( cells[x][y].textContent.length > 0 ) {
            console.log(`The cell at (${x}, ${y}) is already filled.`);
            return false;
        }

        cells[x][y].textContent = type === 0 ? 'O' : 'X';
        return true;
    }

    const rowOrDiagWin = (arr) => {
        // Do checks in all rows / the one diagonal
        return -1;
    }

    const checkWinner = () => {
        let winnerType = rowOrDiagWin(cells);

        if( winnerType === -1 )
            winnerType = rowOrDiagWin(/*rotatedCells*/cells);

        return winnerType;
    }

    return { createCells, removeCells, fillCell, checkWinner };
};

let human = Player("Amine");
let computer = Player("Computer");

const gameController = (function (doc, board, players) {
    const startRound = () => {
        board.removeCells();
        board.createCells();
    }

    doc.querySelector("#button-start").addEventListener("click", () => startRound());
})(document, GameBoard(document), [ human, computer ]);