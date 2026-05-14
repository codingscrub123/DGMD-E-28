export const initialBoard = [
  'bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR',
  'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP',
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP',
  'wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR',
];

export const pieceSymbols = {
  wK: '♔',
  wQ: '♕',
  wR: '♖',
  wB: '♗',
  wN: '♘',
  wP: '♙',
  bK: '♚',
  bQ: '♛',
  bR: '♜',
  bB: '♝',
  bN: '♞',
  bP: '♟︎',
};

export function indexToSquare(index) {
  const file = index % 8;
  const rank = 8 - Math.floor(index / 8);
  const fileChar = 'abcdefgh'[file];
  return `${fileChar}${rank}`;
}

function indexToCoords(index) {
  return { row: Math.floor(index / 8), col: index % 8 };
}

function coordsToIndex(row, col) {
  return row * 8 + col;
}

function isOnBoard(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isSameColor(pieceA, pieceB) {
  return pieceA && pieceB && pieceA[0] === pieceB[0];
}

function isOpponent(pieceA, pieceB) {
  return pieceA && pieceB && pieceA[0] !== pieceB[0];
}

function pathClear(board, from, to, dr, dc) {
  let { row, col } = indexToCoords(from);
  const target = indexToCoords(to);
  row += dr;
  col += dc;
  while (row !== target.row || col !== target.col) {
    if (board[coordsToIndex(row, col)] !== null) {
      return false;
    }
    row += dr;
    col += dc;
  }
  return true;
}

export function getLegalMoves(board, from) {
  const piece = board[from];
  if (!piece) return [];
  const moves = [];
  for (let to = 0; to < 64; to += 1) {
    if (from !== to && isMoveLegal(board, from, to)) {
      moves.push(to);
    }
  }
  return moves;
}

export function isMoveLegal(board, from, to) {
  const piece = board[from];
  const target = board[to];
  if (!piece) return false;
  if (isSameColor(piece, target)) return false;

  const { row: fromRow, col: fromCol } = indexToCoords(from);
  const { row: toRow, col: toCol } = indexToCoords(to);
  const dr = toRow - fromRow;
  const dc = toCol - fromCol;
  const absDr = Math.abs(dr);
  const absDc = Math.abs(dc);
  const color = piece[0];
  const type = piece[1];

  switch (type) {
    case 'P': {
      const direction = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;
      if (dc === 0 && dr === direction && !target) return true;
      if (dc === 0 && dr === direction * 2 && fromRow === startRow) {
        const intermediate = coordsToIndex(fromRow + direction, fromCol);
        return !board[intermediate] && !target;
      }
      if (absDc === 1 && dr === direction && target && isOpponent(piece, target)) return true;
      return false;
    }
    case 'R': {
      if (dr !== 0 && dc !== 0) return false;
      const stepRow = dr === 0 ? 0 : dr / absDr;
      const stepCol = dc === 0 ? 0 : dc / absDc;
      return pathClear(board, from, to, stepRow, stepCol);
    }
    case 'B': {
      if (absDr !== absDc) return false;
      return pathClear(board, from, to, dr / absDr, dc / absDc);
    }
    case 'Q': {
      if (dr === 0 && dc === 0) return false;
      if (absDr === absDc) {
        return pathClear(board, from, to, dr / absDr, dc / absDc);
      }
      if (dr === 0 || dc === 0) {
        const stepRow = dr === 0 ? 0 : dr / absDr;
        const stepCol = dc === 0 ? 0 : dc / absDc;
        return pathClear(board, from, to, stepRow, stepCol);
      }
      return false;
    }
    case 'N':
      return (absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2);
    case 'K':
      return Math.max(absDr, absDc) === 1;
    default:
      return false;
  }
}
