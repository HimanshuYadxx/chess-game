const board = document.getElementById('game');
const boardSize = 8;
let pieces = {};

const unicodePieces = {
  r: '&#9820;', n: '&#9822;', b: '&#9821;', q: '&#9819;', k: '&#9818;', p: '&#9823;',
  R: '&#9814;', N: '&#9816;', B: '&#9815;', Q: '&#9813;', K: '&#9812;', P: '&#9817;'
};

const initialBoard = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R']
];

function createBoard() {
  board.innerHTML = '';
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const square = document.createElement('div');
      square.classList.add('gamecell');
      if ((row + col) % 2 === 0) square.classList.add('white');
      else square.classList.add('black');
      square.id = `${col + 1}_${8 - row}`;
      square.setAttribute("ondrop", "drop(event)");
      square.setAttribute("ondragover", "allowDrop(event)");

      const piece = initialBoard[row][col];
      if (piece) {
        const pieceDiv = document.createElement('div');
        const pieceId = `${piece}_${col + 1}_${8 - row}`;
        pieceDiv.className = 'chess-piece';
        pieceDiv.innerHTML = unicodePieces[piece];
        pieceDiv.setAttribute('draggable', 'true');
        pieceDiv.setAttribute('data-id', pieceId);
        pieceDiv.setAttribute('ondragstart', 'drag(event)');
        square.appendChild(pieceDiv);
        pieces[pieceId] = square.id;
      }
      board.appendChild(square);
    }
  }
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.dataset.id);
}

function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const draggedPiece = document.querySelector(`[data-id='${data}']`);
  if (draggedPiece && ev.target.classList.contains('gamecell')) {
    ev.target.innerHTML = '';
    ev.target.appendChild(draggedPiece);
    pieces[data] = ev.target.id;
  }
}

window.onload = () => {
  createBoard();
};
