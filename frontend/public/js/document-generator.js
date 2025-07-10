class DocumentGenerator {
    constructor(game) {
        this.game = game;
        // Store initial state when generator is created
        this.initialState = this.getInitialState();
        
        // Gemini API Configuration for 2.0 Flash
        this.GEMINI_API_KEY = 'AIzaSyCcY30X95S7sXSlgM8lrgRZ5UykxWQrAn8';
        this.GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash';
        this.API_CONFIG = {
            temperature: 0.4,  // Lower temperature for more focused responses
            topK: 32,
            topP: 0.8,
            maxOutputTokens: 1024,  // Flash model has lower token limit
            candidateCount: 1
        };
    }

    getInitialState() {
        // Get the initial puzzle state (given numbers)
        const initial = [];
        for (let i = 0; i < 9; i++) {
            initial[i] = [];
            for (let j = 0; j < 9; j++) {
                const cell = this.game.grid[i][j];
                initial[i][j] = cell.isFixed ? cell.value : 0;
            }
        }
        return initial;
    }

    async generateSolutionDocument() {
        console.log('Starting document generation...');
        this.initialState = this.getInitialState();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get all moves and statistics
        const moves = this.getActualMoves();
        const stats = this.generateStatistics(moves);
        
        // 1. First page - How to Play
        this.addHowToPlaySection(doc);

        // 2. Step by Step Solution with summary
        await this.addStepByStepSolution(doc, moves, stats);

        // 3. Analysis page
        this.addSolutionStatistics(doc, stats);

        // 4. Final solved puzzle
        this.addFinalPuzzle(doc);
        
        // Restore: let jsPDF handle the download directly
        doc.save(`sudoku-solution-${this.formatDate()}.pdf`);
    }

    getActualMoves() {
        // Get all solution steps from the game
        const allSteps = this.game.allSolutionSteps || [];
        console.log('Total steps found:', allSteps.length);

        // Sort by timestamp to maintain order
        const sortedSteps = [...allSteps].sort((a, b) => {
            if (a.timestamp && b.timestamp) return a.timestamp - b.timestamp;
            return 0;
        });

        // Filter out any invalid or temporary moves
        const validMoves = sortedSteps.filter(move => {
            // Basic validation
            if (!move || typeof move !== 'object') return false;
            if (!move.value || typeof move.row === 'undefined' || typeof move.col === 'undefined') return false;
            if (move.row < 0 || move.row >= 9 || move.col < 0 || move.col >= 9) return false;
            
            // Skip temporary or system-generated moves
            if (move.isTemporary || move.isSystemGenerated) return false;
            
            // Skip if it's a given number in the initial state
            if (this.initialState[move.row][move.col] > 0) return false;

            return true;
        });

        // Group by cell position to get final state (in case of multiple moves in same cell)
        const finalMoves = new Map();
        validMoves.forEach((move, index) => {
            const key = `${move.row}-${move.col}`;
            // Keep the move if it's the first one we've seen for this cell
            // or if it has a later timestamp
            const existing = finalMoves.get(key);
            if (!existing || 
                (move.timestamp && (!existing.timestamp || move.timestamp > existing.timestamp))) {
                finalMoves.set(key, { ...move, sequence: index });
            }
        });

        // Convert back to array and sort by sequence
        const moves = Array.from(finalMoves.values());
        moves.sort((a, b) => a.sequence - b.sequence);

        // Add additional analysis to each move
        moves.forEach(move => {
            // Add related cells
            move.relatedCells = this.getRelatedCells(move.row, move.col);
            
            // Add difficulty if not present
            if (!move.difficulty) {
                move.difficulty = this.getMoveDifficulty(move);
            }

            // Add technique if not present
            if (!move.technique) {
                move.technique = this.getMoveTechnique(move);
            }
        });

        console.log('Final processed moves:', moves.length);
        return moves;
    }

    getRelatedCells(row, col) {
        const related = new Set();
        
        // Add all cells in the same row
        for (let c = 0; c < 9; c++) {
            if (c !== col) {
                related.add(`R${row + 1}C${c + 1}`);
            }
        }
        
        // Add all cells in the same column
        for (let r = 0; r < 9; r++) {
            if (r !== row) {
                related.add(`R${r + 1}C${col + 1}`);
            }
        }
        
        // Add all cells in the same 3x3 box
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

    getMoveTechnique(move) {
        // If technique is already set and valid, use it
        if (move.technique && typeof move.technique === 'string') {
            return move.technique;
        }

        // If strategy is provided, use it
        if (move.strategy && typeof move.strategy === 'string') {
            return move.strategy;
        }

        // Analyze the move to determine the technique
        const grid = this.getCurrentGridState(this.game.allSolutionSteps, move.sequence);
        
        // Check for Naked Single
        if (this.isNakedSingle(move)) {
            return 'Naked Single';
        }
        
        // Check for Hidden Single
        const hiddenSingleType = this.getHiddenSingleType(move, grid);
        if (hiddenSingleType) {
            return hiddenSingleType;
        }
        
        // Check for Pointing Pair/Triple
        if (this.isPointingCombination(move, grid)) {
            return 'Pointing Combination';
        }

        // Check for Box/Line Reduction
        if (this.isBoxLineReduction(move, grid)) {
            return 'Box Line Reduction';
        }

        // Default to Logical Deduction if no specific technique is identified
        return 'Logical Deduction';
    }

    getHiddenSingleType(move, grid) {
        const value = move.value;
        const row = move.row;
        const col = move.col;
        
        // Check row
        let rowCount = 0;
        for (let c = 0; c < 9; c++) {
            if (c !== col && grid[row][c] === 0 && this.canPlaceValue(grid, row, c, value)) {
                rowCount++;
            }
        }
        if (rowCount === 0) return 'Hidden Single Row';

        // Check column
        let colCount = 0;
        for (let r = 0; r < 9; r++) {
            if (r !== row && grid[r][col] === 0 && this.canPlaceValue(grid, r, col, value)) {
                colCount++;
            }
        }
        if (colCount === 0) return 'Hidden Single Column';

        // Check box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        let boxCount = 0;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const currentRow = boxRow + r;
                const currentCol = boxCol + c;
                if ((currentRow !== row || currentCol !== col) && 
                    grid[currentRow][currentCol] === 0 && 
                    this.canPlaceValue(grid, currentRow, currentCol, value)) {
                    boxCount++;
                }
            }
        }
        if (boxCount === 0) return 'Hidden Single Box';

        return null;
    }

    isPointingCombination(move, grid) {
        const value = move.value;
        const boxRow = Math.floor(move.row / 3) * 3;
        const boxCol = Math.floor(move.col / 3) * 3;
        
        // Count possible positions for value in the box
        let positions = [];
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const currentRow = boxRow + r;
                const currentCol = boxCol + c;
                if (grid[currentRow][currentCol] === 0 && 
                    this.canPlaceValue(grid, currentRow, currentCol, value)) {
                    positions.push({row: currentRow, col: currentCol});
                }
            }
        }
        
        // Check if positions align in a row or column
        if (positions.length === 2 || positions.length === 3) {
            const sameRow = positions.every(pos => pos.row === positions[0].row);
            const sameCol = positions.every(pos => pos.col === positions[0].col);
            return sameRow || sameCol;
        }
        
        return false;
    }

    isBoxLineReduction(move, grid) {
        const value = move.value;
        const row = move.row;
        const col = move.col;
        
        // Check if value appears only in one box for the row
        let rowBoxAppearances = new Set();
        for (let c = 0; c < 9; c++) {
            if (grid[row][c] === 0 && this.canPlaceValue(grid, row, c, value)) {
                rowBoxAppearances.add(Math.floor(c / 3));
            }
        }
        if (rowBoxAppearances.size === 1) return true;
        
        // Check if value appears only in one box for the column
        let colBoxAppearances = new Set();
        for (let r = 0; r < 9; r++) {
            if (grid[r][col] === 0 && this.canPlaceValue(grid, r, col, value)) {
                colBoxAppearances.add(Math.floor(r / 3));
            }
        }
        if (colBoxAppearances.size === 1) return true;
        
        return false;
    }

    canPlaceValue(grid, row, col, value) {
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

    getMoveDifficulty(move) {
        // If difficulty is already set and valid, use it
        if (move.difficulty && typeof move.difficulty === 'string') {
            return move.difficulty;
        }
        
        // Determine difficulty based on technique
        const technique = this.getMoveTechnique(move);
        
        switch(technique.toLowerCase()) {
            case 'logical deduction':
                return 'Advanced';
            case 'hidden single':
            case 'hidden single column':
            case 'hidden single row':
            case 'pointing combination':
                return 'Intermediate';
            case 'naked single':
            default:
        return 'Basic';
        }
    }

    isNakedSingle(move) {
        // Check if this is the only possible value for this cell
        const possibilities = this.getPossibleValues(this.getCurrentGridState(this.game.allSolutionSteps, move.sequence), move.row, move.col);
        return possibilities.size === 1;
    }

    generateStatistics(moves) {
        // Initialize counters
        const stats = {
            totalSteps: moves.length,
            difficulty: {
                'Advanced': 0,
                'Basic': 0,
                'Intermediate': 0
            },
            strategy: {}
        };

        // Count each move
        moves.forEach(move => {
            // Skip invalid moves
            if (!move || typeof move.row === 'undefined' || typeof move.col === 'undefined' || !move.value) {
                return;
            }
            
                // Count difficulty
            const difficulty = move.difficulty || 'Basic';
            stats.difficulty[difficulty] = (stats.difficulty[difficulty] || 0) + 1;
            
            // Count strategy/technique
            const technique = this.normalizeTechniqueName(move.technique || 'Logical Deduction');
            stats.strategy[technique] = (stats.strategy[technique] || 0) + 1;
        });

        return stats;
    }

    addHowToPlaySection(doc) {
        // Title
        doc.setFontSize(14);
        doc.text('Sudoku Puzzle Solution', 20, 20);

        // Generation timestamp
        doc.setFontSize(11);
        const timestamp = this.formatDate();
        doc.text(`Generated on ${timestamp}`, 20, 35);

        // Add horizontal line
        doc.setLineWidth(0.5);
        doc.line(20, 40, 190, 40);

        // Description
        doc.setFontSize(11);
        doc.text('This document contains a step-by-step breakdown of the solved Sudoku puzzle, including', 20, 55);
        doc.text('logic used, explanation for each move, and how Sudoku works.', 20, 65);

        // How to Play Title
        doc.setFontSize(14);
        doc.text('How to Play Sudoku', 20, 85);

        // Basic Rule
        doc.setFontSize(11);
        doc.text('Basic Rule: Fill the 9×9 grid with numbers 1-9, ensuring each number appears exactly once', 20, 105);
        doc.text('in every row, column, and 3×3 box.', 20, 115);

        // Solving Techniques Title
        doc.text('Solving Techniques:', 20, 135);

        // 1. Basic Techniques
        doc.text('1. Basic Techniques:', 20, 155);
        doc.text('• Scanning: Check rows, columns, and boxes to find where a number can legally be placed', 30, 170);
        doc.text('• Single Candidate (Naked Single): When only one number can go in a cell', 30, 185);
        doc.text('• Hidden Singles: When a number can only go in one cell within a row, column, or box', 30, 200);

        // 2. Intermediate Techniques
        doc.text('2. Intermediate Techniques:', 20, 220);
        doc.text('• Pointing Pairs/Triples: When a number is restricted to 2-3 cells in a box, aligned in a', 30, 235);
        doc.text('row/column', 30, 245);
        doc.text('• Box/Line Reduction: When a number in a row/column must be in a specific box', 30, 260);
        doc.text('• Hidden Pairs: When two cells in a unit share the same two candidates exclusively', 30, 275);
        doc.text('• Naked Pairs/Triples: When 2-3 cells contain the same 2-3 candidates only', 30, 290);

        // 3. Advanced Techniques
        doc.addPage(); // Start Advanced Techniques on new page to match image
        doc.text('3. Advanced Techniques:', 20, 20);
        doc.text('• X-Wing: When a number appears in exactly two positions in two different rows/columns', 30, 35);
        doc.text('• Swordfish: Similar to X-Wing but with three rows/columns', 30, 50);
        doc.text('• XY-Wing: A pattern involving three cells with specific candidate relationships', 30, 65);
        doc.text('• Remote Pairs: Chain of pairs that can help eliminate candidates', 30, 80);
    }

    async addStepByStepSolution(doc, moves, stats) {
        // Add new page for solution summary
        doc.addPage();

        // Title
        doc.setFontSize(18);
        doc.text('Step-by-Step Solution', 20, 20);
        
        // Add the initial puzzle board
        this.drawInitialPuzzle(doc, 30);

        let currentY = 190;

        // Solution Summary
        doc.setFontSize(14);
        doc.text('Solution Summary:', 20, currentY);
        currentY += 15;


        // Description with proper spacing
        doc.setFontSize(11);
        doc.text('This document contains a step-by-step breakdown of the solved Sudoku puzzle, including', 20, currentY);
        currentY += 10;
        doc.text('logic used, explanation for each move, and how Sudoku works.', 20, currentY);
        currentY += 15;

        // Total Steps
        doc.text(`Total Steps: ${moves.length}`, 20, currentY);
        currentY += 20;

        // Techniques Used section
        doc.setFontSize(14);
        doc.text('Techniques Used:', 20, currentY);
        currentY += 15;


        // Use the same strategy counts as in the statistics page
        const sortedStrategies = Object.entries(stats.strategy)
            .sort((a, b) => b[1] - a[1]);

        // Display techniques with counts and percentages
        doc.setFontSize(11);
        let y = currentY;
        sortedStrategies.forEach(([strategy, count]) => {
            const percent = Math.round((count / moves.length) * 100);
            doc.text(`• ${strategy}: ${count} moves (${percent}%)`, 25, y);
                y += 10;
        });

        // Add page number
        doc.setFontSize(10);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, 105, 285, { align: 'center' });

        // Filter valid moves and ensure they have proper difficulty and technique
        const validMoves = moves.filter(move => {
            if (!move || typeof move.row === 'undefined' || typeof move.col === 'undefined' || !move.value) {
                return false;
            }
            
            // Ensure each move has difficulty and technique
            if (!move.difficulty) {
                move.difficulty = this.getMoveDifficulty(move);
            }
            if (!move.technique) {
                move.technique = this.getMoveTechnique(move);
            }
            
            return true;
        });

        // Add each valid step
        for (let i = 0; i < validMoves.length; i++) {
            const move = validMoves[i];

            // Start a new page for each step
                doc.addPage();

            // Add step header
            doc.setFontSize(14);
            doc.text(`Step ${i + 1}`, 20, 30);

            let currentY = 45;
            const marginX = 20;
            const pageWidth = 170;
            const minBoxHeight = 50;
            const boxPadding = 15;
            const pageHeight = 270; // Maximum Y position before needing a new page
            const headerHeight = 25; // Height needed for section header and spacing

            // Move Details section with box
            doc.setFillColor(245, 245, 245);
            const moveDetailsHeight = 100;
            doc.rect(marginX, currentY, pageWidth, moveDetailsHeight, 'F');
            doc.setDrawColor(200, 200, 200);
            doc.rect(marginX, currentY, pageWidth, moveDetailsHeight);

            doc.setFontSize(12);
            doc.text('Move Details', marginX + 5, currentY + 15);
            doc.setFontSize(11);
            doc.text(`Location: Row ${move.row + 1}, Column ${move.col + 1} (Box ${Math.floor(move.row / 3) * 3 + Math.floor(move.col / 3) + 1})`, marginX + 10, currentY + 30);
            doc.text(`Value Placed: ${move.value}`, marginX + 10, currentY + 45);
            doc.text(`Technique: ${move.technique}`, marginX + 10, currentY + 60);
            doc.text(`Difficulty: ${move.difficulty}`, marginX + 10, currentY + 75);

            // Draw 3x3 grid visualization
            this.draw3x3Grid(doc, move, currentY + 20, 120);

            currentY += moveDetailsHeight + 15;

            // Function to add a section with proper page break handling
            const addSection = (title, text, startY) => {
                let y = startY;
                
                // Add section header
                    doc.setFontSize(14);
                doc.text(title, marginX, y);
                y += 20;

                // Calculate box dimensions
            doc.setFontSize(11);
                const textWidth = pageWidth - 40; // 20px padding on each side
                const wrappedLines = doc.splitTextToSize(text, textWidth);
                const lineHeight = 8;
                const contentHeight = Math.max(minBoxHeight, wrappedLines.length * lineHeight + 30); // 15px padding top and bottom

            // Check if we need a new page
                if (y + contentHeight > pageHeight) {
                doc.addPage();
                    y = 20;
                    // Redraw header on new page
            doc.setFontSize(14);
                    doc.text(title, marginX, y);
                    y += 20;
                }

                // Draw box
            doc.setFillColor(245, 245, 245);
                doc.rect(marginX, y, pageWidth, contentHeight, 'F');
            doc.setDrawColor(200, 200, 200);
                doc.rect(marginX, y, pageWidth, contentHeight);

                // Add text
            doc.setFontSize(11);
                wrappedLines.forEach((line, index) => {
                    doc.text(line, marginX + 20, y + 20 + (index * lineHeight));
                });

                return y + contentHeight + 15;
            };

            // Get move analysis with proper technique identification
            const currentGrid = this.getCurrentGridState(moves, i);
            const possibleMoves = this.getPossibleMoves(currentGrid);
            const analysis = await this.generateMoveAnalysis(move, currentGrid, possibleMoves);

            // Add Move Explanation section
            currentY = addSection(
                'Move Explanation',
                analysis.moveExplanation,
                currentY
            );

            // Add Technique Details section (only once)
            currentY = addSection(
                'Technique Details',
                analysis.techniqueExplanation,
                currentY
            );

        // Add page number
        doc.setFontSize(10);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, 105, 285, { align: 'center' });
        }
    }

    addSolutionStatistics(doc, stats) {
        // Add new page for statistics
        doc.addPage();

        // Title
        doc.setFontSize(18);
        doc.text('Solution Statistics', 20, 20);

        // Difficulty Distribution
        doc.setFontSize(14);
        doc.text('Difficulty Distribution:', 20, 40);

        // Calculate total moves for percentages
        const totalMoves = stats.totalSteps;
        
        // Display difficulty stats with counts and percentages
        doc.setFontSize(11);
        let y = 60;
        
        // Sort difficulties by level (Basic -> Intermediate -> Advanced)
        const difficultyOrder = ['Basic', 'Intermediate', 'Advanced'];
        difficultyOrder.forEach(level => {
            const count = stats.difficulty[level] || 0;
            if (count > 0) {
                const percent = Math.round((count / totalMoves) * 100);
                doc.text(`• ${level}: ${count} moves (${percent}%)`, 25, y);
                y += 15;
            }
        });

        // Strategy Distribution
        y += 10;
        doc.setFontSize(14);
        doc.text('Strategy Distribution:', 20, y);
        y += 20;

        // Sort strategies by usage (most used first)
        const sortedStrategies = Object.entries(stats.strategy)
            .sort((a, b) => b[1] - a[1]);

        // Display strategies
                doc.setFontSize(11);
        sortedStrategies.forEach(([strategy, count]) => {
            const percent = Math.round((count / totalMoves) * 100);
            doc.text(`• ${strategy}: ${count} moves (${percent}%)`, 25, y);
                y += 15;
        });

        // Add page number
        doc.setFontSize(10);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, 105, 285, { align: 'center' });
    }

    draw3x3Grid(doc, move, y, x) {
        const cellSize = 20;  // Increased cell size
        const gridSize = cellSize * 3;
        
        // Draw outer box with thicker border
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.rect(x, y, gridSize, gridSize);

        // Draw grid lines
        for (let i = 1; i < 3; i++) {
            // Horizontal lines
            doc.line(x, y + (i * cellSize), x + gridSize, y + (i * cellSize));
            // Vertical lines
            doc.line(x + (i * cellSize), y, x + (i * cellSize), y + gridSize);
        }

        // Calculate box position
        const boxRow = Math.floor(move.row / 3) * 3;
        const boxCol = Math.floor(move.col / 3) * 3;

        // Fill cells
        doc.setFontSize(14);  // Larger font for numbers
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const cellX = x + (j * cellSize);
                const cellY = y + (i * cellSize);
                const gridValue = this.game.grid[boxRow + i]?.[boxCol + j]?.value;

                // Highlight current move cell
                if (boxRow + i === move.row && boxCol + j === move.col) {
                    doc.setFillColor(200, 255, 200);  // Light green for current move
                    doc.rect(cellX, cellY, cellSize, cellSize, 'F');
                }

                // Add number if it exists
                if (gridValue) {
                    doc.text(
                        gridValue.toString(),
                        cellX + (cellSize / 2),
                        cellY + (cellSize / 2) + 2,
                        { align: 'center' }
                    );
                }
            }
        }
        
        // Add legend
        doc.setFontSize(8);
        doc.setFillColor(200, 255, 200);
        doc.rect(x, y + gridSize + 5, 8, 8, 'F');
        doc.text('Current Move', x + 12, y + gridSize + 11);
    }

    addFinalPuzzle(doc) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Final Solved Puzzle', 20, 20);
        
        const cellSize = 20;
        const gridSize = cellSize * 9;
        const startX = 20;
        const startY = 40;

        // Draw thin grid lines first
        doc.setLineWidth(0.2);
        doc.setDrawColor(0);
        
        // Draw thin horizontal lines
        for (let i = 0; i <= 9; i++) {
            if (i % 3 !== 0) {  // Skip where we'll draw thick lines
                doc.line(startX, startY + (i * cellSize), startX + gridSize, startY + (i * cellSize));
            }
        }
        
        // Draw thin vertical lines
        for (let i = 0; i <= 9; i++) {
            if (i % 3 !== 0) {  // Skip where we'll draw thick lines
                doc.line(startX + (i * cellSize), startY, startX + (i * cellSize), startY + gridSize);
            }
        }

        // Draw thick box borders
        doc.setLineWidth(1.5);
        
        // Draw thick outer border
        doc.rect(startX, startY, gridSize, gridSize);
        
        // Draw thick horizontal lines for 3x3 boxes
        for (let i = 3; i <= 6; i += 3) {
            doc.line(startX, startY + (i * cellSize), startX + gridSize, startY + (i * cellSize));
        }
        
        // Draw thick vertical lines for 3x3 boxes
        for (let i = 3; i <= 6; i += 3) {
            doc.line(startX + (i * cellSize), startY, startX + (i * cellSize), startY + gridSize);
        }

        // Fill in numbers
        doc.setFontSize(12);
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const value = this.game.grid[i][j].value;
                if (value) {
                    const x = startX + (j * cellSize) + (cellSize / 2);
                    const y = startY + (i * cellSize) + (cellSize / 2) + 2;
                    
                    // Use blue for non-fixed numbers
                    if (!this.game.grid[i][j].isFixed) {
                        doc.setTextColor(0, 0, 255);
                    } else {
                        doc.setTextColor(0);
                    }
                    
                    doc.text(value.toString(), x, y, { align: 'center' });
                }
            }
        }
        
        // Reset text color
        doc.setTextColor(0);
    }

    formatDate() {
        const now = new Date();
        return now.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/[/:]/g, '-');
    }

    normalizeTechniqueName(technique) {
        if (!technique) return 'Logical Deduction';
        
        // Convert to title case and handle special cases
        return technique
            .toLowerCase()
            .split(/[_\s]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .replace(/\s*\(.*?\)\s*/g, ''); // Remove any parenthetical text
    }

    getTechniqueExplanation(technique) {
        const explanations = {
            'naked_single': 'Only one number can be placed in this cell as all other numbers are eliminated by the existing numbers in the row, column, and box.',
            'hidden_single_column': 'This number can only go in this cell within its column because all other cells in the column cannot contain this number due to existing constraints.',
            'hidden_single_row': 'This number can only go in this cell within its row because all other cells in the row cannot contain this number due to existing constraints.',
            'pointing_combination': 'A pattern where a number is restricted to specific cells in a box, forming a pointing pair or triple that eliminates possibilities in the connected row or column.',
            'logical_deduction': 'Using advanced logical reasoning to determine the correct number based on the relationships between different cells and existing patterns.',
            'player_move': 'A move made by the player based on their analysis of the puzzle state.'
        };
        return explanations[technique?.toLowerCase()] || 'Using logical deduction to place the number based on available information.';
    }

    getMoveAssessment(move) {
        if (move.isBestMove) {
            return `This was the optimal move at this stage because ${move.reason || 'it was the most constrained cell with the fewest possibilities'}.`;
        } else if (move.betterMove) {
            return `While this move is valid, a better option would have been ${move.betterMove}. ${move.betterMoveReason || ''}`;
        } else {
            return `This move follows the chosen strategy and helps progress toward the solution.`;
        }
    }

    async generateMoveAnalysis(move, currentGrid, possibleMoves) {
        const boxNumber = Math.floor(move.row / 3) * 3 + Math.floor(move.col / 3) + 1;
        const technique = move.technique || this.getMoveTechnique(move);
        
        let moveExplanation = '';
        let techniqueExplanation = '';
        
        switch (technique.toLowerCase().replace(/\s+/g, '_')) {
            case 'naked_single':
                moveExplanation = `The cell at Row ${move.row + 1}, Column ${move.col + 1} has ${move.value} as the only possible value. This is because all other numbers (1-9) are already present in either the same row, column, or 3x3 box (Box ${boxNumber}). By analyzing the constraints, we can see that this is the only valid choice for this cell.`;
                techniqueExplanation = `A Naked Single occurs when a cell has only one possible candidate value remaining. This happens when all other numbers from 1 to 9 are already present in the same row, column, or 3x3 block as that cell. This is one of the most basic and commonly used techniques in Sudoku solving.`;
                break;
                
            case 'hidden_single_row':
            case 'hidden_single':
                moveExplanation = `In Row ${move.row + 1}, the value ${move.value} can only be placed in Column ${move.col + 1}. While this cell might have other candidate values, ${move.value} cannot go anywhere else in Row ${move.row + 1}.`;
                techniqueExplanation = `A Hidden Single occurs when a number can only be placed in one cell within a unit (row, column, or box), even though that cell might have other possible values. This technique requires looking at each number's possible positions within the unit to identify where it must be placed.`;
                break;
                
            case 'hidden_single_column':
                moveExplanation = `In Column ${move.col + 1}, the value ${move.value} can only be placed in Row ${move.row + 1}. While this cell might have other candidate values, ${move.value} cannot go anywhere else in Column ${move.col + 1}.`;
                techniqueExplanation = `A Hidden Single in a column occurs when a number can only be placed in one cell within that column, even though that cell might have other possible values. This technique requires looking at each number's possible positions within the column.`;
                    break;
                
            case 'hidden_single_box':
                moveExplanation = `In Box ${boxNumber}, the value ${move.value} can only be placed at Row ${move.row + 1}, Column ${move.col + 1}. While this cell might have other candidate values, ${move.value} cannot go anywhere else in this 3x3 box.`;
                techniqueExplanation = `A Hidden Single in a box occurs when a number can only be placed in one cell within a 3x3 box, even though that cell might have other possible values. This technique requires looking at each number's possible positions within the box.`;
                break;
                
            case 'pointing_combination':
            case 'pointing_pair':
            case 'pointing_triple':
                moveExplanation = `The value ${move.value} in Box ${boxNumber} can only appear in cells that align in a single row or column. This creates a powerful elimination pattern that affects cells outside the box.`;
                techniqueExplanation = `A Pointing Combination occurs when the possible positions for a number within a 3x3 box are restricted to a single row or column. This creates a strong constraint that eliminates that number as a possibility from other cells in the same row or column outside the box.`;
                break;
                
            case 'box_line_reduction':
                moveExplanation = `The value ${move.value} in Row ${move.row + 1} or Column ${move.col + 1} is restricted to appear only within Box ${boxNumber}. This creates a powerful elimination pattern.`;
                techniqueExplanation = `Box Line Reduction occurs when all possible positions for a number in a row or column are restricted to a single 3x3 box. This means the number must appear in one of those positions, eliminating it as a possibility from other cells in the same box.`;
                break;
                
            case 'logical_deduction':
            default:
                moveExplanation = `Placing ${move.value} in Row ${move.row + 1}, Column ${move.col + 1} follows from careful analysis of the puzzle state and the constraints created by existing numbers.`;
                techniqueExplanation = `This move uses logical deduction based on the current state of the puzzle and the fundamental rules of Sudoku. By analyzing the relationships between different cells and their candidates, we can determine where numbers must be placed.`;
        }

        return {
            moveExplanation,
            techniqueExplanation
        };
    }

    wrapText(doc, text, x, y, maxWidth) {
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line, i) => {
            doc.text(line, x, y + (i * 10));
        });
    }

    formatBetterMove(betterMove) {
        if (!betterMove) return '';
        return `Place ${betterMove.value} at Row ${betterMove.row + 1}, Column ${betterMove.col + 1}. ${betterMove.reason}`;
    }

    getCurrentGridState(moves, currentIndex) {
        // Create a grid state up to the current move
        const grid = Array(9).fill().map(() => Array(9).fill(0));
        
        // Apply initial state
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.initialState[i][j] > 0) {
                    grid[i][j] = this.initialState[i][j];
                }
            }
        }

        // Apply all moves up to current index
        for (let i = 0; i < currentIndex; i++) {
            const move = moves[i];
            grid[move.row][move.col] = move.value;
        }

        return grid;
    }

    getPossibleMoves(grid) {
        const moves = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    const possibilities = this.getPossibleValues(grid, row, col);
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

    getPossibleValues(grid, row, col) {
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

    async callGeminiAPI(prompt) {
        try {
            console.log('Calling Gemini 2.0 Flash API with prompt:', prompt);
            
            const requestBody = {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: this.API_CONFIG
            };

            console.log('Request body:', JSON.stringify(requestBody, null, 2));
            
            const response = await fetch(`${this.GEMINI_API_URL}:generateContent?key=${this.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('API Error Details:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData,
                    url: `${this.GEMINI_API_URL}:generateContent`,
                    requestBody: requestBody
                });
                throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorData}`);
            }

            const data = await response.json();
            console.log('API Response:', data);

            if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
                console.error('Invalid API Response Format:', data);
                throw new Error('Invalid response format from API');
            }

            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            throw error;
        }
    }

    drawInitialPuzzle(doc, startY) {
        doc.setFontSize(14);
        doc.text('Initial Puzzle', 20, startY);
        
        const cellSize = 15;
        const gridSize = cellSize * 9;
        const startX = (210 - gridSize) / 2; // Center on A4
        const yPos = startY + 10;

        // Draw thin grid lines first
        doc.setLineWidth(0.2);
        doc.setDrawColor(0);
        
        for (let i = 0; i <= 9; i++) {
            if (i % 3 !== 0) {
                doc.line(startX, yPos + (i * cellSize), startX + gridSize, yPos + (i * cellSize));
                doc.line(startX + (i * cellSize), yPos, startX + (i * cellSize), yPos + gridSize);
            }
        }

        // Draw thick box borders
        doc.setLineWidth(1);
        for (let i = 0; i <= 9; i++) {
            if (i % 3 === 0) {
                doc.line(startX, yPos + (i * cellSize), startX + gridSize, yPos + (i * cellSize));
                doc.line(startX + (i * cellSize), yPos, startX + (i * cellSize), yPos + gridSize);
            }
        }

        // Fill in numbers
        doc.setFontSize(10);
        doc.setTextColor(0);
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const value = this.initialState[i][j];
                if (value) {
                    const x = startX + (j * cellSize) + (cellSize / 2);
                    const y = yPos + (i * cellSize) + (cellSize / 2) + 3;
                    doc.text(value.toString(), x, y, { align: 'center' });
                }
            }
        }
    }
} 