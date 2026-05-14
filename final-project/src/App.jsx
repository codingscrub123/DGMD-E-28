// Application shell that defines high-level page routing and navigation.
import { Routes, Route, NavLink } from 'react-router-dom';
import Game from './pages/Game.jsx';
import About from './pages/About.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>React Chess Challenge</h1>
        <nav className="app-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active-link' : '')}>
            Play
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            About
          </NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Game />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}
