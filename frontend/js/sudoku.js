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

        // API URL - will be updated based on environment
        this.apiUrl = 'https://sudoku-master-web-backend.onrender.com';

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

        // New state for finalizeCustomPuzzle
        this.isPlaying = false;
    }

    async newGame(difficulty = 'medium') {
        try {
            const response = await fetch(`${this.apiUrl}/api/sudoku/new`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'omit',
                body: JSON.stringify({ difficulty })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Server error: ${errorData}`);
            }

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

    isComplete() {
        // Check if all cells are filled
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col].value === 0) {
                    return false; // Found an empty cell
                }
            }
        }
        
        // Check if the current grid matches the solution
        if (this.solution) {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (this.grid[row][col].value !== this.solution[row][col]) {
                        return false; // Found a cell that doesn't match the solution
                    }
                }
            }
            return true; // All cells match the solution
        }
        
        // If no solution is available, just check if the grid is valid
        return this.isValidGrid(this.grid);
    }
    
    isValidGrid(grid) {
        // Check rows
        for (let row = 0; row < 9; row++) {
            const seen = new Set();
            for (let col = 0; col < 9; col++) {
                const value = grid[row][col].value || grid[row][col];
                if (value === 0) continue;
                if (seen.has(value)) return false;
                seen.add(value);
            }
        }
        
        // Check columns
        for (let col = 0; col < 9; col++) {
            const seen = new Set();
            for (let row = 0; row < 9; row++) {
                const value = grid[row][col].value || grid[row][col];
                if (value === 0) continue;
                if (seen.has(value)) return false;
                seen.add(value);
            }
        }
        
        // Check 3x3 boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const seen = new Set();
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const actualRow = boxRow * 3 + row;
                        const actualCol = boxCol * 3 + col;
                        const value = grid[actualRow][actualCol].value || grid[actualRow][actualCol];
                        if (value === 0) continue;
                        if (seen.has(value)) return false;
                        seen.add(value);
                    }
                }
            }
        }
        
        return true;
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

        // Get current grid state
        const currentGrid = this.grid.map(row => row.map(cell => cell.value));
        const possibleMoves = [];

        // Find all possible moves for each empty cell
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (currentGrid[row][col] === 0) {
                    // Get all possible values for this cell
                    const possibilities = this.getCellPossibilities(currentGrid, row, col);
                    
                    // Analyze each possible value
                    for (const value of possibilities) {
                    const moveInfo = this.analyzeMoveQuality(currentGrid, row, col, value);
                    if (moveInfo) {
                        possibleMoves.push(moveInfo);
                        }
                    }
                }
            }
        }

        if (possibleMoves.length === 0) return null;

        // Sort moves by their strategic value (easier techniques first)
        possibleMoves.sort((a, b) => {
            // First compare by technique complexity
            if (a.score !== b.score) {
                return a.score - b.score;
            }
            
            // If same technique, prefer moves that affect more cells
            const aImpact = this.calculateMoveImpact(currentGrid, a);
            const bImpact = this.calculateMoveImpact(currentGrid, b);
            return bImpact - aImpact;
        });

        // Take the best strategic move as the hint
        const bestMove = possibleMoves[0];
        
        // Verify if this move leads to a valid solution
        if (!this.verifyMove(currentGrid, bestMove)) {
            // If not, find the next best move that leads to a solution
            for (let i = 1; i < possibleMoves.length; i++) {
                if (this.verifyMove(currentGrid, possibleMoves[i])) {
                    bestMove = possibleMoves[i];
                    break;
                }
            }
        }
        
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

    isHiddenSingle(grid, row, col, value, type) {
        let count = 0;
        
        if (type === 'row') {
            // Check row
            for (let c = 0; c < 9; c++) {
                if (c !== col && grid[row][c] === 0 && 
                    this.isValidPlacement(grid, row, c, value)) {
                    count++;
                }
            }
        } else if (type === 'column') {
            // Check column
            for (let r = 0; r < 9; r++) {
                if (r !== row && grid[r][col] === 0 && 
                    this.isValidPlacement(grid, r, col, value)) {
                    count++;
                }
            }
        } else if (type === 'box') {
            // Check box
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    const currentRow = boxRow + r;
                    const currentCol = boxCol + c;
                    if ((currentRow !== row || currentCol !== col) && 
                        grid[currentRow][currentCol] === 0 && 
                        this.isValidPlacement(grid, currentRow, currentCol, value)) {
                        count++;
                    }
                }
            }
        }
        
        return count === 0;
    }

    isPointingCombination(grid, row, col, value) {
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        let rowCount = 0;
        let colCount = 0;
        let boxCount = 0;
        
        // Count possible positions in the box
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (grid[r][c] === 0 && this.isValidPlacement(grid, r, c, value)) {
                    boxCount++;
                    if (r === row) rowCount++;
                    if (c === col) colCount++;
                }
            }
        }
        
        // Check if this forms a pointing pair/triple
        return (boxCount === 2 || boxCount === 3) && (rowCount === boxCount || colCount === boxCount);
    }

    analyzeMoveQuality(grid, row, col, value) {
        // Basic validation
        if (!this.isValidPlacement(grid, row, col, value)) {
            return null;
        }

        const moveInfo = {
            row,
            col,
            value,
            score: 0,
            technique: 'logical_deduction',
            reason: '',
            timestamp: Date.now()
        };

        // Check for naked single
        const possibilities = this.getCellPossibilities(grid, row, col);
        if (possibilities.size === 1) {
            moveInfo.technique = 'naked_single';
            moveInfo.score = 1;
            moveInfo.reason = 'Only one possible value for this cell';
            return moveInfo;
        }

        // Check for hidden single in row
        if (this.isHiddenSingle(grid, row, col, value, 'row')) {
            moveInfo.technique = 'hidden_single_row';
            moveInfo.score = 2;
            moveInfo.reason = `Only possible position for ${value} in this row`;
            return moveInfo;
        }

        // Check for hidden single in column
        if (this.isHiddenSingle(grid, row, col, value, 'column')) {
            moveInfo.technique = 'hidden_single_column';
            moveInfo.score = 2;
            moveInfo.reason = `Only possible position for ${value} in this column`;
            return moveInfo;
        }

        // Check for hidden single in box
        if (this.isHiddenSingle(grid, row, col, value, 'box')) {
            moveInfo.technique = 'hidden_single_box';
            moveInfo.score = 2;
            moveInfo.reason = `Only possible position for ${value} in this box`;
            return moveInfo;
        }

        // Check for pointing combination
        if (this.isPointingCombination(grid, row, col, value)) {
            moveInfo.technique = 'pointing_combination';
            moveInfo.score = 3;
            moveInfo.reason = `Forms a pointing combination in box ${Math.floor(row / 3) * 3 + Math.floor(col / 3) + 1}`;
            return moveInfo;
        }

        // Check for box/line reduction
        if (this.isBoxLineReduction(grid, row, col, value)) {
            moveInfo.technique = 'box_line_reduction';
            moveInfo.score = 4;
            moveInfo.reason = `Forms a box/line reduction pattern`;
            return moveInfo;
        }

        // Default logical deduction
        moveInfo.score = 5;
        moveInfo.reason = 'Logical deduction based on puzzle state';
        return moveInfo;
    }

    calculateMoveImpact(grid, move) {
        let impact = 0;
        const tempGrid = grid.map(row => [...row]);
        tempGrid[move.row][move.col] = move.value;

        // Count affected cells (cells that have their possibilities reduced)
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (tempGrid[r][c] === 0) {
                    const beforePoss = this.getCellPossibilities(grid, r, c).size;
                    const afterPoss = this.getCellPossibilities(tempGrid, r, c).size;
                    if (afterPoss < beforePoss) {
                        impact += (beforePoss - afterPoss);
                    }
                }
            }
        }

        return impact;
    }

    verifyMove(grid, move) {
        // Create a copy of the grid with the move applied
        const tempGrid = grid.map(row => [...row]);
        tempGrid[move.row][move.col] = move.value;

        // Try to solve the puzzle with this move
        return this.isSolvable(tempGrid);
    }

    isSolvable(grid) {
        // Find empty cell
        let row = -1;
        let col = -1;
        let isEmpty = false;
        
        for (let i = 0; i < 9 && !isEmpty; i++) {
            for (let j = 0; j < 9 && !isEmpty; j++) {
                if (grid[i][j] === 0) {
                    row = i;
                    col = j;
                    isEmpty = true;
                }
            }
        }

        // If no empty cell found, puzzle is solved
        if (!isEmpty) {
            return true;
        }

        // Try each possible value
        for (let num = 1; num <= 9; num++) {
            if (this.isValidPlacement(grid, row, col, num)) {
                grid[row][col] = num;
                if (this.isSolvable(grid)) {
                    return true;
                }
                grid[row][col] = 0;
            }
        }

        return false;
    }

    isBoxLineReduction(grid, row, col, value) {
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        let inBoxCount = 0;
        let inLineCount = 0;

        // Count possible positions in the box
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (grid[r][c] === 0 && this.isValidPlacement(grid, r, c, value)) {
                    inBoxCount++;
                }
            }
        }

        // Count possible positions in the row/column outside the box
        for (let i = 0; i < 9; i++) {
            // Check row outside box
            if (Math.floor(i / 3) !== Math.floor(col / 3) && 
                grid[row][i] === 0 && 
                this.isValidPlacement(grid, row, i, value)) {
                inLineCount++;
            }
            // Check column outside box
            if (Math.floor(i / 3) !== Math.floor(row / 3) && 
                grid[i][col] === 0 && 
                this.isValidPlacement(grid, i, col, value)) {
                inLineCount++;
            }
        }

        return inBoxCount === 1 && inLineCount === 0;
    }

    getCellPossibilities(grid, row, col) {
        const possibilities = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        // Check row
        for (let c = 0; c < 9; c++) {
            possibilities.delete(grid[row][c]);
        }
        
        // Check column
        for (let r = 0; r < 9; r++) {
            possibilities.delete(grid[r][col]);
        }
        
        // Check box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                possibilities.delete(grid[boxRow + r][boxCol + c]);
            }
        }
        
        return possibilities;
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
        
        // Check box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if ((boxRow + r !== row || boxCol + c !== col) && 
                    grid[boxRow + r][boxCol + c].value === value) {
                    return false;
                }
            }
        }
        
        return true;
    }

    findCandidateLines(grid) {
        const moves = [];
        
        // Check each box for candidate lines
        for (let boxRow = 0; boxRow < 9; boxRow += 3) {
            for (let boxCol = 0; boxCol < 9; boxCol += 3) {
                // For each value 1-9
                for (let value = 1; value <= 9; value++) {
                    const positions = [];
                    
                    // Find all possible positions for value in this box
                    for (let r = 0; r < 3; r++) {
                        for (let c = 0; c < 3; c++) {
                            const row = boxRow + r;
                            const col = boxCol + c;
                            if (grid[row][col] === 0 && 
                                this.getCellPossibilities(grid, row, col).has(value)) {
                                positions.push({row, col});
                            }
                        }
                    }
                    
                    // Check if all positions align in a row or column
                    if (positions.length >= 2) {
                        const sameRow = positions.every(p => p.row === positions[0].row);
                        const sameCol = positions.every(p => p.col === positions[0].col);
                        
                        if (sameRow || sameCol) {
                            positions.forEach(pos => {
                                moves.push({
                                    row: pos.row,
                                    col: pos.col,
                                    value: value
                                });
                            });
                        }
                    }
                }
            }
        }
        
        return moves;
    }

    findBoxLineReductions(grid) {
        const moves = [];
        
        // Check each row and column
        for (let i = 0; i < 9; i++) {
            // Check rows
            for (let value = 1; value <= 9; value++) {
                const positions = [];
                for (let j = 0; j < 9; j++) {
                    if (grid[i][j] === 0 && 
                        this.getCellPossibilities(grid, i, j).has(value)) {
                        positions.push({row: i, col: j});
                    }
                }
                
                // If all positions are in the same box
                if (positions.length >= 2) {
                    const boxIndex = Math.floor(positions[0].col / 3);
                    if (positions.every(p => Math.floor(p.col / 3) === boxIndex)) {
                        positions.forEach(pos => {
                            moves.push({
                                row: pos.row,
                                col: pos.col,
                                value: value
                            });
                        });
                    }
                }
            }
            
            // Check columns
            for (let value = 1; value <= 9; value++) {
                const positions = [];
                for (let j = 0; j < 9; j++) {
                    if (grid[j][i] === 0 && 
                        this.getCellPossibilities(grid, j, i).has(value)) {
                        positions.push({row: j, col: i});
                    }
                }
                
                // If all positions are in the same box
                if (positions.length >= 2) {
                    const boxIndex = Math.floor(positions[0].row / 3);
                    if (positions.every(p => Math.floor(p.row / 3) === boxIndex)) {
                        positions.forEach(pos => {
                            moves.push({
                                row: pos.row,
                                col: pos.col,
                                value: value
                            });
                        });
                    }
                }
            }
        }
        
        return moves;
    }

    analyzeMove(grid, row, col, value) {
        const analysis = {
            row,
            col,
            value,
            timestamp: Date.now(),
            technique: this.determineTechnique(grid, row, col, value),
            impactScore: 0,
            affectedCells: [],
            eliminatedPossibilities: 0,
            newConstraints: 0
        };

        // Get all related cells (same row, column, and box)
        analysis.affectedCells = this.getRelatedCells(row, col);
        
        // Calculate impact on related cells
        let impactScore = 0;
        let eliminatedPossibilities = 0;
        let newConstraints = 0;

        analysis.affectedCells.forEach(cellRef => {
            const [r, c] = this.parseCellReference(cellRef);
            if (grid[r][c] === 0) {
                eliminatedPossibilities++;
                const possibilities = this.getCellPossibilities(grid, r, c);
                if (possibilities.size === 2) {
                    newConstraints++;
                }
                impactScore += (1 / possibilities.size); // Higher score for more constrained cells
            }
        });

        // Normalize impact score to 0-1 range
        analysis.impactScore = Math.min(1, impactScore / 20);
        analysis.eliminatedPossibilities = eliminatedPossibilities;
        analysis.newConstraints = newConstraints;

        // Generate detailed explanation
        analysis.reason = this.generateMoveExplanation(analysis);

        return analysis;
    }

    determineTechnique(grid, row, col, value) {
        // Check for naked single
        const possibilities = this.getCellPossibilities(grid, row, col);
        if (possibilities.size === 1) {
            return 'naked_single';
        }

        // Check for hidden single in row
        if (this.isHiddenSingle(grid, row, col, value, 'row')) {
            return 'hidden_single_row';
        }

        // Check for hidden single in column
        if (this.isHiddenSingle(grid, row, col, value, 'column')) {
            return 'hidden_single_column';
        }

        // Check for pointing combination
        if (this.isPointingCombination(grid, row, col, value)) {
            return 'pointing_combination';
        }

        return 'logical_deduction';
    }

    generateMoveExplanation(analysis) {
        const techniques = {
            'naked_single': `This cell can only contain ${analysis.value} as all other numbers are eliminated by existing constraints in the row, column, and box.`,
            'hidden_single_row': `${analysis.value} can only be placed in this cell within row ${analysis.row + 1} as all other positions are blocked.`,
            'hidden_single_column': `${analysis.value} can only be placed in this cell within column ${analysis.col + 1} as all other positions are blocked.`,
            'pointing_combination': `${analysis.value} forms a pointing combination in this box, eliminating possibilities in connected cells.`,
            'logical_deduction': `Through logical deduction, ${analysis.value} must be placed here based on the current puzzle state.`
        };

        let explanation = techniques[analysis.technique] || techniques.logical_deduction;
        
        // Add impact analysis
        explanation += ` This move affects ${analysis.affectedCells.length} cells`;
        if (analysis.newConstraints > 0) {
            explanation += `, creating ${analysis.newConstraints} new constraints`;
        }
        explanation += `. Impact score: ${(analysis.impactScore * 100).toFixed(1)}%`;

        return explanation;
    }

    getRelatedCells(row, col) {
        const related = new Set();
        
        // Add cells in same row
        for (let c = 0; c < 9; c++) {
            if (c !== col) {
                related.add(`R${row + 1}C${c + 1}`);
            }
        }
        
        // Add cells in same column
        for (let r = 0; r < 9; r++) {
            if (r !== row) {
                related.add(`R${r + 1}C${col + 1}`);
            }
        }
        
        // Add cells in same box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (r !== row || c !== col) {
                    related.add(`R${r + 1}C${c + 1}`);
                }
            }
        }
        
        return Array.from(related);
    }

    parseCellReference(ref) {
        const [row, col] = ref.match(/\d+/g).map(n => parseInt(n) - 1);
        return [row, col];
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
        
        // For user-created puzzles, ensure we have a solution
        if (!this.solution && this.isCreationComplete()) {
            const solvedGrid = this.solvePuzzle([...currentGrid.map(row => [...row])]);
            if (solvedGrid) {
                this.solution = solvedGrid;
                console.log('Generated solution for user-created puzzle');
            } else {
                console.log('Warning: No valid solution found for user-created puzzle');
                return {
                    solved: false,
                    showSolution: false,
                    error: 'This puzzle has no valid solution'
                };
            }
        }

        // Now we can check against the solution (if available)
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

        // If we reach here, we're dealing with a puzzle without a solution
        // (either user-created but not complete enough, or invalid)
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
            return { 
                solved: false, 
                showSolution: false,
                error: 'Puzzle is not complete'
            };
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
            // If we get here with a valid and complete puzzle but no solution,
            // use the current state as the solution
            if (!this.solution) {
                this.solution = currentGrid;
            }
            return { solved: true };
        }

        return { 
            solved: false, 
            showSolution: false,
            error: 'Puzzle solution is invalid'
        };
    }

    generateRemainingSteps() {
        console.log('Generating remaining solution steps...');
        
        // Ensure we have a solution
        if (!this.solution) {
            console.log('No solution available, attempting to generate one...');
            const currentGrid = this.grid.map(row => row.map(cell => cell.value));
            const solvedGrid = this.solvePuzzle([...currentGrid.map(row => [...row])]);
            if (solvedGrid) {
                this.solution = solvedGrid;
                console.log('Generated solution successfully');
            } else {
                console.log('Failed to generate solution');
                return [];
            }
        }

        const steps = [];
        const currentGrid = this.grid.map(row => row.map(cell => cell.value));
        const workingGrid = [...currentGrid.map(row => [...row])];

        // Keep track of cells we've filled
        const filledCells = new Set();
        const emptyCells = [];

        // First, identify all empty cells that need to be filled
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (currentGrid[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }

        console.log(`Found ${emptyCells.length} empty cells to fill`);

        while (emptyCells.length > 0) {
            let bestMove = null;
            let bestMoveScore = Infinity;

            // Try each empty cell
            for (let i = 0; i < emptyCells.length; i++) {
                const { row, col } = emptyCells[i];
                const targetValue = this.solution[row][col];
                const possibilities = this.getCellPossibilities(workingGrid, row, col);

                // Skip if we can't place the target value
                if (!possibilities.has(targetValue)) {
                    continue;
                }

                let moveScore = possibilities.size; // Base score on number of possibilities
                let technique = '';
                let reason = '';

                // Check for naked single
                if (possibilities.size === 1) {
                    moveScore = 1;
                    technique = 'Naked Single';
                    reason = `Only one possible value (${targetValue}) for this cell`;
                }
                // Check for hidden single in row
                else if (this.isHiddenSingle(workingGrid, row, col, targetValue, 'row')) {
                    moveScore = 2;
                    technique = 'Hidden Single (Row)';
                    reason = `${targetValue} can only go in this cell in row ${row + 1}`;
                }
                // Check for hidden single in column
                else if (this.isHiddenSingle(workingGrid, row, col, targetValue, 'column')) {
                    moveScore = 2;
                    technique = 'Hidden Single (Column)';
                    reason = `${targetValue} can only go in this cell in column ${col + 1}`;
                }
                // Check for hidden single in box
                else if (this.isHiddenSingle(workingGrid, row, col, targetValue, 'box')) {
                    moveScore = 2;
                    technique = 'Hidden Single (Box)';
                    reason = `${targetValue} can only go in this cell in this 3x3 box`;
                }
                // Fallback to logical deduction
                else {
                    moveScore = 3 + possibilities.size;
                    technique = 'Logical Deduction';
                    reason = `${targetValue} is the correct value based on the solution`;
                }

                if (moveScore < bestMoveScore) {
                    bestMove = {
                        row,
                        col,
                        value: targetValue,
                        technique,
                        difficulty: moveScore <= 2 ? 'Basic' : 'Intermediate',
                        reason,
                        score: moveScore
                    };
                    bestMoveScore = moveScore;
                }
            }

            if (!bestMove) {
                console.log('No valid moves found, breaking');
                break;
            }

            // Add the move to steps
            steps.push(bestMove);
            console.log('Added move:', bestMove);

            // Apply the move to the working grid
            workingGrid[bestMove.row][bestMove.col] = bestMove.value;

            // Remove the cell from emptyCells
            const index = emptyCells.findIndex(cell => 
                cell.row === bestMove.row && cell.col === bestMove.col
            );
            if (index !== -1) {
                emptyCells.splice(index, 1);
            }
        }

        console.log(`Generated ${steps.length} solution steps`);
        return steps;
    }

    isHiddenSingle(grid, row, col, value, type) {
        switch (type) {
            case 'row':
                for (let c = 0; c < 9; c++) {
                    if (c !== col && grid[row][c] === 0) {
                        const possibilities = this.getCellPossibilities(grid, row, c);
                        if (possibilities.has(value)) {
                            return false;
                        }
                    }
                }
                return true;

            case 'column':
                for (let r = 0; r < 9; r++) {
                    if (r !== row && grid[r][col] === 0) {
                        const possibilities = this.getCellPossibilities(grid, r, col);
                        if (possibilities.has(value)) {
                            return false;
                        }
                    }
                }
                return true;

            case 'box':
                const boxRow = Math.floor(row / 3) * 3;
                const boxCol = Math.floor(col / 3) * 3;
                for (let r = 0; r < 3; r++) {
                    for (let c = 0; c < 3; c++) {
                        const currentRow = boxRow + r;
                        const currentCol = boxCol + c;
                        if ((currentRow !== row || currentCol !== col) && grid[currentRow][currentCol] === 0) {
                            const possibilities = this.getCellPossibilities(grid, currentRow, currentCol);
                            if (possibilities.has(value)) {
                                return false;
                            }
                        }
                    }
                }
                return true;

            default:
                return false;
        }
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

    getNextSolutionStep() {
        // Get current grid state
        const currentGrid = this.grid.map(row => row.map(cell => cell.value));
        const possibleMoves = [];

        // Find all possible moves for each empty cell
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (currentGrid[row][col] === 0) {
                    // Get all possible values for this cell
                    const possibilities = this.getCellPossibilities(currentGrid, row, col);
                    
                    // Analyze each possible value
                    for (const value of possibilities) {
                        const moveInfo = this.analyzeMoveQuality(currentGrid, row, col, value);
                        if (moveInfo) {
                            possibleMoves.push(moveInfo);
                        }
                    }
                }
            }
        }

        if (possibleMoves.length === 0) return null;

        // Sort moves by their strategic value (easier techniques first)
        possibleMoves.sort((a, b) => {
            // First compare by technique complexity
            if (a.score !== b.score) {
                return a.score - b.score;
            }
            
            // If same technique, prefer moves that affect more cells
            const aImpact = this.calculateMoveImpact(currentGrid, a);
            const bImpact = this.calculateMoveImpact(currentGrid, b);
            return bImpact - aImpact;
        });

        // Take the best strategic move
        let bestMove = possibleMoves[0];
        
        // Verify if this move leads to a valid solution
        if (!this.verifyMove(currentGrid, bestMove)) {
            // If not, find the next best move that leads to a solution
            for (let i = 1; i < possibleMoves.length; i++) {
                if (this.verifyMove(currentGrid, possibleMoves[i])) {
                    bestMove = possibleMoves[i];
                    break;
                }
            }
        }
        
        // Add timestamp to the move
        bestMove.timestamp = Date.now();
        
        // Store the move in solution steps
        this.allSolutionSteps.push(bestMove);
        this.currentStepIndex = this.allSolutionSteps.length - 1;
        
        // Apply the move
        this.saveState();
        this.grid[bestMove.row][bestMove.col] = {
            value: bestMove.value,
            isFixed: false,
            notes: new Set()
        };

        return bestMove;
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
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.startTime = Date.now() - (this.elapsedTime || 0);
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

    getFormattedTime() {
        const seconds = Math.floor((this.elapsedTime || 0) / 1000);
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
        
        // Update the cell value and mark it as fixed
        this.grid[row][col] = {
            value: value,
            isFixed: value !== 0, // Mark non-zero values as fixed
            notes: new Set()
        };

        // After each cell is set, try to solve the puzzle to ensure it's valid
        // and update the solution state
        if (this.isCreationComplete()) {
            const currentGrid = this.grid.map(row => row.map(cell => cell.value));
            const solvedGrid = this.solvePuzzle(currentGrid);
            if (solvedGrid) {
                this.solution = solvedGrid;
                console.log('Solution found for user-created puzzle');
            } else {
                console.log('Warning: No solution found for current configuration');
            }
        }

        return true;
    }

    isCreationComplete() {
        // Check if we have enough fixed numbers to potentially have a unique solution
        let fixedCount = 0;
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col].isFixed) {
                    fixedCount++;
                }
            }
        }
        // Typically, 17 is the minimum number of clues needed for a unique solution
        return fixedCount >= 17;
    }

    solvePuzzle(grid) {
        // Create a copy of the grid to avoid modifying the original
        const workingGrid = grid.map(row => [...row]);
        
        const emptyCell = this.findEmptyCell(workingGrid);
        if (!emptyCell) {
            return workingGrid; // Puzzle is solved
        }

        const [row, col] = emptyCell;
        const possibilities = this.getCellPossibilities(workingGrid, row, col);

        for (const value of possibilities) {
            if (this.isValidPlacement(workingGrid, row, col, value)) {
                workingGrid[row][col] = value;
                
                const result = this.solvePuzzle(workingGrid);
                if (result) {
                    return result;
                }
                
                workingGrid[row][col] = 0; // Backtrack
            }
        }

        return null; // No solution found
    }

    findEmptyCell(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }

    validateCustomPuzzle() {
        // First check for conflicts
        const conflicts = this.findConflicts();
        if (conflicts.length > 0) {
            return {
                isValid: false,
                message: 'Invalid puzzle! There are conflicts in the grid.'
            };
        }

        // Convert grid to simple array for validation
        const puzzleArray = this.grid.map(row => 
            row.map(cell => ({
                value: cell.value,
                isFixed: cell.isFixed,
                notes: new Set()
            }))
        );
        
        // Count clues for information only
        const cluesCount = puzzleArray.flat().filter(cell => cell.value !== 0).length;
        console.log('Number of clues:', cluesCount);

        // Check for unique solution
        const solutions = [];
        this.solveSudoku(puzzleArray, solutions, 2);
        
        if (solutions.length === 0) {
            return {
                isValid: false,
                message: 'Invalid puzzle! The puzzle has no solution.'
            };
        } else if (solutions.length > 1) {
            // Find the differences between solutions to provide helpful feedback
            const differences = this.findSolutionDifferences(solutions[0], solutions[1]);
            if (differences.length > 0) {
                const diff = differences[0];
                return {
                    isValid: false,
                    message: `The puzzle has multiple solutions. Try adding a number at Row ${diff.row + 1}, Column ${diff.col + 1}.`
                };
                } else {
                return {
                    isValid: false,
                    message: 'Invalid puzzle! The puzzle has multiple solutions.'
                };
                }
            }
        
        return {
            isValid: true,
            message: 'Valid puzzle! You can start playing.'
        };
        }

    findSolutionDifferences(solution1, solution2) {
        const differences = [];
            for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (solution1[row][col] !== solution2[row][col]) {
                    differences.push({
                        row: row,
                        col: col,
                        value1: solution1[row][col],
                        value2: solution2[row][col]
                    });
                }
            }
        }
        return differences;
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
                if (solutions.length >= limit) return;
                puzzle[row][col].value = 0;
            }
        }
    }

    findNearbyGivens(puzzle, row, col) {
        const nearbyGivens = [];
        
        // Check same row
        for (let c = 0; c < 9; c++) {
            if (puzzle[row][c].isFixed) {
                nearbyGivens.push({
                    value: puzzle[row][c].value,
                    position: `Row ${row + 1}, Column ${c + 1}`
                });
            }
        }
        
        // Check same column
        for (let r = 0; r < 9; r++) {
            if (puzzle[r][col].isFixed) {
                nearbyGivens.push({
                    value: puzzle[r][col].value,
                    position: `Row ${r + 1}, Column ${col + 1}`
                });
            }
        }
        
        // Check same box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const currentRow = boxRow + r;
                const currentCol = boxCol + c;
                if (puzzle[currentRow][currentCol].isFixed) {
                    nearbyGivens.push({
                        value: puzzle[currentRow][currentCol].value,
                        position: `Row ${currentRow + 1}, Column ${currentCol + 1}`
                    });
                }
            }
        }
        
        return nearbyGivens;
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

    getPossibleMoves(grid) {
        const moves = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    const possibilities = this.getCellPossibilities(grid, row, col);
                    moves.push({
                        row,
                        col,
                        possibilities: Array.from(possibilities)
                    });
                }
            }
        }
        return moves;
    }

    addSolutionStatistics(doc) {
        // Add title
        doc.setFontSize(16);
        doc.text('Solution Statistics', 20, 20);

        // Add difficulty distribution
        doc.setFontSize(14);
        doc.text('Difficulty Distribution:', 20, 40);
        
        const stats = this.generateStatistics(this.allSolutionSteps);
        let y = 55;

        // Format difficulty stats
        doc.setFontSize(11);
        const difficulties = [
            ['Advanced', stats.difficulty['Advanced']],
            ['Intermediate', stats.difficulty['Intermediate']],
            ['Basic', stats.difficulty['Basic']]
        ];

        difficulties.forEach(([level, count]) => {
            const percentage = Math.round((count / stats.totalSteps) * 100);
            doc.text(`• ${level}: ${count} moves (${percentage}%)`, 20, y);
            y += 15;
        });

        // Add strategy distribution
        y += 10;
        doc.setFontSize(14);
        doc.text('Strategy Distribution:', 20, y);
        y += 20;

        // Format strategy stats
        doc.setFontSize(11);
        const strategies = [
            ['Logical Deduction', stats.strategy['Logical Deduction']],
            ['Naked Single', stats.strategy['Naked Single']],
            ['Hidden Single (Column)', stats.strategy['Hidden Single Column']],
            ['Hidden Single (Row)', stats.strategy['Hidden Single Row']],
            ['Pointing Combination', stats.strategy['Pointing Combination']]
        ];

        strategies.forEach(([strategy, count]) => {
            if (count > 0) {
                doc.text(`• ${strategy}: ${count} times`, 20, y);
                y += 15;
            }
        });

        // Add page number
        doc.setFontSize(10);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, 105, 285, { align: 'center' });

        // Add new page for the final puzzle
        doc.addPage();
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

        // Validate the puzzle first
        const validationResult = this.validateCustomPuzzle();
        if (!validationResult.isValid) {
            return false;
        }

        // Store the initial puzzle state
        const initialPuzzle = this.grid.map(row => 
            row.map(cell => ({
                value: cell.value,
                isFixed: cell.value !== 0, // Mark non-empty cells as fixed
                notes: new Set()
            }))
        );

        // Convert grid to simple array for solving
        const puzzleValues = this.grid.map(row => row.map(cell => cell.value));
        
        // Find the solution using solvePuzzle
        const solvedGrid = this.solvePuzzle([...puzzleValues.map(row => [...row])]);
        
        if (solvedGrid) {
            // Store the solution
            this.solution = solvedGrid;
            
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
            this.isPlaying = true;
            
            // Reset and start timer
            this.stopTimer();
            this.elapsedTime = 0;
            this.startTimer();
            
            return true;
        }
        
        return false;
    }

    generateHint() {
        if (!this.solution) {
            console.log('Attempting to generate solution for hint...');
            const currentGrid = this.grid.map(row => row.map(cell => cell.value));
            const solvedGrid = this.solvePuzzle([...currentGrid.map(row => [...row])]);
            if (solvedGrid) {
                this.solution = solvedGrid;
                console.log('Generated solution for hint');
            } else {
                console.log('Failed to generate solution for hint');
                return null;
            }
        }

        if (!this.solution) {
            console.log('No solution available for hint generation');
            return null;
        }

        // Find the first empty cell that matches the solution
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col].value === 0) {
                    const solutionValue = this.solution[row][col];
                    if (this.isValidPlacement(this.grid, row, col, solutionValue)) {
                        return {
                            row,
                            col,
                            value: solutionValue
                        };
                    }
                }
            }
        }

        return null;
    }
}