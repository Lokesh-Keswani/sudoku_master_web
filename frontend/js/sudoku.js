class SudokuGame {
    constructor() {
        // Game state
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = null;
        this.difficulty = 'medium';

        // UI state
        this.selectedCell = null;
        this.isNotesMode = false;

        // Game features
        this.hintsRemaining = 3;
        this.checkCount = 0;

        // History management
        this.undoStack = [];
        this.redoStack = [];

        // Timer management
        this.startTime = null;
        this.elapsedTime = 0;
        this.timerInterval = null;

        // New hint management
        this.currentHints = [];
        this.currentHintIndex = 0;

        // Solution path management
        this.solutionPath = null;
        this.currentSolutionStep = 0;
    }

    async newGame(difficulty = 'medium') {
        try {
            const response = await fetch('http://localhost:8000/api/sudoku/new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ difficulty })
            });

            if (!response.ok) throw new Error('Failed to start new game');

            const data = await response.json();

            // Initialize grid with cell objects
            this.grid = data.grid.map(row => row.map(cell => ({
                value: cell,
                isFixed: cell !== 0,
                notes: new Set()
            })));

            // Reset game state
            this.solution = data.solution;
            this.difficulty = difficulty;
            this.selectedCell = null;
            this.hintsRemaining = 3;
            this.checkCount = 0;

            // Clear history
            this.undoStack = [];
            this.redoStack = [];

            // Reset and start timer
            this.elapsedTime = 0;
            this.startTimer();

            return true;
        } catch (error) {
            console.error('Error starting new game:', error);
            return false;
        }
    }

    selectCell(row, col) {
        if (row >= 0 && row < 9 && col >= 0 && col < 9) {
            this.selectedCell = { row, col };
            return true;
        }
        return false;
    }

    isValidMove(row, col) {
        return this.grid[row] &&
            this.grid[row][col] &&
            !this.grid[row][col].isFixed;
    }

    async makeMove(value) {
        if (!this.selectedCell) return false;
        const { row, col } = this.selectedCell;

        if (!this.isValidMove(row, col)) return false;

        // Handle erasing - don't need to validate with server
        if (value === 0) {
            this.saveState();
            this.grid[row][col].value = 0;
            this.grid[row][col].notes.clear();
            this.redoStack = [];
            return true;
        }

        // Handle notes mode
        if (this.isNotesMode) {
            return this.toggleNote(row, col, value);
        }

        // Handle regular move
        try {
            const response = await fetch('http://localhost:8000/api/sudoku/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    move: { row, col, value },
                    puzzle: {
                        grid: this.grid.map(row => row.map(cell => cell.value || 0)),
                        difficulty: this.difficulty
                    }
                })
            });

            if (!response.ok) throw new Error('Failed to validate move');

            const { valid } = await response.json();
            if (valid) {
                this.saveState();
                this.grid[row][col].value = value;
                this.grid[row][col].notes.clear();
                this.redoStack = [];
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error validating move:', error);
            return false;
        }
    }

    toggleNote(row, col, value) {
        if (!this.selectedCell || this.grid[row][col].value !== 0) return false;

        this.saveState();
        const notes = this.grid[row][col].notes;
        if (notes.has(value)) {
            notes.delete(value);
        } else {
            notes.add(value);
        }
        this.redoStack = [];
        return true;
    }

    async getHint() {
        if (this.hintsRemaining <= 0) return null;

        try {
            const response = await fetch('http://localhost:8000/api/sudoku/hint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grid: this.grid.map(row => row.map(cell => cell.value || 0)),
                    solution: this.solution,
                    difficulty: this.difficulty
                })
            });

            if (!response.ok) throw new Error('Failed to get hint');

            const data = await response.json();
            if (data.moves && data.moves.length > 0) {
                // Directly apply the first move
                const move = data.moves[0];
                this.grid[move.row][move.col] = {
                    value: move.value,
                    isFixed: false,
                    notes: new Set()
                };
                this.hintsRemaining--;
                return move;
            }
            return null;
        } catch (error) {
            console.error('Error getting hint:', error);
            return null;
        }
    }

    getCurrentHint() {
        if (!this.currentHints || this.currentHintIndex >= this.currentHints.length) {
            return null;
        }
        return this.currentHints[this.currentHintIndex];
    }

    getNextHint() {
        if (!this.currentHints || this.currentHintIndex >= this.currentHints.length - 1) {
            return null;
        }
        this.currentHintIndex++;
        return this.getCurrentHint();
    }

    getPreviousHint() {
        if (!this.currentHints || this.currentHintIndex <= 0) {
            return null;
        }
        this.currentHintIndex--;
        return this.getCurrentHint();
    }

    applyCurrentHint() {
        const hint = this.getCurrentHint();
        if (hint) {
            this.saveState();
            const { row, col, value } = hint;
            this.grid[row][col].value = value;
            this.grid[row][col].notes.clear();
            this.redoStack = [];
            return true;
        }
        return false;
    }

    async checkSolution() {
        try {
            const response = await fetch('http://localhost:8000/api/sudoku/check-solution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grid: this.grid.map(row => row.map(cell => cell.value || 0)),
                    solution: this.solution,
                    difficulty: this.difficulty
                })
            });

            if (!response.ok) throw new Error('Failed to check solution');

            const data = await response.json();
            this.checkCount++;

            if (data.solved) {
                this.stopTimer();
                return { solved: true };
            } else if (data.solution_path && data.solution_path.length > 0) {
                // Store the solution path for step-by-step playback
                this.solutionPath = data.solution_path;
                this.currentSolutionStep = 0;
                return { 
                    solved: false, 
                    showSolution: true,
                    solutionPath: data.solution_path 
                };
            }
            return { solved: false, showSolution: false };
        } catch (error) {
            console.error('Error checking solution:', error);
            return { solved: false, showSolution: false };
        }
    }

    getNextSolutionStep() {
        if (!this.solutionPath || this.currentSolutionStep >= this.solutionPath.length) {
            return null;
        }
        return this.solutionPath[this.currentSolutionStep++];
    }

    getPreviousSolutionStep() {
        if (!this.solutionPath || this.currentSolutionStep <= 1) {
            return null;
        }
        this.currentSolutionStep -= 2;
        return this.solutionPath[this.currentSolutionStep++];
    }

    applySolutionStep(step) {
        if (step) {
            this.grid[step.row][step.col].value = step.value;
            return true;
        }
        return false;
    }

    // History management methods
    undo() {
        if (this.undoStack.length === 0) return false;
        this.redoStack.push(JSON.parse(JSON.stringify(this.grid)));
        this.grid = JSON.parse(JSON.stringify(this.undoStack.pop()));
        return true;
    }

    redo() {
        if (this.redoStack.length === 0) return false;
        this.undoStack.push(JSON.parse(JSON.stringify(this.grid)));
        this.grid = JSON.parse(JSON.stringify(this.redoStack.pop()));
        return true;
    }

    saveState() {
        this.undoStack.push(JSON.parse(JSON.stringify(this.grid)));
    }

    // Timer management methods
    startTimer() {
        this.stopTimer();
        this.startTime = Date.now() - this.elapsedTime;
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    pauseTimer() {
        this.stopTimer();
    }

    resumeTimer() {
        if (this.startTime) {
            this.startTimer();
        }
    }

    getFormattedTime() {
        const seconds = Math.floor(this.elapsedTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Add a dedicated erase method
    erase() {
        if (!this.selectedCell) return false;
        const { row, col } = this.selectedCell;
        if (!this.isValidMove(row, col)) return false;

        this.saveState();
        this.grid[row][col].value = 0;
        this.grid[row][col].notes.clear();
        this.redoStack = [];
        return true;
    }
}