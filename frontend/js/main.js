// Initialize game and UI
const game = new SudokuGame();
const ui = new SudokuUI(game);
const imageUploader = new SudokuImageUploader(game);

// Start a new game
game.newGame(); 