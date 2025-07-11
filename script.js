const game = (function(doc)
{
    let boardElement = doc.querySelector("#board");

    let board = null;
    let scoreComputer = 0;
    let scoreHuman = 0;
    let ties = 0;
    let roundsPlayed = 0;

    function makeMove(x, y)
    {
        const checkWinner = () => {
            for( let row of board.getCells() ) {
                let sameTypeCount = 1;
                let lastBoardCell = '';

                for( let i = 1; i < row.length; i++ ) {
                    lastBoardCell = row[i];

                    if( lastBoardCell === '' || lastBoardCell !== row[i - 1] )
                        break;

                    sameTypeCount++;
                }

                if( sameTypeCount === 3 )
                    return lastBoardCell === 'X' ? 0 : 1;
            }

            // No winner yet
            return -1;
        }

        if( board.fillBoard(x, y) ) {
            let winner = checkWinner();

            if( winner === -1 ) {
                board.updateNextMove();
                console.log(`Now player ${board.getNextMove() + 1} can make a move.`);
            } else 
                console.log(`We have a winner! Player ${winner + 1} won the match!`);
        }

        return -1;
    }

    function createBoard(resetScores = false, size = 3)
    {
        if( resetScores ) {
            scoreComputer = 0;
            scoreHuman = 0;
            ties = 0;
            roundsPlayed = 0;
        }

        board = (function ()
        {
            boardElement.style.gridTemplate = `repeat(${size}, 1fr) / repeat(${size}, 1fr)`
            boardElement.style.gap = `${4 / size}vh`;
            console.log(boardElement.style.gap);

            let nextMove = roundsPlayed++ % 2;

            let cells = [];
            for( let i = 0; i < size; i++ ) {
                cells.push(Array.from(Array(size), () => {
                        let cell = document.createElement("button");

                        cell.classList.add("cell");
                        boardElement.appendChild(cell);

                        return cell;
                }));
            }

            console.log(cells);

            const fillBoard = (x, y) => {
                if( cells[x][y].textContent !== '' ) {
                    console.log("This cell cannot be filled")
                    return false;
                }

                cells[x][y] = nextMove === 0 ? 'X' : 'O';
                return true;
            }

            const getCells = () => cells;
            const getNextMove = () => nextMove;
            const updateNextMove = () => nextMove = 1 - nextMove;

            return { getCells, getNextMove, fillBoard, updateNextMove };
        })();
    }

    function think()
    {
    }

    return { createBoard, think };
})(document);

game.createBoard(true);
game.think();