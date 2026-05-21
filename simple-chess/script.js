/* Simple Chess
   Uses chess.js for complete rule validation:
   - Legal moves for all pieces
   - Turn enforcement
   - Check / checkmate / stalemate / draws
*/

$(function () {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  const symbols = {
    wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
    bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟'
  };

  const game = new Chess();
  let selectedSquare = null;
  let legalMoves = [];

  function renderLabels() {
    $('#rank-labels').html(ranks.map(r => `<span>${r}</span>`).join(''));
    $('#file-labels').html(files.map(f => `<span>${f}</span>`).join(''));
  }

  function pieceCodeAt(square) {
    const piece = game.get(square);
    if (!piece) return null;
    return `${piece.color}${piece.type}`;
  }

  function renderBoard() {
    const $board = $('#board');
    $board.empty();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = `${files[col]}${8 - row}`;
        const pieceCode = pieceCodeAt(square);
        const isLight = (row + col) % 2 === 0;
        const $sq = $('<button>', {
          class: `square ${isLight ? 'light' : 'dark'}`,
          'data-square': square,
          type: 'button',
          text: pieceCode ? symbols[pieceCode] : ''
        });

        if (selectedSquare === square) $sq.addClass('selected');

        const target = legalMoves.find(m => m.to === square);
        if (target) {
          $sq.addClass(target.captured ? 'capture' : 'legal');
        }

        $board.append($sq);
      }
    }
  }

  function turnText() {
    return game.turn() === 'w' ? 'White' : 'Black';
  }

  function updateStatus() {
    let status = `Turn: ${turnText()}`;
    let detail = 'Select a piece to see legal moves.';

    if (game.isCheckmate()) {
      status = `Checkmate: ${turnText()} is checkmated`;
      detail = `Winner: ${game.turn() === 'w' ? 'Black' : 'White'}`;
    } else if (game.isStalemate()) {
      status = 'Draw: Stalemate';
      detail = 'No legal moves, and king is not in check.';
    } else if (game.isThreefoldRepetition()) {
      status = 'Draw: Threefold repetition';
      detail = 'Same position repeated three times.';
    } else if (game.isInsufficientMaterial()) {
      status = 'Draw: Insufficient material';
      detail = 'Checkmate is impossible with remaining pieces.';
    } else if (game.isDrawByFiftyMoves()) {
      status = 'Draw: Fifty-move rule';
      detail = '50 moves without pawn move or capture.';
    } else if (game.isDraw()) {
      status = 'Draw';
      detail = 'Game ended in a draw.';
    } else if (game.isCheck()) {
      detail = `${turnText()} is in check.`;
    }

    $('#status').text(status);
    $('#detail').text(detail);
  }

  function clearSelection() {
    selectedSquare = null;
    legalMoves = [];
  }

  $('#board').on('click', '.square', function () {
    if (game.isGameOver()) return;

    const clickedSquare = $(this).data('square');
    const clickedPiece = game.get(clickedSquare);

    // No selected piece yet: select only current side's piece.
    if (!selectedSquare) {
      if (!clickedPiece || clickedPiece.color !== game.turn()) return;
      selectedSquare = clickedSquare;
      legalMoves = game.moves({ square: clickedSquare, verbose: true });
      renderBoard();
      return;
    }

    // Clicking own piece switches selection.
    if (clickedPiece && clickedPiece.color === game.turn()) {
      selectedSquare = clickedSquare;
      legalMoves = game.moves({ square: clickedSquare, verbose: true });
      renderBoard();
      return;
    }

    // Attempt legal move. Handle promotion as queen by default.
    const move = game.move({ from: selectedSquare, to: clickedSquare, promotion: 'q' });

    clearSelection();

    // Illegal target squares simply clear selection and rerender.
    if (!move) {
      renderBoard();
      updateStatus();
      return;
    }

    renderBoard();
    updateStatus();
  });

  $('#reset-btn').on('click', function () {
    game.reset();
    clearSelection();
    renderBoard();
    updateStatus();
  });

  renderLabels();
  renderBoard();
  updateStatus();
});
