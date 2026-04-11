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

// Evaluates a guess against the answer and returns status for each letter
// Status: 'correct' (right letter, right position), 'present' (right letter, wrong position), 'absent' (not in answer)
function evaluateGuess(guess, answer) {
  const result = Array(WORD_LENGTH).fill('absent');
  const answerChars = answer.split('');

  // First pass: mark correct letters (right position)
  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct';
      answerChars[i] = null;
    }
  }

  // Second pass: mark present letters (in answer but wrong position)
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

// Returns an object of letter statuses based on all guesses made
// Handles duplicates by keeping the highest status (correct > present > absent)
function getLetterStatus(guesses, answer) {
  const status = {};
  const rank = { absent: 0, present: 1, correct: 2 };

  // Evaluate all guesses and aggregate letter statuses
  guesses.forEach(guess => {
    const result = evaluateGuess(guess, answer);
    for (let i = 0; i < WORD_LENGTH; i += 1) {
      const letter = guess[i];
      const current = status[letter] || 'absent';
      const candidate = result[i];
      // Keep the higher-ranked status for each letter
      status[letter] = rank[candidate] > rank[current] ? candidate : current;
    }
  });

  return status;
}

// Creates the 6x5 board rows with letter boxes using React
function createBoardRows() {
  return Array.from({ length: ROWS }, (_, rowIndex) => {
    const guess = currentGuesses[rowIndex] || '';
    const result = guess ? evaluateGuess(guess, ANSWER) : Array(WORD_LENGTH).fill('');

    // Create a table row with letter cells
    return React.createElement(
      'tr',
      { key: rowIndex },
      // Create cells for each letter in the word
      Array.from({ length: WORD_LENGTH }, (_, cellIndex) => {
        const letter = guess[cellIndex] || '';
        const status = result[cellIndex];
        // Apply CSS classes based on letter status
        const className = ['letter-box', letter ? 'filled' : '', status].filter(Boolean).join(' ');

        return React.createElement(
          'td',
          { key: cellIndex },
          React.createElement('div', { className }, letter)
        );
      })
    );
  });
}

// Creates the used letters grid showing all letters visited with their statuses
function createUsedLetterBoard(letterStatus) {
  return React.createElement(
    'div',
    { id: 'used-letters', className: 'used-letters-grid' },
    // Render all 26 letters with their respective statuses
    ALPHABET.map(letter => {
      const status = letterStatus[letter] ? `used-letter ${letterStatus[letter]}` : 'used-letter';
      return React.createElement(
        'span',
        { key: letter, className: status },
        letter
      );
    })
  );
}

// Creates the QWERTY keyboard layout showing letter statuses
function createQwertyBoard(letterStatus) {
  return React.createElement(
    'div',
    { id: 'keyboard' },
    // Create each row of the QWERTY keyboard
    QWERTY_ROWS.map((row, rowIndex) =>
      React.createElement(
        'div',
        { key: rowIndex, className: 'key-row' },
        // Create each key with its status
        row.map(letter => {
          const status = letterStatus[letter] ? `key ${letterStatus[letter]}` : 'key';
          return React.createElement(
            'span',
            { key: letter, className: status },
            letter
          );
        })
      )
    )
  );
}

// Returns the game end message based on current game state
function getGameMessage() {
  if (gameState.isGameOver) {
    if (gameState.isWon) {
      return 'You won!';
    } else {
      return `You lost! The answer was ${ANSWER}.`;
    }
  }
  return '';
}

// Main React component that renders the entire game UI
function App() {
  // Calculate updated letter statuses based on current guesses
  const letterStatus = getLetterStatus(currentGuesses, ANSWER);
  const messageText = getGameMessage();
  // Apply green color for wins, red for losses
  const messageStyle = gameState.isWon ? { color: 'green' } : gameState.isGameOver ? { color: 'red' } : {};

  return React.createElement(
    'div',
    { className: 'wordle-app' },
    React.createElement('h1', null, 'Wordle'),
    React.createElement('p', null, 'Guess the word in 6 tries.'),
    React.createElement('p', null, 'Each guess must be a valid 5-letter word.'),
    createQwertyBoard(letterStatus),
    React.createElement(
      'div',
      { id: 'wordle-board' },
      React.createElement(
        'table',
        null,
        React.createElement('tbody', null, createBoardRows())
      )
    ),
    React.createElement('input', {
      type: 'text',
      id: 'guess-input',
      placeholder: 'Enter a 5-letter guess',
      maxLength: WORD_LENGTH,
      disabled: false,
    }),
    React.createElement(
      'div',
      { style: { marginTop: '12px', display: 'flex', gap: '10px', justifyContent: 'center' } },
      React.createElement('button', {
        id: 'submit-button',
        onClick: handleSubmitGuessClick,
      }, 'Submit Guess'),
      React.createElement('button', {
        id: 'new-game-button',
        onClick: handleNewGameClick,
      }, 'New Game')
    ),
    messageText ? React.createElement('p', { style: { ...messageStyle, fontWeight: 'bold', marginTop: '12px' } }, messageText) : null,
    createUsedLetterBoard(letterStatus)
  );
}

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

// Handles the submit guess button click
// Validates input, adds guess to currentGuesses, checks for win/loss conditions
function handleSubmitGuessClick() {
  const input = document.getElementById('guess-input');
  if (!input) return;

  // Prevent guessing after game is over
  if (gameState.isGameOver) {
    console.warn('Game is already over. Click New Game to start again.');
    return;
  }

  const rawGuess = input.value.trim().toUpperCase();

  // Validate guess format
  if (rawGuess.length !== WORD_LENGTH || !/^[A-Z]+$/.test(rawGuess)) {
    console.warn('Please enter a valid 5-letter guess.');
    return;
  }

  // Check if board is full
  if (currentGuesses.length >= ROWS) {
    console.warn('All guess rows are already filled.');
    return;
  }

  // Add guess to list and clear input
  currentGuesses = currentGuesses.concat(rawGuess);
  input.value = '';

  // Check for win or loss
  if (rawGuess === ANSWER) {
    gameState.isGameOver = true;
    gameState.isWon = true;
  } else if (currentGuesses.length >= ROWS) {
    gameState.isGameOver = true;
    gameState.isWon = false;
  }

  renderApp();
}

// Handles the new game button click
// Resets all game state and clears input
function handleNewGameClick() {
  currentGuesses = [];
  gameState = { isGameOver: false, isWon: false };
  const input = document.getElementById('guess-input');
  if (input) {
    input.value = '';
  }
  renderApp();
}

// Re-renders the React app (called after state changes)
function renderApp() {
  root.render(React.createElement(App));
}

// Handles Enter key press in the input field to submit guess
function handleGuessInputKeyDown(event) {
  if (event.key !== 'Enter') return;
  handleSubmitGuessClick();
}

// Initial render
renderApp();

// Attach Enter key listener to input after DOM loads
window.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('guess-input');
  if (input) {
    input.addEventListener('keydown', handleGuessInputKeyDown);
  }
});
