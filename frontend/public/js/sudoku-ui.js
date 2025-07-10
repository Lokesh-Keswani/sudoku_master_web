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
        this.newGameButton = document.getElementById('new-game');
        this.createPuzzleButton = document.getElementById('create-puzzle');
        this.startGameButton = document.getElementById('start-game');
        this.hintButton = document.getElementById('hint');
        this.checkButton = document.getElementById('check');
        this.notesModeButton = document.getElementById('notes-mode');
        this.eraseButton = document.getElementById('erase');
        this.undoButton = document.getElementById('undo');
        this.redoButton = document.getElementById('redo');
        this.difficultySelect = document.getElementById('difficulty');

        // Set up event listeners
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
        this.setupNotesButton();
        this.setupEraseButton();
        this.setupUndoRedoButtons();
        this.setupNumberPad();
        this.setupDocumentButton();
        this.setupCompletePuzzleButton();

        // Update document button visibility based on game state
        this.updateDocumentButtonVisibility();
    }

    setupNewGameButton() {
        document.getElementById('new-game').addEventListener('click', () => {
            const difficulty = document.getElementById('difficulty').value;
            this.game.allSolutionSteps = [];
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

    setupNotesButton() {
        const notesButton = document.getElementById('notes-mode');
        if (notesButton) {
            notesButton.addEventListener('click', (e) => {
                this.game.isNotesMode = !this.game.isNotesMode;
                e.target.classList.toggle('active');
                this.showMessage(this.game.isNotesMode ? 'Notes mode ON' : 'Notes mode OFF');
            });
        }
    }

    setupEraseButton() {
        const eraseButton = document.getElementById('erase');
        if (eraseButton) {
            eraseButton.addEventListener('click', () => {
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
    }

    setupUndoRedoButtons() {
        const undoButton = document.getElementById('undo');
        const redoButton = document.getElementById('redo');
        
        if (undoButton) {
            undoButton.addEventListener('click', () => {
                if (this.game.undo()) {
                    this.render();
                }
            });
        }
        
        if (redoButton) {
            redoButton.addEventListener('click', () => {
                if (this.game.redo()) {
                    this.render();
                }
            });
        }
    }

    setupNumberPad() {
        // Add event listeners for number pad buttons
        const numberButtons = document.querySelectorAll('.number');
        if (numberButtons.length > 0) {
            numberButtons.forEach(button => {
                button.addEventListener('click', async () => {
                    const number = parseInt(button.dataset.number);
                    if (this.game.selectedCell) {
                        // Validate the move before making it
                        const { row, col } = this.game.selectedCell;
                        if (!this.game.isValidPlacement(this.game.grid, row, col, number)) {
                            // Invalid move: animate cell and show message
                            const cellIndex = row * 9 + col;
                            const cell = document.querySelectorAll('.cell')[cellIndex];
                            if (cell) {
                                cell.classList.add('cell-invalid');
                                setTimeout(() => cell.classList.remove('cell-invalid'), 1000);
                            }
                            this.showMessage('Invalid move! This number conflicts with Sudoku rules.', 2000);
                            return;
                        }
                        const valid = await this.game.makeMove(number);
                        if (valid) {
                            this.render();
                            const result = await this.game.checkSolution();
                            if (result.solved) {
                                this.showMessage('✅ Puzzle solved correctly!', 3000);
                            }
                        }
                    }
                });
            });
        }
    }

    setupDocumentButton() {
        const generateDocButton = document.getElementById('generate-doc-button');
        if (!generateDocButton) return;

        generateDocButton.addEventListener('click', async () => {
            try {
                generateDocButton.disabled = true;
                generateDocButton.textContent = 'Generating PDF...';
                
                // Restore: just call the document generator, which will trigger the download
                await this.documentGenerator.generateSolutionDocument();
                
                this.showMessage('PDF generated successfully!');
            } catch (error) {
                console.error('Error generating PDF:', error);
                this.showMessage('Error generating PDF. Please try again.');
            } finally {
                generateDocButton.disabled = false;
                generateDocButton.textContent = 'Generate PDF';
            }
        });
    }

    setupCompletePuzzleButton() {
        const completeButton = document.getElementById('complete-puzzle');
        if (completeButton) {
            completeButton.addEventListener('click', async () => {
                try {
                    completeButton.disabled = true;
                    completeButton.textContent = 'Completing...';
                    
                    const result = await this.game.completeIncompletePuzzle();
                    
                    if (result.completed) {
                        this.render();
                        this.showMessage(result.message);
                        
                        // If there's a solution path, show it
                        if (result.solutionPath && result.solutionPath.length > 0) {
                            this.showSolutionPanel(result.solutionPath);
                        }
                    } else {
                        this.showMessage(result.message || 'Failed to complete puzzle');
                    }
                } catch (error) {
                    console.error('Error completing puzzle:', error);
                    this.showMessage('Error completing puzzle: ' + error.message);
                } finally {
                    completeButton.disabled = false;
                    completeButton.textContent = 'Complete Puzzle';
                }
            });
        }
    }

    updateDocumentButtonVisibility() {
        const generateDocButton = document.getElementById('generate-doc-button');
        if (generateDocButton) {
            generateDocButton.style.display = this.game.isComplete() ? 'block' : 'none';
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

        // After rendering the grid, animate invalid cell if needed
        if (this.game && this.game.lastInvalidCell) {
            const { row, col } = this.game.lastInvalidCell;
            const cellIndex = row * 9 + col;
            const cell = document.querySelectorAll('.cell')[cellIndex];
            if (cell) {
                cell.classList.add('cell-invalid');
                setTimeout(() => cell.classList.remove('cell-invalid'), 1000);
            }
            // Clear the invalid cell after animation
            this.game.lastInvalidCell = null;
        }
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
        console.log('showStep called with:', step);
        
        // Validate step object
        if (!step) {
            console.error('No step provided to showStep');
            return;
        }
        
        if (typeof step !== 'object' || step === null) {
            console.error('Invalid step object (not an object):', step);
            return;
        }
        
        // Ensure required properties exist with defaults
        const safeStep = {
            row: typeof step.row === 'number' ? step.row : -1,
            col: typeof step.col === 'number' ? step.col : -1,
            value: typeof step.value === 'number' ? step.value : 0,
            technique: step.technique || 'Unknown',
            reason: step.reason || step.message || 'No explanation provided',
            difficulty: step.difficulty || 'Medium',
            why: step.why || step.reason || step.message || 'No explanation provided'
        };
        
        // Log the step for debugging
        console.log('Processing step:', safeStep);
        
        // Format the technique name for display
        const formattedTechnique = safeStep.technique
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
            
        // Set difficulty class for styling
        const difficulty = safeStep.difficulty || 'Medium';
        const difficultyClass = difficulty.toLowerCase().replace(/\s+/g, '-');
        const reason = safeStep.reason || 'No reason provided';
        if (!step) {
            console.error('No step provided to showStep');
            return;
        }

        // Validate step object
        if (typeof step !== 'object' || step === null) {
            console.error('Invalid step object:', step);
            return;
        }

        // Validate required step properties
        if (typeof step.row === 'undefined' || typeof step.col === 'undefined' || typeof step.value === 'undefined') {
            console.error('Step is missing required properties (row, col, or value):', step);
            return;
        }

        // Additional guard: skip if row, col, or value are not valid numbers
        if (isNaN(Number(step.row)) || isNaN(Number(step.col)) || isNaN(Number(step.value))) {
            console.error('Step has invalid row, col, or value (NaN):', step);
            return;
        }

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
                // ===== BASIC TECHNIQUES =====
                'Naked Single': 'A cell has only one possible candidate remaining. This is the simplest technique where a cell can be filled with certainty.',
                'Hidden Single': 'In a row, column, or box, a digit has only one possible cell where it can be placed, even though other candidates might exist in that cell.',
                'Full House': 'When all but one cell in a row, column, or box are filled, the last empty cell must contain the missing digit.',
                
                // ===== HIDDEN SINGLE VARIATIONS =====
                'Hidden Single Row': 'A digit can only appear in one cell of a row, even though other candidates exist in that cell. The digit is "hidden" among other candidates in that cell.',
                'Hidden Single Column': 'A digit can only appear in one cell of a column, even though other candidates exist in that cell. The digit is "hidden" among other candidates in that cell.',
                'Hidden Single Box': 'A digit can only appear in one cell of a box, even though other candidates exist in that cell. The digit is "hidden" among other candidates in that cell.',
                
                // ===== INTERSECTIONS (LOCKED CANDIDATES) =====
                'Locked Candidates Type 1 (Pointing)': 'When all candidates for a digit in a box are confined to a single row or column, that digit can be eliminated from the rest of that row or column outside the box.',
                'Locked Candidates Type 2 (Claiming)': 'When all candidates for a digit in a row or column are confined to a single box, that digit can be eliminated from the rest of that box.',
                
                // ===== SUBSETS =====
                // Naked Subsets
                'Naked Pair': 'Two cells in a unit contain exactly the same two candidates. These candidates can be removed from all other cells in the unit.',
                'Naked Triple': 'Three cells in a unit contain exactly three candidates between them. These candidates can be removed from other cells in the unit.',
                'Naked Quadruple': 'Four cells in a unit contain exactly four candidates between them. These candidates can be removed from other cells in the unit.',
                
                // Hidden Subsets
                'Hidden Pair': 'Two digits appear in exactly two cells of a unit, with other candidates in those cells. All other candidates can be removed from these two cells.',
                'Hidden Triple': 'Three digits appear in exactly three cells of a unit, with other candidates in those cells. All other candidates can be removed from these three cells.',
                'Hidden Quadruple': 'Four digits appear in exactly four cells of a unit, with other candidates in those cells. All other candidates can be removed from these four cells.',
                
                // ===== FISH PATTERNS =====
                // Basic Fish
                'X-Wing': 'A digit forms a rectangle with exactly two possible positions in two rows and two columns. This allows elimination of that digit from other cells in those columns/rows.',
                'Swordfish': 'A digit has exactly two or three possible positions in three rows and three columns. This allows elimination of that digit from other cells in those columns/rows.',
                'Jellyfish': 'A digit has exactly two, three, or four possible positions in four rows and four columns. This allows elimination of that digit from other cells in those columns/rows.',
                'Hidden Row': 'A digit is restricted to a single row within a box across multiple boxes, allowing elimination of that digit from the rest of the row outside these boxes.',
                'Hidden Column': 'A digit is restricted to a single column within a box across multiple boxes, allowing elimination of that digit from the rest of the column outside these boxes.',
                'Hidden Pair Row': 'Two digits are restricted to the same two cells in a row, allowing elimination of other candidates from those cells.',
                'Hidden Pair Column': 'Two digits are restricted to the same two cells in a column, allowing elimination of other candidates from those cells.',
                'Hidden Triple Row': 'Three digits are restricted to the same three cells in a row, allowing elimination of other candidates from those cells.',
                'Hidden Triple Column': 'Three digits are restricted to the same three cells in a column, allowing elimination of other candidates from those cells.',
                
                // Finned/Sashimi Fish
                'Finned X-Wing': 'Similar to X-Wing, but with one or more additional candidates (fins) in one of the boxes, allowing for additional eliminations.',
                'Finned Swordfish': 'A Swordfish pattern with one or more additional candidates (fins) in one of the boxes.',
                'Finned Jellyfish': 'A Jellyfish pattern with one or more additional candidates (fins) in one of the boxes.',
                
                // Complex Fish
                'Franken Fish': 'A fish pattern where the base or cover sets include both complete units (rows/columns) and partial units (boxes).',
                'Mutant Fish': 'A fish pattern where the base and cover sets can be any combination of rows, columns, and boxes.',
                'Siamese Fish': 'Two fish patterns that share some base or cover sets, allowing for combined eliminations.',
                'Kraken Fish': 'An advanced fish pattern that includes additional candidates that don\'t fit the standard fish pattern but still allow eliminations.',
                
                // ===== SINGLE DIGIT PATTERNS =====
                'Skyscraper': 'A digit forms a strong link in two rows/columns that share a box, allowing eliminations where the base cells see both towers.',
                '2-String Kite': 'A digit has exactly two candidates in a row and column that intersect in a box, allowing eliminations in cells that see both ends.',
                'Turbot Fish': 'A single-digit pattern that combines a strong link in a row/column with a strong link in a box.',
                'Empty Rectangle': 'A digit\'s candidates in a box are limited to one row or column, allowing eliminations in the intersecting row or column outside the box.',
                
                // ===== UNIQUENESS TECHNIQUES =====
                'Unique Rectangle': 'A pattern that would lead to multiple solutions if certain candidates were not eliminated, based on the assumption that the puzzle has a unique solution.',
                'BUG+1': 'Bivalue Universal Grave + 1: A pattern where all unsolved cells have exactly two candidates except one, which has three. The extra candidate can be placed to avoid multiple solutions.',
                
                // ===== WING PATTERNS =====
                'XY-Wing': 'Three cells where one cell (the pivot) sees the other two (the pincers), and the pincers share a candidate that can be eliminated from cells that see both pincers.',
                'XYZ-Wing': 'Similar to XY-Wing, but the pivot cell has three candidates. The extra candidate allows for additional eliminations.',
                'ALS-XZ': 'Two Almost Locked Sets that share a restricted common candidate, allowing eliminations based on the interaction between the sets.',
                'ALS-XY-Wing': 'An extension of XY-Wing using Almost Locked Sets instead of single cells, allowing for more complex interactions.',
                'ALS-Chain': 'A chain of Almost Locked Sets connected by restricted common candidates, similar to an XY-Chain but with sets instead of single cells.',
                'Death Blossom': 'A complex pattern where one cell (the stem) sees multiple Almost Locked Sets (the petals), allowing for advanced eliminations.',
                
                // ===== LAST RESORT TECHNIQUES =====
                'Brute Force': 'A last-resort method that tries all possible candidates until a solution is found.',
                'Guess': 'Making an educated guess when no logical moves are available.',
                'Trial and Error': 'Trying different values and backtracking when a contradiction is found.'
            };
            // Get technique description or use a default
            let techniqueDescription = techniqueExplanations[formattedTechnique] || 
                `${formattedTechnique} is a Sudoku solving technique.`;
                
            // Build the step info HTML safely
            const locationText = safeStep.row >= 0 && safeStep.col >= 0 
                ? `Row ${safeStep.row + 1}, Column ${safeStep.col + 1}: Place ${safeStep.value}`
                : `Place ${safeStep.value}`;
                
            // Set the step info HTML
            stepInfo.innerHTML = `
                <div class="step-header">
                    <span class="strategy-badge ${difficultyClass}">${formattedTechnique}</span>
                    <span class="difficulty-badge ${difficultyClass}">${difficulty}</span>
                </div>
                <p class="technique-explanation"><strong>About this technique:</strong> ${techniqueDescription}</p>
                <p class="step-location">${locationText}</p>
                <p class="step-reason">${reason}</p>
            `;
            // Build the explanation text safely
            const locationSpeech = safeStep.row >= 0 && safeStep.col >= 0 
                ? `at row ${safeStep.row + 1}, column ${safeStep.col + 1}`
                : '';
                
            let explanation = `${formattedTechnique} technique is used here. ${techniqueDescription} `;
            explanation += `Placing ${safeStep.value} ${locationSpeech}. `;
            explanation += `${safeStep.why || reason} This was the best move because: ${reason}.`;
            const msg = new SpeechSynthesisUtterance(explanation);
            window.speechSynthesis.cancel();
            if (isAutoPlay && typeof onSpeechEnd === 'function') {
                msg.onend = onSpeechEnd;
            }
            window.speechSynthesis.speak(msg);
            
            // Only update the game grid if we have valid coordinates
            if (safeStep.row >= 0 && safeStep.row < 9 && safeStep.col >= 0 && safeStep.col < 9) {
                try {
                    // First, validate the game and grid
                    if (!this.game) {
                        throw new Error('Game instance not found in showStep');
                    }
                    
                    // Initialize the grid if it doesn't exist
                    if (!this.game.grid) {
                        console.log('Initializing game grid in showStep');
                        this.game.grid = Array(9).fill().map(() => 
                            Array(9).fill().map(() => ({
                                value: 0,
                                isFixed: false,
                                notes: new Set()
                            }))
                        );
                    }
                    
                    // Validate grid structure
                    if (!Array.isArray(this.game.grid) || this.game.grid.length !== 9) {
                        throw new Error('Invalid game grid structure');
                    }
                    
                    // Ensure the row exists
                    if (!this.game.grid[safeStep.row]) {
                        this.game.grid[safeStep.row] = [];
                    }
                    
                    // Ensure the cell exists and has the correct structure
                    if (!this.game.grid[safeStep.row][safeStep.col]) {
                        this.game.grid[safeStep.row][safeStep.col] = {
                            value: 0,
                            isFixed: false,
                            notes: new Set()
                        };
                    }
                    
                    // Re-render the grid to show the update
                    this.render();
                    
                    // Highlight the cell that was just updated
                    const cells = document.querySelectorAll('.cell');
                    const cellIndex = safeStep.row * 9 + safeStep.col;
                    if (cellIndex >= 0 && cellIndex < cells.length) {
                        const cell = cells[cellIndex];
                        if (cell) {
                            // Remove highlight from all cells
                            cells.forEach(c => c.classList.remove('highlight', 'solution-highlight'));
                            // Add highlight to the current cell
                            cell.classList.add('solution-highlight');
                        }
                    }
                    
                } catch (error) {
                    console.error('Error in showStep:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    this.showMessage(`Error: ${errorMessage}`);
                }
            } else {
                console.warn('Invalid cell coordinates in showStep:', safeStep.row, safeStep.col);
            }
        }
        this.updateDocumentButtonVisibility();
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

    async fillBoardWithSolution(solutionPath) {
        if (!solutionPath) return;
        // Clear previous steps before filling
        this.game.allSolutionSteps = [];
        for (const step of solutionPath) {
            if (step && typeof step.row === 'number' && typeof step.col === 'number' && typeof step.value === 'number') {
                this.game.grid[step.row][step.col].value = step.value;
                // Record the step for PDF generation
                this.game.allSolutionSteps.push({
                    ...step,
                    timestamp: Date.now()
                });
                // Animate each step
                this.render();
                await new Promise(res => setTimeout(res, 120));
            }
        }
        this.render();
        this.updateDocumentButtonVisibility();
    }
}

// Expose SudokuUI to the global scope
window.SudokuUI = SudokuUI;