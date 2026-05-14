// ChessBoard renders the 8x8 board and delegates each square to the Square component.
import Square from './Square.jsx';

export default function ChessBoard({ board, selected, legalTargets, onSquareClick }) {
  return (
    <div className="board-shell">
      <div className="board-grid">
        {board.map((piece, index) => (
          <Square
            key={index}
            index={index}
            piece={piece}
            isSelected={selected === index}
            isLegalTarget={legalTargets.includes(index)}
            onClick={onSquareClick}
          />
        ))}
      </div>
    </div>
  );
}
