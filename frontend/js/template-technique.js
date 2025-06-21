/**
 * Template-based solving technique for Sudoku
 * This module provides methods to identify forced digit placements using template-based solving.
 */

export default class TemplateTechnique {
    /**
     * Find template-based eliminations in the grid
     * @param {Array} grid - The Sudoku grid
     * @returns {Object|null} Step object with eliminations or null if none found
     */
    findTemplates(grid) {
        // Check each digit from 1 to 9
        for (let digit = 1; digit <= 9; digit++) {
            // Create a grid to mark possible positions for this digit
            const possible = Array(9).fill().map(() => Array(9).fill(false));
            let possibleCount = 0;
            
            // Mark all possible positions for this digit
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    const cell = grid[row][col];
                    if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                        possible[row][col] = true;
                        possibleCount++;
                    }
                }
            }
            
            // Skip if no possible positions or too many (would be inefficient)
            if (possibleCount === 0 || possibleCount > 20) continue;
            
            // Try to find a template (complete set of 9 positions that don't conflict)
            const template = this.findTemplate(possible, digit);
            
            if (template) {
                // Check for eliminations based on the template
                const eliminations = [];
                
                // For each cell in the template, check if it has other candidates that can be eliminated
                for (const {row, col} of template.positions) {
                    const cell = grid[row][col];
                    if (cell.candidates.size > 1) {
                        const digitsToRemove = Array.from(cell.candidates).filter(d => d !== digit);
                        if (digitsToRemove.length > 0) {
                            eliminations.push({
                                row,
                                col,
                                candidates: digitsToRemove,
                                reason: `Template: Digit ${digit} must be placed in this position in some solution, removing other candidates`
                            });
                        }
                    }
                }
                
                if (eliminations.length > 0) {
                    return {
                        type: 'template',
                        digit,
                        positions: template.positions,
                        eliminations: eliminations.map(e => ({
                            row: e.row,
                            col: e.col,
                            value: 0,
                            candidates: e.candidates,
                            reason: e.reason
                        })),
                        explanation: `Template check for digit ${digit} found a unique pattern. ` +
                                   `This digit must be placed in specific positions, allowing elimination of other candidates.`
                    };
                }
            }
        }
        
        return null;
    }
    
    /**
     * Helper function to find a valid template (complete set of 9 non-conflicting positions)
     * @private
     */
    findTemplate(possible, digit, positions = [], startRow = 0) {
        // If we've placed all 9 digits, check if it's a valid template
        if (positions.length === 9) {
            return { positions };
        }
        
        // Find the next row to process (skip rows that already have this digit placed)
        let row = startRow;
        while (row < 9) {
            // Check if this row already has this digit placed
            const hasDigit = positions.some(pos => pos.row === row);
            if (!hasDigit) break;
            row++;
        }
        
        // If all rows are processed, return null (no valid template found)
        if (row >= 9) return null;
        
        // Try each possible position in this row
        for (let col = 0; col < 9; col++) {
            // Skip if this position is not possible for the digit
            if (!possible[row][col]) continue;
            
            // Skip if there's already a digit in this column or box
            const inSameCol = positions.some(pos => pos.col === col);
            if (inSameCol) continue;
            
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;
            const inSameBox = positions.some(pos => {
                const posBoxRow = Math.floor(pos.row / 3) * 3;
                const posBoxCol = Math.floor(pos.col / 3) * 3;
                return posBoxRow === boxRow && posBoxCol === boxCol;
            });
            
            if (inSameBox) continue;
            
            // This position is valid, add it to the current template
            positions.push({ row, col });
            
            // Recursively try to complete the template
            const result = this.findTemplate(possible, digit, positions, row + 1);
            if (result) return result;
            
            // Backtrack
            positions.pop();
        }
        
        return null;
    }
}
