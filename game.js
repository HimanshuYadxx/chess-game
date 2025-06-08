document.addEventListener('DOMContentLoaded', () => {
    const boardContainer = document.getElementById('board-container');
    const gameStatus = document.getElementById('game-status');
    const chess = new Chess();
    let selectedPiece = null;
    let draggedItem = null;

    function createBoard() {
        boardContainer.innerHTML = '';
        const board = chess.board();
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = document.createElement('div');
                square.classList.add('square', (i + j) % 2 === 0 ? 'white' : 'black');
                square.dataset.row = i;
                square.dataset.col = j;

                const piece = board[i][j];
                if (piece) {
                    const pieceElement = document.createElement('span');
                    pieceElement.classList.add('piece');
                    pieceElement.textContent = getPieceUnicode(piece);
                    pieceElement.draggable = true;
                    pieceElement.dataset.piece = `${piece.type}${piece.color}`;
                    square.appendChild(pieceElement);
                }

                boardContainer.appendChild(square);
            }
        }
        addDragAndDropListeners();
        updateGameStatus();
    }

    function getPieceUnicode(piece) {
        const unicodeMap = {
            'p': '♙', 'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔',
            'P': '♟', 'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚'
        };
        return unicodeMap[piece.color === 'b' ? piece.type.toUpperCase() : piece.type];
    }

    function addDragAndDropListeners() {
        const pieces = document.querySelectorAll('.piece');
        const squares = document.querySelectorAll('.square');

        pieces.forEach(piece => {
            piece.addEventListener('dragstart', (e) => {
                draggedItem = e.target;
                setTimeout(() => {
                    e.target.style.display = 'none';
                }, 0);
            });

            piece.addEventListener('dragend', (e) => {
                setTimeout(() => {
                    draggedItem.style.display = 'block';
                    draggedItem = null;
                }, 0);
            });
        });

        squares.forEach(square => {
            square.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            square.addEventListener('dragenter', (e) => {
                e.preventDefault();
            });

            square.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedItem) {
                    const fromSquare = getSquareNotation(draggedItem.parentElement);
                    const toSquare = getSquareNotation(e.currentTarget);
                    const move = chess.move({
                        from: fromSquare,
                        to: toSquare,
                        promotion: 'q' // NOTE: always promote to a queen for simplicity
                    });

                    if (move) {
                        createBoard();
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
            status = `Game over, ${moveColor} is in checkmate.`;
        } else if (chess.in_draw()) {
            status = 'Game over, it\'s a draw.';
        } else {
            status = `${moveColor}'s turn to move.`;
            if (chess.in_check()) {
                status += ` ${moveColor} is in check.`;
            }
        }
        gameStatus.textContent = status;
    }

    createBoard();
});
