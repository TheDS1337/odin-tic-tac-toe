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

        if( winner !== -1 ) {
            consoleElement.innerHTML += `> Player ${winner} won the game. Chicken dinner, we have a winner!\n`;
            consoleElement.scrollTop = consoleElement.scrollHeight;
            
            cells.forEach(r => r.forEach(cell => cell.removeEventListener("click", onCellClick)));
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

let consoleElement = document.querySelector("#console");