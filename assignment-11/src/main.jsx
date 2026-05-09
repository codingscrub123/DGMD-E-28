import React from 'react'
import ReactDOM from 'react-dom/client'
import { MyApp } from './guess.jsx'

/**
 * Application Entry Point
 * Renders the MyApp component from guess.jsx into the root DOM element
 * This initializes the entire Number Guessing Game application
 */
ReactDOM.createRoot(document.getElementById('root')).render(<MyApp />)
