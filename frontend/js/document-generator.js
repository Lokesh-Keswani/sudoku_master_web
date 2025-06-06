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
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get all moves and statistics
        const moves = this.getActualMoves();
        const stats = this.generateStatistics(moves);
        
        // Generate each section in the correct order
        this.addHowToPlaySection(doc);                  // First page with how to play
        await this.addStepByStepSolution(doc, moves);   // Steps with detailed analysis
        this.addSolutionStatistics(doc, stats);         // Statistics before final puzzle
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
        // Initialize counters
        let totalValidSteps = 0;
        const stats = {
            totalSteps: 0,
            difficulty: {
                'Advanced': 0,
                'Basic': 0,
                'Intermediate': 0
            },
            strategy: {
                'Logical Deduction': 0,
                'Naked Single': 0,
                'Hidden Single Column': 0,
                'Hidden Single Row': 0,
                'Pointing Combination': 0
            }
        };

        moves.forEach(move => {
            // Get the technique and normalize it
            const technique = (move.technique || '').toLowerCase();
            const difficulty = (move.difficulty || '').toLowerCase();
            
            // Only count valid moves
            if (move.value && typeof move.row === 'number' && typeof move.col === 'number') {
                // Count difficulty
                if (difficulty.includes('advanced')) {
                    stats.difficulty['Advanced']++;
                } else if (difficulty.includes('intermediate')) {
                    stats.difficulty['Intermediate']++;
                } else {
                    stats.difficulty['Basic']++;
                }
                
                // Map the techniques to our categories
                if (technique === 'naked_single') {
                    stats.strategy['Naked Single']++;
                    totalValidSteps++;
                } else if (technique === 'hidden_single_column') {
                    stats.strategy['Hidden Single Column']++;
                    totalValidSteps++;
                } else if (technique === 'hidden_single_row') {
                    stats.strategy['Hidden Single Row']++;
                    totalValidSteps++;
                } else if (technique === 'pointing_combination') {
                    stats.strategy['Pointing Combination']++;
                    totalValidSteps++;
                } else if (technique === 'logical_deduction' || technique === 'player_move') {
                    stats.strategy['Logical Deduction']++;
                    totalValidSteps++;
                }
            }
        });

        // Set the total steps
        stats.totalSteps = totalValidSteps;
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

    async addStepByStepSolution(doc, moves) {
        // Title for the section
        doc.setFontSize(16);
        doc.text('Step-by-Step Solution', 20, 20);

        // Filter valid moves
        const validMoves = moves.filter(move => {
            const technique = (move.technique || '').toLowerCase();
            return (
                move.value && 
                typeof move.row === 'number' && 
                typeof move.col === 'number' &&
                (
                    technique === 'naked_single' ||
                    technique === 'hidden_single_column' ||
                    technique === 'hidden_single_row' ||
                    technique === 'pointing_combination' ||
                    technique === 'logical_deduction' ||
                    technique === 'player_move'
                )
            );
        });

        // Add each valid step on a new page
        for (let i = 0; i < validMoves.length; i++) {
            const move = validMoves[i];
            
            // Get move analysis from Gemini
            const currentGrid = this.getCurrentGridState(moves, i);
            const possibleMoves = this.getPossibleMoves(currentGrid);
            const analysis = await this.generateMoveAnalysis(move, currentGrid, possibleMoves);

            // Start a new page for each step
            if (i > 0) {
                doc.addPage();
            }

            // Add page header
            doc.setFontSize(18);
            doc.text(`Step ${i + 1}`, 20, 30);

            let currentY = 45;  // Starting Y position
            const marginX = 20;  // Left margin
            const pageWidth = 170;  // Width of content area
            const minBoxHeight = 50;  // Minimum height of boxes
            const boxPadding = 15;  // Padding inside boxes

            // Move Details section with box
            doc.setFillColor(245, 245, 245);
            const moveDetailsHeight = 100;  // Fixed height for move details
            doc.rect(marginX, currentY, pageWidth, moveDetailsHeight, 'F');
            doc.setDrawColor(200, 200, 200);
            doc.rect(marginX, currentY, pageWidth, moveDetailsHeight);

            doc.setFontSize(14);
            doc.text('Move Details', marginX + 5, currentY + 15);
            doc.setFontSize(11);
            doc.text(`Location: Row ${move.row + 1}, Column ${move.col + 1} (Box ${Math.floor(move.row / 3) * 3 + Math.floor(move.col / 3) + 1})`, marginX + 10, currentY + 30);
            doc.text(`Value Placed: ${move.value}`, marginX + 10, currentY + 45);
            doc.text(`Technique Used: ${this.formatTechniqueName(move.technique)}`, marginX + 10, currentY + 60);

            // Draw 3x3 grid on the right side of move details
            this.draw3x3Grid(doc, move, currentY + 20, 120);

            currentY += moveDetailsHeight + 15;  // Update Y position with spacing

            // Move Explanation section
            const moveExplanationLines = doc.splitTextToSize(analysis.moveExplanation, pageWidth - 20);
            const moveExplanationHeight = Math.max(minBoxHeight, (moveExplanationLines.length * 7) + boxPadding * 2);

                    // Check if we need a new page
            if (currentY + moveExplanationHeight > 270) {
                        doc.addPage();
                currentY = 20;
            }

            doc.setFillColor(245, 245, 245);
            doc.rect(marginX, currentY, pageWidth, moveExplanationHeight, 'F');
            doc.setDrawColor(200, 200, 200);
            doc.rect(marginX, currentY, pageWidth, moveExplanationHeight);

                    doc.setFontSize(14);
            doc.text('Move Explanation', marginX + 5, currentY + 15);
            doc.setFontSize(11);
            moveExplanationLines.forEach((line, index) => {
                doc.text(line, marginX + 5, currentY + 30 + (index * 7));
            });

            currentY += moveExplanationHeight + 15;

            // Technique Details section
            const techniqueLines = doc.splitTextToSize(analysis.techniqueExplanation, pageWidth - 20);
            const techniqueHeight = Math.max(minBoxHeight, (techniqueLines.length * 7) + boxPadding * 2);

            // Check if we need a new page
            if (currentY + techniqueHeight > 270) {
                doc.addPage();
                currentY = 20;
            }

            doc.setFillColor(245, 245, 245);
            doc.rect(marginX, currentY, pageWidth, techniqueHeight, 'F');
            doc.setDrawColor(200, 200, 200);
            doc.rect(marginX, currentY, pageWidth, techniqueHeight);

            doc.setFontSize(14);
            doc.text('Technique Details', marginX + 5, currentY + 15);
            doc.setFontSize(11);
            techniqueLines.forEach((line, index) => {
                doc.text(line, marginX + 5, currentY + 30 + (index * 7));
            });

            currentY += techniqueHeight + 15;

            // Move Assessment section
            const assessmentLines = doc.splitTextToSize(analysis.moveAssessment.explanation, pageWidth - 20);
            let assessmentHeight = Math.max(minBoxHeight, (assessmentLines.length * 7) + boxPadding * 2);
            
            if (!analysis.moveAssessment.isOptimal && analysis.moveAssessment.betterMove) {
                assessmentHeight += 60;  // Extra space for better move visualization
            }

            // Check if we need a new page
            if (currentY + assessmentHeight > 270) {
                doc.addPage();
                currentY = 20;
            }

            doc.setFillColor(245, 245, 245);
            doc.rect(marginX, currentY, pageWidth, assessmentHeight, 'F');
            doc.setDrawColor(200, 200, 200);
            doc.rect(marginX, currentY, pageWidth, assessmentHeight);

            doc.setFontSize(14);
            doc.text('Move Assessment', marginX + 5, currentY + 15);
            doc.setFontSize(11);
            assessmentLines.forEach((line, index) => {
                doc.text(line, marginX + 5, currentY + 30 + (index * 7));
            });

            if (!analysis.moveAssessment.isOptimal && analysis.moveAssessment.betterMove) {
                const betterMove = analysis.moveAssessment.betterMove;
                const betterMoveY = currentY + 30 + (assessmentLines.length * 7);
                this.draw3x3Grid(doc, betterMove, betterMoveY, 120);
            }

            currentY += assessmentHeight + 15;

            // Related Cells section
            const relatedCellsText = doc.splitTextToSize(`Related Cells: ${move.relatedCells.join(', ')}`, pageWidth - 20);
            const relatedCellsHeight = Math.max(minBoxHeight, (relatedCellsText.length * 7) + boxPadding * 2);

            // Check if we need a new page
            if (currentY + relatedCellsHeight > 270) {
                doc.addPage();
                currentY = 20;
            }

            doc.setFillColor(245, 245, 245);
            doc.rect(marginX, currentY, pageWidth, relatedCellsHeight, 'F');
            doc.setDrawColor(200, 200, 200);
            doc.rect(marginX, currentY, pageWidth, relatedCellsHeight);

            doc.setFontSize(14);
            doc.text('Related Cells', marginX + 5, currentY + 15);
            doc.setFontSize(11);
            relatedCellsText.forEach((line, index) => {
                doc.text(line, marginX + 5, currentY + 30 + (index * 7));
            });

            // Add page number at the bottom
            doc.setFontSize(10);
            doc.text(`Page ${doc.internal.getNumberOfPages()}`, 105, 285, { align: 'center' });
        }
    }

    addSolutionStatistics(doc, stats) {
        // Add new page for statistics
        doc.addPage();

        // Title
        doc.setFontSize(16);
        doc.text('Solution Statistics', 20, 30);

        // Difficulty Distribution section
        doc.setFontSize(14);
        doc.text('Difficulty Distribution:', 20, 50);
        
        let y = 70;
        
        // Format difficulty stats with proper counts and percentages
        const difficulties = [
            ['Advanced', stats.difficulty['Advanced']],
            ['Intermediate', stats.difficulty['Intermediate']],
            ['Basic', stats.difficulty['Basic']]
        ];

        difficulties.forEach(([level, count]) => {
            if (count > 0) {
                const percentage = Math.round((count / stats.totalSteps) * 100);
                doc.setFontSize(11);
                doc.text(`• ${level}: ${count} moves (${percentage}%)`, 25, y);
                y += 15;
            }
        });

        // Strategy Distribution section
        y += 10;
        doc.setFontSize(14);
        doc.text('Strategy Distribution:', 20, y);
        y += 20;

        // Format strategy stats with counts
        const strategies = [
            ['Naked Single', stats.strategy['Naked Single']],
            ['Hidden Single Column', stats.strategy['Hidden Single Column']],
            ['Hidden Single Row', stats.strategy['Hidden Single Row']],
            ['Pointing Combination', stats.strategy['Pointing Combination']],
            ['Logical Deduction', stats.strategy['Logical Deduction']]
        ];

        strategies.forEach(([strategy, count]) => {
            if (count > 0) {
                doc.setFontSize(11);
                doc.text(`• ${strategy}: ${count} times`, 25, y);
                y += 15;
            }
        });

        // Add Technique Details section
        y += 10;
        doc.setFontSize(14);
        doc.text('Technique Details', 20, y);
        y += 20;

        // Add technique explanations
        doc.setFontSize(11);
        const techniques = {
            'Naked Single': 'A naked single occurs when a cell in the Sudoku grid has only one possible value that can be placed in it. This happens when all other numbers from 1 to 9 are already present in the same row, column, or 3x3 block as the cell in question. The remaining value is the only valid candidate for that cell.',
            'Hidden Single': 'A hidden single occurs when a number can only be placed in one cell within a row, column, or box, even though that cell might have other possible values.',
            'Pointing Combination': 'A pointing combination occurs when the possible positions for a number within a 3x3 box are restricted to a single row or column, eliminating that number as a possibility from other cells in the same row or column.',
            'Logical Deduction': 'Using advanced logical reasoning to determine the correct number based on the relationships between different cells and existing patterns.'
        };

        Object.entries(techniques).forEach(([technique, explanation]) => {
            const lines = doc.splitTextToSize(explanation, 170);
            doc.text(lines, 25, y);
            y += lines.length * 7 + 10;
        });

        // Add Move Assessment section if available
        if (stats.moveAssessments && stats.moveAssessments.length > 0) {
            y += 10;
            doc.setFontSize(14);
            doc.text('Move Assessment', 20, y);
            y += 20;

            doc.setFontSize(11);
            stats.moveAssessments.forEach(assessment => {
                const lines = doc.splitTextToSize(assessment, 170);
                doc.text(lines, 25, y);
                y += lines.length * 7 + 5;
            });
        }

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

    formatTechniqueName(technique) {
        if (!technique) return 'Logical Deduction';
        
        // Convert snake_case to Title Case
        return technique.toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
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

    async generateMoveAnalysis(move, currentGrid, allPossibleMoves) {
        try {
            console.log('Generating analysis for move:', move);
            
            // Create a more concise prompt for Flash model
            const prompt = `Analyze this Sudoku move:
Move: Value ${move.value} at Row ${move.row + 1}, Column ${move.col + 1}
Technique: ${move.technique}
Grid: ${JSON.stringify(currentGrid)}
Available: ${JSON.stringify(allPossibleMoves)}

Provide JSON with:
{
    "moveExplanation": "why this move was made",
    "techniqueExplanation": "how the technique works",
    "moveAssessment": {
        "isOptimal": boolean,
        "explanation": "assessment of move quality",
        "betterMove": null or {"value": n, "row": n, "col": n, "reason": "why better"}
    }
}`;

            // Add retry logic for API calls
            let retries = 3;
            let analysisText = null;
            let error = null;

            while (retries > 0) {
                try {
                    analysisText = await this.callGeminiAPI(prompt);
                    break;
                } catch (e) {
                    error = e;
                    console.error('API call attempt failed:', e);
                    retries--;
                    if (retries > 0) {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between retries
                    }
                }
            }

            if (!analysisText) {
                console.error('All API attempts failed:', error);
                return this.generateFallbackAnalysis(move, currentGrid, allPossibleMoves);
            }

            try {
                // Clean up the response text
                analysisText = analysisText.replace(/```json\n|\n```/g, '').trim();
                const analysis = JSON.parse(analysisText);
                
                // Validate the analysis structure
                if (analysis.moveExplanation && 
                    analysis.techniqueExplanation && 
                    analysis.moveAssessment && 
                    typeof analysis.moveAssessment.isOptimal === 'boolean' &&
                    analysis.moveAssessment.explanation) {
                    console.log('Successfully generated analysis:', analysis);
                    return analysis;
                } else {
                    throw new Error('Invalid analysis structure');
                }
            } catch (parseError) {
                console.error('Error parsing analysis:', parseError);
                console.log('Raw analysis text:', analysisText);
                return this.generateFallbackAnalysis(move, currentGrid, allPossibleMoves);
            }
        } catch (error) {
            console.error('Error in generateMoveAnalysis:', error);
            return this.generateFallbackAnalysis(move, currentGrid, allPossibleMoves);
        }
    }

    generateFallbackAnalysis(move, currentGrid, allPossibleMoves) {
        // Generate a detailed analysis without API
        const boxRow = Math.floor(move.row / 3) * 3;
        const boxCol = Math.floor(move.col / 3) * 3;
        
        // Analyze the constraints
        const rowValues = currentGrid[move.row].filter(v => v !== 0);
        const colValues = currentGrid.map(row => row[move.col]).filter(v => v !== 0);
        const boxValues = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const value = currentGrid[boxRow + i][boxCol + j];
                if (value !== 0) boxValues.push(value);
            }
        }

        // Find alternative moves
        const alternativeMoves = allPossibleMoves.filter(possibleMove => 
            possibleMove.possibilities.length === 1 &&
            !(possibleMove.row === move.row && possibleMove.col === move.col)
        );

        // Analyze the impact of the move
        const impactAnalysis = this.analyzeMoveImpact(move, currentGrid);
        const isNakedSingle = alternativeMoves.length === 0;
        const technique = move.technique?.toLowerCase() || '';
        
        // Generate detailed move explanation
        const moveExplanation = `The value ${move.value} was placed in row ${move.row + 1}, column ${move.col + 1} based on the following analysis:

1. Current Constraints:
   - Row ${move.row + 1} already contains: ${rowValues.join(', ')}
   - Column ${move.col + 1} already contains: ${colValues.join(', ')}
   - Box ${Math.floor(move.row / 3) * 3 + Math.floor(move.col / 3) + 1} already contains: ${boxValues.join(', ')}

2. Impact Analysis:
   - This move affects ${impactAnalysis.affectedCells} cells
   - It eliminates ${impactAnalysis.eliminatedPossibilities} possibilities
   - Creates ${impactAnalysis.newConstraints} new constraints

3. Strategic Value:
   - ${impactAnalysis.strategicValue}`;

        // Generate technique explanation
        const techniqueExplanation = this.getDetailedTechniqueExplanation(move);

        // Determine if this was the optimal move
        const isOptimal = isNakedSingle || 
                         technique.includes('hidden_single') || 
                         (impactAnalysis.impactScore > 0.7 && alternativeMoves.length === 0);
        
        // Generate move assessment
        const moveAssessment = {
            isOptimal,
            explanation: isOptimal ? 
                `This was the optimal move because:
1. ${isNakedSingle ? 'It was the only possible value for this cell' : 'It uses a strong solving technique'}
2. Impact Score: ${impactAnalysis.impactScore.toFixed(2)} out of 1.0
3. ${impactAnalysis.strategicValue}
4. The move creates immediate progress and helps constrain ${impactAnalysis.affectedCells} other cells in the grid.` :
                `While this move is valid, there are more strategic options available:
1. Current Impact Score: ${impactAnalysis.impactScore.toFixed(2)} out of 1.0
2. ${impactAnalysis.strategicValue}
3. There are alternative moves that could lead to faster puzzle resolution.`,
            betterMove: !isOptimal && alternativeMoves.length > 0 ? {
                value: alternativeMoves[0].possibilities[0],
                row: alternativeMoves[0].row,
                col: alternativeMoves[0].col,
                reason: `A better move would be placing ${alternativeMoves[0].possibilities[0]} at row ${alternativeMoves[0].row + 1}, column ${alternativeMoves[0].col + 1} because:
1. It would create more immediate constraints
2. It would affect more cells (${this.getRelatedCells(alternativeMoves[0].row, alternativeMoves[0].col).length} cells)
3. It could reveal hidden patterns in the puzzle
4. It follows a more optimal solving strategy`
            } : null
        };

        return {
            moveExplanation,
            techniqueExplanation,
            moveAssessment
        };
    }

    analyzeMoveImpact(move, currentGrid) {
        const relatedCells = this.getRelatedCells(move.row, move.col);
        let eliminatedPossibilities = 0;
        let newConstraints = 0;
        
        // Count affected empty cells
        const affectedCells = relatedCells.length;
        
        // Analyze impact on related cells
        relatedCells.forEach(cellRef => {
            const [row, col] = cellRef.match(/\d+/g).map(n => parseInt(n) - 1);
            if (currentGrid[row][col] === 0) {
                eliminatedPossibilities++;
                if (this.getPossibleValues(currentGrid, row, col).size === 2) {
                    newConstraints++;
                }
            }
        });
        
        // Calculate impact score (0 to 1)
        const impactScore = (eliminatedPossibilities / 20) + (newConstraints / 10);
        
        // Generate strategic value assessment
        let strategicValue = '';
        if (impactScore > 0.8) {
            strategicValue = 'This move has exceptional strategic value, creating multiple strong constraints.';
        } else if (impactScore > 0.6) {
            strategicValue = 'This move has good strategic value, affecting multiple cells and creating new constraints.';
        } else if (impactScore > 0.4) {
            strategicValue = 'This move has moderate strategic value, making steady progress in the puzzle.';
        } else {
            strategicValue = 'This move has basic strategic value, following fundamental Sudoku rules.';
        }
        
        return {
            affectedCells,
            eliminatedPossibilities,
            newConstraints,
            impactScore,
            strategicValue
        };
    }

    getDetailedTechniqueExplanation(move) {
        const technique = move.technique?.toLowerCase() || '';
        const explanations = {
            'naked_single': `A Naked Single is the most basic Sudoku technique where a cell has only one possible value. This occurs when all other numbers (1-9) are eliminated by existing values in the same row, column, or 3x3 box. In this case, cell (${move.row + 1}, ${move.col + 1}) could only contain ${move.value} because all other numbers were eliminated by the constraints.`,
            
            'hidden_single_row': `A Hidden Single in a row occurs when a number can only appear in one cell within a row, even though that cell might have other possible values. Here, ${move.value} could only be placed in column ${move.col + 1} of row ${move.row + 1} because all other positions in this row were blocked by existing numbers or constraints.`,
            
            'hidden_single_column': `A Hidden Single in a column occurs when a number can only appear in one cell within a column, even though that cell might have other possible values. In this case, ${move.value} could only be placed in row ${move.row + 1} of column ${move.col + 1} because all other positions in this column were blocked by existing numbers or constraints.`,
            
            'pointing_combination': `A Pointing Combination occurs when the possible positions for a number within a 3x3 box are restricted to a single row or column. This creates a powerful constraint that eliminates that number as a possibility from other cells in the same row or column outside the box. Here, ${move.value} forms such a pattern in box ${Math.floor(move.row / 3) * 3 + Math.floor(move.col / 3) + 1}.`,
            
            'logical_deduction': `Logical Deduction involves analyzing the relationships between different cells and their candidates to determine where a number must be placed. This move places ${move.value} in cell (${move.row + 1}, ${move.col + 1}) based on the current state of the puzzle and the constraints it creates.`,
            
            'player_move': `This move was made through careful analysis of the puzzle state and application of Sudoku rules. The placement of ${move.value} in cell (${move.row + 1}, ${move.col + 1}) follows from considering the existing numbers and their implications for possible placements.`
        };
        
        return explanations[technique] || explanations['logical_deduction'];
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
} 