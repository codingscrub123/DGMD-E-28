import React, { useState, useEffect } from 'react'

/**
 * MyApp - Main component for the Number Guessing Game
 * Manages all game state, settings, and statistics in a single-page application
 * Features: interactive guessing game, customizable settings, and stat tracking
 */
export const MyApp = () => {
  // ===== NAVIGATION STATE =====
  // Tracks which page the user is currently viewing: 'game', 'settings', or 'stats'
  const [currentPage, setCurrentPage] = useState('game')

  // ===== GAME STATE =====
  // secretNumber: The random number the player must guess
  // guessInput: The current value in the input field
  // guesses: Array of all numbers the player has guessed
  // message: Feedback message to display to the player
  // messageType: CSS class for message styling ('info', 'success', or 'error')
  // gameOver: Boolean flag indicating if the current game has ended
  const [secretNumber, setSecretNumber] = useState(null)
  const [guessInput, setGuessInput] = useState('')
  const [guesses, setGuesses] = useState([])
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [gameOver, setGameOver] = useState(false)

  // ===== SETTINGS STATE =====
  // minRange/maxRange: The range boundaries for the secret number
  // allowedGuesses: Maximum number of guesses allowed per game
  // temp* variables: Temporary storage for settings until user saves
  const [minRange, setMinRange] = useState(1)
  const [maxRange, setMaxRange] = useState(100)
  const [allowedGuesses, setAllowedGuesses] = useState(10)
  const [tempMinRange, setTempMinRange] = useState(1)
  const [tempMaxRange, setTempMaxRange] = useState(100)
  const [tempAllowedGuesses, setTempAllowedGuesses] = useState(10)

  // ===== STATISTICS STATE =====
  // gamesWon: Total number of games the player has won
  // totalGuessesForWins: Sum of all guesses across all won games (used to calculate average)
  const [gamesWon, setGamesWon] = useState(0)
  const [totalGuessesForWins, setTotalGuessesForWins] = useState(0)

  // ===== EFFECT HOOKS =====
  // Initialize game on component mount - runs only once when the app loads
  useEffect(() => {
    initializeNewGame()
  }, [])

  // Sync temporary settings display when actual settings change
  useEffect(() => {
    setTempMinRange(minRange)
    setTempMaxRange(maxRange)
    setTempAllowedGuesses(allowedGuesses)
  }, [minRange, maxRange, allowedGuesses])

  /**
   * initializeNewGame - Resets the game state and generates a new secret number
   * Called when starting a new game or updating settings
   */
  const initializeNewGame = () => {
    const newSecret = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange
    setSecretNumber(newSecret)
    setGuesses([])
    setGuessInput('')
    setMessage(`Guess a number between ${minRange} and ${maxRange}`)
    setMessageType('info')
    setGameOver(false)
  }

  /**
   * handleGuess - Processes a player's guess attempt
   * Validates input, updates game state, and determines win/loss/continue conditions
   */
  const handleGuess = () => {
    const guess = parseInt(guessInput)

    // Validate input
    if (isNaN(guess)) {
      setMessage('Please enter a valid number')
      setMessageType('error')
      return
    }

    if (guess < minRange || guess > maxRange) {
      setMessage(`Please enter a number between ${minRange} and ${maxRange}`)
      setMessageType('error')
      return
    }

    if (guesses.includes(guess)) {
      setMessage('You already guessed that number!')
      setMessageType('error')
      return
    }

    const newGuesses = [...guesses, guess]
    setGuesses(newGuesses)

    if (guess === secretNumber) {
      setMessage(`🎉 Congratulations! You guessed the number ${secretNumber} in ${newGuesses.length} guess${newGuesses.length !== 1 ? 'es' : ''}!`)
      setMessageType('success')
      setGameOver(true)
      setGamesWon(gamesWon + 1)
      setTotalGuessesForWins(totalGuessesForWins + newGuesses.length)
    } else if (newGuesses.length >= allowedGuesses) {
      setMessage(`😢 Game Over! The correct number was ${secretNumber}.`)
      setMessageType('error')
      setGameOver(true)
    } else {
      const remaining = allowedGuesses - newGuesses.length
      if (guess < secretNumber) {
        setMessage(`Too low! ${remaining} guess${remaining !== 1 ? 'es' : ''} remaining.`)
      } else {
        setMessage(`Too high! ${remaining} guess${remaining !== 1 ? 'es' : ''} remaining.`)
      }
      setMessageType('info')
    }

    setGuessInput('')
  }

  /**
   * handleKeyPress - Allows player to submit guess by pressing Enter key
   * Only submits if the game is still active (not over)
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !gameOver) {
      handleGuess()
    }
  }

  /**
   * handleSettingsSave - Validates and saves new game settings
   * Validates range logic and initializes a new game with updated settings
   */
  const handleSettingsSave = () => {
    if (tempMinRange >= tempMaxRange) {
      alert('Minimum range must be less than maximum range')
      return
    }

    if (tempAllowedGuesses < 1) {
      alert('Allowed guesses must be at least 1')
      return
    }

    setMinRange(tempMinRange)
    setMaxRange(tempMaxRange)
    setAllowedGuesses(tempAllowedGuesses)
    setCurrentPage('game')
    initializeNewGame()
    setMessage('Settings updated! New game started.')
    setMessageType('info')
  }

  /**
   * handleResetStats - Resets all game statistics after user confirmation
   * Clears games won and total guesses data
   */
  const handleResetStats = () => {
    if (window.confirm('Are you sure you want to reset all stats?')) {
      setGamesWon(0)
      setTotalGuessesForWins(0)
      setMessage('Stats reset!')
      setMessageType('info')
    }
  }

  /**
   * averageGuesses - Calculated value for average guesses per win
   * Returns 0 if no games have been won, otherwise returns average rounded to 2 decimal places
   */
  const averageGuesses = gamesWon > 0 ? (totalGuessesForWins / gamesWon).toFixed(2) : 0

  // ===== RENDER =====
  return (
    <div className="container">
      <h1>🎮 Number Guessing Game</h1>

      {/* NAVIGATION BUTTONS - Allow user to switch between pages */}
      <div className="nav-buttons">
        <button onClick={() => setCurrentPage('game')}>🎮 Game</button>
        <button onClick={() => setCurrentPage('settings')}>⚙️ Settings</button>
        <button onClick={() => setCurrentPage('stats')}>📊 Stats</button>
      </div>

      {/* PAGE: GAME - Main guessing game interface */}
      {currentPage === 'game' && (
        <div className="game-content">
          <div className="game-stats">
            <p>Guesses used: {guesses.length} / {allowedGuesses}</p>
            <p>Range: {minRange} - {maxRange}</p>
          </div>

          <div className={`message ${messageType}`}>{message}</div>

          <div className="input-group">
            <input
              type="number"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={gameOver}
              placeholder="Enter your guess"
              min={minRange}
              max={maxRange}
            />
            <button onClick={handleGuess} disabled={gameOver}>
              Guess
            </button>
          </div>

          {guesses.length > 0 && (
            <div className="guesses-list">
              <p><strong>Your guesses:</strong> {guesses.join(', ')}</p>
            </div>
          )}

          {gameOver && (
            <button
              onClick={initializeNewGame}
              style={{ width: '100%', marginTop: '20px' }}
            >
              🔄 Start New Game
            </button>
          )}
        </div>
      )}

      {/* PAGE: SETTINGS - Configure game parameters */}
      {currentPage === 'settings' && (
        <div className="game-content">
          <div className="settings-form">
            <div className="form-group">
              <label>Minimum Range:</label>
              <input
                type="number"
                value={tempMinRange}
                onChange={(e) => setTempMinRange(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label>Maximum Range:</label>
              <input
                type="number"
                value={tempMaxRange}
                onChange={(e) => setTempMaxRange(parseInt(e.target.value) || 100)}
              />
            </div>

            <div className="form-group">
              <label>Allowed Guesses:</label>
              <input
                type="number"
                value={tempAllowedGuesses}
                onChange={(e) => setTempAllowedGuesses(parseInt(e.target.value) || 1)}
                min="1"
              />
            </div>

            <button onClick={handleSettingsSave} style={{ width: '100%' }}>
              💾 Save Settings
            </button>
          </div>
        </div>
      )}

      {/* PAGE: STATS - Display player performance statistics */}
      {currentPage === 'stats' && (
        <div className="game-content">
          <div className="stats-display">
            <div className="stat-item">
              <div className="stat-label">Games Won</div>
              <div className="stat-value">{gamesWon}</div>
            </div>

            <div className="stat-item">
              <div className="stat-label">Average Guesses (for wins)</div>
              <div className="stat-value">{averageGuesses}</div>
            </div>

            {gamesWon > 0 && (
              <div className="stat-item">
                <div className="stat-label">Total Guesses Used</div>
                <div className="stat-value">{totalGuessesForWins}</div>
              </div>
            )}

            {gamesWon === 0 && (
              <div className="stat-item" style={{ borderLeftColor: '#888' }}>
                <div className="stat-label">No wins yet. Start playing to see stats!</div>
              </div>
            )}

            <button onClick={handleResetStats} className="reset-button" style={{ width: '100%' }}>
              🔄 Reset Stats
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
