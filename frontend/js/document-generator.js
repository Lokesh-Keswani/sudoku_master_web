class DocumentGenerator {
    constructor(game) {
        this.game = game;
    }

    async generateSolutionDocument() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Part 1: Puzzle Introduction
        this.addTitle(doc);
        this.addIntroduction(doc);
        
        // Part 2: How to Play Sudoku
        this.addHowToPlay(doc);
        
        // Part 3: Step-by-Step Solution
        this.addSolutionSteps(doc);
        
        // Part 4: Final Puzzle Snapshot
        await this.addFinalSnapshot(doc);
        
        // Save the document
        doc.save(`sudoku-solution-${this.formatDate()}.pdf`);
    }

    addTitle(doc) {
        doc.setFontSize(20);
        doc.text('Sudoku Puzzle Solution', 20, 20);
        doc.setFontSize(12);
        doc.text(`Generated on ${this.formatDate()}`, 20, 30);
        doc.line(20, 35, 190, 35);
    }

    addIntroduction(doc) {
        doc.setFontSize(12);
        const intro = 'This document contains a step-by-step breakdown of the solved Sudoku puzzle, ' +
                     'including logic used, explanation for each move, and how Sudoku works.';
        doc.text(intro, 20, 45, { maxWidth: 170 });
    }

    addHowToPlay(doc) {
        doc.setFontSize(16);
        doc.text('How to Play Sudoku', 20, 65);
        doc.setFontSize(12);
        
        const rules = [
            'Basic Rule: Fill the 9×9 grid with numbers 1-9, ensuring each number appears exactly once in every row, column, and 3×3 box.',
            '',
            'Solving Techniques:',
            '',
            '1. Basic Techniques:',
            '• Scanning: Check rows, columns, and boxes to find where a number can legally be placed',
            '• Single Candidate (Naked Single): When only one number can go in a cell',
            '• Hidden Singles: When a number can only go in one cell within a row, column, or box',
            '',
            '2. Intermediate Techniques:',
            '• Pointing Pairs/Triples: When a number is restricted to 2-3 cells in a box, aligned in a row/column',
            '• Box/Line Reduction: When a number in a row/column must be in a specific box',
            '• Hidden Pairs: When two cells in a unit share the same two candidates exclusively',
            '• Naked Pairs/Triples: When 2-3 cells contain the same 2-3 candidates only',
            '',
            '3. Advanced Techniques:',
            '• X-Wing: When a number appears in exactly two positions in two different rows/columns',
            '• Swordfish: Similar to X-Wing but with three rows/columns',
            '• XY-Wing: A pattern involving three cells with specific candidate relationships',
            '• Remote Pairs: Chain of pairs that can help eliminate candidates',
            '',
            'Tips for Success:',
            '• Start with the most constrained areas (rows/columns/boxes with more numbers)',
            '• Use pencil marks to note possible numbers for each empty cell',
            '• Look for patterns and relationships between cells',
            '• Work systematically and be patient',
            '• Double-check your work regularly'
        ];
        
        let y = 75;
        rules.forEach(rule => {
            if (rule === '') {
                y += 5; // Add extra space for empty lines
            } else {
                doc.text(rule, 20, y, { maxWidth: 170 });
                y += rule.length > 50 ? 15 : 8;
            }
        });
    }

    addSolutionSteps(doc) {
        // Start solution steps on a new page
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Step-by-Step Solution', 20, 20);
        doc.setFontSize(12);

        try {
            // Get all steps in chronological order
            const allSteps = this.getAllSolutionSteps();
            console.log(`Processing ${allSteps.length} solution steps`);
            
            let y = 35;
            let currentPage = 1;
            
            // Add step count summary
            const techniques = new Map();
            allSteps.forEach(step => {
                const technique = step.technique || 'basic_move';
                techniques.set(technique, (techniques.get(technique) || 0) + 1);
            });
            
            // Add summary section
            doc.text('Solution Summary:', 20, y);
            y += 10;
            doc.text(`Total Steps: ${allSteps.length}`, 30, y);
            y += 10;
            doc.text('Techniques Used:', 30, y);
            y += 10;
            
            // Add techniques summary
            for (const [technique, count] of techniques) {
                doc.text(`• ${this.formatTechniqueName(technique)}: ${count} times`, 40, y);
                y += 8;
            }
            
            y += 10;
            doc.text('Detailed Steps:', 20, y);
            y += 10;

            // Process each step
            allSteps.forEach((step, index) => {
                try {
                    // Check if we need a new page
                    if (y > 250) {
                        doc.addPage();
                        currentPage++;
                        y = 20;
                    }

                    // Add step header with box number
                    doc.setFillColor(240, 240, 240);
                    doc.rect(15, y - 5, 180, 130, 'F');
                    doc.setFontSize(14);
                    doc.text(`Step ${index + 1}`, 20, y);
                    doc.setFontSize(12);
                    
                    // Add location and value with box reference
                    const boxNumber = Math.floor(step.row / 3) * 3 + Math.floor(step.col / 3) + 1;
                    doc.text(`Location: Row ${step.row + 1}, Column ${step.col + 1} (Box ${boxNumber})`, 30, y + 7);
                    doc.text(`Value Placed: ${step.value}`, 30, y + 14);
                    
                    // Add strategy used with difficulty level
                    const strategy = step.strategy || 'Basic Move';
                    const difficulty = step.difficulty || 'Basic';
                    doc.text(`Strategy: ${strategy} (${difficulty})`, 30, y + 21);
                    
                    // Add reasoning with word wrap
                    const reason = step.reason || 'Value placed based on game rules';
                    doc.text('Reasoning:', 30, y + 28);
                    const splitReason = doc.splitTextToSize(reason, 150);
                    doc.text(splitReason, 40, y + 35);
                    
                    // Add visual representation of the move
                    this.addMoveVisualization(doc, step, y + 50);
                    
                    // Add related cells explanation if available
                    if (step.relatedCells && step.relatedCells.length > 0) {
                        const relatedCellsText = `Related cells: ${this.formatRelatedCells(step.relatedCells)}`;
                        const splitRelatedCells = doc.splitTextToSize(relatedCellsText, 150);
                        doc.text(splitRelatedCells, 30, y + 120);
                    }
                    
                    // Add page number
                    doc.setFontSize(10);
                    doc.text(`Page ${currentPage}`, 180, 290);
                    doc.setFontSize(12);
                    
                    y += 140; // Increased space for move visualization and related cells
                } catch (error) {
                    console.error(`Error processing step ${index}:`, error);
                    // Continue with next step
                }
            });

            // Add final statistics
            doc.addPage();
            currentPage++;
            doc.setFontSize(16);
            doc.text('Solution Statistics', 20, 20);
            doc.setFontSize(12);
            
            const stats = this.calculateSolutionStats(allSteps);
            let statsY = 40;
            
            doc.text('Difficulty Distribution:', 20, statsY);
            statsY += 10;
            for (const [difficulty, count] of Object.entries(stats.difficultyCount)) {
                doc.text(`• ${difficulty}: ${count} moves (${Math.round(count/allSteps.length*100)}%)`, 30, statsY);
                statsY += 8;
            }
            
            statsY += 10;
            doc.text('Strategy Distribution:', 20, statsY);
            statsY += 10;
            for (const [strategy, count] of Object.entries(stats.strategyCount)) {
                doc.text(`• ${strategy}: ${count} times`, 30, statsY);
                statsY += 8;
            }
            
            // Add page number
            doc.setFontSize(10);
            doc.text(`Page ${currentPage}`, 180, 290);
            
        } catch (error) {
            console.error('Error in addSolutionSteps:', error);
            // Add error message to document
            doc.text('An error occurred while generating the solution steps.', 20, 35);
            doc.text('Please try again or contact support if the problem persists.', 20, 45);
        }
    }

    getAllSolutionSteps() {
        // Get all steps from the game's solution tracking
        const allSteps = [];
        
        try {
            // Get all steps in chronological order
            const steps = this.game.getAllSolutionSteps();
            console.log(`Found ${steps.length} solution steps`);

            if (steps.length > 0) {
                allSteps.push(...steps.map(step => ({
                    ...step,
                    technique: step.technique || 'basic_move',
                    strategy: step.strategy || 'Basic Move',
                    difficulty: step.difficulty || 'Basic',
                    reason: step.reason || 'Value placed based on game rules',
                    relatedCells: step.relatedCells || []
                })));
            } else {
                console.log('No solution steps found, generating remaining steps...');
                // If no steps are recorded, generate the remaining steps
                const remainingSteps = this.game.generateRemainingSteps();
                if (remainingSteps.length > 0) {
                    allSteps.push(...remainingSteps);
                }
            }

            console.log(`Total steps after processing: ${allSteps.length}`);
        } catch (error) {
            console.error('Error in getAllSolutionSteps:', error);
        }
        
        return allSteps;
    }

    formatTechniqueName(technique) {
        // Handle undefined or missing technique
        if (!technique) {
            return 'Basic Move';
        }
        
        try {
            return technique
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        } catch (error) {
            console.error('Error formatting technique name:', error);
            return 'Basic Move';
        }
    }

    formatRelatedCells(cells) {
        return cells
            .map(cell => `R${cell.row + 1}C${cell.col + 1}`)
            .join(', ');
    }

    addMoveVisualization(doc, step, y) {
        // Create a mini 3x3 grid showing the immediate area around the move
        const boxSize = 15;
        const startRow = Math.floor(step.row / 3) * 3;
        const startCol = Math.floor(step.col / 3) * 3;
        
        // Draw title for the visualization
        doc.text('Move Visualization:', 30, y - 5);
        
        // Set line width for grid
        doc.setLineWidth(0.2);
        
        // Draw the outer border of the 3x3 box first
        doc.rect(40, y, boxSize * 3, boxSize * 3);
        
        // Draw the 3x3 box with complete grid lines
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const x = 40 + (j * boxSize);
                const cellY = y + (i * boxSize);
                
                // Draw complete cell borders
                doc.rect(x, cellY, boxSize, boxSize);
                
                // Add numbers
                const row = startRow + i;
                const col = startCol + j;
                const value = this.game.grid[row][col].value;
                
                // Determine cell style
                const isCurrentMove = (row === step.row && col === step.col);
                const isRelatedCell = step.relatedCells && step.relatedCells.some(cell => 
                    cell.row === row && cell.col === col
                );
                
                // Apply cell styling
                if (isCurrentMove) {
                    doc.setFillColor(200, 255, 200); // Light green for current move
                    doc.rect(x, cellY, boxSize, boxSize, 'F');
                } else if (isRelatedCell) {
                    doc.setFillColor(255, 255, 200); // Light yellow for related cells
                    doc.rect(x, cellY, boxSize, boxSize, 'F');
                }
                
                // Redraw cell borders after fill to ensure they're visible
                doc.rect(x, cellY, boxSize, boxSize);
                
                if (value !== 0) {
                    // Use different colors for different types of numbers
                    if (this.game.grid[row][col].isFixed) {
                        doc.setTextColor(0, 0, 0); // Black for given numbers
                    } else if (isCurrentMove) {
                        doc.setTextColor(0, 100, 0); // Dark green for current move
                    } else {
                        doc.setTextColor(0, 0, 255); // Blue for previously placed numbers
                    }
                    
                    doc.text(value.toString(), x + boxSize/2, cellY + boxSize/2, {
                        align: 'center',
                        baseline: 'middle'
                    });
                }
            }
        }
        
        // Reset text color and line width
        doc.setTextColor(0, 0, 0);
        doc.setLineWidth(0.2);
        
        // Add legend
        const legendY = y + (3 * boxSize) + 10;
        doc.setFillColor(200, 255, 200);
        doc.rect(40, legendY, 10, 10, 'F');
        doc.rect(40, legendY, 10, 10); // Add border to legend box
        doc.text('Current Move', 55, legendY + 7);
        
        doc.setFillColor(255, 255, 200);
        doc.rect(100, legendY, 10, 10, 'F');
        doc.rect(100, legendY, 10, 10); // Add border to legend box
        doc.text('Related Cells', 115, legendY + 7);
    }

    async addFinalSnapshot(doc) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Final Solved Puzzle', 20, 20);
        
        // Create a canvas to draw the final puzzle state
        const canvas = document.createElement('canvas');
        canvas.width = 450;
        canvas.height = 450;
        const ctx = canvas.getContext('2d');
        
        // Draw the grid
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 450, 450);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        
        // Draw cells
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const x = j * 50;
                const y = i * 50;
                ctx.strokeRect(x, y, 50, 50);
                
                // Draw numbers
                const value = this.game.grid[i][j].value;
                if (value !== 0) {
                    ctx.font = '30px Arial';
                    ctx.fillStyle = this.game.grid[i][j].isFixed ? 'black' : 'blue';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(value.toString(), x + 25, y + 25);
                }
            }
        }
        
        // Draw thicker lines for 3x3 boxes
        ctx.lineWidth = 4;
        for (let i = 0; i <= 9; i += 3) {
            ctx.beginPath();
            ctx.moveTo(i * 50, 0);
            ctx.lineTo(i * 50, 450);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, i * 50);
            ctx.lineTo(450, i * 50);
            ctx.stroke();
        }
        
        // Convert canvas to image and add to PDF
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 20, 40, 170, 170);
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

    calculateSolutionStats(steps) {
        const stats = {
            difficultyCount: {},
            strategyCount: {}
        };
        
        steps.forEach(step => {
            // Count difficulties
            const difficulty = step.difficulty || 'Basic';
            stats.difficultyCount[difficulty] = (stats.difficultyCount[difficulty] || 0) + 1;
            
            // Count strategies
            const strategy = step.strategy || 'Basic Move';
            stats.strategyCount[strategy] = (stats.strategyCount[strategy] || 0) + 1;
        });
        
        return stats;
    }
} 