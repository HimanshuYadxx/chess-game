document.addEventListener('DOMContentLoaded', () => {
    const boardContainer = document.getElementById('board-container');
    const gameStatus = document.getElementById('game-status');

    // Check if board-container exists before proceeding
    if (!boardContainer) {
        console.error("Error: Could not find board-container element in the DOM.");
        return;
    }
    
    const chess = new Chess();
    let draggedItem = null;

    function createBoard() {
        boardContainer.innerHTML = ''; // Clear the board
        const board = chess.board();

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = document.createElement('div');
                square.classList.add('square', (i + j) % 2 === 0 ? 'white' : 'black');
                square.dataset.row = i;
                square.dataset.col = j;
                const squareNotation = getSquareNotation(square);
                square.dataset.square = squareNotation;

                const piece = board[i][j];
                if (piece) {
                    const pieceElement = document.createElement('span');
                    pieceElement.classList.add('piece');
                    // The key for the map uses piece type for white, and uppercase for black
                    const pieceKey = piece.color === 'b' ? piece.type.toUpperCase() : piece.type;
                    pieceElement.innerHTML = getPieceUnicode(pieceKey);
                    pieceElement.draggable = true;
                    pieceElement.dataset.piece = pieceKey;
                    square.appendChild(pieceElement);
                }
                boardContainer.appendChild(square);
            }
        }
        addDragAndDropListeners();
        updateGameStatus();
    }

    function getPieceUnicode(pieceKey) {
        const unicodeMap = {
            'p': '♙', 'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔', // White
            'P': '♟', 'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚'  // Black
        };
        return unicodeMap[pieceKey] || '';
    }

    function addDragAndDropListeners() {
        const pieces = document.querySelectorAll('.piece');
        const squares = document.querySelectorAll('.square');

        pieces.forEach(piece => {
            piece.addEventListener('dragstart', (e) => {
                // Check if it's the correct player's turn
                const pieceColor = e.target.dataset.piece === e.target.dataset.piece.toLowerCase() ? 'w' : 'b';
                if (chess.turn() === pieceColor) {
                    draggedItem = e.target;
                    setTimeout(() => {
                        e.target.style.opacity = '0.5';
                    }, 0);
                } else {
                    e.preventDefault(); // Prevent dragging if it's not their turn
                }
            });

            piece.addEventListener('dragend', (e) => {
                setTimeout(() => {
                    if (draggedItem) {
                        draggedItem.style.opacity = '1';
                        draggedItem = null;
                    }
                }, 0);
            });
        });

        squares.forEach(square => {
            square.addEventListener('dragover', (e) => e.preventDefault());
            square.addEventListener('dragenter', (e) => e.preventDefault());
            
            square.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedItem) {
                    const fromSquare = draggedItem.parentElement.dataset.square;
                    const toSquare = e.currentTarget.dataset.square;
                    
                    try {
                        const move = chess.move({
                            from: fromSquare,
                            to: toSquare,
                            promotion: 'q' // Always promote to queen for simplicity
                        });

                        if (move) {
                            createBoard(); // Redraw board on successful move
                        }
                    } catch (err) {
                        // This will catch illegal moves if chess.js throws an error
                        console.log("Illegal move:", err.message);
                        // No need to redraw, piece will snap back
                    }
                }
            });
        });
    }

    function getSquareNotation(squareElement) {
        const col = 'abcdefgh'[squareElement.dataset.col];
        const row = 8 - squareElement.dataset.row;
        return `${col}${row}`;
    }

    function updateGameStatus() {
        let status = '';
        const moveColor = chess.turn() === 'w' ? 'White' : 'Black';

        if (chess.in_checkmate()) {
            status = `Game over. ${moveColor} is in checkmate.`;
        } else if (chess.in_draw()) {
            status = `Game over. It's a draw.`;
        } else {
            status = `${moveColor}'s turn.`;
            if (chess.in_check()) {
                status += ` ${moveColor} is in check.`;
            }
        }
        gameStatus.textContent = status;
    }

    // Initial setup
    createBoard();
});
