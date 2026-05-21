/*
  Simple Chess app
  - Board state is stored in a 2D array.
  - UI is rendered from that state.
  - Basic click-to-move interaction (no chess rule validation yet).
*/

$(function () {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  // Track selected square and current player turn.
  let selected = null;
  let currentTurn = 'w';

  // Create initial board with standard piece placement.
  const createInitialBoard = () => ([
    ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
    ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
    ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']
  ]);

  let boardState = createInitialBoard();

  // Map internal piece codes to Unicode symbols.
  const symbols = {
    wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
    bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟'
  };

  function renderLabels() {
    $('#rank-labels').html(ranks.map(r => `<span>${r}</span>`).join(''));
    $('#file-labels').html(files.map(f => `<span>${f}</span>`).join(''));
  }

  function renderBoard() {
    const $board = $('#board');
    $board.empty();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0;
        const piece = boardState[row][col];
        const label = `${files[col]}${8 - row}`;

        const $sq = $('<button>', {
          class: `square ${isLight ? 'light' : 'dark'}`,
          'data-row': row,
          'data-col': col,
          'data-pos': label,
          'aria-label': `Square ${label}`,
          type: 'button',
          text: piece ? symbols[piece] : ''
        });

        if (selected && selected.row === row && selected.col === col) {
          $sq.addClass('selected');
        }

        $board.append($sq);
      }
    }
  }

  function updateStatus() {
    $('#status').text(`Turn: ${currentTurn === 'w' ? 'White' : 'Black'}`);
  }

  function isCurrentPlayersPiece(piece) {
    return piece && piece[0] === currentTurn;
  }

  // Click behavior: select piece, then move to destination.
  $('#board').on('click', '.square', function () {
    const row = Number($(this).data('row'));
    const col = Number($(this).data('col'));
    const clickedPiece = boardState[row][col];

    // First click must be a non-empty square of current player's piece.
    if (!selected) {
      if (!clickedPiece) return; // cannot move empty square
      if (!isCurrentPlayersPiece(clickedPiece)) return; // cannot select opponent piece

      selected = { row, col };
      renderBoard();
      return;
    }

    // Re-clicking selected square cancels selection.
    if (selected.row === row && selected.col === col) {
      selected = null;
      renderBoard();
      return;
    }

    // Move selected piece to target square (no rule validation yet).
    const movingPiece = boardState[selected.row][selected.col];
    boardState[row][col] = movingPiece;
    boardState[selected.row][selected.col] = null;

    // Clear selection and flip turn.
    selected = null;
    currentTurn = currentTurn === 'w' ? 'b' : 'w';

    updateStatus();
    renderBoard();
  });

  $('#reset-btn').on('click', function () {
    boardState = createInitialBoard();
    selected = null;
    currentTurn = 'w';
    updateStatus();
    renderBoard();
  });

  renderLabels();
  updateStatus();
  renderBoard();
});
