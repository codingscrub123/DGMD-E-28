// Game configuration constants
const ANSWER = 'MOODY';
const GUESSES = ['MIGHT', 'FLOOD', 'STRAY'];
let currentGuesses = [...GUESSES];
let gameState = { isGameOver: false, isWon: false };
const WORD_LENGTH = 5;
const ROWS = 6;
const ALPHABET = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
const QWERTY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

function evaluateGuess(guess, answer) {
  const result = Array(WORD_LENGTH).fill('absent');
  const answerChars = answer.split('');

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct';
      answerChars[i] = null;
    }
  }

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (result[i] === 'correct') continue;
    const letter = guess[i];
    const foundIndex = answerChars.indexOf(letter);
    if (foundIndex !== -1) {
      result[i] = 'present';
      answerChars[foundIndex] = null;
    }
  }

  return result;
}

function getLetterStatus(guesses, answer) {
  const status = {};
  const rank = { absent: 0, present: 1, correct: 2 };

  guesses.forEach(guess => {
    const result = evaluateGuess(guess, answer);
    for (let i = 0; i < WORD_LENGTH; i += 1) {
      const letter = guess[i];
      const current = status[letter] || 'absent';
      const candidate = result[i];
      status[letter] = rank[candidate] > rank[current] ? candidate : current;
    }
  });

  return status;
}

function createBoardRows() {
  return Array.from({ length: ROWS }, (_, rowIndex) => {
    const guess = currentGuesses[rowIndex] || '';
    const result = guess ? evaluateGuess(guess, ANSWER) : Array(WORD_LENGTH).fill('');

    return (
      <tr key={rowIndex}>
        {Array.from({ length: WORD_LENGTH }, (_, cellIndex) => {
          const letter = guess[cellIndex] || '';
          const status = result[cellIndex];
          const className = ['letter-box', letter ? 'filled' : '', status].filter(Boolean).join(' ');

          return (
            <td key={cellIndex}>
              <div className={className}>{letter}</div>
            </td>
          );
        })}
      </tr>
    );
  });
}

function createUsedLetterBoard(letterStatus) {
  return (
    <div id="used-letters" className="used-letters-grid">
      {ALPHABET.map(letter => {
        const status = letterStatus[letter] ? `used-letter ${letterStatus[letter]}` : 'used-letter';
        return (
          <span key={letter} className={status}>
            {letter}
          </span>
        );
      })}
    </div>
  );
}

function createQwertyBoard(letterStatus) {
  return (
    <div id="keyboard">
      {QWERTY_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="key-row">
          {row.map(letter => {
            const status = letterStatus[letter] ? `key ${letterStatus[letter]}` : 'key';
            return (
              <span key={letter} className={status}>
                {letter}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function getGameMessage() {
  if (gameState.isGameOver) {
    if (gameState.isWon) {
      return 'You won!';
    }
    return `You lost! The answer was ${ANSWER}.`;
  }
  return '';
}

function App() {
  const letterStatus = getLetterStatus(currentGuesses, ANSWER);
  const messageText = getGameMessage();
  const messageStyle = gameState.isWon ? { color: 'green' } : gameState.isGameOver ? { color: 'red' } : {};

  return (
    <div className="wordle-app">
      <h1>Wordle</h1>
      <p>Guess the word in 6 tries.</p>
      <p>Each guess must be a valid 5-letter word.</p>
      {createQwertyBoard(letterStatus)}
      <div id="wordle-board">
        <table>
          <tbody>{createBoardRows()}</tbody>
        </table>
      </div>
      <input
        type="text"
        id="guess-input"
        placeholder="Enter a 5-letter guess"
        maxLength={WORD_LENGTH}
        disabled={false}
      />
      <div style={{ marginTop: '12px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button id="submit-button" onClick={handleSubmitGuessClick}>
          Submit Guess
        </button>
        <button id="new-game-button" onClick={handleNewGameClick}>
          New Game
        </button>
      </div>
      {messageText && (
        <p style={{ ...messageStyle, fontWeight: 'bold', marginTop: '12px' }}>{messageText}</p>
      )}
      {createUsedLetterBoard(letterStatus)}
    </div>
  );
}

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

function handleSubmitGuessClick() {
  const input = document.getElementById('guess-input');
  if (!input) return;

  if (gameState.isGameOver) {
    console.warn('Game is already over. Click New Game to start again.');
    return;
  }

  const rawGuess = input.value.trim().toUpperCase();

  if (rawGuess.length !== WORD_LENGTH || !/^[A-Z]+$/.test(rawGuess)) {
    console.warn('Please enter a valid 5-letter guess.');
    return;
  }

  if (currentGuesses.length >= ROWS) {
    console.warn('All guess rows are already filled.');
    return;
  }

  currentGuesses = currentGuesses.concat(rawGuess);
  input.value = '';

  if (rawGuess === ANSWER) {
    gameState.isGameOver = true;
    gameState.isWon = true;
  } else if (currentGuesses.length >= ROWS) {
    gameState.isGameOver = true;
    gameState.isWon = false;
  }

  renderApp();
}

function handleNewGameClick() {
  currentGuesses = [];
  gameState = { isGameOver: false, isWon: false };
  const input = document.getElementById('guess-input');
  if (input) {
    input.value = '';
  }
  renderApp();
}

function renderApp() {
  root.render(<App />);
}

function handleGuessInputKeyDown(event) {
  if (event.key !== 'Enter') return;
  handleSubmitGuessClick();
}

renderApp();

window.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('guess-input');
  if (input) {
    input.addEventListener('keydown', handleGuessInputKeyDown);
  }
});
