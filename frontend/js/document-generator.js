class DocumentGenerator {
    constructor(game) {
        this.game = game;
        // Store initial state when generator is created
        this.initialState = this.getInitialState();
        // Add your Gemini API key here
        this.GEMINI_API_KEY = 'AIzaSyDEWoJkI-DGyGQvVDpJ03YmX17XHcy26to';
        this.GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.GEMINI_API_KEY}`;
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
        await this.addStepByStepSolution(doc, moves, stats);  // Steps with summary - now awaiting
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

    async addStepByStepSolution(doc, moves, stats) {
        // Title
        doc.setFontSize(16);
        doc.text('Step-by-Step Solution', 20, 20);

        // Solution Summary
        doc.setFontSize(12);
        doc.text('Solution Summary:', 20, 35);
        
        // Total Steps with more spacing
        doc.text(`Total Steps: ${stats.totalSteps}`, 20, 50);
        
        // Techniques Used with more spacing
        doc.text('Techniques Used:', 20, 65);
        let y = 80;
        
        // Format each technique with bullet points and more spacing between items
        const techniques = [
            ['Logical Deduction', stats.strategy['Logical Deduction']],
            ['Naked Single', stats.strategy['Naked Single']],
            ['Hidden Single Column', stats.strategy['Hidden Single Column']],
            ['Hidden Single Row', stats.strategy['Hidden Single Row']],
            ['Pointing Combination', stats.strategy['Pointing Combination']]
        ];

        techniques.forEach(([technique, count]) => {
            doc.text(`• ${technique}: ${count} times`, 25, y);
            y += 20;
        });
            
        // Add detailed steps
        y += 15;
        doc.text('Detailed Steps:', 20, y);
        y += 15;

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

        // Add each valid step
        for (let i = 0; i < validMoves.length; i++) {
            const move = validMoves[i];
            if (y > 250) {
                doc.addPage();
                y = 20;
            }

            // Get move analysis from Gemini
            const currentGrid = this.getCurrentGridState(validMoves, i);
            const possibleMoves = this.getPossibleMoves(currentGrid);
            const analysis = await this.generateMoveAnalysis(move, currentGrid, possibleMoves);

            // Grey background for step
            doc.setFillColor(240, 240, 240);
            doc.rect(20, y, 170, 140, 'F');  // Increased height for better spacing

            // Left side content (text)
            const leftX = 25;  // Starting X for text content
            let textY = y + 10;  // Starting Y for text content

            // Step header
            doc.setFontSize(12);
            doc.text(`Step ${i + 1}`, leftX, textY);
            textY += 15;

            // 1. The Move
            doc.text(`Location: Row ${move.row + 1}, Column ${move.col + 1} (Box ${Math.floor(move.row / 3) * 3 + Math.floor(move.col / 3) + 1})`, leftX, textY);
            textY += 15;
            doc.text(`Value Placed: ${move.value}`, leftX, textY);
            textY += 20;

            // 2. Move Explanation
            doc.text('Move Explanation:', leftX, textY);
            textY += 15;
            doc.setFontSize(10);
            const moveExplanation = doc.splitTextToSize(analysis.moveExplanation, 85);
            moveExplanation.forEach(line => {
                doc.text(line, leftX + 5, textY);
                textY += 10;
            });
            textY += 5;

            // 3. Technique Explanation
            doc.setFontSize(12);
            doc.text('Technique Explanation:', leftX, textY);
            textY += 15;
            doc.setFontSize(10);
            const techExplanation = doc.splitTextToSize(analysis.techniqueExplanation, 85);
            techExplanation.forEach(line => {
                doc.text(line, leftX + 5, textY);
                textY += 10;
            });
            textY += 5;

            // 4. Move Assessment
            doc.setFontSize(12);
            doc.text('Move Assessment:', leftX, textY);
            textY += 15;
            doc.setFontSize(10);
            const assessmentText = analysis.moveAssessment.isOptimal 
                ? analysis.moveAssessment.explanation
                : `${analysis.moveAssessment.explanation}\nBetter move: ${this.formatBetterMove(analysis.moveAssessment.betterMove)}`;
            const assessmentLines = doc.splitTextToSize(assessmentText, 85);
            assessmentLines.forEach(line => {
                doc.text(line, leftX + 5, textY);
                textY += 10;
            });

            // Right side content (visual)
            const rightX = 120;  // Starting X for visual content
            const visualY = y + 15;  // Starting Y for visual content

            // 5. Visual Representation
            this.draw3x3Grid(doc, move, visualY, rightX);

            // Single legend below the grid
            doc.setFontSize(8);
            const legendY = visualY + 70;  // Position legend below grid
            
            doc.setFillColor(200, 255, 200);
            doc.rect(rightX, legendY, 8, 8, 'F');
            doc.text('Current Move', rightX + 10, legendY + 6);

            doc.setFillColor(255, 255, 200);
            doc.rect(rightX, legendY + 10, 8, 8, 'F');
            doc.text('Related Cells', rightX + 10, legendY + 16);

            // Related cells at the bottom
            doc.setFontSize(9);
            const relatedCellsText = doc.splitTextToSize('Related cells: ' + move.relatedCells.join(', '), 160);
            relatedCellsText.forEach((line, index) => {
                doc.text(line, leftX, y + 130 + (index * 10));
            });

            // Reset colors and move to next step
            doc.setFillColor(240, 240, 240);
            y += 150;  // Increased spacing between steps
        }

        // Add Solution Statistics section
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Solution Statistics', 20, 30);

        // Difficulty Distribution
        doc.setFontSize(12);
        doc.text('Difficulty Distribution:', 20, 50);
        y = 65;

        const totalMoves = stats.totalSteps;
        const difficultyStats = [
            ['Advanced', stats.difficulty['Advanced']],
            ['Basic', stats.difficulty['Basic']],
            ['Intermediate', stats.difficulty['Intermediate']]
        ];

        difficultyStats.forEach(([level, count]) => {
            const percentage = Math.round((count / totalMoves) * 100);
            doc.text(`• ${level}: ${count} moves (${percentage}%)`, 25, y);
            y += 15;
        });

        // Strategy Distribution
        y += 10;
        doc.text('Strategy Distribution:', 20, y);
        y += 15;

        const strategyStats = [
            ['Logical Deduction', stats.strategy['Logical Deduction']],
            ['Naked Single', stats.strategy['Naked Single']],
            ['Hidden Single (Column)', stats.strategy['Hidden Single Column']],
            ['Hidden Single (Row)', stats.strategy['Hidden Single Row']],
            ['Pointing Combination', stats.strategy['Pointing Combination']]
        ];

        strategyStats.forEach(([strategy, count]) => {
            doc.text(`• ${strategy}: ${count} times`, 25, y);
            y += 15;
        });
    }

    draw3x3Grid(doc, move, y, x) {
        try {
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
                    const gridValue = this.game.grid[boxRow + i]?.[boxCol + j]?.value;
                    
                    // Highlight current move cell
                    if (boxRow + i === move.row && boxCol + j === move.col) {
                        doc.setFillColor(200, 255, 200);
                        doc.rect(cellX, cellY, cellSize, cellSize, 'F');
                    }
                    
                    // Add number if it exists
                    if (gridValue) {
                        doc.setFontSize(12);
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
            doc.rect(x + gridSize + 5, y, 5, 5, 'F');
            doc.text('Current Move', x + gridSize + 12, y + 4);
            doc.setFillColor(255, 255, 200);
            doc.rect(x + gridSize + 5, y + 8, 5, 5, 'F');
            doc.text('Related Cells', x + gridSize + 12, y + 12);
        } catch (error) {
            console.error('Error drawing 3x3 grid:', error);
            // Continue execution even if grid drawing fails
        }
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
            const prompt = {
                contents: [{
                    parts: [{
                        text: `Analyze this Sudoku move:
                        Current Move: Value ${move.value} at Row ${move.row + 1}, Column ${move.col + 1}
                        Technique Used: ${move.technique}
                        Current Grid State: ${JSON.stringify(currentGrid)}
                        All Possible Moves: ${JSON.stringify(allPossibleMoves)}
                        
                        Please provide:
                        1. Specific explanation of why this number was placed in this cell
                        2. Detailed explanation of how the ${move.technique} technique was applied here
                        3. Assessment if this was the best move:
                           - If optimal, explain why
                           - If not optimal, what would have been better and why
                        
                        Format the response in JSON with these keys:
                        {
                            "moveExplanation": "",
                            "techniqueExplanation": "",
                            "moveAssessment": {
                                "isOptimal": boolean,
                                "explanation": "",
                                "betterMove": null or { "value": n, "row": n, "col": n, "reason": "" }
                            }
                        }`
                    }]
                }]
            };

            console.log('Sending request to Gemini API...');
            const response = await fetch(this.GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: prompt.contents
                })
            });

            if (!response.ok) {
                console.error('API response not OK:', response.status, response.statusText);
                const errorData = await response.text();
                console.error('Error details:', errorData);
                throw new Error(`Gemini API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Received response from Gemini:', data);
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0].text) {
                throw new Error('Invalid response format from Gemini API');
            }

            let analysisText = data.candidates[0].content.parts[0].text;
            
            // Remove markdown formatting if present
            if (analysisText.includes('```json')) {
                analysisText = analysisText.replace(/```json\n|\n```/g, '');
            }
            
            // Clean up any remaining whitespace and ensure it's valid JSON
            analysisText = analysisText.trim();
            
            try {
                const analysis = JSON.parse(analysisText);
                console.log('Parsed analysis:', analysis);
                return analysis;
            } catch (parseError) {
                console.error('Error parsing analysis JSON:', parseError);
                console.log('Raw analysis text:', analysisText);
                // Return fallback analysis if parsing fails
                return {
                    moveExplanation: this.getDetailedMoveExplanation(move),
                    techniqueExplanation: this.getDetailedTechniqueExplanation(move),
                    moveAssessment: {
                        isOptimal: true,
                        explanation: this.getDetailedMoveAssessment(move),
                        betterMove: null
                    }
                };
            }
        } catch (error) {
            console.error('Error getting move analysis:', error);
            // Return fallback analysis with more detailed explanations
            return {
                moveExplanation: this.getDetailedMoveExplanation(move),
                techniqueExplanation: this.getDetailedTechniqueExplanation(move),
                moveAssessment: {
                    isOptimal: true,
                    explanation: this.getDetailedMoveAssessment(move),
                    betterMove: null
                }
            };
        }
    }

    getDetailedMoveExplanation(move) {
        const technique = move.technique?.toLowerCase() || '';
        if (technique === 'naked_single') {
            return `Placed ${move.value} in this cell as it's the only possible number that can go here. All other numbers (1-9) are already present in either the same row, column, or 3x3 box.`;
        } else if (technique === 'hidden_single_row') {
            return `${move.value} must be placed in this cell because it's the only position in row ${move.row + 1} where ${move.value} can legally be placed. All other cells in this row cannot contain ${move.value} due to existing constraints.`;
        } else if (technique === 'hidden_single_column') {
            return `${move.value} must be placed in this cell because it's the only position in column ${move.col + 1} where ${move.value} can legally be placed. All other cells in this column cannot contain ${move.value} due to existing constraints.`;
        } else if (technique === 'pointing_combination') {
            return `${move.value} forms a pointing combination in this box, where ${move.value} can only appear in specific cells that align in a row or column, eliminating other possibilities.`;
        }
        return `Placed ${move.value} based on logical deduction and the current state of the puzzle.`;
    }

    getDetailedTechniqueExplanation(move) {
        const technique = move.technique?.toLowerCase() || '';
        if (technique === 'naked_single') {
            return `A Naked Single occurs when a cell has only one possible number that can be placed in it. This happens when all other numbers from 1-9 are already present in the cell's row, column, or 3x3 box, leaving only one valid option.`;
        } else if (technique === 'hidden_single_row') {
            return `A Hidden Single in a row occurs when a number can only be placed in one specific cell within that row, even though the cell might have other possible numbers. This is because all other cells in the row cannot contain this number due to existing placements.`;
        } else if (technique === 'hidden_single_column') {
            return `A Hidden Single in a column occurs when a number can only be placed in one specific cell within that column, even though the cell might have other possible numbers. This is because all other cells in the column cannot contain this number due to existing placements.`;
        } else if (technique === 'pointing_combination') {
            return `A Pointing Combination occurs when a number's possible positions within a box are restricted to a single row or column. This means the number cannot appear in that same row or column outside the box.`;
        }
        return `This move uses logical deduction to determine the correct number based on the current state of the puzzle and the relationships between different cells.`;
    }

    getDetailedMoveAssessment(move) {
        const technique = move.technique?.toLowerCase() || '';
        if (technique === 'naked_single') {
            return `This was an optimal move because it's the only possible number for this cell. No other moves could be more straightforward or certain.`;
        } else if (technique.includes('hidden_single')) {
            return `This was a good strategic move as it identifies a hidden single, which is one of the fundamental solving techniques in Sudoku. This move helps reduce possibilities in related cells.`;
        } else if (technique === 'pointing_combination') {
            return `This was an advanced move that effectively reduces possibilities in multiple cells. It's a strong strategic choice that helps progress toward the solution.`;
        }
        return `This move follows logical deduction principles and contributes to solving the puzzle systematically.`;
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
} 