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

        // Solution tracking
        this.allSolutionSteps = [];  // Store all steps including hints and solution moves
        this.currentStepIndex = -1;

        // New hint management
        this.currentHints = [];
        this.currentHintIndex = 0;

        // Solution path management
        this.solutionPath = [];
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

        // If in notes mode, handle note toggling
        if (this.isNotesMode) {
            return this.toggleNote(row, col, value);
        }

        // For regular moves, validate the move first
        if (value !== 0) { // Skip validation for erasing (value = 0)
            // Check if the move violates Sudoku rules
            if (!this.isValidPlacement(this.grid, row, col, value)) {
                console.log('Invalid move: violates Sudoku rules');
                return false;
            }
        }

        // Save the current state for undo
                this.saveState();

        const oldValue = this.grid[row][col].value;
                this.grid[row][col].value = value;
        this.grid[row][col].notes.clear(); // Clear notes when placing a value

        // Add move to solution steps if it's correct
        if (value !== 0 && this.solution && value === this.solution[row][col]) {
            const step = {
                row,
                col,
                value,
                strategy: 'Player Move',
                technique: 'player_move',
                reason: 'Player placed this number manually',
                difficulty: 'Basic',
                relatedCells: this.getRelatedCells(row, col),
                timestamp: Date.now()
            };
            this.allSolutionSteps.push(step);
            this.currentStepIndex = this.allSolutionSteps.length - 1;
        }

                return true;
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
        
        // Add timestamp to the move
        bestMove.timestamp = Date.now();
        
        // Store the hint in solution steps
        this.allSolutionSteps.push(bestMove);
        this.currentStepIndex = this.allSolutionSteps.length - 1;
        
        // Apply the hint
        this.saveState();
        this.grid[bestMove.row][bestMove.col] = {
            value: bestMove.value,
            isFixed: false,
            notes: new Set()
        };
        this.hintsRemaining--;

        return bestMove;
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
        console.log('Checking solution...'); // Debug log
        const currentGrid = this.grid.map(row => row.map(cell => cell.value));
        
        if (this.solution) {
            console.log('Checking against stored solution'); // Debug log
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
            
            console.log('Check results - Solved:', isSolved, 'Empty cells:', hasEmptyCells); // Debug log
            
            if (isSolved && !hasEmptyCells) {
                this.stopTimer();
                return { solved: true };
            }
            
            // Generate remaining solution steps
            const remainingSteps = this.generateRemainingSteps();
            if (remainingSteps.length > 0) {
                // Add timestamp to each step
                remainingSteps.forEach(step => {
                    step.timestamp = Date.now();
                    this.allSolutionSteps.push(step);
                });
                this.currentStepIndex = this.allSolutionSteps.length - 1;
            }
            
            return { 
                solved: false, 
                showSolution: true,
                solutionPath: remainingSteps
            };
        }

        // For regular puzzles, check if all cells are filled and valid
        let isComplete = true;
        let isValid = true;

        // Check if all cells are filled
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (currentGrid[row][col] === 0) {
                    isComplete = false;
                    break;
                }
            }
            if (!isComplete) break;
        }

        if (!isComplete) {
            return { solved: false, showSolution: false };
        }

        // Check rows
        for (let row = 0; row < 9; row++) {
            const seen = new Set();
            for (let col = 0; col < 9; col++) {
                const value = currentGrid[row][col];
                if (seen.has(value)) {
                    isValid = false;
                    break;
                }
                seen.add(value);
            }
            if (!isValid) break;
        }

        // Check columns
        if (isValid) {
            for (let col = 0; col < 9; col++) {
                const seen = new Set();
                for (let row = 0; row < 9; row++) {
                    const value = currentGrid[row][col];
                    if (seen.has(value)) {
                        isValid = false;
                        break;
                    }
                    seen.add(value);
                }
                if (!isValid) break;
            }
        }

        // Check 3x3 boxes
        if (isValid) {
            for (let boxRow = 0; boxRow < 3; boxRow++) {
                for (let boxCol = 0; boxCol < 3; boxCol++) {
                    const seen = new Set();
                    for (let i = 0; i < 3; i++) {
                        for (let j = 0; j < 3; j++) {
                            const value = currentGrid[boxRow * 3 + i][boxCol * 3 + j];
                            if (seen.has(value)) {
                                isValid = false;
                                break;
                            }
                            seen.add(value);
                        }
                        if (!isValid) break;
                    }
                    if (!isValid) break;
                }
                if (!isValid) break;
            }
        }

        console.log('Puzzle check results - Complete:', isComplete, 'Valid:', isValid); // Debug log

        if (isValid && isComplete) {
                this.stopTimer();
                return { solved: true };
        }

            return { solved: false, showSolution: false };
    }

    generateRemainingSteps() {
        console.log('Generating remaining solution steps...'); // Debug log
        
        // Create a deep copy of the current grid
        const currentGrid = this.grid.map(row => row.map(cell => ({
            value: cell.value,
            isFixed: cell.isFixed
        })));

        const remainingSteps = [];
        const filledCells = new Set();

        // First pass: Find all naked singles and hidden singles
        let foundMove;
        do {
            foundMove = false;
            
            // Try each empty cell
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    // Skip if cell is already filled
                    if (currentGrid[row][col].value !== 0 || filledCells.has(`${row},${col}`)) {
                        continue;
                    }

                    const targetValue = this.solution[row][col];
                    const moveInfo = this.analyzeMoveQuality(currentGrid, row, col, targetValue);
                    
                    // Only proceed with basic techniques first
                    if (moveInfo && (moveInfo.technique === 'naked_single' || 
                                   moveInfo.technique.startsWith('hidden_single'))) {
                        remainingSteps.push(moveInfo);
                        currentGrid[row][col].value = targetValue;
                        filledCells.add(`${row},${col}`);
                        foundMove = true;
                        console.log(`Found ${moveInfo.strategy} at R${row + 1}C${col + 1} = ${targetValue}`);
                        break;
                    }
                }
                if (foundMove) break;
            }
        } while (foundMove);

        // Second pass: Find pointing pairs/triples and box/line reductions
        do {
            foundMove = false;
            
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (currentGrid[row][col].value !== 0 || filledCells.has(`${row},${col}`)) {
                        continue;
                    }

                    const targetValue = this.solution[row][col];
                    const moveInfo = this.analyzeMoveQuality(currentGrid, row, col, targetValue);
                    
                    // Look for intermediate techniques
                    if (moveInfo && (moveInfo.technique === 'pointing_combination' || 
                                   moveInfo.technique === 'box_line_reduction')) {
                        remainingSteps.push(moveInfo);
                        currentGrid[row][col].value = targetValue;
                        filledCells.add(`${row},${col}`);
                        foundMove = true;
                        console.log(`Found ${moveInfo.strategy} at R${row + 1}C${col + 1} = ${targetValue}`);
                        break;
                    }
                }
                if (foundMove) break;
            }
        } while (foundMove);

        // Final pass: Use logical deduction for remaining cells
        // Sort remaining cells by constraint (cells with fewer possibilities first)
        const remainingCells = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (currentGrid[row][col].value === 0 && !filledCells.has(`${row},${col}`)) {
                    remainingCells.push({ row, col });
                }
            }
        }

        // Sort by number of possibilities (most constrained first)
        remainingCells.sort((a, b) => {
            const possibilitiesA = this.getPossibleValues(currentGrid, a.row, a.col).size;
            const possibilitiesB = this.getPossibleValues(currentGrid, b.row, b.col).size;
            return possibilitiesA - possibilitiesB;
        });

        // Process remaining cells in order of constraint
        for (const cell of remainingCells) {
            const { row, col } = cell;
            const targetValue = this.solution[row][col];
            const moveInfo = this.analyzeMoveQuality(currentGrid, row, col, targetValue);
            
            if (moveInfo) {
                remainingSteps.push(moveInfo);
                currentGrid[row][col].value = targetValue;
                filledCells.add(`${row},${col}`);
                console.log(`Found ${moveInfo.strategy} at R${row + 1}C${col + 1} = ${targetValue}`);
            }
        }

        console.log(`Generated ${remainingSteps.length} remaining steps`);
        return remainingSteps;
    }

    getAllSolutionSteps() {
        // Get all recorded steps (player moves and hints)
        const recordedSteps = [...this.allSolutionSteps].sort((a, b) => a.timestamp - b.timestamp);
        
        // If we have all cells filled, return just the recorded steps
        if (this.isGridComplete(this.grid)) {
            return recordedSteps;
        }

        // Generate remaining steps using strategic approach
        const remainingSteps = this.generateRemainingSteps();
        
        // Add timestamps to remaining steps, starting after the last recorded step
        const lastTimestamp = recordedSteps.length > 0 
            ? recordedSteps[recordedSteps.length - 1].timestamp 
            : Date.now();
            
        remainingSteps.forEach((step, index) => {
            step.timestamp = lastTimestamp + (index + 1) * 1000; // Space them 1 second apart
        });

        // Combine recorded and remaining steps
        return [...recordedSteps, ...remainingSteps];
    }

    isGridComplete(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col].value === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    analyzeMoveQuality(grid, row, col, value) {
        // Initialize analysis result
        let score = 10;
        let strategy = '';
        let reason = '';
        let difficulty = '';
        let technique = '';
        let relatedCells = [];

        // Get all possible values for this cell
        const possibleValues = this.getPossibleValues(grid, row, col);
        
        // Check for naked single (only one possible value for this cell)
        if (possibleValues.size === 1) {
            score = 1;
            strategy = 'Naked Single';
            technique = 'naked_single';
            reason = `Only the number ${value} can be placed in this cell as all other numbers are eliminated`;
            difficulty = 'Basic';
            relatedCells = this.getConflictingCells(grid, row, col, value);
        }
        // Check for hidden single in row
        else if (this.isHiddenSingle(grid, row, col, value, 'row')) {
            score = 2;
            strategy = 'Hidden Single (Row)';
            technique = 'hidden_single_row';
            reason = `${value} can only go in this cell in row ${row + 1}`;
            difficulty = 'Basic';
            relatedCells = this.getRowCells(row, col);
        }
        // Check for hidden single in column
        else if (this.isHiddenSingle(grid, row, col, value, 'column')) {
            score = 2;
            strategy = 'Hidden Single (Column)';
            technique = 'hidden_single_column';
            reason = `${value} can only go in this cell in column ${col + 1}`;
            difficulty = 'Basic';
            relatedCells = this.getColumnCells(row, col);
        }
        // Check for hidden single in box
        else if (this.isHiddenSingle(grid, row, col, value, 'box')) {
            score = 2;
            strategy = 'Hidden Single (Box)';
            technique = 'hidden_single_box';
            reason = `${value} can only go in this cell in this 3x3 box`;
            difficulty = 'Basic';
            relatedCells = this.getBoxCells(row, col);
        }
        // Check for pointing pair/triple
        else if (this.isPointingCombination(grid, row, col, value)) {
            score = 3;
            strategy = 'Pointing Combination';
            technique = 'pointing_combination';
            reason = `${value} must be in this cell due to a pointing pair/triple configuration`;
            difficulty = 'Intermediate';
            relatedCells = this.getPointingCombinationCells(grid, row, col, value);
        }
        // Check for box/line reduction
        else if (this.isBoxLineReduction(grid, row, col, value)) {
            score = 4;
            strategy = 'Box/Line Reduction';
            technique = 'box_line_reduction';
            reason = `${value} must be in this cell due to box/line reduction pattern`;
            difficulty = 'Intermediate';
            relatedCells = this.getBoxLineCells(row, col);
        }
        // Default logical deduction
        else {
            strategy = 'Logical Deduction';
            technique = 'logical_deduction';
            reason = `Place ${value} based on remaining possibilities and elimination`;
            difficulty = 'Advanced';
            relatedCells = this.getRelatedCells(row, col);
        }

        return {
            row,
            col,
            value,
            score,
            strategy,
            technique,
            reason,
            difficulty,
            relatedCells,
            patternCells: relatedCells
        };
    }

    getPossibleValues(grid, row, col) {
        const possible = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        // Check row
        for (let c = 0; c < 9; c++) {
            if (c !== col && grid[row][c].value !== 0) {
                possible.delete(grid[row][c].value);
            }
        }

        // Check column
        for (let r = 0; r < 9; r++) {
            if (r !== row && grid[r][col].value !== 0) {
                possible.delete(grid[r][col].value);
            }
        }

        // Check box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const currentRow = boxRow + r;
                const currentCol = boxCol + c;
                if ((currentRow !== row || currentCol !== col) && 
                    grid[currentRow][currentCol].value !== 0) {
                    possible.delete(grid[currentRow][currentCol].value);
                }
            }
        }
        
        return possible;
    }

    isHiddenSingle(grid, row, col, value, type) {
        let count = 0;
        let possiblePositions = 0;
        
        if (type === 'row') {
            for (let c = 0; c < 9; c++) {
                if (c !== col && grid[row][c].value === 0) {
                    if (this.isValidPlacement(grid, row, c, value)) {
                count++;
            }
                    possiblePositions++;
                }
            }
        } else if (type === 'column') {
            for (let r = 0; r < 9; r++) {
                if (r !== row && grid[r][col].value === 0) {
                    if (this.isValidPlacement(grid, r, col, value)) {
                        count++;
                    }
                    possiblePositions++;
                }
            }
        } else if (type === 'box') {
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    const currentRow = boxRow + r;
                    const currentCol = boxCol + c;
                    if ((currentRow !== row || currentCol !== col) && 
                        grid[currentRow][currentCol].value === 0) {
                        if (this.isValidPlacement(grid, currentRow, currentCol, value)) {
                            count++;
                        }
                        possiblePositions++;
                    }
                }
            }
        }
        
        return count === 0 && possiblePositions > 0;
    }

    getConflictingCells(grid, row, col, value) {
        const cells = [];
        
        // Check row
        for (let c = 0; c < 9; c++) {
            if (c !== col && grid[row][c] === value) {
                cells.push({ row, col: c });
            }
        }

        // Check column
        for (let r = 0; r < 9; r++) {
            if (r !== row && grid[r][col] === value) {
                cells.push({ row: r, col });
            }
        }

        // Check box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const currentRow = boxRow + r;
                const currentCol = boxCol + c;
                if ((currentRow !== row || currentCol !== col) && grid[currentRow][currentCol] === value) {
                    cells.push({ row: currentRow, col: currentCol });
                }
            }
        }
        
        return cells;
    }

    getRowCells(row, excludeCol) {
        return Array.from({ length: 9 }, (_, col) => 
            col !== excludeCol ? { row, col } : null
        ).filter(cell => cell !== null);
    }

    getColumnCells(excludeRow, col) {
        return Array.from({ length: 9 }, (_, row) => 
            row !== excludeRow ? { row, col } : null
        ).filter(cell => cell !== null);
    }

    getBoxCells(excludeRow, excludeCol) {
        const cells = [];
        const boxRow = Math.floor(excludeRow / 3) * 3;
        const boxCol = Math.floor(excludeCol / 3) * 3;
        
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const row = boxRow + r;
                const col = boxCol + c;
                if (row !== excludeRow || col !== excludeCol) {
                    cells.push({ row, col });
                }
            }
        }
        
        return cells;
    }

    isPointingCombination(grid, row, col, value) {
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        let rowCount = 0;
        let colCount = 0;
        let boxCount = 0;

        // Count possible positions in the box
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const currentRow = boxRow + r;
                const currentCol = boxCol + c;
                if (grid[currentRow][currentCol].value === 0 &&
                    this.isValidPlacement(grid, currentRow, currentCol, value)) {
                    boxCount++;
                    if (currentRow === row) rowCount++;
                    if (currentCol === col) colCount++;
                }
            }
        }

        // Check if this forms a pointing pair/triple
        return (boxCount === 2 || boxCount === 3) && (rowCount === boxCount || colCount === boxCount);
    }

    isBoxLineReduction(grid, row, col, value) {
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        let inBoxCount = 0;
        let inLineCount = 0;

        // Count possible positions in the box
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const currentRow = boxRow + r;
                const currentCol = boxCol + c;
                if (grid[currentRow][currentCol].value === 0 &&
                    this.isValidPlacement(grid, currentRow, currentCol, value)) {
                    inBoxCount++;
                }
            }
        }

        // Count possible positions in the row/column outside the box
        for (let i = 0; i < 9; i++) {
            if (Math.floor(i / 3) !== Math.floor(row / 3)) { // Different box
                if (grid[i][col].value === 0 &&
                    this.isValidPlacement(grid, i, col, value)) {
                    inLineCount++;
                }
            }
            if (Math.floor(i / 3) !== Math.floor(col / 3)) { // Different box
                if (grid[row][i].value === 0 &&
                    this.isValidPlacement(grid, row, i, value)) {
                    inLineCount++;
                }
            }
        }

        return inBoxCount === 1 && inLineCount === 0;
    }

    getPointingCombinationCells(grid, row, col, value) {
        return this.getRelatedCells(row, col);
    }

    getBoxLineCells(row, col) {
        return this.getRelatedCells(row, col);
    }

    getNextSolutionStep() {
        console.log('Getting next solution step, current step:', this.currentSolutionStep); // Debug log
        if (!this.solutionPath || this.currentSolutionStep >= this.solutionPath.length) {
            console.log('No more steps available'); // Debug log
            return null;
        }
        const step = this.solutionPath[this.currentSolutionStep];
        this.currentSolutionStep++;
        console.log('Returning step:', step); // Debug log
        return step;
    }

    getPreviousSolutionStep() {
        console.log('Getting previous solution step, current step:', this.currentSolutionStep); // Debug log
        if (!this.solutionPath || this.currentSolutionStep <= 1) {
            console.log('No previous steps available'); // Debug log
            return null;
        }
        this.currentSolutionStep -= 2;
        const step = this.solutionPath[this.currentSolutionStep];
        this.currentSolutionStep++;
        console.log('Returning step:', step); // Debug log
        return step;
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
        this.allSolutionSteps = []; // Reset solution steps
    }

    setCreationCell(row, col, value) {
        if (!this.isCreating) return false;
        if (value < 0 || value > 9) return false;
        
        // Validate the move if it's not an erasure
        if (value !== 0 && !this.isValidPlacement(this.grid, row, col, value)) {
            console.log('Invalid placement in creation mode');
            return false;
        }
        
        // Update the cell value
        this.grid[row][col] = {
            value: value,
            isFixed: value !== 0, // Mark non-zero values as fixed
            notes: new Set()
        };
        
        return true;
    }

    validateCustomPuzzle() {
        // First check for conflicts
        if (this.findConflicts().length > 0) {
            return false;
        }

        // Convert grid to simple array for validation
        const puzzleArray = this.grid.map(row => 
            row.map(cell => ({
                value: cell.value,
                isFixed: cell.isFixed,
                notes: new Set()
            }))
        );
        
        // Check if puzzle has at least 17 clues (minimum for unique solution)
        const cluesCount = puzzleArray.flat().filter(cell => cell.value !== 0).length;
        if (cluesCount < 17) {
            return false;
        }

        // Check for unique solution
        const solutions = [];
        this.solveSudoku(puzzleArray, solutions, 2);
        return solutions.length === 1;
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
        const puzzleValues = this.grid.map(row => 
            row.map(cell => ({
                value: cell.value,
                isFixed: cell.isFixed,
                notes: new Set()
            }))
        );
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
            this.allSolutionSteps = [];
            
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
            // Create a deep copy of the solution
            const solution = puzzle.map(row => 
                row.map(cell => cell.value)
            );
            solutions.push(solution);
            return;
        }

        const [row, col] = empty;
        for (let num = 1; num <= 9; num++) {
            if (this.isValidPlacement(puzzle, row, col, num)) {
                puzzle[row][col].value = num;
                this.solveSudoku(puzzle, solutions, limit);
                puzzle[row][col].value = 0;
            }
        }
    }

    findEmptyCell(puzzle) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (puzzle[row][col].value === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }

    isValidPlacement(grid, row, col, value) {
        // Check row
        for (let c = 0; c < 9; c++) {
            if (c !== col && grid[row][c].value === value) {
                return false;
            }
        }

        // Check column
        for (let r = 0; r < 9; r++) {
            if (r !== row && grid[r][col].value === value) {
                return false;
            }
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const currentRow = boxRow + r;
                const currentCol = boxCol + c;
                if ((currentRow !== row || currentCol !== col) && 
                    grid[currentRow][currentCol].value === value) {
                    return false;
                }
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

    generatePDFSolutionSection() {
        // Get only the recorded steps (player moves and hints) sorted by timestamp
        const recordedSteps = [...this.allSolutionSteps].sort((a, b) => a.timestamp - b.timestamp);
        
        let solutionText = "Step by Step Solution\n\n";
        
        // Create a copy of initial grid state
        let currentGrid = this.grid.map(row => 
            row.map(cell => ({
                value: cell.value,
                isFixed: cell.isFixed,
                notes: new Set(cell.notes)
            }))
        );
        
        recordedSteps.forEach((step, index) => {
            // Format the move number and location
            const moveNumber = index + 1;
            const location = `R${step.row + 1}C${step.col + 1}`;
            
            // Apply the move to our current grid state
            currentGrid[step.row][step.col] = {
                value: step.value,
                isFixed: false,
                notes: new Set()
            };
            
            // Generate ASCII representation of the grid
            let gridVisual = "\n";
            gridVisual += "┌───────┬───────┬───────┐\n";
            for (let row = 0; row < 9; row++) {
                let line = "│ ";
                for (let col = 0; col < 9; col++) {
                    // Highlight the cell that was just changed
                    const isChangedCell = row === step.row && col === step.col;
                    const value = currentGrid[row][col].value || ' ';
                    line += isChangedCell ? `[${value}]` : ` ${value} `;
                    if (col === 2 || col === 5) line += "│ ";
                    if (col === 8) line += "│";
                }
                gridVisual += line + "\n";
                if (row === 2 || row === 5) {
                    gridVisual += "├───────┼───────┼───────┤\n";
                }
                if (row === 8) {
                    gridVisual += "└───────┴───────┴───────┘\n";
                }
            }
            
            // Format step information
            solutionText += `Step ${moveNumber}\n`;
            solutionText += `${step.strategy} at ${location}\n`;
            solutionText += `Move: Placed ${step.value} in ${location}\n\n`;
            
            // Add move type explanation based on the technique
            switch(step.technique) {
                case 'naked_single':
                    solutionText += "This cell has only one possible value because all other numbers (1-9) are already present in either:\n";
                    solutionText += "- The same row\n";
                    solutionText += "- The same column\n";
                    solutionText += "- The same 3x3 box\n";
                    break;
                    
                case 'hidden_single_row':
                    solutionText += `In row ${step.row + 1}, ${step.value} can only be placed in this cell because:\n`;
                    solutionText += "- All other cells in the row either:\n";
                    solutionText += "  * Already contain a number\n";
                    solutionText += "  * Cannot contain this number due to column/box constraints\n";
                    break;
                    
                case 'hidden_single_column':
                    solutionText += `In column ${step.col + 1}, ${step.value} can only be placed in this cell because:\n`;
                    solutionText += "- All other cells in the column either:\n";
                    solutionText += "  * Already contain a number\n";
                    solutionText += "  * Cannot contain this number due to row/box constraints\n";
                    break;
                    
                case 'hidden_single_box':
                    solutionText += `In this 3x3 box, ${step.value} can only be placed in this cell because:\n`;
                    solutionText += "- All other cells in the box either:\n";
                    solutionText += "  * Already contain a number\n";
                    solutionText += "  * Cannot contain this number due to row/column constraints\n";
                    break;
                    
                case 'pointing_combination':
                    solutionText += "This move uses a pointing pair/triple pattern:\n";
                    solutionText += "- A number can only appear in 2-3 cells in a box\n";
                    solutionText += "- These cells all lie in the same row or column\n";
                    solutionText += "- This eliminates the number from other cells in that row/column\n";
                    break;
                    
                case 'box_line_reduction':
                    solutionText += "This move uses box/line reduction:\n";
                    solutionText += "- A number in a row/column is restricted to one box\n";
                    solutionText += "- This eliminates that number from other cells in the box\n";
                    break;
                    
                case 'player_move':
                    if (step.reason === "Player placed this number manually") {
                        const moveQuality = this.analyzeMoveQuality(
                            currentGrid.map(row => row.map(cell => cell.value)),
                            step.row,
                            step.col,
                            step.value
                        );
                        if (moveQuality.score <= step.score) {
                            solutionText += "This was a good move because:\n";
                            solutionText += `- ${moveQuality.reason}\n`;
                        } else {
                            solutionText += "While this move is valid, there were better options available:\n";
                            solutionText += `- ${moveQuality.strategy} was possible\n`;
                            solutionText += `- ${moveQuality.reason}\n`;
                        }
                    }
                    break;
                    
                default:
                    solutionText += `${step.reason}\n`;
            }
            
            // Add visual representation
            solutionText += "\nGrid after this move:\n";
            solutionText += gridVisual;
            solutionText += "\n";
            
            // Add difficulty level
            solutionText += `Difficulty: ${step.difficulty}\n`;
            solutionText += "─".repeat(50) + "\n\n";
        });
        
        return solutionText;
    }
}