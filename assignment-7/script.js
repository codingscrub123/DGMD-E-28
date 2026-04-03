// debug mode: set to true to print answer in console for easier testing
const DEBUG = true;

// API endpoints
const RANDOM_WORD_API = 'https://random-word-api.herokuapp.com/word?number=1&length=5';
const VALIDATE_WORD_API = 'https://api.datamuse.com/words?sp='; // free dictionary check

const MAX_ROWS = 6;
const WORD_LENGTH = 5;

const boardRows = Array.from(document.querySelectorAll('#wordle-board tbody tr'));
const keys = Array.from(document.querySelectorAll('#keyboard .key'));
const guessInput = document.getElementById('guess-input');
const resetButton = document.getElementById('reset-button');
const usedLettersContainer = document.getElementById('used-letters');

let answer = '';
let currentRow = 0;
let gameOver = false;
let letterStatus = {}; // tracks the best status for each letter in context
let lockedRows = new Set(); // ensures completed rows are immutable after submission

const message = document.createElement('p');
message.id = 'message';
message.style.fontWeight = 'bold';
message.style.marginTop = '10px';
guessInput.parentElement.insertBefore(message, guessInput.nextSibling);

// setMessage: updates the user feedback text under the input
function setMessage(text, color = 'black') {
  message.textContent = text;
  message.style.color = color;
}

// fetchRandomAnswer: get 5-letter word from free API, fallback if fails
async function fetchRandomAnswer() {
  try {
    const response = await fetch(RANDOM_WORD_API);
    if (!response.ok) throw new Error('API unavailable');

    const data = await response.json();
    if (!Array.isArray(data) || !data[0]) throw new Error('Unexpected API response');

    return data[0].toUpperCase();
  } catch (error) {
    if (DEBUG) console.warn('Random word API failed, using fallback', error);
    const fallback = ['PRIDE', 'CRANE', 'BRAVE', 'GHOST', 'PLANT', 'SHORE', 'QUERY', 'FRAME', 'TRACE', 'FLAME'];
    return fallback[Math.floor(Math.random() * fallback.length)];
  }
}

// isValidWord: verify guess with free dictionary API, falls back to simplest length check
async function isValidWord(word) {
  try {
    const response = await fetch(`${VALIDATE_WORD_API}${word.toLowerCase()}&max=1`);
    if (!response.ok) throw new Error('Dictionary API unavailable');

    const results = await response.json();
    return Array.isArray(results) && results.length > 0 && results[0].word.toLowerCase() === word.toLowerCase();
  } catch (error) {
    if (DEBUG) console.warn('Validation API failed, accepting length check only', error);
    return word.length === WORD_LENGTH;
  }
}

// validateGuess: ensures 5-letter alphabetic input and dictionary membership
async function validateGuess(guess) {
  if (guess.length !== WORD_LENGTH) {
    setMessage('Guess must be exactly 5 letters.', 'red');
    return false;
  }
  if (!/^[A-Z]+$/.test(guess)) {
    setMessage('Guess must contain only letters A-Z.', 'red');
    return false;
  }

  const valid = await isValidWord(guess);
  if (!valid) {
    setMessage('Word not found in dictionary.', 'red');
    return false;
  }

  return true;
}

// evaluateGuess: returns an array of statuses for each letter, with duplicate
// handling: correct first, then present with remaining letters
function evaluateGuess(guess) {
  const result = Array(WORD_LENGTH).fill('absent');
  const answerChars = answer.split('');

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct';
      answerChars[i] = null; // consume this match
    }
  }

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (result[i] === 'correct') continue;
    const letter = guess[i];
    const foundIndex = answerChars.indexOf(letter);
    if (foundIndex !== -1) {
      result[i] = 'present';
      answerChars[foundIndex] = null; // consume the found letter
    }
  }

  return result;
}

// updateBoardPreview: shows the currently typed guess in the active row
function updateBoardPreview(guess) {
  if (gameOver || lockedRows.has(currentRow)) return;

  const cells = boardRows[currentRow].querySelectorAll('.letter-box');

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    const cell = cells[i];

    // only preview on rows not yet submitted
    cell.textContent = guess[i] || '';
    cell.classList.remove('correct', 'present', 'absent', 'filled');

    if (guess[i]) {
      cell.classList.add('filled');
    }
  }
}

// updateBoard: sets row letters and color classes after guess evaluation
function updateBoard(guess, result) {
  const cells = boardRows[currentRow].querySelectorAll('.letter-box');

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    const cell = cells[i];
    cell.textContent = guess[i];
    cell.classList.remove('correct', 'present', 'absent', 'filled');
    cell.classList.add('filled');
    cell.classList.add(result[i]);
  }
}

// getPriority: choose highest status (correct > present > absent) for repeat letters
function getPriority(existing, candidate) {
  const rank = { absent: 0, present: 1, correct: 2 };
  return rank[candidate] > rank[existing] ? candidate : existing;
}

// updateKeyboard: color keyboard keys and track used letters for display
function updateKeyboard(guess, result) {
  for (let i = 0; i < WORD_LENGTH; i += 1) {
    const letter = guess[i];
    const status = result[i];
    letterStatus[letter] = getPriority(letterStatus[letter] || 'absent', status);
  }

  keys.forEach(key => {
    const letter = key.textContent.toUpperCase();
    key.classList.remove('correct', 'present', 'absent');
    const status = letterStatus[letter];
    if (status) key.classList.add(status);
  });

  renderUsedLetters();
}

// renderUsedLetters: updates the used letters board from letterStatus object
function renderUsedLetters() {
  usedLettersContainer.innerHTML = '';
  for (let charCode = 65; charCode <= 90; charCode += 1) {
    const letter = String.fromCharCode(charCode);
    const tile = document.createElement('span');
    tile.className = 'used-letter';
    tile.textContent = letter;
    const status = letterStatus[letter];
    if (status) tile.classList.add(status);
    usedLettersContainer.appendChild(tile);
  }
}

// clearBoard: wipes all guessed cells from the board for restart
function clearBoard() {
  boardRows.forEach(row => {
    row.querySelectorAll('.letter-box').forEach(cell => {
      cell.textContent = '';
      cell.classList.remove('correct', 'present', 'absent', 'filled');
    });
  });
}

// initializeGame: sets up a new answer and resets all state
async function initializeGame() {
  answer = await fetchRandomAnswer();
  currentRow = 0;
  gameOver = false;
  letterStatus = {};
  lockedRows.clear();

  clearBoard();
  keys.forEach(key => key.classList.remove('correct', 'present', 'absent'));
  renderUsedLetters();

  if (DEBUG) {
    console.info(`DEBUG: The answer is ${answer}`); // debug mode output
  }

  setMessage(`Guess 1/${MAX_ROWS}. Good luck!`, 'black');
  guessInput.value = '';
  guessInput.focus();
}

// processGuess: hooked to Enter key - evaluates and advances game state
async function processGuess() {
  if (gameOver) return;

  const rawGuess = guessInput.value.trim().toUpperCase();
  if (!(await validateGuess(rawGuess))) {
    guessInput.focus();
    return;
  }

  const evaluation = evaluateGuess(rawGuess);
  updateBoard(rawGuess, evaluation);
  updateKeyboard(rawGuess, evaluation);
  lockedRows.add(currentRow); // lock completed row
  guessInput.value = '';

  if (evaluation.every(v => v === 'correct')) {
    setMessage(`Congratulations! You guessed the word: ${answer}`, 'green');
    gameOver = true;
    return;
  }

  currentRow += 1;

  if (currentRow >= MAX_ROWS) {
    setMessage(`Game over. The answer was: ${answer}`, 'red');
    gameOver = true;
    return;
  }

  setMessage(`Guess ${currentRow + 1}/${MAX_ROWS}. Keep trying!`, 'black');
  updateBoardPreview('');
  guessInput.focus();
}

// Event listeners

// Show the current guess in the active row as the user types
guessInput.addEventListener('input', () => {
  if (gameOver) return;

  const cleanedGuess = guessInput.value
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, WORD_LENGTH);

  guessInput.value = cleanedGuess;
  updateBoardPreview(cleanedGuess);
});

guessInput.addEventListener('keyup', async event => {
  if (event.key === 'Enter') {
    await processGuess();
  }
});

resetButton.addEventListener('click', initializeGame);

// start first game
initializeGame();