// Global variables to store game and UI instances
let game = null;
let ui = null;

// Wait for window to be fully loaded
window.addEventListener('load', () => {
    // Debug: Check if required classes are defined
    console.log('SudokuGame defined:', typeof window.SudokuGame !== 'undefined');
    console.log('SudokuUI defined:', typeof window.SudokuUI !== 'undefined');
    
    if (typeof window.SudokuGame === 'undefined' || typeof window.SudokuUI === 'undefined') {
        console.error('Required classes not found. Make sure all script files are loaded correctly.');
        return;
    }
    
    try {
        // Initialize game and UI
        game = new window.SudokuGame();
        ui = new window.SudokuUI(game);
        
        // Make them globally available for debugging
        window.sudokuGame = game;
        window.sudokuUI = ui;
        
        // Start a new game when the page loads
        game.newGame().then(() => {
            ui.render();
        }).catch(error => {
            console.error('Error starting new game:', error);
        });
    } catch (error) {
        console.error('Error initializing game:', error);
    }

    // Handle keyboard input
    document.addEventListener('keydown', (e) => {
        if (game.selectedCell) {
            const key = e.key;
            if (/^[1-9]$/.test(key)) {
                const { row, col } = game.selectedCell;
                // Only allow input if the cell is not fixed
                if (game.grid[row][col].isFixed) {
                    return;
                }
                // Check for invalid move BEFORE calling makeMove
                if (!game.isValidPlacement(game.grid, row, col, parseInt(key))) {
                    // Mark the cell as invalid and trigger a re-render for animation
                    game.lastInvalidCell = { row, col };
                    if (ui && typeof ui.showMessage === 'function') {
                        ui.showMessage('Invalid move! This number conflicts with Sudoku rules.', 2000);
                    }
                    ui.render();
                    return; // Do NOT call makeMove or render
                }
                // Only call makeMove if valid
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
    const checkButton = document.getElementById('check');
    if (checkButton) {
        checkButton.addEventListener('click', async () => {
            if (!game || !ui) {
                console.error('Game or UI not initialized');
                const messageElement = document.getElementById('message');
                if (messageElement) {
                    messageElement.textContent = 'Game not properly initialized. Please refresh the page.';
                }
                return;
            }

            try {
                checkButton.disabled = true;
                checkButton.textContent = 'Checking...';
                
                const result = await game.checkSolution();
                console.log('Check solution result:', result);
                
                if (result.solved) {
                    ui.showMessage(result.message || 'Puzzle solved correctly!');
                    if (result.solutionPath) {
                        ui.fillBoardWithSolution(result.solutionPath);
                        ui.showSolutionPanel(result.solutionPath);
                    }
                } else if (result.valid) {
                    ui.showMessage(result.message || 'The current board is valid so far.');
                    // If there's a step to show, highlight it
                    if (result.step) {
                        if (
                            typeof result.step.row === 'number' && result.step.row >= 0 && result.step.row < 9 &&
                            typeof result.step.col === 'number' && result.step.col >= 0 && result.step.col < 9 &&
                            typeof result.step.value === 'number' && result.step.value > 0 && result.step.value <= 9
                        ) {
                            // Place the value in the game grid and update UI
                            game.grid[result.step.row][result.step.col].value = result.step.value;
                            // Record the step for PDF generation
                            game.allSolutionSteps.push({
                                ...result.step,
                                timestamp: Date.now()
                            });
                            ui.render();
                            ui.showStep(result.step);
                        } else {
                            ui.showMessage('No logical step found. Try again or use a hint.');
                        }
                    }
                    // If a solution path exists, offer to fill the board
                    else if (result.solutionPath) {
                        ui.fillBoardWithSolution(result.solutionPath);
                        ui.showMessage('Board auto-solved!');
                        ui.showSolutionPanel(result.solutionPath);
                    }
                } else {
                    ui.showMessage(result.message || 'There is an issue with the current board.');
                    // Show conflicts if they exist
                    if (result.conflicts && result.conflicts.length > 0) {
                        console.log('Conflicts found:', result.conflicts);
                    }
                }
            } catch (error) {
                console.error('Error checking solution:', error);
                const messageElement = document.getElementById('message');
                if (messageElement) {
                    messageElement.textContent = 'Error checking solution: ' + (error.message || 'Unknown error');
                }
            } finally {
                if (checkButton) {
                    checkButton.disabled = false;
                    checkButton.textContent = 'Check Solution';
                }
            }
        });
    } else {
        console.error('Check solution button not found');
    }

    // Fill the board with the solution steps using the SudokuGame instance
    function fillBoardWithSolution(solutionPath) {
        if (!game) {
            console.log('Game instance not found');
            return;
        }
        
        if (!solutionPath || !Array.isArray(solutionPath)) {
            console.error('Invalid solution path');
            return;
        }
        
        solutionPath.forEach(step => {
            if (step && typeof step.row === 'number' && typeof step.col === 'number' && typeof step.value === 'number') {
                game.grid[step.row][step.col].value = step.value;
                console.log(`Filled cell [${step.row},${step.col}] with value ${step.value}`);
            }
        });
        
        // Update the UI
        if (ui && typeof ui.render === 'function') {
            console.log('Updating UI with solution');
            ui.render();
        } else {
            console.log('UI update function not found');
        }
    }
});