// Block component represents an individual colored block with a number
// It accepts number and color as props
const Block = ({ number, color }) => {
  return (
    // The div has 'block' class for styling and the color class for background
    // onClick handler shows an alert with the block's number
    <div className={`block ${color}`} onClick={() => alert(number)}>
      {number}
    </div>
  );
};

// Main App component that renders the collection of blocks
const App = () => {
  // Array of block data, each with a number and color name
  // The color names correspond to CSS classes defined in sample.html
  const blocks = [
    { number: 1, color: 'red' },
    { number: 2, color: 'blue' },
    { number: 3, color: 'green' },
    { number: 4, color: 'yellow' },
    { number: 5, color: 'purple' },
    { number: 6, color: 'orange' },
    { number: 7, color: 'pink' },
    { number: 8, color: 'brown' },
    { number: 9, color: 'gray' },
  ];

  return (
    // Container div with flexbox layout to arrange blocks in a grid
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {/* Map over the blocks array to render each Block component */}
      {blocks.map((block, index) => (
        <Block key={index} number={block.number} color={block.color} />
      ))}
    </div>
  );
};

// Render the App component into the DOM element with id 'root'
ReactDOM.render(<App />, document.getElementById('root'));