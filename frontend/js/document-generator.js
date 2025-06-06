class DocumentGenerator {
    constructor(game) {
        this.game = game;
        // Store initial state when generator is created
        this.initialState = this.getInitialState();
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
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get all moves and statistics
        const moves = this.getActualMoves();
        const stats = this.generateStatistics(moves);
        
        // Generate each section in the new order
        this.addHowToPlaySection(doc);                  // First page with how to play
        this.addStepByStepSolution(doc, moves, stats);  // Steps with summary
        this.addFinalPuzzle(doc);                      // Final puzzle at the end
        
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

    getMoveDifficulty(move) {
        if (move.technique === 'Logical Deduction') return 'Advanced';
        if (move.technique === 'Hidden Single' || move.technique === 'Pointing Combination') return 'Intermediate';
        return 'Basic';
    }

    getMoveTechnique(move) {
        if (move.strategy === 'Player Move') return 'Logical Deduction';
        if (move.type === 'hint') return 'Hidden Single';
        return 'Naked Single';
    }

    generateStatistics(moves) {
        const stats = {
            difficulty: {
                'Advanced': 0,
                'Intermediate': 0,
                'Basic': 0
            },
            strategy: {
                'Logical Deduction': 0,
                'Naked Single': 0,
                'Hidden Single (Column)': 0,
                'Hidden Single (Row)': 0,
                'Pointing Combination': 0
            },
            totalSteps: moves.length
        };

        moves.forEach(move => {
            // Count difficulty
            if (move.difficulty) {
                stats.difficulty[move.difficulty]++;
            } else {
                stats.difficulty['Basic']++;
            }

            // Count strategy
            if (move.technique) {
                stats.strategy[move.technique] = (stats.strategy[move.technique] || 0) + 1;
            }
        });

        return stats;
    }

    addHowToPlaySection(doc) {
        // Title
        doc.setFontSize(18);
        doc.text('Sudoku Puzzle Solution', 20, 20);

        // Generation timestamp
        doc.setFontSize(10);
        doc.text(`Generated on ${this.formatDate()}`, 20, 30);

        // Introduction
        doc.setFontSize(11);
        doc.text('This document contains a step-by-step breakdown of the solved Sudoku puzzle, including', 20, 45);
        doc.text('logic used, explanation for each move, and how Sudoku works.', 20, 52);

        // How to Play Section
        doc.setFontSize(14);
        doc.text('How to Play Sudoku', 20, 70);

        // Basic Rule
        doc.setFontSize(11);
        doc.text('Basic Rule: Fill the 9×9 grid with numbers 1-9, ensuring each number appears exactly once', 20, 85);
        doc.text('in every row, column, and 3×3 box.', 20, 92);

        // Solving Techniques Section
        doc.text('Solving Techniques:', 20, 110);

        // 1. Basic Techniques
        doc.setFontSize(12);
        doc.text('1. Basic Techniques:', 20, 125);
        doc.setFontSize(11);
        const basicTechniques = [
            '• Scanning: Check rows, columns, and boxes to find where a number can legally be placed',
            '• Single Candidate (Naked Single): When only one number can go in a cell',
            '• Hidden Singles: When a number can only go in one cell within a row, column, or box'
        ];
        let y = 135;
        basicTechniques.forEach(technique => {
            const lines = doc.splitTextToSize(technique, 170);
            lines.forEach(line => {
                doc.text(line, 20, y);
                y += 7;
            });
        });

        // 2. Intermediate Techniques
        doc.setFontSize(12);
        doc.text('2. Intermediate Techniques:', 20, y + 5);
        doc.setFontSize(11);
        const intermediateTechniques = [
            '• Pointing Pairs/Triples: When a number is restricted to 2-3 cells in a box, aligned in a',
            '  row/column',
            '• Box/Line Reduction: When a number in a row/column must be in a specific box',
            '• Hidden Pairs: When two cells in a unit share the same two candidates exclusively',
            '• Naked Pairs/Triples: When 2-3 cells contain the same 2-3 candidates only'
        ];
        y += 15;
        intermediateTechniques.forEach(technique => {
            const lines = doc.splitTextToSize(technique, 170);
            lines.forEach(line => {
                doc.text(line, 20, y);
                y += 7;
            });
        });

        // 3. Advanced Techniques
        doc.setFontSize(12);
        doc.text('3. Advanced Techniques:', 20, y + 5);
        doc.setFontSize(11);
        const advancedTechniques = [
            '• X-Wing: When a number appears in exactly two positions in two different rows/columns',
            '• Swordfish: Similar to X-Wing but with three rows/columns',
            '• XY-Wing: A pattern involving three cells with specific candidate relationships',
            '• Remote Pairs: Chain of pairs that can help eliminate candidates'
        ];
        y += 15;
        advancedTechniques.forEach(technique => {
            const lines = doc.splitTextToSize(technique, 170);
            lines.forEach(line => {
                doc.text(line, 20, y);
                y += 7;
            });
        });

        // Add page break
        doc.addPage();
    }

    addStepByStepSolution(doc, moves, stats) {
        // Title
        doc.setFontSize(16);
        doc.text('Step-by-Step Solution', 20, 20);

        // Solution Summary
        doc.setFontSize(12);
        doc.text('Solution Summary:', 20, 35);
        doc.text(`Total Steps: ${stats.totalSteps}`, 25, 45);
        
        doc.text('Techniques Used:', 25, 55);
        let y = 65;
        Object.entries(stats.strategy).forEach(([strategy, count]) => {
            doc.text(`• ${strategy}: ${count} times`, 30, y);
            y += 7;
        });
            
        y += 10;
        doc.text('Detailed Steps:', 20, y);
        y += 10;

        // Add each step
        moves.forEach((move, index) => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }

            // Grey background for step
            doc.setFillColor(240, 240, 240);
            doc.rect(20, y, 170, 80, 'F');

            // Step header
            doc.setFontSize(12);
            doc.text(`Step ${index + 1}`, 25, y + 10);

            // Location and value
            doc.text(`Location: Row ${move.row + 1}, Column ${move.col + 1} (Box ${Math.floor(move.row / 3) * 3 + Math.floor(move.col / 3) + 1})`, 25, y + 20);
            doc.text(`Value Placed: ${move.value}`, 25, y + 30);
            doc.text(`Strategy: ${move.technique || 'Logical Deduction'} (${move.difficulty || 'Advanced'})`, 25, y + 40);

            // Reasoning
            doc.text('Reasoning:', 25, y + 50);
            doc.setFontSize(10);
            doc.text('Place 3 based on remaining possibilities and elimination', 30, y + 57);

            // Draw 3x3 grid visualization
            this.draw3x3Grid(doc, move, y + 15, 120);

            // Related cells
            doc.setFontSize(10);
            doc.text('Related cells: ' + move.relatedCells.join(', '), 25, y + 70, {
                maxWidth: 160
            });

            y += 90;
        });
    }

    draw3x3Grid(doc, move, y, x) {
        const cellSize = 15;
        const gridSize = cellSize * 3;

        // Draw outer box
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.rect(x, y, gridSize, gridSize);

        // Draw grid lines
        for (let i = 1; i < 3; i++) {
            doc.line(x + (i * cellSize), y, x + (i * cellSize), y + gridSize);
            doc.line(x, y + (i * cellSize), x + gridSize, y + (i * cellSize));
        }

        // Calculate box position
        const boxRow = Math.floor(move.row / 3) * 3;
        const boxCol = Math.floor(move.col / 3) * 3;

        // Fill cells
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const cellX = x + (j * cellSize);
                const cellY = y + (i * cellSize);
                const value = this.game.grid[boxRow + i][boxCol + j].value;

                // Highlight current move cell
                if (boxRow + i === move.row && boxCol + j === move.col) {
                    doc.setFillColor(200, 255, 200);
                    doc.rect(cellX, cellY, cellSize, cellSize, 'F');
                }

                // Add number
                if (value) {
                    doc.setFontSize(12);
                    doc.text(
                        value.toString(),
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
        doc.rect(x + gridSize + 5, y, 5, 5, 'F');
        doc.text('Current Move', x + gridSize + 12, y + 4);
        doc.setFillColor(255, 255, 200);
        doc.rect(x + gridSize + 5, y + 8, 5, 5, 'F');
        doc.text('Related Cells', x + gridSize + 12, y + 12);
    }

    addFinalPuzzle(doc) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Final Solved Puzzle', 20, 20);
        
        const cellSize = 20;
        const gridSize = cellSize * 9;
        const startX = 20;
        const startY = 40;

        // Draw main grid
        doc.setLineWidth(0.5);
        doc.rect(startX, startY, gridSize, gridSize);

        // Draw 3x3 box borders
        doc.setLineWidth(1);
        for (let i = 0; i <= 9; i += 3) {
            doc.line(startX + (i * cellSize), startY, startX + (i * cellSize), startY + gridSize);
            doc.line(startX, startY + (i * cellSize), startX + gridSize, startY + (i * cellSize));
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
} 