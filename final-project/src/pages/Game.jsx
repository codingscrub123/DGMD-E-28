import { useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import ChessBoard from '../components/ChessBoard.jsx';
import {
  initialBoard,
  pieceSymbols,
  isMoveLegal,
  getLegalMoves,
  indexToSquare,
} from '../game/chessLogic.js';

const startingForm = { white: 'White', black: 'Black' };

export default function Game() {
  const [board, setBoard] = useLocalStorage('chess-board', initialBoard);
  const [turn, setTurn] = useLocalStorage('chess-turn', 'w');
  const [history, setHistory] = useLocalStorage('chess-history', []);
  const [whitePlayer, setWhitePlayer] = useLocalStorage('chess-white-player', 'White');
  const [blackPlayer, setBlackPlayer] = useLocalStorage('chess-black-player', 'Black');
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('Click a piece to select it and then click a destination square.');
  const [formData, setFormData] = useState({ white: whitePlayer, black: blackPlayer });

  const legalTargets = useMemo(() => {
    if (selected === null) return [];
    return getLegalMoves(board, selected);
  }, [board, selected]);

  const activeColorName = turn === 'w' ? whitePlayer : blackPlayer;

  function handleSquareClick(index) {
    const piece = board[index];
    const selectedPiece = selected !== null ? board[selected] : null;

    if (selected === index) {
      setSelected(null);
      setFeedback('Selection cleared. Choose another piece or destination.');
      return;
    }

    if (selected !== null && isMoveLegal(board, selected, index)) {
      const updatedBoard = [...board];
      updatedBoard[index] = selectedPiece;
      updatedBoard[selected] = null;
      const moveNotation = `${selectedPiece}@${indexToSquare(selected)}→${indexToSquare(index)}`;
      setBoard(updatedBoard);
      setSelected(null);
      setTurn(turn === 'w' ? 'b' : 'w');
      setHistory([moveNotation, ...history].slice(0, 20));
      setFeedback(`${activeColorName} moved ${pieceSymbols[selectedPiece]} to ${indexToSquare(index)}.`);
      return;
    }

    if (piece && piece.startsWith(turn)) {
      setSelected(index);
      setFeedback(`${activeColorName} selected ${pieceSymbols[piece]} at ${indexToSquare(index)}.`);
      return;
    }

    setFeedback('Pick a valid piece for the current turn or a legal destination square.');
  }

  function handleReset(event) {
    event.preventDefault();
    setBoard(initialBoard);
    setTurn('w');
    setHistory([]);
    setSelected(null);
    setFeedback('Game reset. White starts.');
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handlePlayerSubmit(event) {
    event.preventDefault();
    setWhitePlayer(formData.white.trim() || 'White');
    setBlackPlayer(formData.black.trim() || 'Black');
    setFeedback('Player names saved. Continue your game or reset to start fresh.');
  }

  return (
    <section className="game-page">
      <div className="game-top">
        <div className="game-panel">
          <h2>Chess Arena</h2>
          <p>Current turn: <strong>{turn === 'w' ? whitePlayer : blackPlayer}</strong></p>
          <p>{feedback}</p>

          <form className="player-form" onSubmit={handlePlayerSubmit}>
            <h3>Player Names</h3>
            <label>
              White player
              <input name="white" value={formData.white} onChange={handleInputChange} placeholder="White" />
            </label>
            <label>
              Black player
              <input name="black" value={formData.black} onChange={handleInputChange} placeholder="Black" />
            </label>
            <button type="submit">Save Names</button>
            <button type="button" onClick={handleReset}>Reset Game</button>
          </form>
        </div>

        <div className="history-panel">
          <h3>Move History</h3>
          <ol>
            {history.length > 0 ? (
              history.map((move, index) => <li key={index}>{move}</li>)
            ) : (
              <li>No moves yet.</li>
            )}
          </ol>
        </div>
      </div>

      <ChessBoard
        board={board}
        selected={selected}
        legalTargets={legalTargets}
        onSquareClick={handleSquareClick}
      />
    </section>
  );
}
