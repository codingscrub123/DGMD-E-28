// About page describing the app features and technical implementation.
export default function About() {
  return (
    <section className="about-page">
      <h2>About React Chess Challenge</h2>
      <p>
        This single page app is built with React, React Router, hooks, and local storage.
        It includes player controls, a working chessboard, and a history of moves.
      </p>
      <p>
        The chessboard supports click-to-move interaction, piece selection, and legal move
        highlighting for standard chess pieces.
      </p>
      <p>Use the Play route to try the game and update player names through the form.</p>
    </section>
  );
}
