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
        this.apiUrl = 'http://localhost:8000';

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
        this.timer = {
            startTime: 0,
            elapsedTime: 0,
            timerInterval: null,
            isPaused: false,
            isGameComplete: false
        };

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

        // Audio trainer properties
        this.audioTrainer = {
            enabled: false,
            currentStep: 0,
            steps: [],
            audioContext: null,
            speechSynthesis: window.speechSynthesis,
            voice: null,
            rate: 1.0,
            pitch: 1.0
        };
        
        // Initialize audio context
        this.initializeAudioTrainer();

        // Initialize solving techniques
        this.techniques = window.SudokuTechniques ? new window.SudokuTechniques() : null;
        
        // Initialize technique availability
        this.initializeTechniques();

        // Integrate advanced techniques
        this.techniques = new window.SudokuTechniques();

        // Add lastInvalidCell property
        this.lastInvalidCell = null;
    }

    initializeTechniques() {
        if (!this.techniques) {
            console.warn('Advanced solving techniques not available');
            this.availableTechniques = [];
            return;
        }

        // Define available techniques in order of complexity
        this.availableTechniques = [
            'nakedSingle',
            'hiddenSingle',
            'nakedPair',
            'pointingPair',
            'hiddenPair',
            'nakedTriple',
            'hiddenTriple',
            'xWing',
            'swordfish',
            'xyWing',
            'xyzWing',
            'uniqueRectangle',
            'skyscraper',
            'twoStringKite',
            'turbotFish'
        ];
        
        // Initialize technique scores based on difficulty
        this.techniqueScores = {
            'nakedSingle': 10,
            'hiddenSingle': 20,
            'nakedPair': 30,
            'pointingPair': 35,
            'hiddenPair': 40,
            'nakedTriple': 45,
            'hiddenTriple': 50,
            'xWing': 60,
            'swordfish': 70,
            'xyWing': 80,
            'xyzWing': 85,
            'uniqueRectangle': 90,
            'skyscraper': 95,
            'turbotFish': 100
        };
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

            const hint_levels = {
                'easy': 4,
                'medium': 3,
                'hard': 2,
                'expert': 1,
                'master': 0
            };
            const key = difficulty.trim().toLowerCase();
            this.hintsRemaining = hint_levels[key] !== undefined ? hint_levels[key] : 3;
            if (hint_levels[key] === undefined) {
                console.warn('Unknown difficulty:', difficulty);
            }

            // Disable hint button in Master mode
            const hintButton = document.getElementById('hint');
            if (hintButton) {
                if (key === 'master') {
                    hintButton.disabled = true;
                    hintButton.title = "No hints available in Master mode";
                } else {
                    hintButton.disabled = false;
                    hintButton.title = "";
                }
            }

            this.checkCount = 0;

            // Clear history
            this.undoStack = [];
            this.redoStack = [];

            // Reset and start timer
            this.timer.elapsedTime = 0;
            this.timer.isGameComplete = false;
            this.timer.isPaused = false;
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

    isFullHouse(grid, row, col, value) {
        // Check if this is the last empty cell in its unit (row, column, or box)
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        // Check row
        let rowCount = 0;
        for (let c = 0; c < 9; c++) {
            if (grid[row][c] !== 0) rowCount++;
        }
        if (rowCount === 8) return 'row';
        
        // Check column
        let colCount = 0;
        for (let r = 0; r < 9; r++) {
            if (grid[r][col] !== 0) colCount++;
        }
        if (colCount === 8) return 'column';
        
        // Check box
        let boxCount = 0;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (grid[boxRow + r][boxCol + c] !== 0) boxCount++;
            }
        }
        if (boxCount === 8) return 'box';
        
        return null;
    }

    isNakedSingle(grid, row, col) {
        const possibilities = this.getCellPossibilities(grid, row, col);
        return possibilities.size === 1;
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

    isIntersection(grid, row, col, value) {
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        // Check row-box intersection
        let rowBoxCount = 0;
        let rowOutsideCount = 0;
        for (let c = 0; c < 9; c++) {
            if (grid[row][c] === 0 && this.isValidPlacement(grid, row, c, value)) {
                if (c >= boxCol && c < boxCol + 3) {
                    rowBoxCount++;
                } else {
                    rowOutsideCount++;
                }
            }
        }
        if (rowBoxCount > 0 && rowOutsideCount === 0) {
            return 'row_box';
        }
        
        // Check column-box intersection
        let colBoxCount = 0;
        let colOutsideCount = 0;
        for (let r = 0; r < 9; r++) {
            if (grid[r][col] === 0 && this.isValidPlacement(grid, r, col, value)) {
                if (r >= boxRow && r < boxRow + 3) {
                    colBoxCount++;
                } else {
                    colOutsideCount++;
                }
            }
        }
        if (colBoxCount > 0 && colOutsideCount === 0) {
            return 'column_box';
        }
        
        return null;
    }

    isLockedCandidate(grid, row, col, value) {
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        // Type 1 (Pointing): Check if all occurrences in a box are in the same row/column
        let boxRowCount = 0;
        let boxColCount = 0;
        let totalBoxCount = 0;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (grid[r][c] === 0 && this.isValidPlacement(grid, r, c, value)) {
                    totalBoxCount++;
                    if (r === row) boxRowCount++;
                    if (c === col) boxColCount++;
                }
            }
        }
        
        if (totalBoxCount > 1) {
            if (boxRowCount === totalBoxCount) {
                return 'pointing_row';
            }
            if (boxColCount === totalBoxCount) {
                return 'pointing_column';
            }
        }
        
        // Type 2 (Claiming): Check if all occurrences in a row/column are in the same box
        let rowBoxCount = 0;
        let colBoxCount = 0;
        let totalRowCount = 0;
        let totalColCount = 0;
        
        // Check row
        for (let c = 0; c < 9; c++) {
            if (grid[row][c] === 0 && this.isValidPlacement(grid, row, c, value)) {
                totalRowCount++;
                if (c >= boxCol && c < boxCol + 3) {
                    rowBoxCount++;
                }
            }
        }
        
        // Check column
        for (let r = 0; r < 9; r++) {
            if (grid[r][col] === 0 && this.isValidPlacement(grid, r, col, value)) {
                totalColCount++;
                if (r >= boxRow && r < boxRow + 3) {
                    colBoxCount++;
                }
            }
        }
        
        if (totalRowCount > 1 && rowBoxCount === totalRowCount) {
            return 'claiming_row';
        }
        if (totalColCount > 1 && colBoxCount === totalColCount) {
            return 'claiming_column';
        }
        
        return null;
    }

    analyzeMoveQuality(grid, row, col, value) {
        // First check if the move is valid
        if (grid[row][col] !== 0) return null;
        
        const candidates = this.getCellPossibilities(grid, row, col);
        if (!candidates.has(value)) return null;
        
        // Try advanced techniques if available
        if (this.techniques && this.availableTechniques.length > 0) {
            // Prepare cell grid with candidates for advanced techniques
            const cellGrid = grid.map((rowArr, r) => rowArr.map((v, c) => ({
                value: v,
                candidates: this.getCellPossibilities(grid, r, c),
                row: r,
                col: c,
                isGiven: v !== 0
            })));
            
            // Try each technique in order of complexity
            for (const tech of this.availableTechniques) {
                try {
                    const techMethod = `find${tech.charAt(0).toUpperCase() + tech.slice(1)}`;
                    if (typeof this.techniques[techMethod] === 'function') {
                        const result = this.techniques[techMethod](cellGrid, { row, col, value });
                        
                        if (result && result.isValid) {
                            return {
                                row,
                                col,
                                value,
                                technique: tech,
                                score: this.techniqueScores[tech] || 100,
                                reason: result.reason || `Applied ${tech} technique`,
                                affectedCells: result.affectedCells || this.getAffectedCells(grid, row, col, value),
                                eliminations: result.eliminations || [],
                                details: result.details || {},
                                timestamp: Date.now()
                            };
                        }
                    }
                } catch (e) {
                    console.warn(`Error applying technique ${tech}:`, e);
                }
            }
        }
        
        // Fallback to basic analysis if no advanced technique applies
        return this.basicAnalyzeMoveQuality(grid, row, col, value);
    }
    
    basicAnalyzeMoveQuality(grid, row, col, value) {
        // Basic validation
        if (grid[row][col] !== 0) return null;
        
        // Check if the move is valid
        if (!this.isValidPlacement(grid, row, col, value)) {
            return null;
        }
        
        const moveInfo = {
            row,
            col,
            value,
            score: 100, // Default score for basic moves
            technique: 'logical_deduction',
            reason: 'Basic logical deduction',
            affectedCells: this.getAffectedCells(grid, row, col, value),
            timestamp: Date.now()
        };
        
        // Check for Full House (Last Digit)
        const fullHouseType = this.isFullHouse(grid, row, col, value);
        if (fullHouseType) {
            moveInfo.technique = 'full_house';
            moveInfo.score = 10;
            moveInfo.reason = `Last empty cell in ${fullHouseType}`;
            return moveInfo;
        }

        // Check for naked single
        if (this.isNakedSingle(grid, row, col)) {
            moveInfo.technique = 'naked_single';
            moveInfo.score = 20;
            moveInfo.reason = 'Only one possible value for this cell';
            return moveInfo;
        }

        // Check for hidden single
        const hiddenSingleType = this.isHiddenSingle(grid, row, col, value, 'row') ? 'row' :
                               this.isHiddenSingle(grid, row, col, value, 'col') ? 'col' :
                               this.isHiddenSingle(grid, row, col, value, 'box') ? 'box' : null;
                               
        if (hiddenSingleType) {
            moveInfo.technique = `hidden_single_${hiddenSingleType}`;
            moveInfo.score = 30;
            moveInfo.reason = `Only possible cell for ${value} in this ${hiddenSingleType}`;
            return moveInfo;
        }
        
        // Check for locked candidate
        const lockedCandidateType = this.isLockedCandidate(grid, row, col, value);
        if (lockedCandidateType) {
            moveInfo.technique = 'locked_candidate';
            moveInfo.score = 40;
            moveInfo.reason = `Forms a ${lockedCandidateType} pattern`;
            return moveInfo;
        }

        // Check for Fish patterns
        const fish = this.findFish(grid, row, col, value);
        if (fish) {
            moveInfo.technique = fish.type;
            moveInfo.score = 50;
            moveInfo.reason = `Forms a ${fish.type} pattern in ${fish.unit}s ${fish.cells.map(c => c.row + 1).join(', ')}`;
            return moveInfo;
        }

        // Check for Unique Rectangle
        const uniqueRect = this.findUniqueRectangle(grid, row, col, value);
        if (uniqueRect) {
            moveInfo.technique = 'unique_rectangle';
            moveInfo.score = 60;
            moveInfo.reason = `Forms a unique rectangle with shared candidates ${uniqueRect.sharedCandidates.join(', ')}`;
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

        // First check if the current state is valid
        const isValid = this.isValid();
        console.log('Board validity check:', isValid);
        
        if (!isValid) {
            // Find conflicts to give more specific feedback
            const conflicts = this.findConflicts();
            console.log('Found conflicts:', conflicts);
            
            if (conflicts.length > 0) {
                return { 
                    valid: false, 
                    message: `Invalid board: ${conflicts[0].reason}`,
                    conflicts: conflicts,
                    showSolution: true
                };
            }
            return { 
                valid: false, 
                message: 'The current board has conflicts!',
                showSolution: true
            };
        }

        // Check if the puzzle is already solved
        const isComplete = this.isComplete();
        console.log('Board complete check:', isComplete);
        
        if (isComplete) {
            this.stopTimer();
            return { 
                solved: true, 
                valid: true, 
                message: 'Puzzle solved correctly!',
                showSolution: false
            };
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
                return { 
                    solved: true, 
                    valid: true,
                    message: 'Puzzle solved correctly!'
                };
            }
            
            // Generate remaining solution steps to complete the puzzle
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
                valid: true,
                showSolution: true,
                solutionPath: remainingSteps,
                message: `Puzzle incomplete. ${remainingSteps.length} steps remaining to complete.`
            };
        }

        // If we reach here, we're dealing with a puzzle without a solution
        // Try to generate a solution and complete the puzzle
        console.log('No stored solution, attempting to solve puzzle...');
        const solvedGrid = this.solvePuzzle([...currentGrid.map(row => [...row])]);
        
        if (solvedGrid) {
            this.solution = solvedGrid;
            console.log('Generated solution successfully');
            
            // Generate complete solution path
            const completeSolutionPath = this.generateCompleteSolutionPath(currentGrid, solvedGrid);
            
            return {
                solved: false,
                valid: true,
                showSolution: true,
                solutionPath: completeSolutionPath,
                message: `Puzzle solvable. ${completeSolutionPath.length} steps to complete.`
            };
        }

        // If we can't solve it, check if it's complete but invalid
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
                valid: true,
                showSolution: false,
                error: 'Puzzle is not complete and cannot be solved'
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
            return { 
                solved: true, 
                valid: true,
                message: 'Puzzle solved correctly!'
            };
        }

        return { 
            solved: false, 
            valid: false,
            showSolution: false,
            error: 'Puzzle solution is invalid'
        };
    }

    // New method to generate complete solution path from current state to solution
    generateCompleteSolutionPath(currentGrid, solutionGrid) {
        console.log('Generating complete solution path...');
        
        const steps = [];
        const workingGrid = [...currentGrid.map(row => [...row])];
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
                const targetValue = solutionGrid[row][col];
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

        console.log(`Generated ${steps.length} complete solution steps`);
        return steps;
    }

    // Enhanced method to complete incomplete puzzles
    async completeIncompletePuzzle() {
        console.log('Completing incomplete puzzle...');
        
        const currentGrid = this.grid.map(row => row.map(cell => cell.value));
        
        // Check if puzzle is already complete
        if (this.isComplete()) {
            return {
                completed: true,
                message: 'Puzzle is already complete!',
                solutionPath: []
            };
        }

        // Check if current state is valid
        if (!this.isValid()) {
            return {
                completed: false,
                message: 'Cannot complete invalid puzzle. Please fix conflicts first.',
                error: 'Invalid board state'
            };
        }

        // Try to generate a solution
        const solvedGrid = this.solvePuzzle([...currentGrid.map(row => [...row])]);
        
        if (!solvedGrid) {
            return {
                completed: false,
                message: 'Puzzle cannot be solved from current state.',
                error: 'No solution exists'
            };
        }

        // Store the solution
        this.solution = solvedGrid;
        
        // Generate complete solution path
        const solutionPath = this.generateCompleteSolutionPath(currentGrid, solvedGrid);
        
        // Apply the solution to the current grid
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col].value === 0) {
                    this.grid[row][col].value = solvedGrid[row][col];
                }
            }
        }

        console.log('Puzzle completed successfully');
        
        return {
            completed: true,
            message: `Puzzle completed! Applied ${solutionPath.length} moves.`,
            solutionPath: solutionPath
        };
    }

    generateRemainingSteps() {
        console.log('Generating remaining solution steps...');
        
        // Ensure we have a solution
        if (!this.solution) {
            console.log('No solution available, attempting to generate one...');
            const currentGrid = this.grid.map(row => row.map(cell => cell.value));
            const solvedGrid = this.solvePuzzle(currentGrid);
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

    // Game state methods
    isComplete() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col].value === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    // Check if the current grid is valid
    isValid() {
        // Check rows
        for (let row = 0; row < 9; row++) {
            const seen = new Set();
            for (let col = 0; col < 9; col++) {
                const value = this.grid[row][col].value;
                if (value !== 0 && seen.has(value)) return false;
                if (value !== 0) seen.add(value);
            }
        }

        // Check columns
        for (let col = 0; col < 9; col++) {
            const seen = new Set();
            for (let row = 0; row < 9; row++) {
                const value = this.grid[row][col].value;
                if (value !== 0 && seen.has(value)) return false;
                if (value !== 0) seen.add(value);
            }
        }

        // Check 3x3 boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const seen = new Set();
                for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
                    for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
                        const value = this.grid[row][col].value;
                        if (value !== 0 && seen.has(value)) return false;
                        if (value !== 0) seen.add(value);
                    }
                }
            }
        }

        return true;
    }

    // Check solution using advanced techniques
    async checkSolution() {
        try {
            console.log('Starting checkSolution...');
            
            // First check if the current state is valid
            const isValid = this.isValid();
            console.log('Board validity check:', isValid);
            
            if (!isValid) {
                // Find conflicts to give more specific feedback
                const conflicts = this.findConflicts();
                console.log('Found conflicts:', conflicts);
                
                if (conflicts.length > 0) {
                    return { 
                        valid: false, 
                        message: `Invalid board: ${conflicts[0].reason}`,
                        conflicts: conflicts,
                        showSolution: true
                    };
                }
                return { 
                    valid: false, 
                    message: 'The current board has conflicts!',
                    showSolution: true
                };
            }

            // Check if the puzzle is already solved
            const isComplete = this.isComplete();
            console.log('Board complete check:', isComplete);
            
            if (isComplete) {
                return { 
                    solved: true, 
                    valid: true, 
                    message: 'Puzzle solved correctly!',
                    showSolution: false
                };
            }

            // Make a copy of the current grid to work with
            const gridCopy = JSON.parse(JSON.stringify(this.grid));
            console.log('Grid copied for analysis');
            
            // Try to find the next step using advanced techniques
            console.log('Looking for next step...');
            const nextStep = await this.findNextStep(gridCopy);
            console.log('Next step found:', nextStep);
            
            if (nextStep) {
                // Ensure the step has all required properties
                const formattedStep = {
                    row: typeof nextStep.row === 'number' ? nextStep.row : 0,
                    col: typeof nextStep.col === 'number' ? nextStep.col : 0,
                    value: typeof nextStep.value === 'number' ? nextStep.value : 0,
                    technique: nextStep.technique || 'Basic',
                    reason: nextStep.reason || nextStep.message || 'Next step found',
                    difficulty: nextStep.difficulty || 'Easy',
                    why: nextStep.why || `Found using ${nextStep.technique || 'Basic'} technique`,
                    ...nextStep // Spread any additional properties
                };
                
                console.log('Formatted step:', formattedStep);
                
                return {
                    valid: true,
                    message: `Next step: ${formattedStep.technique}`,
                    technique: formattedStep.technique,
                    step: formattedStep,
                    showSolution: true
                };
            }
            
            console.log('No next step found with techniques, trying to solve...');
            
            // If no next step found with techniques, try to find a solution
            const solution = this.solveSudoku(gridCopy, [], 1);
            console.log('Solution attempt result:', solution ? `Found ${solution.length} steps` : 'No solution');
            
            if (solution && solution.length > 0) {
                return {
                    valid: true,
                    message: 'Puzzle is solvable. Keep going!',
                    showSolution: true,
                    solutionPath: solution
                };
            }
            
            console.log('No valid solution found');
            
            return {
                valid: false,
                message: 'No valid moves found. The puzzle might be unsolvable from this state.',
                showSolution: true
            };
        } catch (error) {
            console.error('Error in checkSolution:', error);
            return {
                valid: false,
                message: 'An error occurred while checking the solution.',
                error: error.message,
                showSolution: true
            };
        }
    }
    
    // Find the next logical step in the solution
    async findNextStep(grid) {
        console.log('Finding next step...');
        
        // Ensure all candidates are up to date before running techniques
        this.updateAllCandidates(grid);
        
        // Try different solving techniques in order of complexity
        const techniques = [
            'findNakedSingle',
            'findHiddenSingle',
            'findFullHouse',
            'findLockedCandidatesType1', // Pointing
            'findLockedCandidatesType2', // Claiming
            // Add more only if they always return a placement
        ];
        
        for (const technique of techniques) {
            try {
                console.log(`Trying technique: ${technique}`);
                
                if (this.techniques && typeof this.techniques[technique] === 'function') {
                    const result = await this.techniques[technique](grid);
                    
                    if (result) {
                        console.log(`Found step with ${technique}:`, result);
                        
                        // Format the technique name for display
                        const techniqueName = technique.replace('find', '').replace(/([A-Z])/g, ' $1').trim();
                        
                        // Extract row, col, value from result.cells[0] if present
                        let row = (typeof result.row === 'number') ? result.row : undefined;
                        let col = (typeof result.col === 'number') ? result.col : undefined;
                        let value = (typeof result.value === 'number') ? result.value : undefined;
                        if (Array.isArray(result.cells) && result.cells.length > 0) {
                            const cell = result.cells[0];
                            if (typeof cell.row === 'number') row = cell.row;
                            if (typeof cell.col === 'number') col = cell.col;
                            if (typeof cell.value === 'number') value = cell.value;
                        }
                        // Only return steps that actually place a value
                        if (
                            typeof row === 'number' && row >= 0 && row < 9 &&
                            typeof col === 'number' && col >= 0 && col < 9 &&
                            typeof value === 'number' && value > 0 && value <= 9
                        ) {
                            // Placement step
                            const step = {
                                row, col, value,
                                technique: techniqueName,
                                strategy: techniqueName,
                                message: result.message || result.explanation || `Found using ${techniqueName}`,
                                reason: result.reason || result.explanation || `Found using ${techniqueName} technique`,
                                why: result.why || result.explanation || `This is the only possible value for this cell based on ${techniqueName}.`,
                                difficulty: result.difficulty || this.getTechniqueDifficulty(technique) || 'Medium',
                                ...result
                            };
                            return step;
                        } else {
                            console.warn('Skipping invalid step:', { row, col, value, result });
                            continue;
                        }
                    } else {
                        console.log(`No result from ${technique}`);
                    }
                } else {
                    console.warn(`Technique not found: ${technique}`);
                }
            } catch (error) {
                console.error(`Error in ${technique}:`, error);
            }
        }
        
        console.log('No next step found with any technique');
        return null;
    }
    
    // Helper method to determine difficulty of techniques
    getTechniqueDifficulty(technique) {
        const difficultyMap = {
            // Basic techniques
            'findNakedSingle': 'Easy',
            'findHiddenSingle': 'Easy',
            
            // Medium techniques
            'findNakedPair': 'Medium',
            'findHiddenPair': 'Medium',
            'findPointingPair': 'Medium',
            'findBoxLineReduction': 'Medium',
            
            // Advanced techniques
            'findXWing': 'Hard',
            'findSwordfish': 'Hard',
            'findXYWing': 'Hard',
            'findXYZWing': 'Hard',
            'findWWing': 'Hard',
            'findSkyscraper': 'Hard',
            'findTwoStringKite': 'Hard',
            'findTurbotFish': 'Hard'
        };
        
        return difficultyMap[technique] || 'Medium';
    }
    
    // Check if the puzzle is solvable from the current state
    async isSolvable(grid) {
        // Make a deep copy of the grid to avoid modifying the original
        const gridCopy = JSON.parse(JSON.stringify(grid || this.grid));
        
        try {
            // Try to solve the puzzle using a simple backtracking algorithm
            return await this.solveWithBacktracking(gridCopy);
        } catch (error) {
            console.error('Error checking solvability:', error);
            return false;
        }
    }
    
    // Simple backtracking solver to check solvability
    async solveWithBacktracking(grid) {
        // Find the next empty cell
        const findEmptyCell = (grid) => {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (grid[row][col].value === 0) {
                        return { row, col };
                    }
                }
            }
            return null; // No empty cells
        };
        
        // Check if a number can be placed in a cell
        const isValid = (grid, row, col, num) => {
            // Check row
            for (let x = 0; x < 9; x++) {
                if (grid[row][x].value === num) return false;
            }
            
            // Check column
            for (let x = 0; x < 9; x++) {
                if (grid[x][col].value === num) return false;
            }
            
            // Check 3x3 box
            const boxStartRow = Math.floor(row / 3) * 3;
            const boxStartCol = Math.floor(col / 3) * 3;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (grid[boxStartRow + i][boxStartCol + j].value === num) {
                        return false;
                    }
                }
            }
            
            return true;
        };
        
        // Main solving function
        const solve = (grid) => {
            const emptyCell = findEmptyCell(grid);
            if (!emptyCell) return true; // Puzzle solved
            
            const { row, col } = emptyCell;
            
            for (let num = 1; num <= 9; num++) {
                if (isValid(grid, row, col, num)) {
                    grid[row][col].value = num;
                    
                    if (solve(grid)) {
                        return true;
                    }
                    
                    // Backtrack
                    grid[row][col].value = 0;
                }
            }
            
            return false; // Trigger backtracking
        };
        
        // Make a copy of the grid to avoid modifying the original
        const gridCopy = JSON.parse(JSON.stringify(grid));
        return solve(gridCopy);
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
        if (this.timer.timerInterval) {
            clearInterval(this.timer.timerInterval);
        }
        
        this.timer.startTime = Date.now() - this.timer.elapsedTime;
        this.timer.isPaused = false;
        this.timer.isGameComplete = false;
        
        this.timer.timerInterval = setInterval(() => {
            if (!this.timer.isPaused && !this.timer.isGameComplete) {
                this.timer.elapsedTime = Date.now() - this.timer.startTime;
                this.updateTimerDisplay();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer.timerInterval) {
            clearInterval(this.timer.timerInterval);
            this.timer.timerInterval = null;
        }
        this.timer.isGameComplete = true;
        this.updateTimerDisplay();
    }

    pauseTimer() {
        if (!this.timer.isGameComplete) {
            this.timer.isPaused = true;
            this.timer.elapsedTime = Date.now() - this.timer.startTime;
            if (this.timer.timerInterval) {
                clearInterval(this.timer.timerInterval);
                this.timer.timerInterval = null;
            }
        }
    }

    resumeTimer() {
        if (!this.timer.isGameComplete && this.timer.isPaused) {
            this.timer.startTime = Date.now() - this.timer.elapsedTime;
            this.timer.isPaused = false;
            this.startTimer();
        }
    }

    updateTimerDisplay() {
        const formattedTime = this.getFormattedTime();
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = formattedTime;
        }
    }

    getFormattedTime() {
        const totalSeconds = Math.floor(this.timer.elapsedTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    getNumberCounts() {
        const counts = {};
        for (let i = 1; i <= 9; i++) {
            counts[i] = 0;
        }

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const value = this.grid[r][c].value;
                if (value >= 1 && value <= 9) {
                    counts[value]++;
                }
            }
        }
        return counts;
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
        this.timer.elapsedTime = 0;
        this.timer.isGameComplete = false;
        this.timer.isPaused = false;
        
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
            this.timer.elapsedTime = 0;
            this.timer.isGameComplete = false;
            this.timer.isPaused = false;
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

    findHiddenSubset(grid, row, col, value, type) {
        const possibilities = this.getCellPossibilities(grid, row, col);
        if (possibilities.size < 2) return null;

        let cells = [];
        let candidates = new Set([value]);

        // Get all empty cells in the unit
        if (type === 'row') {
            for (let c = 0; c < 9; c++) {
                if (grid[row][c] === 0) {
                    cells.push({row, col: c});
                }
            }
        } else if (type === 'column') {
            for (let r = 0; r < 9; r++) {
                if (grid[r][col] === 0) {
                    cells.push({row: r, col});
                }
            }
        } else if (type === 'box') {
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    if (grid[boxRow + r][boxCol + c] === 0) {
                        cells.push({row: boxRow + r, col: boxCol + c});
                    }
                }
            }
        }

        // Find cells that share candidates with the current cell
        const sharedCells = cells.filter(cell => {
            if (cell.row === row && cell.col === col) return false;
            const cellPossibilities = this.getCellPossibilities(grid, cell.row, cell.col);
            return Array.from(possibilities).some(p => cellPossibilities.has(p));
        });

        // Check for hidden pairs
        if (sharedCells.length === 1) {
            const otherCell = sharedCells[0];
            const otherPossibilities = this.getCellPossibilities(grid, otherCell.row, otherCell.col);
            const sharedCandidates = new Set(
                Array.from(possibilities).filter(p => otherPossibilities.has(p))
            );
            if (sharedCandidates.size === 2) {
                return {
                    type: 'hidden_pair',
                    cells: [{row, col}, otherCell],
                    candidates: Array.from(sharedCandidates)
                };
            }
        }

        // Check for hidden triples
        if (sharedCells.length === 2) {
            const [cell1, cell2] = sharedCells;
            const poss1 = this.getCellPossibilities(grid, cell1.row, cell1.col);
            const poss2 = this.getCellPossibilities(grid, cell2.row, cell2.col);
            const sharedCandidates = new Set(
                Array.from(possibilities).filter(p => 
                    poss1.has(p) && poss2.has(p)
                )
            );
            if (sharedCandidates.size === 3) {
                return {
                    type: 'hidden_triple',
                    cells: [{row, col}, cell1, cell2],
                    candidates: Array.from(sharedCandidates)
                };
            }
        }

        return null;
    }

    findNakedSubset(grid, row, col, value) {
        const possibilities = this.getCellPossibilities(grid, row, col);
        if (possibilities.size < 2) return null;

        // Check row
        const rowSubset = this.findNakedSubsetInUnit(grid, row, col, possibilities, 'row');
        if (rowSubset) return rowSubset;

        // Check column
        const colSubset = this.findNakedSubsetInUnit(grid, row, col, possibilities, 'column');
        if (colSubset) return colSubset;

        // Check box
        const boxSubset = this.findNakedSubsetInUnit(grid, row, col, possibilities, 'box');
        if (boxSubset) return boxSubset;

        return null;
    }

    findNakedSubsetInUnit(grid, row, col, possibilities, type) {
        let cells = [];
        let unitCells = [];

        // Get all empty cells in the unit
        if (type === 'row') {
            for (let c = 0; c < 9; c++) {
                if (grid[row][c] === 0) {
                    unitCells.push({row, col: c});
                }
            }
        } else if (type === 'column') {
            for (let r = 0; r < 9; r++) {
                if (grid[r][col] === 0) {
                    unitCells.push({row: r, col});
                }
            }
        } else if (type === 'box') {
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    if (grid[boxRow + r][boxCol + c] === 0) {
                        unitCells.push({row: boxRow + r, col: boxCol + c});
                    }
                }
            }
        }

        // Find cells with matching candidates
        cells = unitCells.filter(cell => {
            if (cell.row === row && cell.col === col) return true;
            const cellPossibilities = this.getCellPossibilities(grid, cell.row, cell.col);
            return cellPossibilities.size === possibilities.size &&
                   Array.from(possibilities).every(p => cellPossibilities.has(p));
        });

        if (cells.length === 2) {
            return {
                type: 'naked_pair',
                cells: cells,
                candidates: Array.from(possibilities)
            };
        } else if (cells.length === 3) {
            return {
                type: 'naked_triple',
                cells: cells,
                candidates: Array.from(possibilities)
            };
        }

        return null;
    }

    findFish(grid, row, col, value) {
        // Check for X-Wing
        const xWing = this.findXWing(grid, row, col, value);
        if (xWing) return xWing;

        // Check for Swordfish
        const swordfish = this.findSwordfish(grid, row, col, value);
        if (swordfish) return swordfish;

        // Check for Jellyfish
        const jellyfish = this.findJellyfish(grid, row, col, value);
        if (jellyfish) return jellyfish;

        return null;
    }

    findXWing(grid, row, col, value) {
        // Check rows for X-Wing
        const rowXWing = this.findFishInUnit(grid, row, col, value, 'row', 2);
        if (rowXWing) {
            return {
                type: 'x_wing',
                unit: 'row',
                cells: rowXWing.cells,
                value: value
            };
        }

        // Check columns for X-Wing
        const colXWing = this.findFishInUnit(grid, row, col, value, 'column', 2);
        if (colXWing) {
            return {
                type: 'x_wing',
                unit: 'column',
                cells: colXWing.cells,
                value: value
            };
        }

        return null;
    }

    findSwordfish(grid, row, col, value) {
        // Check rows for Swordfish
        const rowSwordfish = this.findFishInUnit(grid, row, col, value, 'row', 3);
        if (rowSwordfish) {
            return {
                type: 'swordfish',
                unit: 'row',
                cells: rowSwordfish.cells,
                value: value
            };
        }

        // Check columns for Swordfish
        const colSwordfish = this.findFishInUnit(grid, row, col, value, 'column', 3);
        if (colSwordfish) {
            return {
                type: 'swordfish',
                unit: 'column',
                cells: colSwordfish.cells,
                value: value
            };
        }

        return null;
    }

    findJellyfish(grid, row, col, value) {
        // Check rows for Jellyfish
        const rowJellyfish = this.findFishInUnit(grid, row, col, value, 'row', 4);
        if (rowJellyfish) {
            return {
                type: 'jellyfish',
                unit: 'row',
                cells: rowJellyfish.cells,
                value: value
            };
        }

        // Check columns for Jellyfish
        const colJellyfish = this.findFishInUnit(grid, row, col, value, 'column', 4);
        if (colJellyfish) {
            return {
                type: 'jellyfish',
                unit: 'column',
                cells: colJellyfish.cells,
                value: value
            };
        }

        return null;
    }

    findFishInUnit(grid, row, col, value, unitType, size) {
        let units = [];
        let cells = [];

        // Get all units (rows or columns) that contain the value as a candidate
        if (unitType === 'row') {
            for (let r = 0; r < 9; r++) {
                let unitCells = [];
                for (let c = 0; c < 9; c++) {
                    if (grid[r][c] === 0 && this.isValidPlacement(grid, r, c, value)) {
                        unitCells.push({row: r, col: c});
                    }
                }
                if (unitCells.length > 0 && unitCells.length <= size) {
                    units.push({index: r, cells: unitCells});
                }
            }
        } else {
            for (let c = 0; c < 9; c++) {
                let unitCells = [];
                for (let r = 0; r < 9; r++) {
                    if (grid[r][c] === 0 && this.isValidPlacement(grid, r, c, value)) {
                        unitCells.push({row: r, col: c});
                    }
                }
                if (unitCells.length > 0 && unitCells.length <= size) {
                    units.push({index: c, cells: unitCells});
                }
            }
        }

        // Find combinations of units that form a fish pattern
        if (units.length >= size) {
            const combinations = this.getCombinations(units, size);
            for (const combo of combinations) {
                const allCells = combo.flatMap(u => u.cells);
                const uniqueCols = new Set(allCells.map(c => c.col));
                const uniqueRows = new Set(allCells.map(c => c.row));

                if (unitType === 'row' && uniqueCols.size === size) {
                    return {
                        cells: allCells,
                        units: combo.map(u => u.index)
                    };
                } else if (unitType === 'column' && uniqueRows.size === size) {
                    return {
                        cells: allCells,
                        units: combo.map(u => u.index)
                    };
                }
            }
        }

        return null;
    }

    getCombinations(array, size) {
        const result = [];
        const combine = (arr, n) => {
            if (n === 0) {
                result.push([...arr]);
                return;
            }
            for (let i = 0; i <= array.length - n; i++) {
                arr.push(array[i]);
                combine(arr, n - 1);
                arr.pop();
            }
        };
        combine([], size);
        return result;
    }

    findUniqueRectangle(grid, row, col, value) {
        // Get all possible rectangles containing this cell
        const rectangles = this.findPossibleRectangles(grid, row, col);
        
        for (const rect of rectangles) {
            // Check if this forms a unique rectangle pattern
            const pattern = this.analyzeUniqueRectangle(grid, rect, value);
            if (pattern) {
                return pattern;
            }
        }
        
        return null;
    }

    findPossibleRectangles(grid, row, col) {
        const rectangles = [];
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        // Check for rectangles within the same box
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (r !== row && c !== col && grid[r][c] === 0) {
                    // Find the opposite corner
                    const oppRow = row + (r - row);
                    const oppCol = col + (c - col);
                    if (oppRow >= 0 && oppRow < 9 && oppCol >= 0 && oppCol < 9 && grid[oppRow][oppCol] === 0) {
                        rectangles.push([
                            {row, col},
                            {row: r, col: c},
                            {row: oppRow, col: oppCol},
                            {row: r, col: col}
                        ]);
                    }
                }
            }
        }
        
        return rectangles;
    }

    analyzeUniqueRectangle(grid, rectangle, value) {
        // Get candidates for all cells in the rectangle
        const candidates = rectangle.map(cell => 
            this.getCellPossibilities(grid, cell.row, cell.col)
        );
        
        // Check if three cells share the same two candidates
        const sharedCandidates = new Set();
        let extraCell = null;
        let extraCandidates = null;
        
        for (let i = 0; i < candidates.length; i++) {
            if (candidates[i].size === 2) {
                candidates[i].forEach(c => sharedCandidates.add(c));
            } else if (candidates[i].size > 2) {
                extraCell = rectangle[i];
                extraCandidates = candidates[i];
            }
        }
        
        // If we found a pattern
        if (sharedCandidates.size === 2 && extraCell && extraCandidates) {
            // Check if the extra cell contains the shared candidates
            const hasSharedCandidates = Array.from(sharedCandidates)
                .every(c => extraCandidates.has(c));
            
            if (hasSharedCandidates) {
                return {
                    type: 'unique_rectangle',
                    cells: rectangle,
                    sharedCandidates: Array.from(sharedCandidates),
                    extraCell: extraCell,
                    extraCandidates: Array.from(extraCandidates)
                };
            }
        }
        
        return null;
    }

    initializeAudioTrainer() {
        // Initialize Web Speech API
        if (this.audioTrainer.speechSynthesis) {
            // Get available voices
            const voices = this.audioTrainer.speechSynthesis.getVoices();
            // Select a suitable voice (prefer English)
            this.audioTrainer.voice = voices.find(voice => 
                voice.lang.includes('en') && voice.name.includes('Female')
            ) || voices[0];
        }

        // Initialize Web Audio API
        try {
            this.audioTrainer.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    toggleAudioTrainer() {
        this.audioTrainer.enabled = !this.audioTrainer.enabled;
        if (this.audioTrainer.enabled) {
            this.prepareAudioSteps();
            this.startAudioTraining();
        } else {
            this.stopAudioTraining();
        }
        return this.audioTrainer.enabled;
    }

    prepareAudioSteps() {
        this.audioTrainer.steps = [];
        const steps = this.allSolutionSteps;

        for (const step of steps) {
            const explanation = this.generateAudioExplanation(step);
            this.audioTrainer.steps.push({
                step: step,
                explanation: explanation
            });
        }
    }

    generateAudioExplanation(step) {
        let explanation = '';
        
        switch (step.technique) {
            case 'full_house':
                explanation = `This is a Full House. Cell ${this.getCellReference(step.row, step.col)} is the last empty cell in its ${step.reason.split(' in ')[1]}. We can place ${step.value} here.`;
                break;
            case 'naked_single':
                explanation = `This is a Naked Single. Cell ${this.getCellReference(step.row, step.col)} can only contain ${step.value} as it's the only possible value.`;
                break;
            case 'hidden_single_row':
            case 'hidden_single_column':
            case 'hidden_single_box':
                explanation = `This is a Hidden Single. ${step.value} can only go in cell ${this.getCellReference(step.row, step.col)} in this ${step.technique.split('_')[2]}.`;
                break;
            case 'naked_pair':
            case 'naked_triple':
                explanation = `This is a ${step.technique.replace('_', ' ')}. These cells can only contain ${step.reason.split(' with candidates ')[1]}.`;
                break;
            case 'hidden_pair':
            case 'hidden_triple':
                explanation = `This is a ${step.technique.replace('_', ' ')}. These numbers can only go in these specific cells.`;
                break;
            case 'intersection':
                explanation = `This is an Intersection. ${step.reason}`;
                break;
            case 'locked_candidate':
                explanation = `This is a Locked Candidate. ${step.reason}`;
                break;
            case 'x_wing':
            case 'swordfish':
            case 'jellyfish':
                explanation = `This is a ${step.technique}. ${step.reason}`;
                break;
            case 'unique_rectangle':
                explanation = `This is a Unique Rectangle. ${step.reason}`;
                break;
            default:
                explanation = `Place ${step.value} in cell ${this.getCellReference(step.row, step.col)}. ${step.reason}`;
        }

        return explanation;
    }

    getCellReference(row, col) {
        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
        return `${letters[row]}${col + 1}`;
    }

    startAudioTraining() {
        if (!this.audioTrainer.enabled) return;
        
        this.audioTrainer.currentStep = 0;
        this.playNextAudioStep();
    }

    stopAudioTraining() {
        if (this.audioTrainer.speechSynthesis) {
            this.audioTrainer.speechSynthesis.cancel();
        }
    }

    playNextAudioStep() {
        if (!this.audioTrainer.enabled || 
            this.audioTrainer.currentStep >= this.audioTrainer.steps.length) {
            return;
        }

        const currentStep = this.audioTrainer.steps[this.audioTrainer.currentStep];
        
        // Highlight the current step's cell
        this.selectCell(currentStep.step.row, currentStep.step.col);
        
        // Speak the explanation
        if (this.audioTrainer.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(currentStep.explanation);
            utterance.voice = this.audioTrainer.voice;
            utterance.rate = this.audioTrainer.rate;
            utterance.pitch = this.audioTrainer.pitch;
            
            utterance.onend = () => {
                // Wait a moment before moving to the next step
                setTimeout(() => {
                    this.audioTrainer.currentStep++;
                    this.playNextAudioStep();
                }, 1000);
            };
            
            this.audioTrainer.speechSynthesis.speak(utterance);
        }
    }

    setAudioTrainerVoice(voice) {
        if (this.audioTrainer.speechSynthesis) {
            const voices = this.audioTrainer.speechSynthesis.getVoices();
            this.audioTrainer.voice = voices.find(v => v.name === voice) || voices[0];
        }
    }

    setAudioTrainerRate(rate) {
        this.audioTrainer.rate = rate;
    }

    setAudioTrainerPitch(pitch) {
        this.audioTrainer.pitch = pitch;
    }

    // Add pause/resume functionality to the game
    togglePause() {
        if (this.timer.isPaused) {
            this.resumeTimer();
            return false; // Return false to indicate game is resumed
        } else {
            this.pauseTimer();
            return true; // Return true to indicate game is paused
        }
    }

    // Update candidates for all empty cells in the grid
    updateAllCandidates(grid) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c].value === 0) {
                    grid[r][c].candidates = this.getPossibleValues(grid, r, c);
                } else {
                    grid[r][c].candidates = new Set();
                }
            }
        }
    }
}

// Expose SudokuGame to the global scope
window.SudokuGame = SudokuGame;