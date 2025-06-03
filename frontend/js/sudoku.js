class SudokuGame {
    constructor() {
        // Game state
        this.grid = Array(9).fill().map(() => 
            Array(9).fill().map(() => ({
                value: 0,
                isFixed: false,
                notes: new Set()
            }))
        );
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

        // Custom puzzle creation state
        this.isCreating = false;
        this.customPuzzle = null;
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
            this.grid = data.grid.map(row => 
                row.map(value => ({
                    value: value,
                    isFixed: value !== 0,
                    notes: new Set()
                }))
            );

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

        // Handle notes mode
        if (this.isNotesMode) {
            return this.toggleNote(row, col, value);
        }

        // Handle erasing - don't need to validate with server
        if (value === 0) {
            this.saveState();
            this.grid[row][col].value = 0;
            this.grid[row][col].notes.clear();
            this.redoStack = [];
            return true;
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
        const cell = this.grid[row][col];
        
        // Ensure notes is initialized as a Set
        if (!(cell.notes instanceof Set)) {
            cell.notes = new Set();
        }
        
        if (cell.notes.has(value)) {
            cell.notes.delete(value);
        } else {
            cell.notes.add(value);
        }
        this.redoStack = [];
        return true;
    }

    async getHint() {
        if (this.hintsRemaining <= 0) return null;

        // For custom puzzles or regular puzzles, use the same strategic approach
        const currentGrid = this.grid.map(row => row.map(cell => cell.value));
        const possibleMoves = [];

        // Find all possible moves and score them
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (currentGrid[row][col] === 0) {
                    const value = this.solution[row][col];
                    const moveInfo = this.analyzeMoveQuality(currentGrid, row, col, value);
                    if (moveInfo) {
                        possibleMoves.push(moveInfo);
                    }
                }
            }
        }

        if (possibleMoves.length === 0) return null;

        // Sort moves by their strategic value (easier techniques first)
        possibleMoves.sort((a, b) => a.score - b.score);

        // Take the best move as the hint
        const bestMove = possibleMoves[0];
        
        // Apply the hint
        this.saveState();
        this.grid[bestMove.row][bestMove.col] = {
            value: bestMove.value,
            isFixed: false,
            notes: new Set()
        };
        this.hintsRemaining--;

        return {
            row: bestMove.row,
            col: bestMove.col,
            value: bestMove.value,
            reason: bestMove.reason,
            strategy: bestMove.strategy,
            difficulty: bestMove.difficulty,
            highlightCells: bestMove.highlightCells,
            patternCells: bestMove.patternCells
        };
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
        const currentGrid = this.grid.map(row => row.map(cell => cell.value));
        
        // For custom puzzles, check against stored solution
        if (this.solution) {
            let isSolved = true;
            let hasEmptyCells = false;

            // Check if the grid is complete and correct
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (currentGrid[row][col] === 0) {
                        hasEmptyCells = true;
                    } else if (currentGrid[row][col] !== this.solution[row][col]) {
                        isSolved = false;
                    }
                }
            }
            
            if (isSolved && !hasEmptyCells) {
                this.stopTimer();
                return { solved: true };
            }
            
            // Generate solution path
            return { 
                solved: false, 
                showSolution: true,
                solutionPath: this.generateSolutionPath()
            };
        }

        // For regular puzzles, use the API
        try {
            const response = await fetch('http://localhost:8000/api/sudoku/check-solution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grid: currentGrid,
                    solution: this.solution,
                    difficulty: this.difficulty
                })
            });

            if (!response.ok) throw new Error('Failed to check solution');

            const data = await response.json();

            if (data.solved) {
                this.stopTimer();
                return { solved: true };
            } else {
                return { 
                    solved: false, 
                    showSolution: true,
                    solutionPath: data.solution_path 
                };
            }
        } catch (error) {
            console.error('Error checking solution:', error);
            return { solved: false, showSolution: false };
        }
    }

    generateSolutionPath() {
        const path = [];
        const currentGrid = this.grid.map(row => row.map(cell => cell.value));
        
        while (!this.isGridComplete(currentGrid)) {
            // Find all possible moves and score them
            const possibleMoves = [];
            
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (currentGrid[row][col] === 0) {
                        const value = this.solution[row][col];
                        const moveInfo = this.analyzeMoveQuality(currentGrid, row, col, value);
                        if (moveInfo) {
                            possibleMoves.push(moveInfo);
                        }
                    }
                }
            }

            // Sort moves by their strategic value (easier techniques first)
            possibleMoves.sort((a, b) => a.score - b.score);

            if (possibleMoves.length === 0) break;

            // Take the best move
            const bestMove = possibleMoves[0];
            path.push(bestMove);
            currentGrid[bestMove.row][bestMove.col] = bestMove.value;
        }

        return path;
    }

    analyzeMoveQuality(grid, row, col, value) {
        // Count how many instances of this number exist in related cells
        let numberCount = 0;
        let possiblePositions = 0;

        // Check row
        for (let c = 0; c < 9; c++) {
            if (grid[row][c] === value) numberCount++;
            if (grid[row][c] === 0) possiblePositions++;
        }

        // Check column
        for (let r = 0; r < 9; r++) {
            if (grid[r][col] === value) numberCount++;
            if (grid[r][col] === 0) possiblePositions++;
        }

        // Check box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (grid[boxRow + r][boxCol + c] === value) numberCount++;
                if (grid[boxRow + r][boxCol + c] === 0) possiblePositions++;
            }
        }

        // Check if this is the only possible position for this number
        const isOnlyPosition = this.isOnlyPossiblePosition(grid, row, col, value);

        // Check if this cell has only one possible value
        const hasOnePossibility = this.countPossibleValues(grid, row, col) === 1;

        // Calculate a score for this move (lower is better)
        let score = 10; // Base score
        let strategy = '';
        let reason = '';
        let difficulty = '';

        if (isOnlyPosition && hasOnePossibility) {
            score = 1;
            strategy = 'Forced Move';
            reason = `${value} is the only possible number for this cell, and this cell is the only possible position for ${value}`;
            difficulty = 'Basic';
        } else if (hasOnePossibility) {
            score = 2;
            strategy = 'Single Candidate';
            reason = `${value} is the only possible number for this cell`;
            difficulty = 'Basic';
        } else if (isOnlyPosition) {
            score = 3;
            strategy = 'Hidden Single';
            reason = `This is the only position where ${value} can go in this ${this.getRegionType(row, col, value)}`;
            difficulty = 'Basic';
        } else if (numberCount >= 6) { // If number appears frequently
            score = 4;
            strategy = 'Pattern Recognition';
            reason = `${value} appears frequently in related regions, limiting its possible positions`;
            difficulty = 'Intermediate';
        } else if (possiblePositions <= 3) { // Few possible positions
            score = 5;
            strategy = 'Limited Positions';
            reason = `Limited positions available for ${value} in this region`;
            difficulty = 'Intermediate';
        } else {
            strategy = 'Logical Deduction';
            reason = `Place ${value} based on remaining possibilities`;
            difficulty = 'Advanced';
        }

        return {
            row,
            col,
            value,
            score,
            strategy,
            reason,
            difficulty,
            highlightCells: [{ row, col }],
            patternCells: this.getRelatedCells(row, col)
        };
    }

    isOnlyPossiblePosition(grid, row, col, value) {
        // Check if this is the only position in row where value can go
        let rowPossible = 0;
        for (let c = 0; c < 9; c++) {
            if (grid[row][c] === 0 && this.isValidPlacement(grid, row, c, value)) {
                rowPossible++;
            }
        }
        if (rowPossible === 1) return true;

        // Check if this is the only position in column where value can go
        let colPossible = 0;
        for (let r = 0; r < 9; r++) {
            if (grid[r][col] === 0 && this.isValidPlacement(grid, r, col, value)) {
                colPossible++;
            }
        }
        if (colPossible === 1) return true;

        // Check if this is the only position in box where value can go
        let boxPossible = 0;
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (grid[boxRow + r][boxCol + c] === 0 && 
                    this.isValidPlacement(grid, boxRow + r, boxCol + c, value)) {
                    boxPossible++;
                }
            }
        }
        return boxPossible === 1;
    }

    countPossibleValues(grid, row, col) {
        let count = 0;
        for (let value = 1; value <= 9; value++) {
            if (this.isValidPlacement(grid, row, col, value)) {
                count++;
            }
        }
        return count;
    }

    isValidPlacement(grid, row, col, value) {
        // Check row
        for (let c = 0; c < 9; c++) {
            if (grid[row][c] === value) return false;
        }

        // Check column
        for (let r = 0; r < 9; r++) {
            if (grid[r][col] === value) return false;
        }

        // Check box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (grid[boxRow + r][boxCol + c] === value) return false;
            }
        }

        return true;
    }

    getRegionType(row, col, value) {
        // Determine which region (row, column, or box) has only one possible position for this value
        return 'region'; // Placeholder - implement actual logic
    }

    isGridComplete(grid) {
        return !grid.some(row => row.includes(0));
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
        
        const previousState = this.undoStack.pop();
        this.redoStack.push(this.serializeGrid());
        this.deserializeGrid(previousState);
        return true;
    }

    redo() {
        if (this.redoStack.length === 0) return false;
        
        const nextState = this.redoStack.pop();
        this.undoStack.push(this.serializeGrid());
        this.deserializeGrid(nextState);
        return true;
    }

    saveState() {
        this.undoStack.push(this.serializeGrid());
    }

    // Helper methods for state management
    serializeGrid() {
        return this.grid.map(row =>
            row.map(cell => ({
                value: cell.value,
                isFixed: cell.isFixed,
                notes: Array.from(cell.notes)
            }))
        );
    }

    deserializeGrid(state) {
        this.grid = state.map(row =>
            row.map(cell => ({
                value: cell.value,
                isFixed: cell.isFixed,
                notes: new Set(cell.notes)
            }))
        );
    }

    // Timer management methods
    startTimer() {
        if (this.isCreating) return; // Don't start timer in creation mode
        
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

    startPuzzleCreation() {
        this.isCreating = true;
        // Stop and reset timer
        this.stopTimer();
        this.elapsedTime = 0;
        this.timerInterval = null;
        
        // Initialize empty grid for creation
        this.grid = Array(9).fill().map(() => 
            Array(9).fill().map(() => ({
                value: 0,
                isFixed: false,
                notes: new Set()
            }))
        );
        this.solution = null;
        this.selectedCell = null;
    }

    setCreationCell(row, col, value) {
        if (!this.isCreating) return false;
        if (value < 0 || value > 9) return false;
        
        // Update the cell value
        this.grid[row][col] = {
            value: value,
            isFixed: false,
            notes: new Set()
        };
        
        return true;
    }

    findConflicts() {
        const conflicts = new Set();

        // Check rows
        for (let row = 0; row < 9; row++) {
            const seen = new Map();
            for (let col = 0; col < 9; col++) {
                const value = this.grid[row][col].value;
                if (value === 0) continue;
                
                if (seen.has(value)) {
                    conflicts.add(JSON.stringify({row, col}));
                    conflicts.add(JSON.stringify({row, col: seen.get(value)}));
                } else {
                    seen.set(value, col);
                }
            }
        }

        // Check columns
        for (let col = 0; col < 9; col++) {
            const seen = new Map();
            for (let row = 0; row < 9; row++) {
                const value = this.grid[row][col].value;
                if (value === 0) continue;
                
                if (seen.has(value)) {
                    conflicts.add(JSON.stringify({row, col}));
                    conflicts.add(JSON.stringify({row: seen.get(value), col}));
                } else {
                    seen.set(value, row);
                }
            }
        }

        // Check 3x3 boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const seen = new Map();
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        const row = boxRow * 3 + i;
                        const col = boxCol * 3 + j;
                        const value = this.grid[row][col].value;
                        if (value === 0) continue;
                        
                        if (seen.has(value)) {
                            conflicts.add(JSON.stringify({row, col}));
                            const [prevRow, prevCol] = seen.get(value);
                            conflicts.add(JSON.stringify({row: prevRow, col: prevCol}));
                        } else {
                            seen.set(value, [row, col]);
                        }
                    }
                }
            }
        }

        return Array.from(conflicts).map(c => JSON.parse(c));
    }

    validateCustomPuzzle() {
        // First check for conflicts
        if (this.findConflicts().length > 0) {
            return false;
        }

        // Convert grid to simple array for validation
        const puzzleArray = this.grid.map(row => row.map(cell => cell.value));
        
        // Check if puzzle has at least 17 clues (minimum for unique solution)
        const cluesCount = puzzleArray.flat().filter(val => val !== 0).length;
        if (cluesCount < 17) {
            return false;
        }

        // Check for unique solution
        const solutions = [];
        this.solveSudoku(puzzleArray, solutions, 2);
        return solutions.length === 1;
    }

    finalizeCustomPuzzle() {
        if (!this.isCreating) return false;

        // Store the initial puzzle state
        const initialPuzzle = this.grid.map(row => 
            row.map(cell => ({
                value: cell.value,
                isFixed: cell.value !== 0, // Mark non-empty cells as fixed
                notes: new Set()
            }))
        );

        // Find the solution
        const puzzleValues = this.grid.map(row => row.map(cell => cell.value));
        const solutions = [];
        this.solveSudoku(puzzleValues, solutions, 1);
        
        if (solutions.length === 1) {
            // Store the solution
            this.solution = solutions[0];
            
            // Set up the game grid with the initial puzzle
            this.grid = initialPuzzle;
            
            // Reset game state
            this.isCreating = false;
            this.customPuzzle = null;
            this.selectedCell = null;
            this.isNotesMode = false;
            this.hintsRemaining = 3;
            this.checkCount = 0;
            this.undoStack = [];
            this.redoStack = [];
            
            // Reset and start timer
            this.stopTimer();
            this.elapsedTime = 0;
            this.startTimer();
            
            return true;
        }
        
        return false;
    }

    solveSudoku(puzzle, solutions, limit) {
        if (solutions.length >= limit) return;
        
        const empty = this.findEmptyCell(puzzle);
        if (!empty) {
            solutions.push(JSON.parse(JSON.stringify(puzzle)));
            return;
        }

        const [row, col] = empty;
        for (let num = 1; num <= 9; num++) {
            if (this.isValidPlacement(puzzle, row, col, num)) {
                puzzle[row][col] = num;
                this.solveSudoku(puzzle, solutions, limit);
                puzzle[row][col] = 0;
            }
        }
    }

    findEmptyCell(puzzle) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (puzzle[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }

    isValidPlacement(puzzle, row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (x !== col && puzzle[row][x] === num) return false;
        }

        // Check column
        for (let x = 0; x < 9; x++) {
            if (x !== row && puzzle[x][col] === num) return false;
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const r = boxRow + i;
                const c = boxCol + j;
                if (r !== row && c !== col && puzzle[r][c] === num) return false;
            }
        }

        return true;
    }

    getRelatedCells(row, col) {
        const cells = [];
        
        // Add cells in the same row
        for (let c = 0; c < 9; c++) {
            if (c !== col) {
                cells.push({ row, col: c });
            }
        }
        
        // Add cells in the same column
        for (let r = 0; r < 9; r++) {
            if (r !== row) {
                cells.push({ row: r, col });
            }
        }
        
        // Add cells in the same 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const currentRow = boxRow + r;
                const currentCol = boxCol + c;
                if ((currentRow !== row || currentCol !== col) && 
                    !cells.some(cell => cell.row === currentRow && cell.col === currentCol)) {
                    cells.push({ row: currentRow, col: currentCol });
                }
            }
        }
        
        return cells;
    }
}