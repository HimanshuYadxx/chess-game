// Chess Game Logic
class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.gameStatus = 'active';
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        
        this.initializeUI();
        this.renderBoard();
        this.updateGameInfo();
    }

    // Initialize the chess board with starting positions
    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Place pawns
        for (let i = 0; i < 8; i++) {
            board[1][i] = { type: 'pawn', color: 'black' };
            board[6][i] = { type: 'pawn', color: 'white' };
        }
        
        // Place other pieces
        const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        for (let i = 0; i < 8; i++) {
            board[0][i] = { type: pieceOrder[i], color: 'black' };
            board[7][i] = { type: pieceOrder[i], color: 'white' };
        }
        
        return board;
    }

    // Initialize UI elements and event listeners
    initializeUI() {
        this.boardElement = document.getElementById('chess-board');
        this.gameStatusElement = document.getElementById('game-status');
        this.capturedWhiteElement = document.getElementById('captured-white');
        this.capturedBlackElement = document.getElementById('captured-black');
        
        document.getElementById('new-game').addEventListener('click', () => this.newGame());
        document.getElementById('undo-move').addEventListener('click', () => this.undoMove());
    }

    // Render the chess board
    renderBoard() {
        this.boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                const piece = this.board[row][col];
                if (piece) {
                    square.textContent = this.getPieceSymbol(piece);
                }
                
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                this.boardElement.appendChild(square);
            }
        }
    }

    // Get Unicode symbol for chess pieces
    getPieceSymbol(piece) {
        const symbols = {
            white: {
                king: '♔', queen: '♕', rook: '♖',
                bishop: '♗', knight: '♘', pawn: '♙'
            },
            black: {
                king: '♚', queen: '♛', rook: '♜',
                bishop: '♝', knight: '♞', pawn: '♟'
            }
        };
        return symbols[piece.color][piece.type];
    }

    // Handle square click events
    handleSquareClick(row, col) {
        if (this.gameStatus !== 'active') return;

        const clickedSquare = { row, col };
        const piece = this.board[row][col];

        if (this.selectedSquare) {
            if (this.selectedSquare.row === row && this.selectedSquare.col === col) {
                // Deselect current square
                this.clearSelection();
            } else if (this.isValidMove(this.selectedSquare, clickedSquare)) {
                // Make the move
                this.makeMove(this.selectedSquare, clickedSquare);
                this.clearSelection();
                this.switchPlayer();
                this.checkGameStatus();
            } else if (piece && piece.color === this.currentPlayer) {
                // Select new piece
                this.selectSquare(row, col);
            } else {
                // Invalid move, clear selection
                this.clearSelection();
            }
        } else if (piece && piece.color === this.currentPlayer) {
            // Select piece
            this.selectSquare(row, col);
        }
    }

    // Select a square and highlight valid moves
    selectSquare(row, col) {
        this.selectedSquare = { row, col };
        this.highlightSquare(row, col, 'selected');
        this.highlightValidMoves(row, col);
    }

    // Clear current selection and highlights
    clearSelection() {
        this.selectedSquare = null;
        this.clearHighlights();
    }

    // Highlight a square with a specific class
    highlightSquare(row, col, className) {
        const square = this.getSquareElement(row, col);
        square.classList.add(className);
    }

    // Clear all highlights
    clearHighlights() {
        const squares = this.boardElement.querySelectorAll('.square');
        squares.forEach(square => {
            square.classList.remove('selected', 'valid-move', 'capture-move');
        });
    }

    // Highlight valid moves for selected piece
    highlightValidMoves(row, col) {
        const validMoves = this.getValidMoves(row, col);
        validMoves.forEach(move => {
            const targetPiece = this.board[move.row][move.col];
            const className = targetPiece ? 'capture-move' : 'valid-move';
            this.highlightSquare(move.row, move.col, className);
        });
    }

    // Get square element by coordinates
    getSquareElement(row, col) {
        return this.boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    // Check if a move is valid
    isValidMove(from, to) {
        const validMoves = this.getValidMoves(from.row, from.col);
        return validMoves.some(move => move.row === to.row && move.col === to.col);
    }

    // Get all valid moves for a piece
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        let moves = [];
        
        switch (piece.type) {
            case 'pawn':
                moves = this.getPawnMoves(row, col, piece.color);
                break;
            case 'rook':
                moves = this.getRookMoves(row, col, piece.color);
                break;
            case 'bishop':
                moves = this.getBishopMoves(row, col, piece.color);
                break;
            case 'queen':
                moves = [...this.getRookMoves(row, col, piece.color), ...this.getBishopMoves(row, col, piece.color)];
                break;
            case 'knight':
                moves = this.getKnightMoves(row, col, piece.color);
                break;
            case 'king':
                moves = this.getKingMoves(row, col, piece.color);
                break;
        }

        // Filter out moves that would put own king in check
        return moves.filter(move => !this.wouldBeInCheck(piece.color, { row, col }, move));
    }

    // Get valid pawn moves
    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Forward move
        if (this.isValidSquare(row + direction, col) && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col });
            
            // Double move from starting position
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }

        // Diagonal captures
        [-1, 1].forEach(colOffset => {
            const newRow = row + direction;
            const newCol = col + colOffset;
            if (this.isValidSquare(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (targetPiece && targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });

        return moves;
    }

    // Get valid rook moves
    getRookMoves(row, col, color) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        directions.forEach(([rowDir, colDir]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + i * rowDir;
                const newCol = col + i * colDir;
                
                if (!this.isValidSquare(newRow, newCol)) break;
                
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (targetPiece.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });

        return moves;
    }

    // Get valid bishop moves
    getBishopMoves(row, col, color) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        directions.forEach(([rowDir, colDir]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + i * rowDir;
                const newCol = col + i * colDir;
                
                if (!this.isValidSquare(newRow, newCol)) break;
                
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (targetPiece.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });

        return moves;
    }

    // Get valid knight moves
    getKnightMoves(row, col, color) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        knightMoves.forEach(([rowOffset, colOffset]) => {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;
            
            if (this.isValidSquare(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });

        return moves;
    }

    // Get valid king moves
    getKingMoves(row, col, color) {
        const moves = [];
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        kingMoves.forEach(([rowOffset, colOffset]) => {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;
            
            if (this.isValidSquare(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });

        return moves;
    }

    // Check if coordinates are within board bounds
    isValidSquare(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    // Make a move on the board
    makeMove(from, to) {
        const piece = this.board[from.row][from.col];
        const capturedPiece = this.board[to.row][to.col];

        // Record move for history
        this.moveHistory.push({
            from: { ...from },
            to: { ...to },
            piece: { ...piece },
            capturedPiece: capturedPiece ? { ...capturedPiece } : null
        });

        // Handle captured piece
        if (capturedPiece) {
            this.capturedPieces[capturedPiece.color].push(capturedPiece);
        }

        // Move piece
        this.board[to.row][to.col] = piece;
        this.board[from.row][from.col] = null;

        // Add move animation
        const targetSquare = this.getSquareElement(to.row, to.col);
        targetSquare.classList.add('piece-moving');
        setTimeout(() => targetSquare.classList.remove('piece-moving'), 300);

        this.renderBoard();
        this.updateCapturedPieces();
    }

    // Switch current player
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.updateGameInfo();
    }

    // Check if a move would put the king in check
    wouldBeInCheck(color, from, to) {
        // Create a temporary board state
        const originalPiece = this.board[to.row][to.col];
        const movingPiece = this.board[from.row][from.col];
        
        // Make temporary move
        this.board[to.row][to.col] = movingPiece;
        this.board[from.row][from.col] = null;
        
        const inCheck = this.isInCheck(color);
        
        // Restore board state
        this.board[from.row][from.col] = movingPiece;
        this.board[to.row][to.col] = originalPiece;
        
        return inCheck;
    }

    // Check if a king is in check
    isInCheck(color) {
        const kingPosition = this.findKing(color);
        if (!kingPosition) return false;

        // Check if any opponent piece can attack the king
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color !== color) {
                    const moves = this.getBasicMoves(row, col, piece);
                    if (moves.some(move => move.row === kingPosition.row && move.col === kingPosition.col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Get basic moves without check validation (to avoid infinite recursion)
    getBasicMoves(row, col, piece) {
        switch (piece.type) {
            case 'pawn': return this.getPawnMoves(row, col, piece.color);
            case 'rook': return this.getRookMoves(row, col, piece.color);
            case 'bishop': return this.getBishopMoves(row, col, piece.color);
            case 'queen': return [...this.getRookMoves(row, col, piece.color), ...this.getBishopMoves(row, col, piece.color)];
            case 'knight': return this.getKnightMoves(row, col, piece.color);
            case 'king': return this.getKingMoves(row, col, piece.color);
            default: return [];
        }
    }

    // Find king position
    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    // Check game status (checkmate, stalemate, etc.)
    checkGameStatus() {
        const inCheck = this.isInCheck(this.currentPlayer);
        const hasValidMoves = this.hasValidMoves(this.currentPlayer);

        if (!hasValidMoves) {
            if (inCheck) {
                this.gameStatus = 'checkmate';
                this.gameStatusElement.textContent = `Checkmate! ${this.currentPlayer === 'white' ? 'Black' : 'White'} wins!`;
            } else {
                this.gameStatus = 'stalemate';
                this.gameStatusElement.textContent = 'Stalemate! Game is a draw.';
            }
        } else if (inCheck) {
            this.gameStatusElement.textContent = `${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)} is in check!`;
        } else {
            this.gameStatusElement.textContent = 'Game in progress';
        }
    }

    // Check if player has any valid moves
    hasValidMoves(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const validMoves = this.getValidMoves(row, col);
                    if (validMoves.length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Update game information display
    updateGameInfo() {
        const whitePlayers = document.querySelectorAll('.white-player');
        const blackPlayers = document.querySelectorAll('.black-player');
        
        whitePlayers.forEach(player => {
            player.classList.toggle('active', this.currentPlayer === 'white');
            const indicator = player.querySelector('.turn-indicator');
            indicator.textContent = this.currentPlayer === 'white' ? 'Your turn' : 'Waiting...';
        });
        
        blackPlayers.forEach(player => {
            player.classList.toggle('active', this.currentPlayer === 'black');
            const indicator = player.querySelector('.turn-indicator');
            indicator.textContent = this.currentPlayer === 'black' ? 'Your turn' : 'Waiting...';
        });
    }

    // Update captured pieces display
    updateCapturedPieces() {
        this.capturedWhiteElement.innerHTML = this.capturedPieces.white
            .map(piece => `<span class="captured-piece">${this.getPieceSymbol(piece)}</span>`)
            .join('');
        
        this.capturedBlackElement.innerHTML = this.capturedPieces.black
            .map(piece => `<span class="captured-piece">${this.getPieceSymbol(piece)}</span>`)
            .join('');
    }

    // Start a new game
    newGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.gameStatus = 'active';
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        
        this.renderBoard();
        this.updateGameInfo();
        this.updateCapturedPieces();
        this.gameStatusElement.textContent = 'Game in progress';
    }

    // Undo last move
    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        const lastMove = this.moveHistory.pop();
        
        // Restore piece positions
        this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        this.board[lastMove.to.row][lastMove.to.col] = lastMove.capturedPiece;
        
        // Restore captured pieces
        if (lastMove.capturedPiece) {
            const capturedArray = this.capturedPieces[lastMove.capturedPiece.color];
            const index = capturedArray.findIndex(piece => 
                piece.type === lastMove.capturedPiece.type && 
                piece.color === lastMove.capturedPiece.color
            );
            if (index !== -1) {
                capturedArray.splice(index, 1);
            }
        }
        
        // Switch player back
        this.switchPlayer();
        
        this.renderBoard();
        this.updateCapturedPieces();
        this.clearSelection();
        this.checkGameStatus();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChessGame();
});
