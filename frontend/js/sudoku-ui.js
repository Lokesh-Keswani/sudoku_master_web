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
            this.generateDocButton.addEventListener('click', async () => {
                await this.documentGenerator.generateSolutionDocument();
                // Show a message/link in the pdf-link-container
                const pdfLinkContainer = document.getElementById('pdf-link-container');
                pdfLinkContainer.innerHTML = '<span style="background:#e3f2fd;padding:8px 16px;border-radius:4px;display:inline-block;">PDF generated and downloaded! If it didn\'t download, <a href="#" onclick="window.location.reload()">click here to try again</a>.</span>';
            });
        }

        this.setupEventListeners();
        this.render();

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

        // Hide generate doc button initially
        if (this.generateDocButton) {
            this.generateDocButton.style.display = 'none';
        }
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
                    this.resetTimer();
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
                    // this.fillBoardWithSolution(result.solutionPath); // Commented out to restore step-by-step behavior
                    this.showMessage('Here is the step-by-step solution.');
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
                        const result = await this.game.checkSolution();
                        if (result.solved) {
                            this.showMessage('Congratulations! You solved the puzzle!');
                            this.disableGameControls();
                            this.showDownloadButton();
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

    showDownloadButton() {
        console.log('Showing download button...'); // Debug log
        const downloadButton = document.getElementById('generate-doc-button');
        if (downloadButton) {
            downloadButton.style.display = 'block';
            console.log('Download button display set to:', downloadButton.style.display); // Debug log
        } else {
            console.log('Download button not found in DOM'); // Debug log
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
        this.updateNumberPad();
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

    showMessage(message, duration = 3000) {
        if (!this.messageElement) return;
        
        // Clear any existing timeout
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        
        // Set the message and show it
        this.messageElement.textContent = message;
        this.messageElement.classList.add('show');
        
        // Auto-hide after duration
        this.messageTimeout = setTimeout(() => {
            this.messageElement.classList.remove('show');
        }, duration);
    }

    checkWin() {
        if (this.game.isComplete()) {
            // Stop the timer when the game is won
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
            
            // Disable game controls
            this.disableGameControls();
            
            // Show win message
            this.showMessage('Congratulations! You solved the puzzle!', 5000);
            
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
        const controls = ['hint', 'check', 'notes-mode', 'erase', 'undo', 'redo'];
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
        this.stopTimer();
        this.elapsedTime = 0;
        this.lastUpdateTime = Date.now();
        this.updateTimer();
        this.startTimerUpdates();
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

    showStep(step, isAutoPlay = false, onSpeechEnd = null) {
        const stepInfo = document.getElementById('step-info');
        if (!stepInfo) return;

        if (step) {
            console.log('Showing step:', step);
            const technique = step.technique || step.strategy || 'Logical Deduction';
            const difficulty = step.difficulty || 'Basic';
            const reason = step.reason || 'Move made based on logical deduction';
            const formattedTechnique = technique.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            const difficultyClass = difficulty.toLowerCase().replace(/\s+/g, '-');
            const techniqueExplanations = {
                // Singles
                'Naked Single': 'Naked Single: Only one candidate remains for this cell, so it must be placed here.',
                'Hidden Single': 'Hidden Single: A digit can only go in one cell within a unit (row, column, or box).',
                'Full House': 'Full House (Last Digit): Only one empty cell remains in a unit, so the missing digit must go there.',
                // Intersections
                'Locked Candidates Type 1 (Pointing)': 'Locked Candidates Type 1 (Pointing): All candidates for a digit in a box are confined to a single row or column, so that digit can be eliminated from the rest of that row or column.',
                'Locked Candidates Type 2 (Claiming)': 'Locked Candidates Type 2 (Claiming): All candidates for a digit in a row or column are confined to a single box, so that digit can be eliminated from the rest of that box.',
                // Hidden Subsets
                'Hidden Pair': 'Hidden Pair: Two digits can only go in two cells within a unit, so all other candidates can be removed from those cells.',
                'Hidden Triple': 'Hidden Triple: Three digits can only go in three cells within a unit, so all other candidates can be removed from those cells.',
                'Hidden Quadruple': 'Hidden Quadruple: Four digits can only go in four cells within a unit, so all other candidates can be removed from those cells.',
                // Naked Subsets
                'Naked Pair': 'Naked Pair: Two cells in a unit contain only the same two candidates, so those candidates can be removed from other cells in the unit.',
                'Naked Triple': 'Naked Triple: Three cells in a unit contain only the same three candidates, so those candidates can be removed from other cells in the unit.',
                'Naked Quadruple': 'Naked Quadruple: Four cells in a unit contain only the same four candidates, so those candidates can be removed from other cells in the unit.',
                // Fish
                'X-Wing': 'X-Wing: A digit appears in exactly two cells in two different rows and columns, forming a rectangle. This allows elimination of that digit from other cells in those columns/rows.',
                'Swordfish': 'Swordfish: Like X-Wing, but with three rows and columns.',
                'Jellyfish': 'Jellyfish: Like X-Wing, but with four rows and columns.',
                // Finned/Sashimi Fish
                'Finned X-Wing': 'Finned X-Wing: An X-Wing with an extra candidate (the fin) that allows for additional eliminations.',
                'Finned Swordfish': 'Finned Swordfish: A Swordfish with a fin.',
                'Finned Jellyfish': 'Finned Jellyfish: A Jellyfish with a fin.',
                // Complex Fish
                'Franken Fish': 'Franken Fish: A fish pattern that uses non-standard blocks.',
                'Mutant Fish': 'Mutant Fish: A fish pattern that uses both rows and columns as base/cover sets.',
                'Siamese Fish': 'Siamese Fish: Two fish patterns sharing base sets.',
                // Single Digit Patterns
                'Skyscraper': 'Skyscraper: A digit forms a strong link in two rows/columns, allowing eliminations.',
                '2-String Kite': '2-String Kite: A pattern combining strong links in a row and column.',
                'Turbot Fish': 'Turbot Fish: A pattern combining strong links in rows and columns.',
                'Empty Rectangle': 'Empty Rectangle: A digit’s candidates in a box are limited to one row/column, allowing eliminations.',
                // Uniqueness
                'Unique Rectangle': 'Unique Rectangle: A pattern that would allow multiple solutions, so certain candidates can be eliminated.',
                'BUG+1': 'BUG+1: Binary Universal Grave + 1. Only one cell can take a certain value to avoid multiple solutions.',
                // Wings
                'XY-Wing': 'XY-Wing: Three cells with specific candidate relationships allow eliminations.',
                'XYZ-Wing': 'XYZ-Wing: An extension of XY-Wing with an additional candidate.',
                'W-Wing': 'W-Wing: Two cells with a strong link allow eliminations.',
                // Miscellaneous
                'Sue de Coq': 'Sue de Coq: A complex pattern involving two sets of cells and candidates.',
                'Coloring': 'Coloring: Using colors to track strong/weak links and make eliminations.',
                // Chains and Loops
                'Remote Pair': 'Remote Pair: A chain of cells with the same two candidates allows eliminations.',
                'X-Chain': 'X-Chain: A chain of strong links for a single digit.',
                'XY-Chain': 'XY-Chain: A chain of cells with alternating candidates allows eliminations.',
                'Nice Loop': 'Nice Loop (AIC): Alternating Inference Chains and Nice Loops for advanced eliminations.',
                // ALS
                'ALS-XZ': 'ALS-XZ: Almost Locked Set XZ rule for advanced eliminations.',
                'ALS-XY-Wing': 'ALS-XY-Wing: An ALS-based extension of the XY-Wing.',
                'ALS Chain': 'ALS Chain: A chain of Almost Locked Sets.',
                'Death Blossom': 'Death Blossom: A complex pattern involving multiple ALS.',
                // Last Resort
                'Templates': 'Templates: Template-based solving approach.',
                'Forcing Chain': 'Forcing Chain: Chain-based forcing pattern.',
                'Forcing Net': 'Forcing Net: Network of forcing chains.',
                'Kraken Fish': 'Kraken Fish: Complex fish pattern with additional candidates.',
                'Brute Force': 'Brute Force: Last resort solving method, tries all possibilities.'
            };
            let techniqueDescription = techniqueExplanations[formattedTechnique] || `${formattedTechnique} is a Sudoku technique.`;
            stepInfo.innerHTML = `
                <div class="step-header">
                    <span class="strategy-badge ${difficultyClass}">${formattedTechnique}</span>
                    <span class="difficulty-badge ${difficultyClass}">${difficulty}</span>
                </div>
                <p class="technique-explanation"><strong>About this technique:</strong> ${techniqueDescription}</p>
                <p class="step-location">Row ${step.row + 1}, Column ${step.col + 1}: Place ${step.value}</p>
                <p class="step-reason">${reason}</p>
            `;
            let why = step.why || reason;
            let explanation = `${formattedTechnique} technique is used here. ${techniqueDescription} Placing ${step.value} at row ${step.row + 1}, column ${step.col + 1}. ${why} This was the best move because: ${reason}.`;
            const msg = new SpeechSynthesisUtterance(explanation);
            window.speechSynthesis.cancel();
            if (isAutoPlay && typeof onSpeechEnd === 'function') {
                msg.onend = onSpeechEnd;
            }
            window.speechSynthesis.speak(msg);
            this.game.grid[step.row][step.col] = {
                value: step.value,
                isFixed: false,
                notes: new Set()
            };
            this.render();
            const cells = document.querySelectorAll('.cell');
            const cellIndex = step.row * 9 + step.col;
            const cell = cells[cellIndex];
            if (cell) {
                cells.forEach(c => c.classList.remove('solution-highlight'));
                cell.classList.add('solution-highlight');
            }
        }
    }

    showSolutionPanel(solutionPath) {
        console.log('Showing solution panel with path:', solutionPath); // Debug log

        // Use the static panel from the HTML
        const panel = document.getElementById('solution-steps-panel');
        if (!panel) return;
        panel.className = 'solution-panel';
        panel.innerHTML = '';

        // Header
        const header = document.createElement('h3');
        header.textContent = 'Solution Steps';
        panel.appendChild(header);

        // Content
        const content = document.createElement('div');
        content.className = 'solution-content';
        panel.appendChild(content);

        // Step info (where step explanations go)
        const stepInfo = document.createElement('div');
        stepInfo.id = 'step-info';
        stepInfo.className = 'step-info';
        content.appendChild(stepInfo);

        // Controls
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

        let currentStepIndex = -1;
        let autoPlayActive = false;
        let autoPlayShouldStop = false;

        // Auto play logic (waits for speech to finish)
        autoPlayButton.addEventListener('click', () => {
            if (autoPlayActive) {
                autoPlayShouldStop = true;
                autoPlayActive = false;
                autoPlayButton.textContent = 'Auto Play';
            } else {
                autoPlayActive = true;
                autoPlayShouldStop = false;
                autoPlayButton.textContent = 'Stop';
                const playStep = (index) => {
                    if (autoPlayShouldStop || index >= solutionPath.length) {
                        autoPlayActive = false;
                        autoPlayButton.textContent = 'Auto Play';
                        return;
                    }
                    currentStepIndex = index;
                    this.showStep(solutionPath[currentStepIndex], true, () => {
                        playStep(index + 1);
                    });
                };
                playStep(currentStepIndex < 0 ? 0 : currentStepIndex);
            }
        });

        prevButton.addEventListener('click', () => {
            if (currentStepIndex > 0) {
                currentStepIndex--;
                this.showStep(solutionPath[currentStepIndex]);
            }
            autoPlayActive = false;
            autoPlayButton.textContent = 'Auto Play';
        });

        nextButton.addEventListener('click', () => {
            if (currentStepIndex < solutionPath.length - 1) {
                currentStepIndex++;
                this.showStep(solutionPath[currentStepIndex]);
            }
            autoPlayActive = false;
            autoPlayButton.textContent = 'Auto Play';
        });

        controls.appendChild(prevButton);
        controls.appendChild(autoPlayButton);
        controls.appendChild(nextButton);
        panel.appendChild(controls);

        // Show the first step
        if (solutionPath && solutionPath.length > 0) {
            currentStepIndex = 0;
            this.showStep(solutionPath[currentStepIndex]);
        } else {
            stepInfo.innerHTML = '<em>No solution steps available.</em>';
        }
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

    updateDocumentButtonVisibility() {
        const generateDocButton = document.getElementById('generate-doc-button');
        if (generateDocButton) {
            generateDocButton.style.display = this.game.isPlaying ? 'block' : 'none';
        }
    }

    updateNumberPad() {
        const counts = this.game.getNumberCounts();
        document.querySelectorAll('.numbers .number').forEach(button => {
            const number = parseInt(button.dataset.number);
            const count = counts[number] || 0;
            const remaining = 9 - count;

            let countElement = button.querySelector('.count');
            if (!countElement) {
                countElement = document.createElement('span');
                countElement.className = 'count';
                button.appendChild(countElement);
            }

            countElement.textContent = remaining;

            if (remaining <= 0) {
                button.disabled = true;
                button.classList.add('completed');
            } else {
                button.disabled = false;
                button.classList.remove('completed');
            }
        });
    }

    fillBoardWithSolution(solutionPath) {
        if (!solutionPath) return;
        solutionPath.forEach(step => {
            if (step && typeof step.row === 'number' && typeof step.col === 'number' && typeof step.value === 'number') {
                this.game.grid[step.row][step.col].value = step.value;
            }
        });
        this.render();
    }
}