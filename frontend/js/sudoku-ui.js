class SudokuUI {
    constructor(game) {
        this.game = game;
        this.gridElement = document.getElementById('sudoku-grid');
        this.timeElement = document.getElementById('time');
        this.messageElement = document.getElementById('message');
        this.timerElement = document.getElementById('time');
        this.documentGenerator = new DocumentGenerator(game);
        this.selectedCell = null;

        // Get UI elements
        this.generateDocButton = document.getElementById('generate-doc-button');

        // Set up event listeners
        if (this.generateDocButton) {
            this.generateDocButton.addEventListener('click', () => {
                this.documentGenerator.generateSolutionDocument();
            });
        }

        this.setupEventListeners();
        this.updateUI();

        // Initialize timer state
        this.lastUpdateTime = Date.now();
        this.elapsedTime = 0;
        this.timerInterval = null;

        // Start timer updates
        this.startTimerUpdates();

        // Listen for game state changes from the game
        const originalNewGame = this.game.newGame.bind(this.game);
        this.game.newGame = async (difficulty) => {
            const result = await originalNewGame(difficulty);
            if (result) {
                this.resetTimer();
                this.startTimerUpdates();
            }
            return result;
        };

        // Start with the timer if a game is in progress
        if (!this.game.isCreating && this.game.startTime) {
            this.startTimerUpdates();
        }
    }

    setupEventListeners() {
        // Game control buttons
        this.setupNewGameButton();
        this.setupCreatePuzzleButton();
        this.setupHintButton();
        this.setupCheckButton();
        this.setupNotesButton();
        this.setupEraseButton();
        this.setupUndoRedoButtons();
        this.setupNumberPad();

        const validateButton = document.getElementById('validate-button');

        // Hide generate doc button initially
        if (this.generateDocButton) {
            this.generateDocButton.style.display = 'none';
        }

        validateButton.addEventListener('click', () => {
            if (!this.game.isCreating) return;

            const validationResult = this.game.validateCustomPuzzle();
            this.showMessage(validationResult.message);

            if (validationResult.isValid) {
                if (this.game.finalizeCustomPuzzle()) {
                    validateButton.textContent = 'Validate Puzzle';
                    this.showMessage('Puzzle created successfully! You can now start playing.');

                    // Show generate doc button after successful puzzle creation
                    if (this.generateDocButton) {
                        this.generateDocButton.style.display = 'block';
                    }

                    this.updateUI();
                }
            }
        });
    }

    setupNewGameButton() {
        document.getElementById('new-game').addEventListener('click', () => {
            const difficulty = document.getElementById('difficulty').value;
            this.game.newGame(difficulty).then(() => {
                // Reset the timer
                this.resetTimer();
                this.startTimerUpdates();
                
                // Re-enable all controls
                this.enableGameControls();
                
                // Clear any existing messages
                this.messageElement.textContent = '';
                
                // Render the new game
                this.render();
                this.showMessage(`New ${difficulty} game started!`);
            });
        });
    }

    setupCreatePuzzleButton() {
        const createButton = document.getElementById('create-puzzle');
        const startGameButton = document.getElementById('start-game');

        createButton.addEventListener('click', () => {
            this.isCreationMode = true;
            this.game.startPuzzleCreation();
            this.disableGameControls();
            // Enable number pad in creation mode
            document.querySelectorAll('.number').forEach(btn => btn.disabled = false);
            createButton.style.display = 'none';
            startGameButton.style.display = 'block';
            this.render();
            this.showMessage('Creation mode: Enter your puzzle numbers');
        });

        startGameButton.addEventListener('click', () => {
            if (this.game.validateCustomPuzzle()) {
                if (this.game.finalizeCustomPuzzle()) {
                    this.isCreationMode = false;
                    createButton.style.display = 'block';
                    startGameButton.style.display = 'none';
                    this.enableGameControls();
                    this.render();
                    this.showMessage('Custom puzzle started! Good luck!');
                } else {
                    this.showMessage('Error: Failed to create puzzle. Please try again.');
                }
            } else {
                this.showMessage('Invalid puzzle! The puzzle must have a unique solution.');
            }
        });
    }

    setupHintButton() {
        document.getElementById('hint').addEventListener('click', async () => {
            if (this.game.hintsRemaining > 0) {
                const hint = await this.game.getHint();
                if (hint) {
                    this.render();
                    this.showMessage(`${hint.reason} (${this.game.hintsRemaining} hints remaining)`);
                }
            } else {
                this.showMessage('No hints remaining!');
            }
        });
    }

    setupCheckButton() {
        console.log('Setting up check button...'); // Debug log
        const checkButton = document.getElementById('check');
        if (checkButton) {
            console.log('Check button found'); // Debug log
            checkButton.addEventListener('click', async () => {
                console.log('Check button clicked'); // Debug log
                const result = await this.game.checkSolution();
                console.log('Check result:', result); // Debug log

                if (result.solved) {
                    this.showMessage('Congratulations! Puzzle solved!');
                    this.timeElement.textContent = this.game.getFormattedTime();
                    this.disableGameControls();
                    this.showDownloadButton();
                } else if (result.showSolution && result.solutionPath) {
                    this.showSolutionPanel(result.solutionPath);
                    this.showMessage('Here is the step-by-step solution');
                } else {
                    this.showMessage('Keep trying! Click check again to see the solution.');
                }
            });
        } else {
            console.error('Check button not found in DOM'); // Debug log
        }
    }

    setupNotesButton() {
        const notesButton = document.getElementById('notes-mode');
        notesButton.addEventListener('click', (e) => {
            this.game.isNotesMode = !this.game.isNotesMode;
            e.target.classList.toggle('active');
            this.showMessage(this.game.isNotesMode ? 'Notes mode ON' : 'Notes mode OFF');
        });
    }

    setupEraseButton() {
        document.getElementById('erase').addEventListener('click', () => {
            if (this.game.selectedCell) {
                if (this.game.erase()) {
                    this.render();
                } else {
                    this.showMessage('Cannot erase this cell!');
                }
            } else {
                this.showMessage('Please select a cell first!');
            }
        });
    }

    setupUndoRedoButtons() {
        document.getElementById('undo').addEventListener('click', () => {
            if (this.game.undo()) {
                this.render();
            }
        });

        document.getElementById('redo').addEventListener('click', () => {
            if (this.game.redo()) {
                this.render();
            }
        });
    }

    setupNumberPad() {
        // Add event listeners for number pad buttons
        document.querySelectorAll('.number').forEach(button => {
            button.addEventListener('click', async () => {
                const number = parseInt(button.dataset.number);
                if (this.game.selectedCell) {
                    const valid = await this.game.makeMove(number);
                    if (valid) {
                        this.render();
                        if (this.checkWin()) {
                            this.showMessage('Congratulations! You solved the puzzle!');
                            this.disableGameControls();
                        }
                    } else {
                        this.showMessage('Invalid move!');
                    }
                } else {
                    this.showMessage('Please select a cell first!');
                }
            });
        });
    }

    setupDownloadButton() {
        console.log('Showing download button...'); // Debug log
        const downloadButton = document.getElementById('generate-doc-button');
        if (downloadButton) {
            downloadButton.style.display = 'block';
            console.log('Download button display set to:', downloadButton.style.display); // Debug log
        } else {
            console.log('Download button not found in DOM'); // Debug log
        }
    }

    showDownloadButton() {
        console.log('Showing download button...');
        const downloadButton = document.getElementById('generate-doc-button');
        if (downloadButton) {
            // Ensure button is centered and visible
            downloadButton.style.display = 'block';
            downloadButton.style.margin = '25px auto';
            downloadButton.style.padding = '12px 24px';
            downloadButton.style.fontSize = '1.1rem';
            downloadButton.style.borderRadius = '6px';
            downloadButton.style.maxWidth = '200px';
            downloadButton.style.textAlign = 'center';
            console.log('Download button display set to:', downloadButton.style.display);
        } else {
            console.log('Download button not found in DOM');
        }
    }

    render() {
        console.log('Rendering grid...'); // Debug log
        this.gridElement.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = this.createCell(row, col);
                this.gridElement.appendChild(cell);
            }
        }

        this.updateHintButton();
    }

    createCell(row, col) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = row;
        cell.dataset.col = col;

        const cellData = this.game.grid[row][col];

        // Apply cell borders
        if (row % 3 === 0) cell.style.borderTop = '2px solid var(--grid-line-color)';
        if (col % 3 === 0) cell.style.borderLeft = '2px solid var(--grid-line-color)';

        // Handle creation mode differently
        if (this.isCreationMode) {
            this.setupCreationModeCell(cell, row, col);
            if (cellData && cellData.value !== 0) {
                cell.textContent = cellData.value;
            }
        } else {
            // Regular game mode
            if (cellData) {
                if (cellData.isFixed) {
                    cell.classList.add('fixed');
                }
                if (cellData.value !== 0) {
                    cell.textContent = cellData.value;
                }
                if (cellData.notes && cellData.notes.size > 0) {
                    const notesElement = this.createNotesElement(cellData.notes);
                    cell.appendChild(notesElement);
                }
            }

            // Add click handler for regular mode
            cell.addEventListener('click', () => {
                this.clearSelection();
                this.game.selectCell(row, col);
                cell.classList.add('selected');
                this.highlightRelatedCells(row, col);
            });
        }

        return cell;
    }

    applyCellBorders(cell, row, col) {
        if (row % 3 === 0) cell.style.borderTop = '2px solid var(--grid-line-color)';
        if (col % 3 === 0) cell.style.borderLeft = '2px solid var(--grid-line-color)';
    }

    populateCellContent(cell, row, col) {
        const cellData = this.game.grid[row][col];

        if (cellData) {
            if (cellData.isFixed) {
                cell.classList.add('fixed');
            }
            if (cellData.value !== 0) {
                cell.textContent = cellData.value;
            }

            if (cellData.notes && cellData.notes.size > 0) {
                const notesElement = this.createNotesElement(cellData.notes);
                cell.appendChild(notesElement);
            }
        }
    }

    createNotesElement(notes) {
        const notesElement = document.createElement('div');
        notesElement.className = 'notes';

        for (let i = 1; i <= 9; i++) {
            const noteCell = document.createElement('div');
            noteCell.textContent = notes.has(i) ? i : '';
            notesElement.appendChild(noteCell);
        }

        return notesElement;
    }

    setupCellClickHandler(cell, row, col) {
        cell.addEventListener('click', () => {
            this.clearSelection();
            this.game.selectCell(row, col);
            cell.classList.add('selected');
            this.highlightRelatedCells(row, col);
        });
    }

    clearSelection() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected', 'highlighted');
        });
    }

    highlightRelatedCells(row, col) {
        const cells = document.querySelectorAll('.cell');
        const boxStartRow = Math.floor(row / 3) * 3;
        const boxStartCol = Math.floor(col / 3) * 3;

        // Highlight same row and column
        for (let i = 0; i < 9; i++) {
            cells[row * 9 + i].classList.add('highlighted');
            cells[i * 9 + col].classList.add('highlighted');
        }

        // Highlight same 3x3 box
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                cells[(boxStartRow + i) * 9 + (boxStartCol + j)].classList.add('highlighted');
            }
        }
    }

    updateHintButton() {
        const hintButton = document.getElementById('hint');
        if (hintButton) {
            hintButton.textContent = `Hint (${this.game.hintsRemaining})`;
        }
    }

    showMessage(message) {
        if (!this.messageElement) return;
        
        // Update message content
        this.messageElement.textContent = message;
        
        // Ensure the message is visible
        this.messageElement.classList.add('show');
        
        // Clear any existing timeout to prevent multiple messages from interfering
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        
        // Auto-hide the message after 3 seconds
        this.messageTimeout = setTimeout(() => {
            if (this.messageElement) {
                this.messageElement.classList.remove('show');
            }
        }, 3000);
        
        // If this is a win message, ensure the timer stops and game controls are disabled
        if (message.includes('Congratulations') || message.includes('solved')) {
            this.stopTimer();
            this.disableGameControls();
        }
    }

    checkWin() {
        if (this.game.isComplete()) {
            // Stop the timer when the game is won
            this.stopTimer();
            
            // Disable game controls
            this.disableGameControls();
            
            // Show win message
            this.showMessage('Congratulations! You solved the puzzle!');
            
            // Show download button if available
            this.showDownloadButton();
            
            return true;
        }
        return false;
    }

    disableGameControls() {
        // Disable all number buttons
        document.querySelectorAll('.number').forEach(button => {
            button.disabled = true;
        });
        
        // Disable other game controls
        const controls = ['hint', 'check', 'notes', 'erase', 'undo', 'redo'];
        controls.forEach(control => {
            const element = document.getElementById(control);
            if (element) {
                element.disabled = true;
            }
        });
    }

    startTimerUpdates() {
        // Clear any existing timer
        this.stopTimer();
        
        // Start a new timer
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
        
        // Initial update
        this.updateTimer();
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    resetTimer() {
        this.elapsedTime = 0;
        this.lastUpdateTime = Date.now();
        this.updateTimer();
    }
    
    updateTimer() {
        if (!this.timerElement) return;
        
        // Calculate elapsed time in seconds
        const now = Date.now();
        const delta = (now - this.lastUpdateTime) / 1000; // in seconds
        this.elapsedTime += delta;
        this.lastUpdateTime = now;
        
        // Format as MM:SS
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = Math.floor(this.elapsedTime % 60);
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update the timer display
        this.timerElement.textContent = formattedTime;
    }

    showSolutionPanel(solutionPath) {
        console.log('Showing solution panel with path:', solutionPath); // Debug log

        // Remove existing solution panel if any
        const existingPanel = document.querySelector('.solution-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        const panel = document.createElement('div');
        panel.className = 'solution-panel';

        const header = document.createElement('h3');
        header.textContent = 'Solution Steps';
        panel.appendChild(header);

        const content = document.createElement('div');
        content.className = 'solution-content';

        const stepInfo = document.createElement('div');
        stepInfo.className = 'step-info';
        content.appendChild(stepInfo);

        const controls = document.createElement('div');
        controls.className = 'solution-controls';

        const prevButton = document.createElement('button');
        prevButton.textContent = '← Previous Step';
        prevButton.className = 'solution-nav-button';

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next Step →';
        nextButton.className = 'solution-nav-button';

        const autoPlayButton = document.createElement('button');
        autoPlayButton.textContent = 'Auto Play';
        autoPlayButton.className = 'solution-auto-button';

        let autoPlayInterval = null;
        let currentStepIndex = -1;

        const showStep = (step) => {
            if (step) {
                console.log('Showing step:', step); // Debug log

                // Get the technique and difficulty, with fallbacks
                const technique = step.technique || step.strategy || 'Logical Deduction';
                const difficulty = step.difficulty || 'Basic';
                const reason = step.reason || 'Move made based on logical deduction';

                // Format the technique name
                const formattedTechnique = technique.split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                // Add difficulty class for styling
                const difficultyClass = difficulty.toLowerCase().replace(/\s+/g, '-');

                stepInfo.innerHTML = `
                    <div class="step-header">
                        <span class="strategy-badge ${difficultyClass}">${formattedTechnique}</span>
                        <span class="difficulty-badge ${difficultyClass}">${difficulty}</span>
                    </div>
                    <p class="step-location">Row ${step.row + 1}, Column ${step.col + 1}: Place ${step.value}</p>
                    <p class="step-reason">${reason}</p>
                `;

                // Apply the move to the game grid
                this.game.grid[step.row][step.col] = {
                    value: step.value,
                    isFixed: false,
                    notes: new Set()
                };

                // Re-render the entire grid
                this.render();

                // Highlight the affected cell
                const cells = document.querySelectorAll('.cell');
                const cellIndex = step.row * 9 + step.col;
                const cell = cells[cellIndex];
                if (cell) {
                    // Remove previous highlights
                    cells.forEach(c => c.classList.remove('solution-highlight'));
                    // Add highlight to current cell
                    cell.classList.add('solution-highlight');
                }
            }
        };

        // Previous button click handler
        prevButton.addEventListener('click', () => {
            if (currentStepIndex > 0) {
                currentStepIndex--;
                showStep(solutionPath[currentStepIndex]);
            }
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
                autoPlayButton.textContent = 'Auto Play';
            }
        });

        // Auto play button click handler
        autoPlayButton.addEventListener('click', () => {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
                autoPlayButton.textContent = 'Auto Play';
            } else {
                autoPlayButton.textContent = 'Stop';
                autoPlayInterval = setInterval(() => {
                    if (currentStepIndex < solutionPath.length - 1) {
                        currentStepIndex++;
                        showStep(solutionPath[currentStepIndex]);
                    } else {
                        clearInterval(autoPlayInterval);
                        autoPlayInterval = null;
                        autoPlayButton.textContent = 'Auto Play';
                    }
                }, 1500);
            }
        });

        // Next button click handler
        nextButton.addEventListener('click', () => {
            if (currentStepIndex < solutionPath.length - 1) {
                currentStepIndex++;
                showStep(solutionPath[currentStepIndex]);
            }
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
                autoPlayButton.textContent = 'Auto Play';
            }
        });

        controls.appendChild(prevButton);
        controls.appendChild(autoPlayButton);
        controls.appendChild(nextButton);

        panel.appendChild(content);
        panel.appendChild(controls);

        document.querySelector('.game-container').appendChild(panel);

        // Show the first step
        if (solutionPath && solutionPath.length > 0) {
            currentStepIndex = 0;
            showStep(solutionPath[currentStepIndex]);
        }
    }

    disableGameControls() {
        document.getElementById('hint').disabled = true;
        document.getElementById('check').disabled = true;
        document.getElementById('notes-mode').disabled = true;
        document.getElementById('erase').disabled = true;
        document.getElementById('undo').disabled = true;
        document.getElementById('redo').disabled = true;
    }

    enableGameControls() {
        document.getElementById('hint').disabled = false;
        document.getElementById('check').disabled = false;
        document.getElementById('notes-mode').disabled = false;
        document.getElementById('erase').disabled = false;
        document.getElementById('undo').disabled = false;
        document.getElementById('redo').disabled = false;
    }

    setupCreationModeCell(cell, row, col) {
        cell.classList.add('editable');
        cell.tabIndex = 0; // Make cell focusable

        // Handle keyboard input
        cell.addEventListener('keydown', (e) => {
            e.preventDefault();
            const key = e.key;
            if (/^[1-9]$/.test(key)) {
                if (this.game.setCreationCell(row, col, parseInt(key))) {
                    cell.textContent = key;
                } else {
                    this.showMessage('Invalid placement! Number conflicts with existing values.');
                }
            } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
                this.game.setCreationCell(row, col, 0);
                cell.textContent = '';
            }
        });

        // Handle click for selection in creation mode
        cell.addEventListener('click', () => {
            this.clearSelection();
            cell.classList.add('selected');
            cell.focus(); // Focus the cell when clicked
        });

        // Handle number pad clicks in creation mode
        const handleNumberInput = (value) => {
            if (cell.classList.contains('selected')) {
                if (value === 0) {
                    this.game.setCreationCell(row, col, 0);
                    cell.textContent = '';
                } else if (this.game.setCreationCell(row, col, value)) {
                    cell.textContent = value;
                } else {
                    this.showMessage('Invalid placement! Number conflicts with existing values.');
                }
            }
        };

        // Add number pad event listeners if they don't exist
        if (!this.numberPadInitialized) {
            document.querySelectorAll('.number').forEach(button => {
                button.addEventListener('click', () => {
                    if (this.isCreationMode) {
                        const value = parseInt(button.dataset.number);
                        const selectedCell = document.querySelector('.cell.selected');
                        if (selectedCell) {
                            const row = parseInt(selectedCell.dataset.row);
                            const col = parseInt(selectedCell.dataset.col);
                            handleNumberInput(value);
                        }
                    }
                });
            });
            this.numberPadInitialized = true;
        }
    }

    clearHighlights() {
        // Implement the logic to clear highlights
    }

    updateUI() {
        this.updateGrid();
        this.updateDocumentButtonVisibility();
        // Update other UI elements as needed
    }

    startTimerUpdates() {
        // Clear any existing interval
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Start updating the timer display
        this.timerInterval = setInterval(() => {
            if (this.timerElement && this.game.startTime) {
                const now = Date.now();
                const elapsed = now - this.game.startTime;
                const seconds = Math.floor(elapsed / 1000);
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                this.timerElement.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    resetTimer() {
        // Stop any running timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Reset the display
        if (this.timerElement) {
            this.timerElement.textContent = '00:00';
        }
        
        // Reset timer state
        this.lastUpdateTime = Date.now();
        this.elapsedTime = 0;
    }

    updateTimer(time) {
        if (this.timerElement) {
            document.getElementById("time").textContent = this.game.getFormattedTime();
        }
    }

    updateDocumentButtonVisibility() {
        const generateDocButton = document.getElementById('generate-doc-button');
        if (generateDocButton) {
            generateDocButton.style.display = this.game.isPlaying ? 'block' : 'none';
        }
    }

    checkWin() {
        if (this.game.checkWin()) {
            this.showMessage('Congratulations! Puzzle solved!');
            this.showDownloadButton();
            return true;
        }
        return false;
    }
}