document.addEventListener('DOMContentLoaded', () => {
    // Initialize game and UI
    const game = new SudokuGame();
    const ui = new SudokuUI(game);
    
    // Start a new game when the page loads
    game.newGame().then(() => {
        ui.render();
    });

    // Handle keyboard input
    document.addEventListener('keydown', (e) => {
        if (game.selectedCell) {
            const key = e.key;
            if (/^[1-9]$/.test(key)) {
                game.makeMove(parseInt(key)).then(valid => {
                    if (valid) {
                        ui.render();
                        // Audio explanation for the move
                        const cell = game.selectedCell;
                        const value = parseInt(key);
                        if (cell && value) {
                            const msg = new SpeechSynthesisUtterance(`Placed ${value} at row ${cell.row + 1}, column ${cell.col + 1}`);
                            window.speechSynthesis.speak(msg);
                        }
                        // Check if puzzle is solved after each valid move
                        game.checkSolution().then(result => {
                            if (result.solved) {
                                ui.showMessage('Congratulations! Puzzle solved!');
                                ui.showDownloadButton();
                            }
                        });
                    }
                });
            } else if (key === 'Backspace' || key === 'Delete') {
                if (game.isValidMove(game.selectedCell.row, game.selectedCell.col)) {
                    game.makeMove(0).then(() => ui.render());
                }
            }
        }
    });

    // Handle window focus events
    window.addEventListener('focus', () => {
        game.resumeTimer();
    });

    window.addEventListener('blur', () => {
        game.pauseTimer();
    });

    // Check Solution button event handler
    document.getElementById('check-solution').addEventListener('click', () => {
        game.checkSolution().then(result => {
            if (result.solved && result.solutionPath) {
                ui.fillBoardWithSolution(result.solutionPath);
                ui.showSolutionPanel(result.solutionPath);
                fillBoardWithSolution(result.solutionPath);
            }
        });
    });
});

// Fill the board with the solution steps using the SudokuGame instance
function fillBoardWithSolution(solutionPath) {
    if (!window.sudoku) {
        console.log('SudokuGame instance not found on window');
        return;
    }
    solutionPath.forEach(step => {
        if (step && typeof step.row === 'number' && typeof step.col === 'number' && typeof step.value === 'number') {
            window.sudoku.grid[step.row][step.col].value = step.value;
            console.log(`Filled cell [${step.row},${step.col}] with value ${step.value}`);
        }
    });
    if (window.sudokuUI && typeof window.sudokuUI.renderGrid === 'function') {
        console.log('Calling sudokuUI.renderGrid()');
        window.sudokuUI.renderGrid();
    } else {
        console.log('sudokuUI.renderGrid() not found');
    }
}