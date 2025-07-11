const game = (
    function()
    {
        const board = (function ()
        {
            let nextMove = 0;
            let cells = Array.from(Array(3), () => Array(3).fill(''));

            const fillBoard = (x, y) => {
                if( cells[x][y] !== '' ) {
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

        return { makeMove };
    }
)();