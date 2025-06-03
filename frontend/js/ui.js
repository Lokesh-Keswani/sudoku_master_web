class SudokuUI {
    constructor(game) {
        this.game = game;
        this.gridElement = document.getElementById('sudoku-grid');
        this.timeElement = document.getElementById('time');
        this.messageElement = document.getElementById('message');
        this.isCreationMode = false;

        this.setupEventListeners();
        this.setupTimerUpdate();
        this.render();
    }

    setupEventListeners() {
        // Game control buttons
        this.setupNewGameButton();
        this.setupCreatePuzzleButton();
        this.setupHintButton();
        this.setupCheckSolutionButton();
        this.setupNotesButton();
        this.setupEraseButton();
        this.setupUndoRedoButtons();
        this.setupNumberPad();
    }

    setupNewGameButton() {
        document.getElementById('new-game').addEventListener('click', () => {
            const difficulty = document.getElementById('difficulty').value;
            this.game.newGame(difficulty).then(() => {
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
            this.startPuzzleCreation(); // Disable controls
            createButton.style.display = 'none';
            startGameButton.style.display = 'block';
            this.render();
            this.showMessage('Creation mode: Enter your puzzle (minimum 17 numbers needed)');
        });

        startGameButton.addEventListener('click', () => {
            if (this.game.validateCustomPuzzle()) {
                if (this.game.finalizeCustomPuzzle()) {
                    this.isCreationMode = false;
                    createButton.style.display = 'block';
                    startGameButton.style.display = 'none';
                    
                    // Re-enable all game controls
                    document.getElementById('hint').disabled = false;
                    document.getElementById('check').disabled = false;
                    document.getElementById('notes-mode').disabled = false;
                    
                    this.render();
                    this.showMessage('Custom puzzle started! Good luck!');
                } else {
                    this.showMessage('Error: Failed to create puzzle. Please try again.');
                }
            } else {
                this.showMessage('Invalid puzzle! Need at least 17 numbers and a unique solution.');
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
                } else {
                    this.showMessage('No more hints available!');
                }
            } else {
                this.showMessage('No hints remaining!');
            }
        });
    }

    setupCheckSolutionButton() {
        document.getElementById('check').addEventListener('click', async () => {
            const result = await this.game.checkSolution();
            console.log('Check solution result:', result); // Debug log
            
            if (result.solved) {
                this.showMessage('Congratulations! Puzzle solved!');
                this.timeElement.textContent = this.game.getFormattedTime();
                this.disableGameControls();
            } else if (result.showSolution && result.solutionPath) {
                console.log('Showing solution panel with path:', result.solutionPath); // Debug log
                this.showSolutionPanel(result.solutionPath);
                this.showMessage('Here is the step-by-step solution');
            } else {
                this.showMessage('Keep trying! Click check again to see the solution.');
            }
        });
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
        document.querySelectorAll('.number').forEach(button => {
            button.addEventListener('click', () => {
                const value = parseInt(button.dataset.number);
                if (this.game.selectedCell) {
                    this.game.makeMove(value).then(valid => {
                        if (valid) {
                            this.render();
                        } else {
                            this.showMessage('Invalid move!');
                        }
                    });
                }
            });
        });
    }

    setupTimerUpdate() {
        setInterval(() => {
            if (!this.game.isCreating) {
                this.timeElement.textContent = this.game.getFormattedTime();
            }
        }, 1000);
    }

    render() {
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

        this.applyCellBorders(cell, row, col);
        
        const cellData = this.game.grid[row][col];
        
        if (this.isCreationMode) {
            this.setupCreationModeCell(cell, row, col);
            if (cellData.value !== 0) {
                cell.textContent = cellData.value;
            }
        } else {
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
            this.setupCellClickHandler(cell, row, col);
        }

        return cell;
    }

    applyCellBorders(cell, row, col) {
        if (row % 3 === 0) cell.style.borderTop = '2px solid var(--grid-line-color)';
        if (col % 3 === 0) cell.style.borderLeft = '2px solid var(--grid-line-color)';
    }

    createNotesElement(notes) {
        const notesElement = document.createElement('div');
        notesElement.className = 'notes';

        // Create a 3x3 grid for notes
        for (let i = 1; i <= 9; i++) {
            const noteCell = document.createElement('div');
            noteCell.className = 'note-cell';
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

    showMessage(text, duration = 3000) {
        this.messageElement.textContent = text;
        this.messageElement.classList.add('show');
        setTimeout(() => {
            this.messageElement.classList.remove('show');
        }, duration);
    }

    showSolutionPanel(solutionPath) {
        console.log('Creating solution panel with path:', solutionPath);
        
        // Remove existing solution panel if any
        const existingPanel = document.querySelector('.solution-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        // Store initial grid state
        const initialGrid = this.game.grid.map(row => 
            row.map(cell => ({
                value: cell.value,
                isFixed: cell.isFixed,
                notes: new Set(cell.notes)
            }))
        );

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
        prevButton.textContent = '← Previous';
        prevButton.className = 'solution-nav-button';
        
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next →';
        nextButton.className = 'solution-nav-button';
        
        const autoPlayButton = document.createElement('button');
        autoPlayButton.textContent = 'Auto Play';
        autoPlayButton.className = 'solution-auto-button';

        let currentStepIndex = -1;
        const steps = solutionPath;

        const showStep = (index) => {
            if (index >= 0 && index < steps.length) {
                // Reset grid to initial state if going backwards
                if (index < currentStepIndex) {
                    this.game.grid = initialGrid.map(row => 
                        row.map(cell => ({
                            value: cell.value,
                            isFixed: cell.isFixed,
                            notes: new Set(cell.notes)
                        }))
                    );
                    // Apply all steps up to current index
                    for (let i = 0; i <= index; i++) {
                        const step = steps[i];
                        this.game.grid[step.row][step.col] = {
                            value: step.value,
                            isFixed: false,
                            notes: new Set()
                        };
                    }
                } else {
                    // Apply just this step if going forward
                    const step = steps[index];
                    this.game.grid[step.row][step.col] = {
                        value: step.value,
                        isFixed: false,
                        notes: new Set()
                    };
                }

                const step = steps[index];
                
                // Update step info
                stepInfo.innerHTML = `
                    <div class="step-header">
                        <span class="strategy-badge ${step.difficulty.toLowerCase()}">${step.strategy}</span>
                        <span class="difficulty-badge ${step.difficulty.toLowerCase()}">${step.difficulty}</span>
                    </div>
                    <p class="step-reason">${step.reason}</p>
                `;

                // Clear all highlights
                this.clearHighlights();

                // Highlight the main cell
                const mainCell = document.querySelector(`.cell[data-row="${step.row}"][data-col="${step.col}"]`);
                if (mainCell) {
                    mainCell.classList.add('solution-highlight');
                }

                // Highlight related cells
                if (step.patternCells) {
                    step.patternCells.forEach(cell => {
                        const cellElement = document.querySelector(`.cell[data-row="${cell.row}"][data-col="${cell.col}"]`);
                        if (cellElement) {
                            cellElement.classList.add('pattern-highlight');
                        }
                    });
                }

                // Update the grid display
                this.render();

                currentStepIndex = index;
                prevButton.disabled = currentStepIndex <= 0;
                nextButton.disabled = currentStepIndex >= steps.length - 1;
            }
        };
        
        let autoPlayInterval = null;
        
        const stopAutoPlay = () => {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
                autoPlayButton.textContent = 'Auto Play';
            }
        };

        prevButton.addEventListener('click', () => {
            stopAutoPlay();
            if (currentStepIndex > 0) {
                showStep(currentStepIndex - 1);
            }
        });

        nextButton.addEventListener('click', () => {
            stopAutoPlay();
            if (currentStepIndex < steps.length - 1) {
                showStep(currentStepIndex + 1);
            }
        });

        autoPlayButton.addEventListener('click', () => {
            if (autoPlayInterval) {
                stopAutoPlay();
            } else {
                autoPlayButton.textContent = 'Stop';
                let index = currentStepIndex;
                autoPlayInterval = setInterval(() => {
                    index++;
                    if (index >= steps.length) {
                        stopAutoPlay();
                        this.game.stopTimer();
                        this.timeElement.textContent = this.game.getFormattedTime();
                        this.disableGameControls();
                    } else {
                        showStep(index);
                    }
                }, 2000);
            }
        });

        controls.appendChild(prevButton);
        controls.appendChild(autoPlayButton);
        controls.appendChild(nextButton);
        
        panel.appendChild(content);
        panel.appendChild(controls);
        
        document.querySelector('.game-container').appendChild(panel);
        
        // Show the first step
        if (steps.length > 0) {
            showStep(0);
        }
    }

    clearHighlights() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('solution-highlight', 'pattern-highlight', 'highlighted');
        });
    }

    setupCreationModeCell(cell, row, col) {
        cell.contentEditable = true;
        cell.classList.add('editable');
        
        // Handle keyboard input
        cell.addEventListener('keydown', (e) => {
            e.preventDefault();
            const key = e.key;
            if (/^[1-9]$/.test(key)) {
                cell.textContent = key;
                this.game.setCreationCell(row, col, parseInt(key));
                this.highlightConflicts();
            } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
                cell.textContent = '';
                this.game.setCreationCell(row, col, 0);
                this.highlightConflicts();
            }
        });

        // Handle cell selection
        cell.addEventListener('click', () => {
            this.clearSelection();
            cell.classList.add('selected');
        });
    }

    highlightConflicts() {
        const conflicts = this.game.findConflicts();
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('conflict');
        });

        conflicts.forEach(({row, col}) => {
            const cells = document.querySelectorAll('.cell');
            const index = row * 9 + col;
            if (cells[index]) {
                cells[index].classList.add('conflict');
            }
        });
    }

    startPuzzleCreation() {
        // Disable game controls during creation
        document.getElementById('hint').disabled = true;
        document.getElementById('check').disabled = true;
        document.getElementById('notes-mode').disabled = true;
        document.getElementById('notes-mode').classList.remove('active');
        
        // Reset and freeze the timer display
        this.timeElement.textContent = '00:00';
    }

    disableGameControls() {
        document.getElementById('hint').disabled = true;
        document.getElementById('check').disabled = true;
        document.getElementById('notes-mode').disabled = true;
        document.querySelectorAll('.number').forEach(btn => btn.disabled = true);
        document.getElementById('erase').disabled = true;
    }
}