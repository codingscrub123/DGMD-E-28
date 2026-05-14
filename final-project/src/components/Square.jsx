import { pieceSymbols } from '../game/chessLogic.js';

export default function Square({ index, piece, isSelected, isLegalTarget, onClick }) {
  const row = Math.floor(index / 8);
  const file = index % 8;
  const dark = (row + file) % 2 === 1;
  const className = [
    'board-square',
    dark ? 'dark-square' : 'light-square',
    isSelected ? 'selected-square' : '',
    isLegalTarget ? 'legal-target' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={className} onClick={() => onClick(index)}>
      <span className="piece">{piece ? pieceSymbols[piece] : ''}</span>
    </button>
  );
}
