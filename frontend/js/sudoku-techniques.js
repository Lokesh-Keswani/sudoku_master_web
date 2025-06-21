/**
 * Advanced Sudoku Solving Techniques Module
 * This module contains placeholders and documentation for implementing
 * advanced Sudoku solving techniques. Each technique is organized into
 * logical groups and includes documentation for future implementation.
 */

// Debug: Check if SudokuTechniques is defined
console.log('Defining SudokuTechniques class');

// Use an IIFE to avoid polluting the global scope
(function() {
class SudokuTechniques {
    constructor() {
        console.log('SudokuTechniques constructor called');
        // Initialize any necessary state for techniques
        this.techniques = {
            singles: {},
            intersections: {},
            hiddenSubsets: {},
            nakedSubsets: {},
            fish: {},
            singleDigitPatterns: {},
            uniqueness: {},
            wings: {},
            miscellaneous: {},
            chainsAndLoops: {},
            als: {},
            lastResort: {}
        };
    }

    // ===== SINGLES =====
    /**
     * Helper method to get candidates for a cell
     */
    getCandidates(grid, row, col) {
        if (grid[row][col].value !== 0) return new Set();
        
        const candidates = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        // Check row and column
        for (let i = 0; i < 9; i++) {
            candidates.delete(grid[row][i].value);
            candidates.delete(grid[i][col].value);
        }
        
        // Check box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                candidates.delete(grid[r][c].value);
            }
        }
        
        return candidates;
    }

    /**
     * Naked Single
     * When a cell has only one possible candidate.
     * Returns an object with the cell and value, or null if not found.
     */
    findNakedSingle(grid) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c].value === 0) {
                    const candidates = this.getCandidates(grid, r, c);
                    if (candidates.size === 1) {
                        const value = candidates.values().next().value;
                        return {
                            type: 'naked_single',
                            cells: [{ row: r, col: c, value }],
                            eliminations: [],
                            explanation: `Naked Single: Only possible value for this cell is ${value}.`
                        };
                    }
                }
            }
        }
        return null;
    }

    /**
     * Full House / Last Digit
     * When a unit (row, column, or box) has only one empty cell,
     * the missing digit must go there.
     * Returns an object with the cell and value, or null if not found.
     */
    findFullHouse(grid) {
        // Check all rows, columns, and boxes
        const units = [];
        // Rows
        for (let i = 0; i < 9; i++) {
            units.push(Array.from({length: 9}, (_, j) => [i, j]));
        }
        // Columns
        for (let j = 0; j < 9; j++) {
            units.push(Array.from({length: 9}, (_, i) => [i, j]));
        }
        // Boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                let box = [];
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        box.push([boxRow * 3 + i, boxCol * 3 + j]);
                    }
                }
                units.push(box);
            }
        }
        for (const unit of units) {
            let empty = [];
            let present = new Set();
            for (const [r, c] of unit) {
                const v = grid[r][c].value;
                if (v === 0) empty.push([r, c]);
                else present.add(v);
            }
            if (empty.length === 1) {
                // Find missing digit
                for (let d = 1; d <= 9; d++) {
                    if (!present.has(d)) {
                        return {
                            type: 'full_house',
                            cells: [{ row: empty[0][0], col: empty[0][1], value: d }],
                            eliminations: [],
                            explanation: `Full House: Only one cell left in this unit, so it must be ${d}.`
                        };
                    }
                }
            }
        }
        return null;
    }

    /**
     * Hidden Single
     * When a digit can only go in one cell within a unit.
     * Returns an object with the cell and value, or null if not found.
     */
    findHiddenSingle(grid) {
        // For each unit (row, col, box), for each digit, see if it can go in only one cell
        const units = [];
        for (let i = 0; i < 9; i++) units.push(Array.from({length: 9}, (_, j) => [i, j])); // rows
        for (let j = 0; j < 9; j++) units.push(Array.from({length: 9}, (_, i) => [i, j])); // cols
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                let box = [];
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        box.push([boxRow * 3 + i, boxCol * 3 + j]);
                    }
                }
                units.push(box);
            }
        }
        for (const unit of units) {
            for (let d = 1; d <= 9; d++) {
                let possible = [];
                for (const [r, c] of unit) {
                    if (grid[r][c].value === 0 && grid[r][c].candidates && grid[r][c].candidates.has(d)) {
                        possible.push([r, c]);
                    }
                }
                if (possible.length === 1) {
                    return {
                        type: 'hidden_single',
                        cells: [{ row: possible[0][0], col: possible[0][1], value: d }],
                        eliminations: [],
                        explanation: `Hidden Single: Only one cell in this unit can be ${d}.`
                    };
                }
            }
        }
        return null;
    }

    /**
     * Naked Single
     * When a cell has only one possible candidate.
     * Returns an object with the cell and value, or null if not found.
     */
    findNakedSingle(grid) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c].value === 0 && grid[r][c].candidates && grid[r][c].candidates.size === 1) {
                    const val = Array.from(grid[r][c].candidates)[0];
                    return {
                        type: 'naked_single',
                        cells: [{ row: r, col: c, value: val }],
                        eliminations: [],
                        explanation: `Naked Single: Only one candidate (${val}) for this cell.`
                    };
                }
            }
        }
        return null;
    }

    // ===== INTERSECTIONS =====
    /**
     * Locked Candidates Type 1 (Pointing)
     * When all candidates for a digit in a box are in one row/column,
     * that digit can be eliminated from the rest of the row/column.
     */
    findLockedCandidatesType1(grid) {
        // For each box
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                // For each digit 1-9
                for (let d = 1; d <= 9; d++) {
                    let rows = new Set();
                    let cols = new Set();
                    let cellsWithCandidate = [];
                    
                    // Check all cells in the box for the digit
                    for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
                        for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
                            if (grid[r][c].value === 0) {
                                const candidates = this.getCandidates(grid, r, c);
                                if (candidates.has(d)) {
                                    rows.add(r);
                                    cols.add(c);
                                    cellsWithCandidate.push({row: r, col: c});
                                }
                            }
                        }
                    }
                    
                    // If all candidates are in a single row
                    if (rows.size === 1 && cellsWithCandidate.length > 1) {
                        const row = Array.from(rows)[0];
                        const eliminations = [];
                        
                        // Find cells to eliminate (same row, outside the box)
                        for (let c = 0; c < 9; c++) {
                            if (Math.floor(c / 3) === boxCol) continue; // Skip cells in the same box
                            if (grid[row][c].value === 0) {
                                const candidates = this.getCandidates(grid, row, c);
                                if (candidates.has(d)) {
                                    eliminations.push({row, col: c, value: d});
                                }
                            }
                        }
                        
                        if (eliminations.length > 0) {
                            return {
                                type: 'locked_candidates_type1',
                                cells: cellsWithCandidate.map(cell => ({
                                    row: cell.row, 
                                    col: cell.col, 
                                    value: d
                                })),
                                eliminations,
                                explanation: `Locked Candidates (Pointing): Digit ${d} in this box is restricted to row ${row + 1}, ` +
                                            `so it can be removed from the rest of the row.`
                            };
                        }
                    }
                    
                    // If all candidates are in a single column
                    if (cols.size === 1 && cellsWithCandidate.length > 1) {
                        const col = Array.from(cols)[0];
                        const eliminations = [];
                        
                        // Find cells to eliminate (same column, outside the box)
                        for (let r = 0; r < 9; r++) {
                            if (Math.floor(r / 3) === boxRow) continue; // Skip cells in the same box
                            if (grid[r][col].value === 0) {
                                const candidates = this.getCandidates(grid, r, col);
                                if (candidates.has(d)) {
                                    eliminations.push({row: r, col, value: d});
                                }
                            }
                        }
                        
                        if (eliminations.length > 0) {
                            return {
                                type: 'locked_candidates_type1',
                                cells: cellsWithCandidate.map(cell => ({
                                    row: cell.row, 
                                    col: cell.col, 
                                    value: d
                                })),
                                eliminations,
                                explanation: `Locked Candidates (Pointing): Digit ${d} in this box is restricted to column ${col + 1}, ` +
                                            `so it can be removed from the rest of the column.`
                            };
                        }
                    }
                }
            }
        }
        return null;
    }

    /**
     * Locked Candidates Type 2 (Claiming)
     * When all candidates for a digit in a row/column are in one box,
     * that digit can be eliminated from the rest of the box.
     */
    findLockedCandidatesType2(grid) {
        // Check all digits 1-9
        for (let d = 1; d <= 9; d++) {
            // Check all rows
            for (let row = 0; row < 9; row++) {
                let cols = [];
                let boxCol = -1;
                let allInSameBox = true;
                
                // Find all columns in this row that can contain the digit
                for (let col = 0; col < 9; col++) {
                    if (grid[row][col].value === 0) {
                        const candidates = this.getCandidates(grid, row, col);
                        if (candidates.has(d)) {
                            cols.push(col);
                            // Check if all columns are in the same box
                            const currentBoxCol = Math.floor(col / 3);
                            if (boxCol === -1) {
                                boxCol = currentBoxCol;
                            } else if (boxCol !== currentBoxCol) {
                                allInSameBox = false;
                            }
                        }
                    }
                }
                
                // If all candidates are in the same box and there are candidates
                if (allInSameBox && cols.length > 0 && boxCol !== -1) {
                    const boxRow = Math.floor(row / 3);
                    const eliminations = [];
                    const cellsWithCandidate = [];
                    
                    // Find cells to eliminate (same box, outside the row)
                    for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
                        for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
                            if (r === row) continue; // Skip cells in the same row
                            if (grid[r][c].value === 0) {
                                const candidates = this.getCandidates(grid, r, c);
                                if (candidates.has(d)) {
                                    eliminations.push({row: r, col: c, value: d});
                                }
                            }
                            // Track cells with the candidate for highlighting
                            if (r === row && cols.includes(c)) {
                                cellsWithCandidate.push({row: r, col: c});
                            }
                        }
                    }
                    
                    if (eliminations.length > 0) {
                        return {
                            type: 'locked_candidates_type2',
                            cells: cellsWithCandidate.map(cell => ({
                                row: cell.row,
                                col: cell.col,
                                value: d
                            })),
                            eliminations,
                            explanation: `Locked Candidates (Claiming): In row ${row + 1}, digit ${d} can only appear in box ${boxRow * 3 + boxCol + 1}, ` +
                                        `so it can be removed from the rest of the box.`
                        };
                    }
                }
            }
            
            // Check all columns (similar logic as for rows)
            for (let col = 0; col < 9; col++) {
                let rows = [];
                let boxRow = -1;
                let allInSameBox = true;
                
                // Find all rows in this column that can contain the digit
                for (let row = 0; row < 9; row++) {
                    if (grid[row][col].value === 0) {
                        const candidates = this.getCandidates(grid, row, col);
                        if (candidates.has(d)) {
                            rows.push(row);
                            // Check if all rows are in the same box
                            const currentBoxRow = Math.floor(row / 3);
                            if (boxRow === -1) {
                                boxRow = currentBoxRow;
                            } else if (boxRow !== currentBoxRow) {
                                allInSameBox = false;
                            }
                        }
                    }
                }
                
                // If all candidates are in the same box and there are candidates
                if (allInSameBox && rows.length > 0 && boxRow !== -1) {
                    const boxCol = Math.floor(col / 3);
                    const eliminations = [];
                    const cellsWithCandidate = [];
                    
                    // Find cells to eliminate (same box, outside the column)
                    for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
                        for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
                            if (c === col) continue; // Skip cells in the same column
                            if (grid[r][c].value === 0) {
                                const candidates = this.getCandidates(grid, r, c);
                                if (candidates.has(d)) {
                                    eliminations.push({row: r, col: c, value: d});
                                }
                            }
                            // Track cells with the candidate for highlighting
                            if (c === col && rows.includes(r)) {
                                cellsWithCandidate.push({row: r, col: c});
                            }
                        }
                    }
                    
                    if (eliminations.length > 0) {
                        return {
                            type: 'locked_candidates_type2',
                            cells: cellsWithCandidate.map(cell => ({
                                row: cell.row,
                                col: cell.col,
                                value: d
                            })),
                            eliminations,
                            explanation: `Locked Candidates (Claiming): In column ${col + 1}, digit ${d} can only appear in box ${boxRow * 3 + boxCol + 1}, ` +
                                        `so it can be removed from the rest of the box.`
                        };
                    }
                }
            }
        }
        return null;
    }

    // ===== HIDDEN SUBSETS =====
    /**
     * Hidden Pair
     * When two digits can only go in two cells within a unit.
     * Returns an object with the cells and the hidden pair, or null if not found.
     */
    findHiddenPair(grid) {
        // Check all units (rows, columns, boxes)
        const units = [];
        
        // Add all rows
        for (let r = 0; r < 9; r++) {
            units.push(Array.from({length: 9}, (_, c) => [r, c]));
        }
        
        // Add all columns
        for (let c = 0; c < 9; c++) {
            units.push(Array.from({length: 9}, (_, r) => [r, c]));
        }
        
        // Add all boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                let box = [];
                for (let r = 0; r < 3; r++) {
                    for (let c = 0; c < 3; c++) {
                        box.push([boxRow * 3 + r, boxCol * 3 + c]);
                    }
                }
                units.push(box);
            }
        }
        
        // For each unit, look for hidden pairs
        for (const unit of units) {
            // For each pair of digits (1-9)
            for (let d1 = 1; d1 <= 8; d1++) {
                for (let d2 = d1 + 1; d2 <= 9; d2++) {
                    // Find cells that could be either d1 or d2
                    const possibleCells = [];
                    
                    for (const [r, c] of unit) {
                        if (grid[r][c].value === 0) {
                            const candidates = this.getCandidates(grid, r, c);
                            if (candidates.has(d1) || candidates.has(d2)) {
                                possibleCells.push({
                                    row: r,
                                    col: c,
                                    candidates: Array.from(candidates)
                                });
                            }
                        }
                    }
                    
                    // If exactly 2 cells can be either d1 or d2, we have a hidden pair
                    if (possibleCells.length === 2) {
                        const cell1 = possibleCells[0];
                        const cell2 = possibleCells[1];
                        
                        // Find candidates to eliminate (all except d1 and d2)
                        const eliminations = [];
                        let modified = false;
                        
                        // Check first cell
                        const cell1Candidates = this.getCandidates(grid, cell1.row, cell1.col);
                        for (const d of cell1Candidates) {
                            if (d !== d1 && d !== d2) {
                                eliminations.push({
                                    row: cell1.row,
                                    col: cell1.col,
                                    value: d
                                });
                                modified = true;
                            }
                        }
                        
                        // Check second cell
                        const cell2Candidates = this.getCandidates(grid, cell2.row, cell2.col);
                        for (const d of cell2Candidates) {
                            if (d !== d1 && d !== d2) {
                                eliminations.push({
                                    row: cell2.row,
                                    col: cell2.col,
                                    value: d
                                });
                                modified = true;
                            }
                        }
                        
                        // If we found eliminations, return the hidden pair
                        if (modified) {
                            return {
                                type: 'hidden_pair',
                                cells: [
                                    {row: cell1.row, col: cell1.col, value: 0, candidates: [d1, d2]},
                                    {row: cell2.row, col: cell2.col, value: 0, candidates: [d1, d2]}
                                ],
                                eliminations,
                                explanation: `Hidden Pair: The digits ${d1} and ${d2} can only appear in cells ` +
                                            `(${cell1.row+1},${cell1.col+1}) and (${cell2.row+1},${cell2.col+1}) in this unit. ` +
                                            `Other candidates can be removed from these cells.`
                            };
                        }
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Hidden Triple
     * When three digits can only go in three cells within a unit.
     */
    findHiddenTriple(grid) {
        // TODO: Implement hidden triple detection
        return null;
    }

    /**
     * Hidden Quadruple
     * When four digits can only go in four cells within a unit.
     */
    findHiddenQuadruple(grid) {
        // Check all rows, columns, and boxes
        for (let i = 0; i < 9; i++) {
            // Check row i
            const rowResult = this.findHiddenQuadrupleInUnit(grid, 'row', i);
            if (rowResult) return rowResult;
            
            // Check column i
            const colResult = this.findHiddenQuadrupleInUnit(grid, 'col', i);
            if (colResult) return colResult;
            
            // Check box i
            const boxRow = Math.floor(i / 3) * 3;
            const boxCol = (i % 3) * 3;
            const boxResult = this.findHiddenQuadrupleInBox(grid, boxRow, boxCol);
            if (boxResult) return boxResult;
        }
        
        return null;
    }
    
    findHiddenQuadrupleInUnit(grid, unitType, index) {
        // Track candidate positions for each digit (1-9)
        const digitPositions = new Map();
        
        // Collect positions for each digit in the unit
        for (let i = 0; i < 9; i++) {
            const row = unitType === 'row' ? index : i;
            const col = unitType === 'col' ? index : i;
            const cell = grid[row][col];
            
            if (cell.value === 0 && cell.candidates) {
                cell.candidates.forEach(digit => {
                    if (!digitPositions.has(digit)) {
                        digitPositions.set(digit, []);
                    }
                    digitPositions.get(digit).push({ row, col });
                });
            }
        }
        
        // Get digits that appear in 2-4 cells
        const candidates = Array.from(digitPositions.entries())
            .filter(([_, positions]) => positions.length >= 2 && positions.length <= 4)
            .map(([digit]) => digit);
        
        // Check all combinations of 4 digits
        for (let a = 0; a < candidates.length; a++) {
            for (let b = a + 1; b < candidates.length; b++) {
                for (let c = b + 1; c < candidates.length; c++) {
                    for (let d = c + 1; d < candidates.length; d++) {
                        const digits = [candidates[a], candidates[b], candidates[c], candidates[d]];
                        
                        // Get all cells that contain any of these digits
                        const allCells = [];
                        digits.forEach(digit => {
                            digitPositions.get(digit).forEach(pos => {
                                if (!allCells.some(c => c.row === pos.row && c.col === pos.col)) {
                                    allCells.push(pos);
                                }
                            });
                        });
                        
                        // We need exactly 4 cells that contain these digits
                        if (allCells.length !== 4) continue;
                        
                        // Check if these cells form a hidden quadruple
                        const hiddenQuadCells = [];
                        let isValid = true;
                        
                        for (const cell of allCells) {
                            const cellDigits = Array.from(grid[cell.row][cell.col].candidates)
                                .filter(d => digits.includes(d));
                                
                            if (cellDigits.length === 0) {
                                isValid = false;
                                break;
                            }
                            
                            hiddenQuadCells.push({
                                row: cell.row,
                                col: cell.col,
                                digits: cellDigits
                            });
                        }
                        
                        if (!isValid) continue;
                        
                        // Check if any cell has candidates outside the hidden quadruple
                        const eliminations = [];
                        
                        for (const cell of hiddenQuadCells) {
                            const cellData = grid[cell.row][cell.col];
                            const digitsToRemove = Array.from(cellData.candidates)
                                .filter(d => !digits.includes(d));
                                
                            if (digitsToRemove.length > 0) {
                                eliminations.push({
                                    row: cell.row,
                                    col: cell.col,
                                    digits: digitsToRemove,
                                    reason: `Hidden Quadruple: Can remove ${digitsToRemove.join(',')} from (${cell.row+1},${cell.col+1})`
                                });
                            }
                        }
                        
                        if (eliminations.length > 0) {
                            return {
                                type: 'hidden_quadruple',
                                unitType,
                                unitIndex: index,
                                digits: [...digits].sort((x, y) => x - y),
                                cells: hiddenQuadCells,
                                eliminations: eliminations.map(e => ({
                                    row: e.row,
                                    col: e.col,
                                    value: 0,
                                    candidates: e.digits,
                                    reason: e.reason
                                })),
                                explanation: `Hidden Quadruple found in ${unitType} ${index + 1}: ` +
                                           `Digits ${digits.sort((x, y) => x - y).join(', ')} appear only in cells ` +
                                           hiddenQuadCells.map(c => `(${c.row+1},${c.col+1})`).join(', ') +
                                           ` with candidates ${hiddenQuadCells.map(c => `{${c.digits.join(',')}}`).join(', ')}. ` +
                                           `Other candidates can be removed from these cells.`
                            };
                        }
                    }
                }
            }
        }
        
        return null;
    }
    
    findHiddenQuadrupleInBox(grid, startRow, startCol) {
        // Track candidate positions for each digit (1-9)
        const digitPositions = new Map();
        
        // Collect positions for each digit in the box
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                const cell = grid[r][c];
                
                if (cell.value === 0 && cell.candidates) {
                    cell.candidates.forEach(digit => {
                        if (!digitPositions.has(digit)) {
                            digitPositions.set(digit, []);
                        }
                        digitPositions.get(digit).push({ row: r, col: c });
                    });
                }
            }
        }
        
        // Get digits that appear in 2-4 cells
        const candidates = Array.from(digitPositions.entries())
            .filter(([_, positions]) => positions.length >= 2 && positions.length <= 4)
            .map(([digit]) => digit);
        
        // Check all combinations of 4 digits
        for (let a = 0; a < candidates.length; a++) {
            for (let b = a + 1; b < candidates.length; b++) {
                for (let c = b + 1; c < candidates.length; c++) {
                    for (let d = c + 1; d < candidates.length; d++) {
                        const digits = [candidates[a], candidates[b], candidates[c], candidates[d]];
                        
                        // Get all cells that contain any of these digits
                        const allCells = [];
                        digits.forEach(digit => {
                            digitPositions.get(digit).forEach(pos => {
                                if (!allCells.some(c => c.row === pos.row && c.col === pos.col)) {
                                    allCells.push(pos);
                                }
                            });
                        });
                        
                        // We need exactly 4 cells that contain these digits
                        if (allCells.length !== 4) continue;
                        
                        // Check if these cells form a hidden quadruple
                        const hiddenQuadCells = [];
                        let isValid = true;
                        
                        for (const cell of allCells) {
                            const cellDigits = Array.from(grid[cell.row][cell.col].candidates)
                                .filter(d => digits.includes(d));
                                
                            if (cellDigits.length === 0) {
                                isValid = false;
                                break;
                            }
                            
                            hiddenQuadCells.push({
                                row: cell.row,
                                col: cell.col,
                                digits: cellDigits
                            });
                        }
                        
                        if (!isValid) continue;
                        
                        // Check if any cell has candidates outside the hidden quadruple
                        const eliminations = [];
                        
                        for (const cell of hiddenQuadCells) {
                            const cellData = grid[cell.row][cell.col];
                            const digitsToRemove = Array.from(cellData.candidates)
                                .filter(d => !digits.includes(d));
                                
                            if (digitsToRemove.length > 0) {
                                eliminations.push({
                                    row: cell.row,
                                    col: cell.col,
                                    digits: digitsToRemove,
                                    reason: `Hidden Quadruple: Can remove ${digitsToRemove.join(',')} from (${cell.row+1},${cell.col+1})`
                                });
                            }
                        }
                        
                        if (eliminations.length > 0) {
                            const boxIndex = Math.floor(startRow / 3) * 3 + Math.floor(startCol / 3);
                            return {
                                type: 'hidden_quadruple',
                                unitType: 'box',
                                unitIndex: boxIndex,
                                digits: [...digits].sort((x, y) => x - y),
                                cells: hiddenQuadCells,
                                eliminations: eliminations.map(e => ({
                                    row: e.row,
                                    col: e.col,
                                    value: 0,
                                    candidates: e.digits,
                                    reason: e.reason
                                })),
                                explanation: `Hidden Quadruple found in box ${boxIndex + 1}: ` +
                                           `Digits ${digits.sort((x, y) => x - y).join(', ')} appear only in cells ` +
                                           hiddenQuadCells.map(c => `(${c.row+1},${c.col+1})`).join(', ') +
                                           ` with candidates ${hiddenQuadCells.map(c => `{${c.digits.join(',')}}`).join(', ')}. ` +
                                           `Other candidates can be removed from these cells.`
                            };
                        }
                    }
                }
            }
        }
        
        return null;
    }

    // ===== NAKED SUBSETS =====
    /**
     * Naked Pair / Locked Pair
     * When two cells in a unit contain only the same two candidates.
     * Returns an object with the cells and candidates, or null if not found.
     */
    findNakedPair(grid) {
        // Check all rows, columns, and boxes
        for (let i = 0; i < 9; i++) {
            // Check row i
            const rowResult = this.findNakedPairInUnit(grid, 'row', i);
            if (rowResult) return rowResult;
            
            // Check column i
            const colResult = this.findNakedPairInUnit(grid, 'col', i);
            if (colResult) return colResult;
            
            // Check box i
            const boxRow = Math.floor(i / 3) * 3;
            const boxCol = (i % 3) * 3;
            const boxResult = this.findNakedPairInBox(grid, boxRow, boxCol);
            if (boxResult) return boxResult;
        }
        
        return null;
    }
    
    /**
     * Helper method to find naked pairs in a row or column
     * @private
     */
    findNakedPairInUnit(grid, unitType, index) {
        const bivalueCells = [];
        const candidatesMap = new Map();
        
        // Collect all bivalue cells and track their candidates
        for (let i = 0; i < 9; i++) {
            const row = unitType === 'row' ? index : i;
            const col = unitType === 'col' ? index : i;
            const cell = grid[row][col];
            
            if (cell.value === 0 && cell.candidates && cell.candidates.size === 2) {
                const candidates = Array.from(cell.candidates).sort((a, b) => a - b).join(',');
                if (!candidatesMap.has(candidates)) {
                    candidatesMap.set(candidates, []);
                }
                candidatesMap.get(candidates).push({row, col});
                bivalueCells.push({row, col, candidates: candidates.split(',').map(Number)});
            }
        }
        
        // Check for any candidate pair that appears exactly twice
        for (const [candidates, cells] of candidatesMap.entries()) {
            if (cells.length === 2) {
                const [a, b] = candidates.split(',').map(Number);
                const eliminations = [];
                
                // Find all cells in the unit that see both cells of the pair
                for (let i = 0; i < 9; i++) {
                    const row = unitType === 'row' ? index : i;
                    const col = unitType === 'col' ? index : i;
                    const cell = grid[row][col];
                    
                    // Skip the naked pair cells and cells with values
                    if (cell.value !== 0) continue;
                    if ((row === cells[0].row && col === cells[0].col) || 
                        (row === cells[1].row && col === cells[1].col)) {
                        continue;
                    }
                    
                    // Check if this cell's candidates include either of the pair's candidates
                    if (cell.candidates) {
                        const digitsToRemove = [a, b].filter(d => cell.candidates.has(d));
                        if (digitsToRemove.length > 0) {
                            eliminations.push({
                                row,
                                col,
                                digits: digitsToRemove,
                                reason: `Naked Pair: Can remove ${digitsToRemove.join(',')} from (${row+1},${col+1})`
                            });
                        }
                    }
                }
                
                if (eliminations.length > 0) {
                    return {
                        type: 'naked_pair',
                        unitType: unitType,
                        unitIndex: index,
                        cells: cells.map(c => ({
                            row: c.row,
                            col: c.col,
                            candidates: [a, b]
                        })),
                        eliminations,
                        explanation: `Naked Pair found in ${unitType} ${index + 1}: ` +
                                   `Cells (${cells[0].row+1},${cells[0].col+1}) and ` +
                                   `(${cells[1].row+1},${cells[1].col+1}) with candidates ${a},${b}. ` +
                                   `These candidates can be removed from other cells in the ${unitType}.`
                    };
                }
            }
        }
        
        return null;
    }
    
    /**
     * Helper method to find naked pairs in a 3x3 box
     * @private
     */
    findNakedPairInBox(grid, startRow, startCol) {
        const bivalueCells = [];
        const candidatesMap = new Map();
        
        // Collect all bivalue cells in the box
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                const cell = grid[r][c];
                if (cell.value === 0 && cell.candidates && cell.candidates.size === 2) {
                    const candidates = Array.from(cell.candidates).sort((a, b) => a - b).join(',');
                    if (!candidatesMap.has(candidates)) {
                        candidatesMap.set(candidates, []);
                    }
                    candidatesMap.get(candidates).push({row: r, col: c});
                    bivalueCells.push({row: r, col: c, candidates: candidates.split(',').map(Number)});
                }
            }
        }
        
        // Check for any candidate pair that appears exactly twice
        for (const [candidates, cells] of candidatesMap.entries()) {
            if (cells.length === 2) {
                const [a, b] = candidates.split(',').map(Number);
                const eliminations = [];
                
                // Find all cells in the box that see both cells of the pair
                for (let r = startRow; r < startRow + 3; r++) {
                    for (let c = startCol; c < startCol + 3; c++) {
                        const cell = grid[r][c];
                        
                        // Skip the naked pair cells and cells with values
                        if (cell.value !== 0) continue;
                        if ((r === cells[0].row && c === cells[0].col) || 
                            (r === cells[1].row && c === cells[1].col)) {
                            continue;
                        }
                        
                        // Check if this cell's candidates include either of the pair's candidates
                        if (cell.candidates) {
                            const digitsToRemove = [a, b].filter(d => cell.candidates.has(d));
                            if (digitsToRemove.length > 0) {
                                eliminations.push({
                                    row: r,
                                    col: c,
                                    digits: digitsToRemove,
                                    reason: `Naked Pair: Can remove ${digitsToRemove.join(',')} from (${r+1},${c+1})`
                                });
                            }
                        }
                    }
                }
                
                if (eliminations.length > 0) {
                    const boxIndex = Math.floor(startRow / 3) * 3 + Math.floor(startCol / 3);
                    return {
                        type: 'naked_pair',
                        unitType: 'box',
                        unitIndex: boxIndex,
                        cells: cells.map(c => ({
                            row: c.row,
                            col: c.col,
                            candidates: [a, b]
                        })),
                        eliminations,
                        explanation: `Naked Pair found in box ${boxIndex + 1}: ` +
                                   `Cells (${cells[0].row+1},${cells[0].col+1}) and ` +
                                   `(${cells[1].row+1},${cells[1].col+1}) with candidates ${a},${b}. ` +
                                   `These candidates can be removed from other cells in the box.`
                    };
                }
            }
        }
        
        return null;
    }

    /**
     * Naked Triple / Locked Triple
     * When three cells in a unit contain only the same three candidates.
     */
    findNakedTriple(grid) {
        // Check all rows, columns, and boxes
        for (let i = 0; i < 9; i++) {
            // Check row i
            const rowResult = this.findNakedTripleInUnit(grid, 'row', i);
            if (rowResult) return rowResult;
            
            // Check column i
            const colResult = this.findNakedTripleInUnit(grid, 'col', i);
            if (colResult) return colResult;
            
            // Check box i
            const boxRow = Math.floor(i / 3) * 3;
            const boxCol = (i % 3) * 3;
            const boxResult = this.findNakedTripleInBox(grid, boxRow, boxCol);
            if (boxResult) return boxResult;
        }
        
        return null;
    }
    
    findNakedTripleInUnit(grid, unitType, index) {
        // Find all cells with 2-3 candidates
        const candidateCells = [];
        
        // Collect candidate information
        for (let i = 0; i < 9; i++) {
            const row = unitType === 'row' ? index : i;
            const col = unitType === 'col' ? index : i;
            const cell = grid[row][col];
            
            if (cell.value === 0 && cell.candidates && cell.candidates.size <= 3) {
                const candidates = Array.from(cell.candidates).sort((a, b) => a - b);
                candidateCells.push({
                    row, 
                    col,
                    candidates
                });
            }
        }
        
        // Check all combinations of 3 cells
        for (let i = 0; i < candidateCells.length; i++) {
            for (let j = i + 1; j < candidateCells.length; j++) {
                for (let k = j + 1; k < candidateCells.length; k++) {
                    const cells = [
                        candidateCells[i],
                        candidateCells[j],
                        candidateCells[k]
                    ];
                    
                    // Get union of all candidates
                    const allCandidates = new Set();
                    cells.forEach(cell => {
                        cell.candidates.forEach(d => allCandidates.add(d));
                    });
                    
                    // Must have exactly 3 candidates total
                    if (allCandidates.size !== 3) continue;
                    
                    const candidates = Array.from(allCandidates).sort((a, b) => a - b);
                    const eliminations = [];
                    
                    // Find cells to eliminate from
                    for (let c = 0; c < candidateCells.length; c++) {
                        const cell = candidateCells[c];
                        
                        // Skip the naked triple cells
                        if (cells.includes(cell)) continue;
                        
                        // Check if this cell has any of the candidates
                        const hasCandidate = cell.candidates.some(d => candidates.includes(d));
                        if (hasCandidate) {
                            eliminations.push({
                                row: cell.row,
                                col: cell.col,
                                candidates: cell.candidates.filter(d => candidates.includes(d))
                            });
                        }
                    }
                    
                    if (eliminations.length > 0) {
                        return {
                            type: 'naked_triple',
                            unitType,
                            unitIndex: index,
                            cells: cells.map(c => ({
                                row: c.row,
                                col: c.col,
                                candidates: c.candidates
                            })),
                            eliminations: eliminations.map(e => ({
                                row: e.row,
                                col: e.col,
                                value: 0,
                                candidates: e.candidates,
                                reason: `Naked Triple: Can remove ${e.candidates.join(',')} from (${e.row+1},${e.col+1})`
                            })),
                            explanation: `Naked Triple found in ${unitType} ${index + 1}: ` +
                                       `Cells (${cells[0].row+1},${cells[0].col+1}), ` +
                                       `(${cells[1].row+1},${cells[1].col+1}), and ` +
                                       `(${cells[2].row+1},${cells[2].col+1}) with candidates ${candidates.join(',')}. ` +
                                       `These candidates can be removed from other cells in the ${unitType}.`
                        };
                    }
                }
            }
        }
        
        return null;
    }
    
    findNakedTripleInBox(grid, startRow, startCol) {
        const candidateCells = [];
        
        // Collect candidate information in the box
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                const cell = grid[r][c];
                if (cell.value === 0 && cell.candidates && cell.candidates.size <= 3) {
                    const candidates = Array.from(cell.candidates).sort((a, b) => a - b);
                    candidateCells.push({
                        row: r,
                        col: c,
                        candidates
                    });
                }
            }
        }
        
        // Check all combinations of 3 cells
        for (let i = 0; i < candidateCells.length; i++) {
            for (let j = i + 1; j < candidateCells.length; j++) {
                for (let k = j + 1; k < candidateCells.length; k++) {
                    const cells = [
                        candidateCells[i],
                        candidateCells[j],
                        candidateCells[k]
                    ];
                    
                    // Get union of all candidates
                    const allCandidates = new Set();
                    cells.forEach(cell => {
                        cell.candidates.forEach(d => allCandidates.add(d));
                    });
                    
                    // Must have exactly 3 candidates total
                    if (allCandidates.size !== 3) continue;
                    
                    const candidates = Array.from(allCandidates).sort((a, b) => a - b);
                    const eliminations = [];
                    
                    // Find cells to eliminate from in the box
                    for (let c = 0; c < candidateCells.length; c++) {
                        const cell = candidateCells[c];
                        
                        // Skip the naked triple cells
                        if (cells.includes(cell)) continue;
                        
                        // Check if this cell has any of the candidates
                        const hasCandidate = cell.candidates.some(d => candidates.includes(d));
                        if (hasCandidate) {
                            eliminations.push({
                                row: cell.row,
                                col: cell.col,
                                candidates: cell.candidates.filter(d => candidates.includes(d))
                            });
                        }
                    }
                    
                    if (eliminations.length > 0) {
                        const boxIndex = Math.floor(startRow / 3) * 3 + Math.floor(startCol / 3);
                        return {
                            type: 'naked_triple',
                            unitType: 'box',
                            unitIndex: boxIndex,
                            cells: cells.map(c => ({
                                row: c.row,
                                col: c.col,
                                candidates: c.candidates
                            })),
                            eliminations: eliminations.map(e => ({
                                row: e.row,
                                col: e.col,
                                value: 0,
                                candidates: e.candidates,
                                reason: `Naked Triple: Can remove ${e.candidates.join(',')} from (${e.row+1},${e.col+1})`
                            })),
                            explanation: `Naked Triple found in box ${boxIndex + 1}: ` +
                                       `Cells (${cells[0].row+1},${cells[0].col+1}), ` +
                                       `(${cells[1].row+1},${cells[1].col+1}), and ` +
                                       `(${cells[2].row+1},${cells[2].col+1}) with candidates ${candidates.join(',')}. ` +
                                       `These candidates can be removed from other cells in the box.`
                        };
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Naked Quadruple
     * When four cells in a unit contain only the same four candidates.
     */
    findNakedQuadruple(grid) {
        // TODO: Implement naked quadruple detection
        return null;
    }

    // ===== FISH PATTERNS =====
    /**
     * X-Wing Pattern
     * A digit has exactly two possible positions in two different rows (or columns),
     * and these positions line up in the same columns (or rows).
     * Returns an object with the X-Wing cells and eliminations, or null if not found.
     */
    findXWing(grid) {
        // Check for both row-based and column-based X-Wings
        return this.findRowBasedXWing(grid) || this.findColBasedXWing(grid);
    }
    
    /**
     * Helper method to find row-based X-Wings
     */
    findRowBasedXWing(grid) {
        // For each digit 1-9
        for (let d = 1; d <= 9; d++) {
            // Find rows where the digit appears exactly twice
            const rowsWithTwo = [];
            
            // First pass: find all rows with exactly two possible positions for d
            for (let r = 0; r < 9; r++) {
                const cols = [];
                for (let c = 0; c < 9; c++) {
                    if (grid[r][c].value === 0) {
                        const candidates = this.getCandidates(grid, r, c);
                        if (candidates.has(d)) {
                            cols.push(c);
                        }
                    }
                }
                if (cols.length === 2) {
                    rowsWithTwo.push({row: r, cols: cols});
                }
            }
            
            // Look for two rows with the same two columns
            for (let i = 0; i < rowsWithTwo.length; i++) {
                for (let j = i + 1; j < rowsWithTwo.length; j++) {
                    const row1 = rowsWithTwo[i];
                    const row2 = rowsWithTwo[j];
                    
                    // Check if the columns match
                    if (row1.cols[0] === row2.cols[0] && row1.cols[1] === row2.cols[1]) {
                        // Found an X-Wing pattern
                        const c1 = row1.cols[0];
                        const c2 = row1.cols[1];
                        
                        // Find eliminations in the columns
                        const eliminations = [];
                        
                        // Check column c1 (skip the X-Wing rows)
                        for (let r = 0; r < 9; r++) {
                            if (r !== row1.row && r !== row2.row && grid[r][c1].value === 0) {
                                const candidates = this.getCandidates(grid, r, c1);
                                if (candidates.has(d)) {
                                    eliminations.push({row: r, col: c1, value: d});
                                }
                            }
                        }
                        
                        // Check column c2 (skip the X-Wing rows)
                        for (let r = 0; r < 9; r++) {
                            if (r !== row1.row && r !== row2.row && grid[r][c2].value === 0) {
                                const candidates = this.getCandidates(grid, r, c2);
                                if (candidates.has(d)) {
                                    eliminations.push({row: r, col: c2, value: d});
                                }
                            }
                        }
                        
                        if (eliminations.length > 0) {
                            return {
                                type: 'x_wing',
                                direction: 'row',
                                digit: d,
                                cells: [
                                    {row: row1.row, col: c1, value: d},
                                    {row: row1.row, col: c2, value: d},
                                    {row: row2.row, col: c1, value: d},
                                    {row: row2.row, col: c2, value: d}
                                ],
                                eliminations,
                                explanation: `X-Wing (Row): Digit ${d} forms an X-Wing in rows ${row1.row+1} and ${row2.row+1}. ` +
                                            `It can be removed from other cells in columns ${c1+1} and ${c2+1}.`
                            };
                        }
                    }
                }
            }
        }
        return null;
    }
    
    /**
     * Helper method to find column-based X-Wings
     */
    findColBasedXWing(grid) {
        // For each digit 1-9
        for (let d = 1; d <= 9; d++) {
            // Find columns where the digit appears exactly twice
            const colsWithTwo = [];
            
            // First pass: find all columns with exactly two possible positions for d
            for (let c = 0; c < 9; c++) {
                const rows = [];
                for (let r = 0; r < 9; r++) {
                    if (grid[r][c].value === 0) {
                        const candidates = this.getCandidates(grid, r, c);
                        if (candidates.has(d)) {
                            rows.push(r);
                        }
                    }
                }
                if (rows.length === 2) {
                    colsWithTwo.push({col: c, rows: rows});
                }
            }
            
            // Look for two columns with the same two rows
            for (let i = 0; i < colsWithTwo.length; i++) {
                for (let j = i + 1; j < colsWithTwo.length; j++) {
                    const col1 = colsWithTwo[i];
                    const col2 = colsWithTwo[j];
                    
                    // Check if the rows match
                    if (col1.rows[0] === col2.rows[0] && col1.rows[1] === col2.rows[1]) {
                        // Found an X-Wing pattern
                        const r1 = col1.rows[0];
                        const r2 = col1.rows[1];
                        
                        // Find eliminations in the rows
                        const eliminations = [];
                        
                        // Check row r1 (skip the X-Wing columns)
                        for (let c = 0; c < 9; c++) {
                            if (c !== col1.col && c !== col2.col && grid[r1][c].value === 0) {
                                const candidates = this.getCandidates(grid, r1, c);
                                if (candidates.has(d)) {
                                    eliminations.push({row: r1, col: c, value: d});
                                }
                            }
                        }
                        
                        // Check row r2 (skip the X-Wing columns)
                        for (let c = 0; c < 9; c++) {
                            if (c !== col1.col && c !== col2.col && grid[r2][c].value === 0) {
                                const candidates = this.getCandidates(grid, r2, c);
                                if (candidates.has(d)) {
                                    eliminations.push({row: r2, col: c, value: d});
                                }
                            }
                        }
                        
                        if (eliminations.length > 0) {
                            return {
                                type: 'x_wing',
                                direction: 'column',
                                digit: d,
                                cells: [
                                    {row: r1, col: col1.col, value: d},
                                    {row: r1, col: col2.col, value: d},
                                    {row: r2, col: col1.col, value: d},
                                    {row: r2, col: col2.col, value: d}
                                ],
                                eliminations,
                                explanation: `X-Wing (Column): Digit ${d} forms an X-Wing in columns ${col1.col+1} and ${col2.col+1}. ` +
                                            `It can be removed from other cells in rows ${r1+1} and ${r2+1}.`
                            };
                        }
                    }
                }
            }
        }
        return null;
    }
    
    /**
     * Basic Fish Patterns
     * X-Wing, Swordfish, Jellyfish, and larger basic fish patterns.
     */
    findBasicFish(grid) {
        // First try to find an X-Wing
        const xwing = this.findXWing(grid);
        if (xwing) return xwing;
        
        // Try to find a Swordfish
        const swordfish = this.findSwordfish(grid);
        if (swordfish) return swordfish;
        
        // Try to find a Jellyfish
        const jellyfish = this.findJellyfish(grid);
        if (jellyfish) return jellyfish;
        
        return null;
    }
    
    /**
     * X-Wing Pattern
     * A digit has exactly two possible positions in two different rows (or columns),
     * and these positions line up in the same columns (or rows).
     * Returns an object with the X-Wing cells and eliminations, or null if not found.
     */
    findXWing(grid) {
        // First try row-based X-Wing
        const rowBased = this.findRowBasedXWing(grid);
        if (rowBased) return rowBased;
        
        // Then try column-based X-Wing
        return this.findColBasedXWing(grid);
    }
    
    /**
     * Helper method to find column-based X-Wings
     */
    findColBasedXWing(grid) {
        for (let digit = 1; digit <= 9; digit++) {
            let colCandidates = [];
            
            // Find all columns with exactly two candidate positions for this digit
            for (let c = 0; c < 9; c++) {
                let rows = [];
                for (let r = 0; r < 9; r++) {
                    if (grid[r][c].value === 0 && grid[r][c].candidates && grid[r][c].candidates.has(digit)) {
                        rows.push(r);
                    }
                }
                if (rows.length === 2) {
                    colCandidates.push({ col: c, rows });
                }
            }
            
            // Check all pairs of columns for X-Wing
            for (let i = 0; i < colCandidates.length; i++) {
                for (let j = i + 1; j < colCandidates.length; j++) {
                    const a = colCandidates[i];
                    const b = colCandidates[j];
                    if (a.rows[0] === b.rows[0] && a.rows[1] === b.rows[1]) {
                        // Found X-Wing in columns a.col and b.col, rows a.rows
                        let eliminations = [];
                        for (let c = 0; c < 9; c++) {
                            if (c !== a.col && c !== b.col) {
                                for (const row of a.rows) {
                                    if (grid[row][c].value === 0 && grid[row][c].candidates && grid[row][c].candidates.has(digit)) {
                                        eliminations.push({ row: row, col: c, digit });
                                    }
                                }
                            }
                        }
                        if (eliminations.length > 0) {
                            return {
                                type: 'x_wing',
                                cells: [
                                    { row: a.rows[0], col: a.col, value: null },
                                    { row: a.rows[1], col: a.col, value: null },
                                    { row: b.rows[0], col: b.col, value: null },
                                    { row: b.rows[1], col: b.col, value: null }
                                ],
                                eliminations,
                                explanation: `X-Wing on digit ${digit} in columns ${a.col + 1} and ${b.col + 1}, rows ${a.rows[0] + 1} and ${a.rows[1] + 1}. All other candidates for ${digit} in these rows can be eliminated.`
                            };
                        }
                    }
                }
            }
        }
        return null;
    }

    /**
     * Swordfish
     * Finds Swordfish patterns for all digits (row-based and column-based).
     * Returns a step object if found, otherwise null.
     */
    findSwordfish(grid) {
        for (let digit = 1; digit <= 9; digit++) {
            // ROW-BASED SWORDFISH
            let rowCandidates = [];
            for (let r = 0; r < 9; r++) {
                let cols = [];
                for (let c = 0; c < 9; c++) {
                    if (grid[r][c].value === 0 && grid[r][c].candidates && grid[r][c].candidates.has(digit)) {
                        cols.push(c);
                    }
                }
                if (cols.length >= 2 && cols.length <= 3) {
                    rowCandidates.push({ row: r, cols });
                }
            }
            // Check all combinations of 3 rows
            for (let i = 0; i < rowCandidates.length; i++) {
                for (let j = i + 1; j < rowCandidates.length; j++) {
                    for (let k = j + 1; k < rowCandidates.length; k++) {
                        const allCols = [...rowCandidates[i].cols, ...rowCandidates[j].cols, ...rowCandidates[k].cols];
                        const uniqueCols = Array.from(new Set(allCols));
                        if (uniqueCols.length === 3) {
                            // Found Swordfish in rows i, j, k and columns uniqueCols
                            let eliminations = [];
                            for (let r = 0; r < 9; r++) {
                                if (r !== rowCandidates[i].row && r !== rowCandidates[j].row && r !== rowCandidates[k].row) {
                                    for (const col of uniqueCols) {
                                        if (grid[r][col].value === 0 && grid[r][col].candidates && grid[r][col].candidates.has(digit)) {
                                            eliminations.push({ row: r, col: col, digit });
                                        }
                                    }
                                }
                            }
                            if (eliminations.length > 0) {
                                return {
                                    type: 'swordfish',
                                    cells: [
                                        { row: rowCandidates[i].row, col: uniqueCols[0], value: null },
                                        { row: rowCandidates[i].row, col: uniqueCols[1], value: null },
                                        { row: rowCandidates[i].row, col: uniqueCols[2], value: null },
                                        { row: rowCandidates[j].row, col: uniqueCols[0], value: null },
                                        { row: rowCandidates[j].row, col: uniqueCols[1], value: null },
                                        { row: rowCandidates[j].row, col: uniqueCols[2], value: null },
                                        { row: rowCandidates[k].row, col: uniqueCols[0], value: null },
                                        { row: rowCandidates[k].row, col: uniqueCols[1], value: null },
                                        { row: rowCandidates[k].row, col: uniqueCols[2], value: null }
                                    ],
                                    eliminations,
                                    explanation: `Swordfish on digit ${digit} in rows ${rowCandidates[i].row + 1}, ${rowCandidates[j].row + 1}, ${rowCandidates[k].row + 1} and columns ${uniqueCols.map(c => c + 1).join(', ')}. All other candidates for ${digit} in these columns can be eliminated.`
                                };
                            }
                        }
                    }
                }
            }
            // COLUMN-BASED SWORDFISH
            let colCandidates = [];
            for (let c = 0; c < 9; c++) {
                let rows = [];
                for (let r = 0; r < 9; r++) {
                    if (grid[r][c].value === 0 && grid[r][c].candidates && grid[r][c].candidates.has(digit)) {
                        rows.push(r);
                    }
                }
                if (rows.length >= 2 && rows.length <= 3) {
                    colCandidates.push({ col: c, rows });
                }
            }
            // Check all combinations of 3 columns
            for (let i = 0; i < colCandidates.length; i++) {
                for (let j = i + 1; j < colCandidates.length; j++) {
                    for (let k = j + 1; k < colCandidates.length; k++) {
                        const allRows = [...colCandidates[i].rows, ...colCandidates[j].rows, ...colCandidates[k].rows];
                        const uniqueRows = Array.from(new Set(allRows));
                        if (uniqueRows.length === 3) {
                            // Found Swordfish in columns i, j, k and rows uniqueRows
                            let eliminations = [];
                            for (let c = 0; c < 9; c++) {
                                if (c !== colCandidates[i].col && c !== colCandidates[j].col && c !== colCandidates[k].col) {
                                    for (const row of uniqueRows) {
                                        if (grid[row][c].value === 0 && grid[row][c].candidates && grid[row][c].candidates.has(digit)) {
                                            eliminations.push({ row: row, col: c, digit });
                                        }
                                    }
                                }
                            }
                            if (eliminations.length > 0) {
                                return {
                                    type: 'swordfish',
                                    cells: [
                                        { row: uniqueRows[0], col: colCandidates[i].col, value: null },
                                        { row: uniqueRows[1], col: colCandidates[i].col, value: null },
                                        { row: uniqueRows[2], col: colCandidates[i].col, value: null },
                                        { row: uniqueRows[0], col: colCandidates[j].col, value: null },
                                        { row: uniqueRows[1], col: colCandidates[j].col, value: null },
                                        { row: uniqueRows[2], col: colCandidates[j].col, value: null },
                                        { row: uniqueRows[0], col: colCandidates[k].col, value: null },
                                        { row: uniqueRows[1], col: colCandidates[k].col, value: null },
                                        { row: uniqueRows[2], col: colCandidates[k].col, value: null }
                                    ],
                                    eliminations,
                                    explanation: `Swordfish on digit ${digit} in columns ${colCandidates[i].col + 1}, ${colCandidates[j].col + 1}, ${colCandidates[k].col + 1} and rows ${uniqueRows.map(r => r + 1).join(', ')}. All other candidates for ${digit} in these rows can be eliminated.`
                                };
                            }
                        }
                    }
                }
            }
        }
        return null;
    }

    /**
     * Jellyfish
     * Finds Jellyfish patterns for all digits (row-based and column-based).
     * A Jellyfish is a 4x4 grid where a digit appears in exactly four rows and four columns.
     * Returns a step object if found, otherwise null.
     */
    /**
     * Finned X-Wing
     * An X-Wing with an extra candidate in one of the boxes.
     * This technique extends the X-Wing by allowing one of the four boxes to have extra candidates.
     */
    findFinnedXWing(grid) {
        // Check for Finned X-Wing for each digit 1-9
        for (let digit = 1; digit <= 9; digit++) {
            // Try both row-based and column-based Finned X-Wings
            const rowBased = this.findFinnedXWingRows(grid, digit);
            if (rowBased) return rowBased;
            
            const colBased = this.findFinnedXWingCols(grid, digit);
            if (colBased) return colBased;
        }
        return null;
    }
    
    /**
     * Helper method to find row-based Finned X-Wings
     */
    findFinnedXWingRows(grid, digit) {
        // Find all rows with exactly 2 or 3 candidates for this digit
        const rowCandidates = [];
        
        // First pass: find all rows with 2-3 candidates
        for (let r = 0; r < 9; r++) {
            const positions = [];
            for (let c = 0; c < 9; c++) {
                const cell = grid[r][c];
                if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                    positions.push({row: r, col: c});
                }
            }
            if (positions.length === 2 || positions.length === 3) {
                rowCandidates.push({
                    row: r,
                    positions: positions,
                    // Group by box to identify potential fins
                    boxCols: [...new Set(positions.map(pos => Math.floor(pos.col / 3)))]
                });
            }
        }
        
        // Look for two rows that share the same two box columns
        for (let i = 0; i < rowCandidates.length; i++) {
            for (let j = i + 1; j < rowCandidates.length; j++) {
                const row1 = rowCandidates[i];
                const row2 = rowCandidates[j];
                
                // Skip if rows are in the same box row
                if (Math.floor(row1.row / 3) === Math.floor(row2.row / 3)) continue;
                
                // Check if they share exactly two box columns
                const sharedBoxCols = row1.boxCols.filter(bc => row2.boxCols.includes(bc));
                if (sharedBoxCols.length !== 2) continue;
                
                // Find the columns that form the X-Wing pattern
                const baseCols = [];
                const finCols = [];
                
                // For each shared box column, check the positions
                for (const boxCol of sharedBoxCols) {
                    const colsInBox = [0, 1, 2].map(x => boxCol * 3 + x);
                    const row1Cols = row1.positions.map(p => p.col).filter(c => colsInBox.includes(c));
                    const row2Cols = row2.positions.map(p => p.col).filter(c => colsInBox.includes(c));
                    
                    // Check for a fin in this box (one row has 2 candidates, the other has 1)
                    if ((row1Cols.length === 2 && row2Cols.length === 1) || 
                        (row1Cols.length === 1 && row2Cols.length === 2)) {
                        
                        const finRow = row1Cols.length === 2 ? row1 : row2;
                        const baseRow = row1Cols.length === 2 ? row2 : row1;
                        
                        // The base column is the one in the base row
                        const baseCol = baseRow.positions.find(p => colsInBox.includes(p.col)).col;
                        
                        // The fin columns are the ones in the fin row that aren't the base column
                        const finColsInBox = finRow.positions
                            .map(p => p.col)
                            .filter(c => colsInBox.includes(c) && c !== baseCol);
                        
                        baseCols.push(baseCol);
                        finCols.push(...finColsInBox);
                    } else if (row1Cols.length === 2 && row2Cols.length === 2) {
                        // Standard X-Wing pattern (no fin in this box)
                        baseCols.push(...row1Cols);
                    }
                }
                
                // If we have exactly one fin column and two base columns, we might have a Finned X-Wing
                if (finCols.length === 1 && baseCols.length === 2) {
                    const finCol = finCols[0];
                    const [baseCol1, baseCol2] = baseCols;
                    
                    // Find the box containing the fin
                    const finBoxCol = Math.floor(finCol / 3);
                    const finBoxRow = Math.floor(row1.row / 3);
                    
                    // Find cells that see both the fin and the base columns
                    const eliminations = [];
                    
                    // Check the column of the fin for eliminations
                    for (let r = 0; r < 9; r++) {
                        // Skip the rows already in the pattern
                        if (r === row1.row || r === row2.row) continue;
                        
                        const cell = grid[r][finCol];
                        if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                            // Check if this cell is in the same box as the fin
                            if (Math.floor(r / 3) === finBoxRow) {
                                eliminations.push({
                                    row: r,
                                    col: finCol,
                                    digit,
                                    reason: `Finned X-Wing: Can remove ${digit} from (${r+1},${finCol+1})`
                                });
                            }
                        }
                    }
                    
                    if (eliminations.length > 0) {
                        // Get all cells involved in the pattern
                        const cells = [
                            ...row1.positions.map(pos => ({
                                row: pos.row,
                                col: pos.col,
                                value: null,
                                candidates: [digit]
                            })),
                            ...row2.positions.map(pos => ({
                                row: pos.row,
                                col: pos.col,
                                value: null,
                                candidates: [digit]
                            }))
                        ];
                        
                        return {
                            type: 'finned_x_wing',
                            cells,
                            eliminations,
                            explanation: `Finned X-Wing on ${digit} in rows ${row1.row+1} and ${row2.row+1} ` +
                                       `with fin at (${row1.row+1},${finCol+1}). ` +
                                       `Eliminates ${digit} from ${eliminations.length} cells.`
                        };
                    }
                }
            }
        }
        
        return null;
    }
    
    /**
     * Helper method to find column-based Finned X-Wings
     */
    findFinnedXWingCols(grid, digit) {
        // Find all columns with exactly 2 or 3 candidates for this digit
        const colCandidates = [];
        
        // First pass: find all columns with 2-3 candidates
        for (let c = 0; c < 9; c++) {
            const positions = [];
            for (let r = 0; r < 9; r++) {
                const cell = grid[r][c];
                if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                    positions.push({row: r, col: c});
                }
            }
            if (positions.length === 2 || positions.length === 3) {
                colCandidates.push({
                    col: c,
                    positions: positions,
                    // Group by box to identify potential fins
                    boxRows: [...new Set(positions.map(pos => Math.floor(pos.row / 3)))]
                });
            }
        }
        
        // Look for two columns that share the same two box rows
        for (let i = 0; i < colCandidates.length; i++) {
            for (let j = i + 1; j < colCandidates.length; j++) {
                const col1 = colCandidates[i];
                const col2 = colCandidates[j];
                
                // Skip if columns are in the same box column
                if (Math.floor(col1.col / 3) === Math.floor(col2.col / 3)) continue;
                
                // Check if they share exactly two box rows
                const sharedBoxRows = col1.boxRows.filter(br => col2.boxRows.includes(br));
                if (sharedBoxRows.length !== 2) continue;
                
                // Find the rows that form the X-Wing pattern
                const baseRows = [];
                const finRows = [];
                
                // For each shared box row, check the positions
                for (const boxRow of sharedBoxRows) {
                    const rowsInBox = [0, 1, 2].map(x => boxRow * 3 + x);
                    const col1Rows = col1.positions.map(p => p.row).filter(r => rowsInBox.includes(r));
                    const col2Rows = col2.positions.map(p => p.row).filter(r => rowsInBox.includes(r));
                    
                    // Check for a fin in this box (one column has 2 candidates, the other has 1)
                    if ((col1Rows.length === 2 && col2Rows.length === 1) || 
                        (col1Rows.length === 1 && col2Rows.length === 2)) {
                        
                        const finCol = col1Rows.length === 2 ? col1 : col2;
                        const baseCol = col1Rows.length === 2 ? col2 : col1;
                        
                        // The base row is the one in the base column
                        const baseRow = baseCol.positions.find(p => rowsInBox.includes(p.row)).row;
                        
                        // The fin rows are the ones in the fin column that aren't the base row
                        const finRowsInBox = finCol.positions
                            .map(p => p.row)
                            .filter(r => rowsInBox.includes(r) && r !== baseRow);
                        
                        baseRows.push(baseRow);
                        finRows.push(...finRowsInBox);
                    } else if (col1Rows.length === 2 && col2Rows.length === 2) {
                        // Standard X-Wing pattern (no fin in this box)
                        baseRows.push(...col1Rows);
                    }
                }
                
                // If we have exactly one fin row and two base rows, we might have a Finned X-Wing
                if (finRows.length === 1 && baseRows.length === 2) {
                    const finRow = finRows[0];
                    const [baseRow1, baseRow2] = baseRows;
                    
                    // Find the box containing the fin
                    const finBoxRow = Math.floor(finRow / 3);
                    const finBoxCol = Math.floor(col1.col / 3);
                    
                    // Find cells that see both the fin and the base rows
                    const eliminations = [];
                    
                    // Check the row of the fin for eliminations
                    for (let c = 0; c < 9; c++) {
                        // Skip the columns already in the pattern
                        if (c === col1.col || c === col2.col) continue;
                        
                        const cell = grid[finRow][c];
                        if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                            // Check if this cell is in the same box as the fin
                            if (Math.floor(c / 3) === finBoxCol) {
                                eliminations.push({
                                    row: finRow,
                                    col: c,
                                    digit,
                                    reason: `Finned X-Wing: Can remove ${digit} from (${finRow+1},${c+1})`
                                });
                            }
                        }
                    }
                    
                    if (eliminations.length > 0) {
                        // Get all cells involved in the pattern
                        const cells = [
                            ...col1.positions.map(pos => ({
                                row: pos.row,
                                col: pos.col,
                                value: null,
                                candidates: [digit]
                            })),
                            ...col2.positions.map(pos => ({
                                row: pos.row,
                                col: pos.col,
                                value: null,
                                candidates: [digit]
                            }))
                        ];
                        
                        return {
                            type: 'finned_x_wing',
                            cells,
                            eliminations,
                            explanation: `Finned X-Wing on ${digit} in columns ${col1.col+1} and ${col2.col+1} ` +
                                       `with fin at (${finRow+1},${col1.col+1}). ` +
                                       `Eliminates ${digit} from ${eliminations.length} cells.`
                        };
                    }
                }
            }
        }
        
        return null;
    }
    
    findJellyfish(grid) {
        for (let digit = 1; digit <= 9; digit++) {
            // ROW-BASED JELLYFISH
            let rowCandidates = [];
            for (let r = 0; r < 9; r++) {
                let cols = [];
                for (let c = 0; c < 9; c++) {
                    if (grid[r][c].value === 0 && grid[r][c].candidates && grid[r][c].candidates.has(digit)) {
                        cols.push(c);
                    }
                }
                if (cols.length >= 2 && cols.length <= 4) {
                    rowCandidates.push({ row: r, cols });
                }
            }
            
            // Check all combinations of 4 rows
            for (let i = 0; i < rowCandidates.length; i++) {
                for (let j = i + 1; j < rowCandidates.length; j++) {
                    for (let k = j + 1; k < rowCandidates.length; k++) {
                        for (let l = k + 1; l < rowCandidates.length; l++) {
                            const allCols = [
                                ...rowCandidates[i].cols,
                                ...rowCandidates[j].cols,
                                ...rowCandidates[k].cols,
                                ...rowCandidates[l].cols
                            ];
                            const uniqueCols = Array.from(new Set(allCols));
                            
                            if (uniqueCols.length === 4) {
                                // Found Jellyfish in rows i, j, k, l and columns uniqueCols
                                let eliminations = [];
                                for (let r = 0; r < 9; r++) {
                                    if (r !== rowCandidates[i].row && 
                                        r !== rowCandidates[j].row && 
                                        r !== rowCandidates[k].row && 
                                        r !== rowCandidates[l].row) {
                                        for (const col of uniqueCols) {
                                            if (grid[r][col].value === 0 && 
                                                grid[r][col].candidates && 
                                                grid[r][col].candidates.has(digit)) {
                                                eliminations.push({ row: r, col: col, digit });
                                            }
                                        }
                                    }
                                }
                                
                                if (eliminations.length > 0) {
                                    return {
                                        type: 'jellyfish',
                                        cells: [
                                            { row: rowCandidates[i].row, col: uniqueCols[0], value: null },
                                            { row: rowCandidates[i].row, col: uniqueCols[1], value: null },
                                            { row: rowCandidates[i].row, col: uniqueCols[2], value: null },
                                            { row: rowCandidates[i].row, col: uniqueCols[3], value: null },
                                            { row: rowCandidates[j].row, col: uniqueCols[0], value: null },
                                            { row: rowCandidates[j].row, col: uniqueCols[1], value: null },
                                            { row: rowCandidates[j].row, col: uniqueCols[2], value: null },
                                            { row: rowCandidates[j].row, col: uniqueCols[3], value: null },
                                            { row: rowCandidates[k].row, col: uniqueCols[0], value: null },
                                            { row: rowCandidates[k].row, col: uniqueCols[1], value: null },
                                            { row: rowCandidates[k].row, col: uniqueCols[2], value: null },
                                            { row: rowCandidates[k].row, col: uniqueCols[3], value: null },
                                            { row: rowCandidates[l].row, col: uniqueCols[0], value: null },
                                            { row: rowCandidates[l].row, col: uniqueCols[1], value: null },
                                            { row: rowCandidates[l].row, col: uniqueCols[2], value: null },
                                            { row: rowCandidates[l].row, col: uniqueCols[3], value: null }
                                        ],
                                        eliminations,
                                        explanation: `Jellyfish on digit ${digit} in rows ${rowCandidates[i].row + 1}, ${rowCandidates[j].row + 1}, ${rowCandidates[k].row + 1}, ${rowCandidates[l].row + 1} and columns ${uniqueCols.map(c => c + 1).join(', ')}. All other candidates for ${digit} in these columns can be eliminated.`
                                    };
                                }
                            }
                        }
                    }
                }
            }
            
            // COLUMN-BASED JELLYFISH
            let colCandidates = [];
            for (let c = 0; c < 9; c++) {
                let rows = [];
                for (let r = 0; r < 9; r++) {
                    if (grid[r][c].value === 0 && grid[r][c].candidates && grid[r][c].candidates.has(digit)) {
                        rows.push(r);
                    }
                }
                if (rows.length >= 2 && rows.length <= 4) {
                    colCandidates.push({ col: c, rows });
                }
            }
            
            // Check all combinations of 4 columns
            for (let i = 0; i < colCandidates.length; i++) {
                for (let j = i + 1; j < colCandidates.length; j++) {
                    for (let k = j + 1; k < colCandidates.length; k++) {
                        for (let l = k + 1; l < colCandidates.length; l++) {
                            const allRows = [
                                ...colCandidates[i].rows,
                                ...colCandidates[j].rows,
                                ...colCandidates[k].rows,
                                ...colCandidates[l].rows
                            ];
                            const uniqueRows = Array.from(new Set(allRows));
                            
                            if (uniqueRows.length === 4) {
                                // Found Jellyfish in columns i, j, k, l and rows uniqueRows
                                let eliminations = [];
                                for (let c = 0; c < 9; c++) {
                                    if (c !== colCandidates[i].col && 
                                        c !== colCandidates[j].col && 
                                        c !== colCandidates[k].col && 
                                        c !== colCandidates[l].col) {
                                        for (const row of uniqueRows) {
                                            if (grid[row][c].value === 0 && 
                                                grid[row][c].candidates && 
                                                grid[row][c].candidates.has(digit)) {
                                                eliminations.push({ row: row, col: c, digit });
                                            }
                                        }
                                    }
                                }
                                
                                if (eliminations.length > 0) {
                                    return {
                                        type: 'jellyfish',
                                        cells: [
                                            { row: uniqueRows[0], col: colCandidates[i].col, value: null },
                                            { row: uniqueRows[1], col: colCandidates[i].col, value: null },
                                            { row: uniqueRows[2], col: colCandidates[i].col, value: null },
                                            { row: uniqueRows[3], col: colCandidates[i].col, value: null },
                                            { row: uniqueRows[0], col: colCandidates[j].col, value: null },
                                            { row: uniqueRows[1], col: colCandidates[j].col, value: null },
                                            { row: uniqueRows[2], col: colCandidates[j].col, value: null },
                                            { row: uniqueRows[3], col: colCandidates[j].col, value: null },
                                            { row: uniqueRows[0], col: colCandidates[k].col, value: null },
                                            { row: uniqueRows[1], col: colCandidates[k].col, value: null },
                                            { row: uniqueRows[2], col: colCandidates[k].col, value: null },
                                            { row: uniqueRows[3], col: colCandidates[k].col, value: null },
                                            { row: uniqueRows[0], col: colCandidates[l].col, value: null },
                                            { row: uniqueRows[1], col: colCandidates[l].col, value: null },
                                            { row: uniqueRows[2], col: colCandidates[l].col, value: null },
                                            { row: uniqueRows[3], col: colCandidates[l].col, value: null }
                                        ],
                                        eliminations,
                                        explanation: `Jellyfish on digit ${digit} in columns ${colCandidates[i].col + 1}, ${colCandidates[j].col + 1}, ${colCandidates[k].col + 1}, ${colCandidates[l].col + 1} and rows ${uniqueRows.map(r => r + 1).join(', ')}. All other candidates for ${digit} in these rows can be eliminated.`
                                    };
                                }
                            }
                        }
                    }
                }
            }
        }
        return null;
    }

    /**
     * Skyscraper
     * A pattern where a digit forms a strong link in two rows/columns that share a house.
     * If the base cells (in the shared house) both contain the digit as a candidate,
     * the digit can be eliminated from cells that see both top cells.
     */
    findSkyscraper(grid) {
        // Check for skyscrapers for each digit 1-9
        for (let digit = 1; digit <= 9; digit++) {
            // Try row-based skyscrapers first (strong links in columns)
            const rowResult = this.findRowBasedSkyscraper(grid, digit);
            if (rowResult) return rowResult;
            
            // Then try column-based skyscrapers (strong links in rows)
            const colResult = this.findColBasedSkyscraper(grid, digit);
            if (colResult) return colResult;
        }
        return null;
    }
    
    /**
     * Helper method to find row-based skyscrapers (strong links in columns)
     */
    findRowBasedSkyscraper(grid, digit) {
        // For each pair of columns, check for skyscraper pattern
        for (let c1 = 0; c1 < 9; c1++) {
            for (let c2 = c1 + 1; c2 < 9; c2++) {
                // Find rows where this digit appears in these columns
                const rowsInC1 = [];
                const rowsInC2 = [];
                
                for (let r = 0; r < 9; r++) {
                    const cell1 = grid[r][c1];
                    const cell2 = grid[r][c2];
                    
                    if (cell1.value === 0 && cell1.candidates && cell1.candidates.has(digit)) {
                        rowsInC1.push(r);
                    }
                    if (cell2.value === 0 && cell2.candidates && cell2.candidates.has(digit)) {
                        rowsInC2.push(r);
                    }
                }
                
                // For a skyscraper, we need exactly two rows in each column
                if (rowsInC1.length === 2 && rowsInC2.length === 2) {
                    // Find the common row (base) and different rows (tops)
                    const baseRow1 = rowsInC1[0];
                    const baseRow2 = rowsInC1[1];
                    
                    // Check if one of these rows is in the second column's candidates
                    if (rowsInC2.includes(baseRow1) || rowsInC2.includes(baseRow2)) {
                        // Determine which row is the base (appears in both columns)
                        const baseRow = rowsInC2.includes(baseRow1) ? baseRow1 : 
                                      rowsInC2.includes(baseRow2) ? baseRow2 : null;
                        
                        if (baseRow === null) continue;
                        
                        // Get the top rows (one in each column that's not the base)
                        const topRow1 = rowsInC1.find(r => r !== baseRow);
                        const topRow2 = rowsInC2.find(r => r !== baseRow);
                        
                        // Find cells that see both top cells
                        const eliminations = [];
                        
                        // Check cells in the same row as the base that see both tops
                        for (let c = 0; c < 9; c++) {
                            // Skip the base columns
                            if (c === c1 || c === c2) continue;
                            
                            const cell = grid[baseRow][c];
                            if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                                // Check if this cell sees both top cells
                                const seesTop1 = (c === c1) || (Math.floor(c / 3) === Math.floor(c1 / 3) && 
                                                             Math.floor(baseRow / 3) === Math.floor(topRow1 / 3));
                                const seesTop2 = (c === c2) || (Math.floor(c / 3) === Math.floor(c2 / 3) && 
                                                             Math.floor(baseRow / 3) === Math.floor(topRow2 / 3));
                                
                                if (seesTop1 && seesTop2) {
                                    eliminations.push({
                                        row: baseRow,
                                        col: c,
                                        digit,
                                        reason: `Skyscraper: Can remove ${digit} from (${baseRow+1},${c+1})`
                                    });
                                }
                            }
                        }
                        
                        // Also check cells that see both top cells in their respective rows
                        for (let c = 0; c < 9; c++) {
                            // Skip the top columns
                            if (c === c1 || c === c2) continue;
                            
                            // Check first top row
                            const cell1 = grid[topRow1][c];
                            if (cell1.value === 0 && cell1.candidates && cell1.candidates.has(digit)) {
                                // If this cell sees the other top cell in the same row, it's a candidate for elimination
                                if (Math.floor(c / 3) === Math.floor(c2 / 3) && 
                                    Math.floor(topRow1 / 3) === Math.floor(topRow2 / 3)) {
                                    eliminations.push({
                                        row: topRow1,
                                        col: c,
                                        digit,
                                        reason: `Skyscraper: Can remove ${digit} from (${topRow1+1},${c+1})`
                                    });
                                }
                            }
                            
                            // Check second top row
                            const cell2 = grid[topRow2][c];
                            if (cell2.value === 0 && cell2.candidates && cell2.candidates.has(digit)) {
                                // If this cell sees the other top cell in the same row, it's a candidate for elimination
                                if (Math.floor(c / 3) === Math.floor(c1 / 3) && 
                                    Math.floor(topRow2 / 3) === Math.floor(topRow1 / 3)) {
                                    eliminations.push({
                                        row: topRow2,
                                        col: c,
                                        digit,
                                        reason: `Skyscraper: Can remove ${digit} from (${topRow2+1},${c+1})`
                                    });
                                }
                            }
                        }
                        
                        if (eliminations.length > 0) {
                            return {
                                type: 'skyscraper',
                                cells: [
                                    {row: baseRow, col: c1, value: null, candidates: [digit]},
                                    {row: baseRow, col: c2, value: null, candidates: [digit]},
                                    {row: topRow1, col: c1, value: null, candidates: [digit]},
                                    {row: topRow2, col: c2, value: null, candidates: [digit]}
                                ],
                                eliminations,
                                explanation: `Skyscraper on ${digit} with base in row ${baseRow+1} ` +
                                           `and columns ${c1+1},${c2+1}. Tops at (${topRow1+1},${c1+1}) and (${topRow2+1},${c2+1}). ` +
                                           `Eliminates ${digit} from ${eliminations.length} cells.`
                            };
                        }
                    }
                }
            }
        }
        return null;
    }
    
    /**
     * Helper method to find column-based skyscrapers (strong links in rows)
     */
    findColBasedSkyscraper(grid, digit) {
        // For each pair of rows, check for skyscraper pattern
        for (let r1 = 0; r1 < 9; r1++) {
            for (let r2 = r1 + 1; r2 < 9; r2++) {
                // Find columns where this digit appears in these rows
                const colsInR1 = [];
                const colsInR2 = [];
                
                for (let c = 0; c < 9; c++) {
                    const cell1 = grid[r1][c];
                    const cell2 = grid[r2][c];
                    
                    if (cell1.value === 0 && cell1.candidates && cell1.candidates.has(digit)) {
                        colsInR1.push(c);
                    }
                    if (cell2.value === 0 && cell2.candidates && cell2.candidates.has(digit)) {
                        colsInR2.push(c);
                    }
                }
                
                // For a skyscraper, we need exactly two columns in each row
                if (colsInR1.length === 2 && colsInR2.length === 2) {
                    // Find the common column (base) and different columns (tops)
                    const baseCol1 = colsInR1[0];
                    const baseCol2 = colsInR1[1];
                    
                    // Check if one of these columns is in the second row's candidates
                    if (colsInR2.includes(baseCol1) || colsInR2.includes(baseCol2)) {
                        // Determine which column is the base (appears in both rows)
                        const baseCol = colsInR2.includes(baseCol1) ? baseCol1 : 
                                      colsInR2.includes(baseCol2) ? baseCol2 : null;
                        
                        if (baseCol === null) continue;
                        
                        // Get the top columns (one in each row that's not the base)
                        const topCol1 = colsInR1.find(c => c !== baseCol);
                        const topCol2 = colsInR2.find(c => c !== baseCol);
                        
                        // Find cells that see both top cells
                        const eliminations = [];
                        
                        // Check cells in the same column as the base that see both tops
                        for (let r = 0; r < 9; r++) {
                            // Skip the base rows
                            if (r === r1 || r === r2) continue;
                            
                            const cell = grid[r][baseCol];
                            if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                                // Check if this cell sees both top cells
                                const seesTop1 = (r === r1) || (Math.floor(r / 3) === Math.floor(r1 / 3) && 
                                                             Math.floor(baseCol / 3) === Math.floor(topCol1 / 3));
                                const seesTop2 = (r === r2) || (Math.floor(r / 3) === Math.floor(r2 / 3) && 
                                                             Math.floor(baseCol / 3) === Math.floor(topCol2 / 3));
                                
                                if (seesTop1 && seesTop2) {
                                    eliminations.push({
                                        row: r,
                                        col: baseCol,
                                        digit,
                                        reason: `Skyscraper: Can remove ${digit} from (${r+1},${baseCol+1})`
                                    });
                                }
                            }
                        }
                        
                        // Also check cells that see both top cells in their respective columns
                        for (let r = 0; r < 9; r++) {
                            // Skip the top rows
                            if (r === r1 || r === r2) continue;
                            
                            // Check first top column
                            const cell1 = grid[r][topCol1];
                            if (cell1.value === 0 && cell1.candidates && cell1.candidates.has(digit)) {
                                // If this cell sees the other top cell in the same column, it's a candidate for elimination
                                if (Math.floor(r / 3) === Math.floor(r2 / 3) && 
                                    Math.floor(topCol1 / 3) === Math.floor(topCol2 / 3)) {
                                    eliminations.push({
                                        row: r,
                                        col: topCol1,
                                        digit,
                                        reason: `Skyscraper: Can remove ${digit} from (${r+1},${topCol1+1})`
                                    });
                                }
                            }
                            
                            // Check second top column
                            const cell2 = grid[r][topCol2];
                            if (cell2.value === 0 && cell2.candidates && cell2.candidates.has(digit)) {
                                // If this cell sees the other top cell in the same column, it's a candidate for elimination
                                if (Math.floor(r / 3) === Math.floor(r1 / 3) && 
                                    Math.floor(topCol2 / 3) === Math.floor(topCol1 / 3)) {
                                    eliminations.push({
                                        row: r,
                                        col: topCol2,
                                        digit,
                                        reason: `Skyscraper: Can remove ${digit} from (${r+1},${topCol2+1})`
                                    });
                                }
                            }
                        }
                        
                        if (eliminations.length > 0) {
                            return {
                                type: 'skyscraper',
                                cells: [
                                    {row: r1, col: baseCol, value: null, candidates: [digit]},
                                    {row: r2, col: baseCol, value: null, candidates: [digit]},
                                    {row: r1, col: topCol1, value: null, candidates: [digit]},
                                    {row: r2, col: topCol2, value: null, candidates: [digit]}
                                ],
                                eliminations,
                                explanation: `Skyscraper on ${digit} with base in column ${baseCol+1} ` +
                                           `and rows ${r1+1},${r2+1}. Tops at (${r1+1},${topCol1+1}) and (${r2+1},${topCol2+1}). ` +
                                           `Eliminates ${digit} from ${eliminations.length} cells.`
                            };
                        }
                    }
                }
            }
        }
        return null;
    }

    /**
     * 2-String Kite
     * A pattern combining strong links in a row and column for a single digit.
     * When a digit has exactly two possible positions in a row and in a column,
     * and they share a box, the digit can be eliminated from cells that see both ends.
     */
    findTwoStringKite(grid) {
        // Check for 2-String Kite for each digit 1-9
        for (let digit = 1; digit <= 9; digit++) {
            // Find all strong links (rows/columns with exactly two candidates for this digit)
            const strongRows = [];
            const strongCols = [];
            
            // Check rows for strong links
            for (let r = 0; r < 9; r++) {
                const positions = [];
                for (let c = 0; c < 9; c++) {
                    const cell = grid[r][c];
                    if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                        positions.push({row: r, col: c});
                    }
                }
                if (positions.length === 2) {
                    strongRows.push({
                        row: r,
                        cells: positions,
                        isRow: true
                    });
                }
            }
            
            // Check columns for strong links
            for (let c = 0; c < 9; c++) {
                const positions = [];
                for (let r = 0; r < 9; r++) {
                    const cell = grid[r][c];
                    if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                        positions.push({row: r, col: c});
                    }
                }
                if (positions.length === 2) {
                    strongCols.push({
                        col: c,
                        cells: positions,
                        isCol: true
                    });
                }
            }
            
            // Check all combinations of strong rows and columns
            for (const strongRow of strongRows) {
                for (const strongCol of strongCols) {
                    // Find the intersection cell (if any)
                    const intersection = strongRow.cells.find(cell => 
                        cell.col === strongCol.col
                    );
                    
                    // Skip if no intersection or if intersection is already solved
                    if (!intersection || grid[intersection.row][intersection.col].value !== 0) {
                        continue;
                    }
                    
                    // Get the other cell in the row (not at the intersection)
                    const rowCell = strongRow.cells.find(cell => cell !== intersection);
                    
                    // Get the other cell in the column (not at the intersection)
                    const colCell = strongCol.cells.find(cell => 
                        cell.row !== intersection.row || cell.col !== intersection.col
                    );
                    
                    if (!rowCell || !colCell) continue;
                    
                    // Check if rowCell and colCell share a box
                    if (this.sameBox(rowCell.row, rowCell.col, colCell.row, colCell.col)) {
                        // Check if there are any cells that see both rowCell and colCell
                        const eliminations = [];
                        
                        // Get all cells that see both rowCell and colCell
                        const seenByBoth = this.getCellsSeenByBoth(
                            rowCell.row, rowCell.col,
                            colCell.row, colCell.col
                        );
                        
                        // Check each cell seen by both for the digit
                        for (const {row, col} of seenByBoth) {
                            // Skip the cells that are part of the pattern
                            if ((row === intersection.row && col === intersection.col) ||
                                (row === rowCell.row && col === rowCell.col) ||
                                (row === colCell.row && col === colCell.col)) {
                                continue;
                            }
                            
                            const cell = grid[row][col];
                            if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                                eliminations.push({
                                    row,
                                    col,
                                    digit,
                                    reason: `2-String Kite: Can remove ${digit} from (${row+1},${col+1})`
                                });
                            }
                        }
                        
                        if (eliminations.length > 0) {
                            const result = {
                                type: 'two_string_kite',
                                cells: [
                                    {row: intersection.row, col: intersection.col, value: null, candidates: [digit]},
                                    {row: rowCell.row, col: rowCell.col, value: null, candidates: [digit]},
                                    {row: colCell.row, col: colCell.col, value: null, candidates: [digit]},
                                ],
                                eliminations: eliminations,
                                explanation: '2-String Kite on ' + digit + ' with row ' + (strongRow.row + 1) + ' and column ' + (strongCol.col + 1) + '. ' +
                                           'Eliminates ' + digit + ' from ' + eliminations.length + ' cells.'
                            };
                            return result;
                        }
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Turbot Fish
     * A pattern that extends the concept of X-Wing and Skyscraper, using a chain of strong links.
     * It can be seen as a bent version of a Skyscraper or a finned X-Wing.
     */
    findTurbotFish(grid) {
        // Check for Turbot Fish for each digit 1-9
        for (let digit = 1; digit <= 9; digit++) {
            // Try all four possible orientations of the pattern
            const result = this.findTurbotFishForDigit(grid, digit);
            if (result) return result;
        }
        return null;
    }
    
    /**
     * Helper method to find Turbot Fish for a specific digit
     */
    findTurbotFishForDigit(grid, digit) {
        // Find all strong links (pairs of candidates) for this digit
        const strongLinks = [];
        
        // Check rows for strong links
        for (let r = 0; r < 9; r++) {
            const positions = [];
            for (let c = 0; c < 9; c++) {
                const cell = grid[r][c];
                if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                    positions.push({row: r, col: c});
                }
            }
            if (positions.length === 2) {
                strongLinks.push({
                    type: 'row',
                    index: r,
                    cells: positions,
                    isRow: true
                });
            }
        }
        
        // Check columns for strong links
        for (let c = 0; c < 9; c++) {
            const positions = [];
            for (let r = 0; r < 9; r++) {
                const cell = grid[r][c];
                if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                    positions.push({row: r, col: c});
                }
            }
            if (positions.length === 2) {
                strongLinks.push({
                    type: 'col',
                    index: c,
                    cells: positions,
                    isCol: true
                });
            }
        }
        
        // Check boxes for strong links
        for (let boxR = 0; boxR < 9; boxR += 3) {
            for (let boxC = 0; boxC < 9; boxC += 3) {
                const positions = [];
                for (let r = boxR; r < boxR + 3; r++) {
                    for (let c = boxC; c < boxC + 3; c++) {
                        const cell = grid[r][c];
                        if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                            positions.push({row: r, col: c});
                        }
                    }
                }
                if (positions.length === 2) {
                    strongLinks.push({
                        type: 'box',
                        boxRow: Math.floor(boxR / 3),
                        boxCol: Math.floor(boxC / 3),
                        cells: positions,
                        isBox: true
                    });
                }
            }
        }
        
        // Try to find a Turbot Fish pattern
        for (let i = 0; i < strongLinks.length; i++) {
            for (let j = i + 1; j < strongLinks.length; j++) {
                const link1 = strongLinks[i];
                const link2 = strongLinks[j];
                
                // Skip if both links are of the same type and index
                if (link1.type === link2.type && link1.index === link2.index) continue;
                
                // Find the intersection cell (if any)
                const intersection = this.findIntersection(link1, link2);
                if (!intersection) continue;
                
                // Get the other cells in each strong link
                const otherCell1 = link1.cells.find(cell => 
                    cell.row !== intersection.row || cell.col !== intersection.col
                );
                const otherCell2 = link2.cells.find(cell => 
                    cell.row !== intersection.row || cell.col !== intersection.col
                );
                
                if (!otherCell1 || !otherCell2) continue;
                
                // Check if otherCell1 and otherCell2 see each other (same row, column, or box)
                if (otherCell1.row !== otherCell2.row && 
                    otherCell1.col !== otherCell2.col && 
                    !this.sameBox(otherCell1.row, otherCell1.col, otherCell2.row, otherCell2.col)) {
                    continue;
                }
                
                // Find cells that see both otherCell1 and otherCell2
                const seenByBoth = this.getCellsSeenByBoth(
                    otherCell1.row, 
                    otherCell1.col,
                    otherCell2.row, 
                    otherCell2.col
                );
                
                const eliminations = [];
                
                // Check each cell seen by both for the digit
                for (const {row, col} of seenByBoth) {
                    // Skip the cells that are part of the pattern
                    if ((row === intersection.row && col === intersection.col) ||
                        (row === otherCell1.row && col === otherCell1.col) ||
                        (row === otherCell2.row && col === otherCell2.col)) {
                        continue;
                    }
                    
                    const cell = grid[row][col];
                    if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                        eliminations.push({
                            row,
                            col,
                            digit,
                            reason: `Turbot Fish: Can remove ${digit} from (${row+1},${col+1})`
                        });
                    }
                }
                
                if (eliminations.length > 0) {
                    return {
                        type: 'turbot_fish',
                        cells: [
                            {row: intersection.row, col: intersection.col, value: null, candidates: [digit]},
                            {row: otherCell1.row, col: otherCell1.col, value: null, candidates: [digit]},
                            {row: otherCell2.row, col: otherCell2.col, value: null, candidates: [digit]}
                        ],
                        eliminations,
                        explanation: `Turbot Fish on ${digit} with strong links in ${link1.type} ${link1.index + 1} and ${link2.type} ${link2.index + 1}. ` +
                                   `Eliminates ${digit} from ${eliminations.length} cells.`
                    };
                }
            }
        }
        
        return null;
    }
    
    /**
     * Helper method to find the intersection cell between two strong links
     */
    findIntersection(link1, link2) {
        for (const cell1 of link1.cells) {
            for (const cell2 of link2.cells) {
                if (cell1.row === cell2.row && cell1.col === cell2.col) {
                    return {row: cell1.row, col: cell1.col};
                }
            }
        }
        return null;
    }

    /**
     * Empty Rectangle
     * A pattern where a digit's candidates in a box are limited to one row or column.
     * This allows for eliminations in the corresponding row/column outside the box.
     */
    findEmptyRectangle(grid) {
        // Check for Empty Rectangle for each digit 1-9
        for (let digit = 1; digit <= 9; digit++) {
            // Try all 9 boxes
            for (let boxR = 0; boxR < 9; boxR += 3) {
                for (let boxC = 0; boxC < 9; boxC += 3) {
                    // Find all candidates for this digit in the box
                    const candidates = [];
                    for (let r = boxR; r < boxR + 3; r++) {
                        for (let c = boxC; c < boxC + 3; c++) {
                            const cell = grid[r][c];
                            if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                                candidates.push({row: r, col: c});
                            }
                        }
                    }
                    
                    // Skip if no candidates or if candidates span multiple rows and columns
                    if (candidates.length < 2) continue;
                    
                    // Check if all candidates are in the same row
                    const uniqueRows = [...new Set(candidates.map(c => c.row))];
                    const uniqueCols = [...new Set(candidates.map(c => c.col))];
                    
                    // Check for row-based empty rectangle
                    if (uniqueRows.length === 1) {
                        const row = uniqueRows[0];
                        const result = this.checkEmptyRectangleRow(grid, digit, row, boxR, boxC);
                        if (result) return result;
                    }
                    
                    // Check for column-based empty rectangle
                    if (uniqueCols.length === 1) {
                        const col = uniqueCols[0];
                        const result = this.checkEmptyRectangleCol(grid, digit, col, boxR, boxC);
                        if (result) return result;
                    }
                }
            }
        }
        return null;
    }
    
    /**
     * Helper method to check for row-based empty rectangle
     */
    checkEmptyRectangleRow(grid, digit, row, boxR, boxC) {
        // Find other candidates in the same row but outside the box
        const otherCandidates = [];
        for (let c = 0; c < 9; c++) {
            // Skip the current box
            if (c >= boxC && c < boxC + 3) continue;
            
            const cell = grid[row][c];
            if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                otherCandidates.push({row, col: c});
            }
        }
        
        // If no other candidates in the row, no eliminations possible
        if (otherCandidates.length === 0) return null;
        
        // Check if these candidates form a strong link with any candidates in their columns
        for (const {row: r, col: c} of otherCandidates) {
            // Check for strong links in the column
            const colCandidates = [];
            for (let r2 = 0; r2 < 9; r2++) {
                // Skip the current cell and cells in the same box row
                if (r2 === row || Math.floor(r2 / 3) === Math.floor(row / 3)) continue;
                
                const cell = grid[r2][c];
                if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                    colCandidates.push({row: r2, col: c});
                }
            }
            
            // If we have a strong link (exactly one other candidate in the column)
            if (colCandidates.length === 1) {
                const {row: r2, col: c2} = colCandidates[0];
                
                // Check if this candidate is in the same box as our original candidates
                if (Math.floor(r2 / 3) === Math.floor(boxR / 3) && 
                    Math.floor(c2 / 3) === Math.floor(boxC / 3)) {
                    continue; // Skip if in the same box
                }
                
                // Find cells that see both the original candidates and the linked candidate
                const eliminations = [];
                
                // Get cells in the box that see the linked candidate
                for (let br = boxR; br < boxR + 3; br++) {
                    for (let bc = boxC; bc < boxC + 3; bc++) {
                        // Skip the row with the original candidates
                        if (br === row) continue;
                        
                        // Check if this cell sees the linked candidate
                        const seesLinked = (br === r2) || (bc === c2) || 
                                         (Math.floor(br / 3) === Math.floor(r2 / 3) && 
                                          Math.floor(bc / 3) === Math.floor(c2 / 3));
                        
                        if (seesLinked) {
                            const cell = grid[br][bc];
                            if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                                eliminations.push({
                                    row: br,
                                    col: bc,
                                    digit,
                                    reason: `Empty Rectangle: Can remove ${digit} from (${br+1},${bc+1})`
                                });
                            }
                        }
                    }
                }
                
                if (eliminations.length > 0) {
                    // Get all cells involved in the pattern
                    const boxCells = [];
                    for (let br = boxR; br < boxR + 3; br++) {
                        for (let bc = boxC; bc < boxC + 3; bc++) {
                            const cell = grid[br][bc];
                            if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                                boxCells.push({row: br, col: bc, value: null, candidates: [digit]});
                            }
                        }
                    }
                    
                    return {
                        type: 'empty_rectangle',
                        cells: [
                            ...boxCells,
                            {row, col: c, value: null, candidates: [digit]},
                            {row: r2, col: c2, value: null, candidates: [digit]}
                        ],
                        eliminations,
                        explanation: `Empty Rectangle on ${digit} in box (${Math.floor(boxR/3)+1},${Math.floor(boxC/3)+1}) ` +
                                   `aligned in row ${row+1}. Eliminates ${digit} from ${eliminations.length} cells.`
                    };
                }
            }
        }
        
        return null;
    }
    
    /**
     * Helper method to check for column-based empty rectangle
     */
    checkEmptyRectangleCol(grid, digit, col, boxR, boxC) {
        // Find other candidates in the same column but outside the box
        const otherCandidates = [];
        for (let r = 0; r < 9; r++) {
            // Skip the current box
            if (r >= boxR && r < boxR + 3) continue;
            
            const cell = grid[r][col];
            if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                otherCandidates.push({row: r, col});
            }
        }
        
        // If no other candidates in the column, no eliminations possible
        if (otherCandidates.length === 0) return null;
        
        // Check if these candidates form a strong link with any candidates in their rows
        for (const {row: r, col: c} of otherCandidates) {
            // Check for strong links in the row
            const rowCandidates = [];
            for (let c2 = 0; c2 < 9; c2++) {
                // Skip the current cell and cells in the same box column
                if (c2 === col || Math.floor(c2 / 3) === Math.floor(col / 3)) continue;
                
                const cell = grid[r][c2];
                if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                    rowCandidates.push({row: r, col: c2});
                }
            }
            
            // If we have a strong link (exactly one other candidate in the row)
            if (rowCandidates.length === 1) {
                const {row: r2, col: c2} = rowCandidates[0];
                
                // Check if this candidate is in the same box as our original candidates
                if (Math.floor(r2 / 3) === Math.floor(boxR / 3) && 
                    Math.floor(c2 / 3) === Math.floor(boxC / 3)) {
                    continue; // Skip if in the same box
                }
                
                // Find cells that see both the original candidates and the linked candidate
                const eliminations = [];
                
                // Get cells in the box that see the linked candidate
                for (let br = boxR; br < boxR + 3; br++) {
                    for (let bc = boxC; bc < boxC + 3; bc++) {
                        // Skip the column with the original candidates
                        if (bc === col) continue;
                        
                        // Check if this cell sees the linked candidate
                        const seesLinked = (br === r2) || (bc === c2) || 
                                         (Math.floor(br / 3) === Math.floor(r2 / 3) && 
                                          Math.floor(bc / 3) === Math.floor(c2 / 3));
                        
                        if (seesLinked) {
                            const cell = grid[br][bc];
                            if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                                eliminations.push({
                                    row: br,
                                    col: bc,
                                    digit,
                                    reason: `Empty Rectangle: Can remove ${digit} from (${br+1},${bc+1})`
                                });
                            }
                        }
                    }
                }
                
                if (eliminations.length > 0) {
                    // Get all cells involved in the pattern
                    const boxCells = [];
                    for (let br = boxR; br < boxR + 3; br++) {
                        for (let bc = boxC; bc < boxC + 3; bc++) {
                            const cell = grid[br][bc];
                            if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                                boxCells.push({row: br, col: bc, value: null, candidates: [digit]});
                            }
                        }
                    }
                    
                    return {
                        type: 'empty_rectangle',
                        cells: [
                            ...boxCells,
                            {row: r, col, value: null, candidates: [digit]},
                            {row: r2, col: c2, value: null, candidates: [digit]}
                        ],
                        eliminations,
                        explanation: `Empty Rectangle on ${digit} in box (${Math.floor(boxR/3)+1},${Math.floor(boxC/3)+1}) ` +
                                   `aligned in column ${col+1}. Eliminates ${digit} from ${eliminations.length} cells.`
                    };
                }
            }
        }
        
        return null;
    }

    // ===== UNIQUENESS PATTERNS =====
    
    /**
     * Unique Rectangle Type 1
     * Four cells forming a rectangle with three cells having the same two candidates.
     */
    findUniqueRectangleType1(grid) {
        // Check all possible rectangles (pairs of rows and columns)
        for (let r1 = 0; r1 < 9; r1++) {
            for (let r2 = r1 + 1; r2 < 9; r2++) {
                for (let c1 = 0; c1 < 9; c1++) {
                    for (let c2 = c1 + 1; c2 < 9; c2++) {
                        // Check if these four cells form a rectangle with the same two candidates
                        const cell1 = grid[r1][c1];
                        const cell2 = grid[r1][c2];
                        const cell3 = grid[r2][c1];
                        const cell4 = grid[r2][c2];
                        
                        // All four cells must be empty and have exactly 2 candidates
                        if (cell1.value !== 0 || cell2.value !== 0 || 
                            cell3.value !== 0 || cell4.value !== 0) {
                            continue;
                        }
                        
                        if (!cell1.candidates || !cell2.candidates || 
                            !cell3.candidates || !cell4.candidates) {
                            continue;
                        }
                        
                        const candidates1 = Array.from(cell1.candidates).sort((a, b) => a - b);
                        const candidates2 = Array.from(cell2.candidates).sort((a, b) => a - b);
                        const candidates3 = Array.from(cell3.candidates).sort((a, b) => a - b);
                        const candidates4 = Array.from(cell4.candidates).sort((a, b) => a - b);
                        
                        // All four cells must have exactly 2 candidates and they must be the same
                        if (candidates1.length !== 2 || candidates2.length !== 2 || 
                            candidates3.length !== 2 || candidates4.length !== 2) {
                            continue;
                        }
                        
                        // Check if all four cells have the same two candidates
                        const allSame = [candidates2, candidates3, candidates4].every(c => 
                            c.length === 2 && 
                            c[0] === candidates1[0] && 
                            c[1] === candidates1[1]
                        );
                        
                        if (!allSame) continue;
                        
                        // For Type 1, one of the cells must be in the same box as another cell
                        // and one of the candidates must be a "victim" that can be eliminated
                        
                        // Check if any two cells are in the same box
                        const cells = [
                            {row: r1, col: c1, box: Math.floor(r1/3)*3 + Math.floor(c1/3)},
                            {row: r1, col: c2, box: Math.floor(r1/3)*3 + Math.floor(c2/3)},
                            {row: r2, col: c1, box: Math.floor(r2/3)*3 + Math.floor(c1/3)},
                            {row: r2, col: c2, box: Math.floor(r2/3)*3 + Math.floor(c2/3)}
                        ];
                        
                        // Find pairs of cells in the same box
                        const boxMap = new Map();
                        cells.forEach((cell, idx) => {
                            if (!boxMap.has(cell.box)) {
                                boxMap.set(cell.box, []);
                            }
                            boxMap.get(cell.box).push(idx);
                        });
                        
                        // We need at least two cells in the same box for a Unique Rectangle
                        for (const [box, indices] of boxMap.entries()) {
                            if (indices.length >= 2) {
                                // For Type 1, we need exactly one cell with extra candidates
                                // But since we already checked all have exactly 2 candidates,
                                // this would be a Deadly Pattern, so the puzzle would be invalid
                                // Therefore, this case shouldn't happen in a valid puzzle
                                
                                // However, if we find such a pattern, we can eliminate one of the candidates
                                // from one of the cells to prevent the Deadly Pattern
                                const [idx1, idx2] = indices;
                                const cellA = cells[idx1];
                                const cellB = cells[idx2];
                                
                                // For Type 1, we can eliminate one of the candidates from one of the cells
                                // to prevent the Deadly Pattern
                                const eliminations = [];
                                
                                // Choose one of the candidates to eliminate (arbitrarily the first one)
                                const candidateToEliminate = candidates1[0];
                                eliminations.push({
                                    row: cellA.row,
                                    col: cellA.col,
                                    candidates: [candidateToEliminate],
                                    reason: `Unique Rectangle Type 1: Can remove ${candidateToEliminate} to avoid Deadly Pattern`
                                });
                                
                                if (eliminations.length > 0) {
                                    return {
                                        type: 'unique_rectangle_type1',
                                        cells: [
                                            {row: r1, col: c1, candidates: candidates1},
                                            {row: r1, col: c2, candidates: candidates2},
                                            {row: r2, col: c1, candidates: candidates3},
                                            {row: r2, col: c2, candidates: candidates4}
                                        ],
                                        candidates: [...candidates1],
                                        eliminations: eliminations.map(e => ({
                                            row: e.row,
                                            col: e.col,
                                            value: 0,
                                            candidates: e.candidates,
                                            reason: e.reason
                                        })),
                                        explanation: `Unique Rectangle Type 1 found with digits ${candidates1.join(',')} at ` +
                                                   `(${r1+1},${c1+1}), (${r1+1},${c2+1}), (${r2+1},${c1+1}), (${r2+1},${c2+1}). ` +
                                                   `To avoid a Deadly Pattern, ${candidateToEliminate} can be removed from (${cellA.row+1},${cellA.col+1}).`
                                    };
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Unique Rectangle Type 2
     * Four cells forming a rectangle with extra candidates in the fourth cell.
     */
    findUniqueRectangleType2(grid) {
        // Check all possible rectangles (pairs of rows and columns)
        for (let r1 = 0; r1 < 9; r1++) {
            for (let r2 = r1 + 1; r2 < 9; r2++) {
                for (let c1 = 0; c1 < 9; c1++) {
                    for (let c2 = c1 + 1; c2 < 9; c2++) {
                        // Get the four cells that form a rectangle
                        const cell1 = grid[r1][c1];
                        const cell2 = grid[r1][c2];
                        const cell3 = grid[r2][c1];
                        const cell4 = grid[r2][c2];
                        
                        // All four cells must be empty
                        if (cell1.value !== 0 || cell2.value !== 0 || 
                            cell3.value !== 0 || cell4.value !== 0) {
                            continue;
                        }
                        
                        // All must have candidates
                        if (!cell1.candidates || !cell2.candidates || 
                            !cell3.candidates || !cell4.candidates) {
                            continue;
                        }
                        
                        // Sort candidates for comparison
                        const candidates1 = Array.from(cell1.candidates).sort((a, b) => a - b);
                        const candidates2 = Array.from(cell2.candidates).sort((a, b) => a - b);
                        const candidates3 = Array.from(cell3.candidates).sort((a, b) => a - b);
                        const candidates4 = Array.from(cell4.candidates).sort((a, b) => a - b);
                        
                        // For Type 2, three cells should have exactly 2 candidates (the same two)
                        // and the fourth cell should have those two candidates plus one or more extra
                        
                        // Check all four possible configurations where one cell is the "corner" with extra candidates
                        const configs = [
                            { corner: 0, others: [candidates2, candidates3, candidates4] },
                            { corner: 1, others: [candidates1, candidates3, candidates4] },
                            { corner: 2, others: [candidates1, candidates2, candidates4] },
                            { corner: 3, others: [candidates1, candidates2, candidates3] }
                        ];
                        
                        for (const config of configs) {
                            const cornerCandidates = [candidates1, candidates2, candidates3, candidates4][config.corner];
                            
                            // The corner cell should have 3 candidates (2 base + 1 extra)
                            if (cornerCandidates.length !== 3) continue;
                            
                            // The other three cells should have exactly 2 candidates
                            if (config.others.some(c => c.length !== 2)) continue;
                            
                            // All three other cells should have the same two candidates
                            const baseCandidates = config.others[0];
                            if (!config.others.every(c => c[0] === baseCandidates[0] && c[1] === baseCandidates[1])) {
                                continue;
                            }
                            
                            // The corner cell should contain both base candidates
                            if (!baseCandidates.every(d => cornerCandidates.includes(d))) {
                                continue;
                            }
                            
                            // Find the extra candidate in the corner cell
                            const extraCandidates = cornerCandidates.filter(d => !baseCandidates.includes(d));
                            if (extraCandidates.length === 0) continue;
                            
                            // For Type 2, the extra candidate can be eliminated from the corner cell
                            // because if it were true, it would create a Deadly Pattern
                            const eliminations = [];
                            const cornerRow = [r1, r1, r2, r2][config.corner];
                            const cornerCol = [c1, c2, c1, c2][config.corner];
                            
                            eliminations.push({
                                row: cornerRow,
                                col: cornerCol,
                                candidates: extraCandidates,
                                reason: `Unique Rectangle Type 2: Can eliminate ${extraCandidates.join(',')} to avoid Deadly Pattern`
                            });
                            
                            if (eliminations.length > 0) {
                                const cellPositions = [
                                    {row: r1, col: c1},
                                    {row: r1, col: c2},
                                    {row: r2, col: c1},
                                    {row: r2, col: c2}
                                ];
                                
                                return {
                                    type: 'unique_rectangle_type2',
                                    cells: [
                                        {row: r1, col: c1, candidates: candidates1},
                                        {row: r1, col: c2, candidates: candidates2},
                                        {row: r2, col: c1, candidates: candidates3},
                                        {row: r2, col: c2, candidates: candidates4}
                                    ],
                                    baseCandidates: [...baseCandidates],
                                    extraCandidates: [...extraCandidates],
                                    eliminations: eliminations.map(e => ({
                                        row: e.row,
                                        col: e.col,
                                        value: 0,
                                        candidates: e.candidates,
                                        reason: e.reason
                                    })),
                                    explanation: `Unique Rectangle Type 2 found with base candidates ${baseCandidates.join(',')} at ` +
                                               `(${r1+1},${c1+1}), (${r1+1},${c2+1}), (${r2+1},${c1+1}), (${r2+1},${c2+1}). ` +
                                               `Cell (${cornerRow+1},${cornerCol+1}) has extra candidate(s) ${extraCandidates.join(',')} ` +
                                               `which can be eliminated to avoid a Deadly Pattern.`
                                };
                            }
                        }
                    }
                }
            }
        }
        
        return null;
    }

    // ... [Similar placeholders for other Unique Rectangle types 3-6]


    // ===== WINGS =====
    
    /**
     * XY-Wing
     * A pattern involving three cells (pivot and two pincers) with candidates XY, XZ, and YZ.
     * If the pivot sees both pincers, Z can be eliminated from cells seen by both pincers.
     */
    findXYWing(grid) {
        // Find all bivalue cells (cells with exactly two candidates)
        const bivalueCells = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = grid[r][c];
                if (cell.value === 0 && cell.candidates && cell.candidates.size === 2) {
                    bivalueCells.push({
                        row: r,
                        col: c,
                        candidates: Array.from(cell.candidates).sort((a, b) => a - b)
                    });
                }
            }
        }

        // Check each potential pivot cell (has exactly two candidates)
        for (const pivot of bivalueCells) {
            const [x, y] = pivot.candidates;
            
            // Find pincers (cells that share one candidate with pivot)
            const xPincers = [];
            const yPincers = [];
            
            for (const cell of bivalueCells) {
                // Skip the pivot itself
                if (cell.row === pivot.row && cell.col === pivot.col) continue;
                
                const [a, b] = cell.candidates;
                
                // Check for XZ pincer (shares X with pivot)
                if (a === x || b === x) {
                    const z = a === x ? b : a;
                    xPincers.push({...cell, z});
                }
                // Check for YZ pincer (shares Y with pivot)
                else if (a === y || b === y) {
                    const z = a === y ? b : a;
                    yPincers.push({...cell, z});
                }
            }
            
            // Check all combinations of xPincers and yPincers
            for (const xPincer of xPincers) {
                for (const yPincer of yPincers) {
                    // Pincers must share the same Z candidate
                    if (xPincer.z !== yPincer.z) continue;
                    
                    // Pincers must see each other (same row, col, or box)
                    if (xPincer.row !== yPincer.row && 
                        xPincer.col !== yPincer.col && 
                        !this.sameBox(xPincer.row, xPincer.col, yPincer.row, yPincer.col)) {
                        continue;
                    }
                    
                    // Find cells that see both pincers where we can eliminate Z
                    const z = xPincer.z;
                    const eliminations = [];
                    
                    // Get all cells seen by both pincers
                    const seenByBoth = this.getCellsSeenByBoth(
                        xPincer.row, xPincer.col, 
                        yPincer.row, yPincer.col
                    );
                    
                    // Check each cell seen by both pincers
                    for (const {row, col} of seenByBoth) {
                        const cell = grid[row][col];
                        if (cell.value === 0 && cell.candidates && cell.candidates.has(z)) {
                            // Skip the pivot and pincers
                            if ((row === pivot.row && col === pivot.col) ||
                                (row === xPincer.row && col === xPincer.col) ||
                                (row === yPincer.row && col === yPincer.col)) {
                                continue;
                            }
                            
                            eliminations.push({
                                row,
                                col,
                                digit: z,
                                reason: `XY-Wing: Can remove ${z} from (${row+1},${col+1})`
                            });
                        }
                    }
                    
                    if (eliminations.length > 0) {
                        return {
                            type: 'xy_wing',
                            cells: [
                                {row: pivot.row, col: pivot.col, value: null, candidates: pivot.candidates},
                                {row: xPincer.row, col: xPincer.col, value: null, candidates: [x, xPincer.z]},
                                {row: yPincer.row, col: yPincer.col, value: null, candidates: [y, yPincer.z]}
                            ],
                            eliminations,
                            explanation: `XY-Wing with pivot (${pivot.row+1},${pivot.col+1})[${x},${y}], ` +
                                       `pincers (${xPincer.row+1},${xPincer.col+1})[${x},${xPincer.z}] and ` +
                                       `(${yPincer.row+1},${yPincer.col+1})[${y},${yPincer.z}]. ` +
                                       `Eliminates ${z} from ${eliminations.length} cells.`
                        };
                    }
                }
            }
        }
        
        return null;
    }
    
    /**
     * Helper method to check if two cells are in the same 3x3 box
     */
    sameBox(row1, col1, row2, col2) {
        return Math.floor(row1 / 3) === Math.floor(row2 / 3) && 
               Math.floor(col1 / 3) === Math.floor(col2 / 3);
    }
    
    /**
     * Helper method to check if cell (row2, col2) is seen by cell (row1, col1)
     * A cell is seen by another if they are in the same row, column, or box
     */
    isCellSeenBy(row1, col1, row2, col2) {
        // Same row or column
        if (row1 === row2 || col1 === col2) return true;
        
        // Same 3x3 box
        return this.sameBox(row1, col1, row2, col2);
    }
    
    /**
     * Helper method to get cells seen by both of two given cells
     */
    getCellsSeenByBoth(row1, col1, row2, col2) {
        const seen = new Set();
        const result = [];
        
        // Mark all cells seen by first cell
        for (let i = 0; i < 9; i++) {
            // Same row
            seen.add(`${row1},${i}`);
            // Same column
            seen.add(`${i},${col1}`);
            // Same box
            const boxRow = Math.floor(row1 / 3) * 3 + Math.floor(i / 3);
            const boxCol = Math.floor(col1 / 3) * 3 + (i % 3);
            seen.add(`${boxRow},${boxCol}`);
        }
        
        // Check cells seen by second cell against those seen by first
        const seenBySecond = new Set();
        for (let i = 0; i < 9; i++) {
            // Check same row
            this.checkAndAddSeen(seen, seenBySecond, result, row2, i);
            // Check same column
            this.checkAndAddSeen(seen, seenBySecond, result, i, col2);
            // Check same box
            const boxRow = Math.floor(row2 / 3) * 3 + Math.floor(i / 3);
            const boxCol = Math.floor(col2 / 3) * 3 + (i % 3);
            this.checkAndAddSeen(seen, seenBySecond, result, boxRow, boxCol);
        }
        
        return result;
    }
    
    /**
     * Helper method to check and add seen cells
     */
    checkAndAddSeen(seen, seenBySecond, result, row, col) {
        const key = `${row},${col}`;
        if (seen.has(key) && !seenBySecond.has(key)) {
            seenBySecond.add(key);
            result.push({row, col});
        }
    }

    /**
     * XYZ-Wing
     * An extension of XY-Wing where the pivot has three candidates (XYZ) and the pincers have two (XZ and YZ).
     * If the pivot sees both pincers, Z can be eliminated from cells seen by all three cells.
     */
    findXYZWing(grid) {
        // Find all potential pivot cells (with exactly three candidates)
        const potentialPivots = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = grid[r][c];
                if (cell.value === 0 && cell.candidates && cell.candidates.size === 3) {
                    potentialPivots.push({
                        row: r,
                        col: c,
                        candidates: Array.from(cell.candidates).sort((a, b) => a - b)
                    });
                }
            }
        }

        // Find all bivalue cells (for pincers)
        const bivalueCells = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = grid[r][c];
                if (cell.value === 0 && cell.candidates && cell.candidates.size === 2) {
                    bivalueCells.push({
                        row: r,
                        col: c,
                        candidates: Array.from(cell.candidates).sort((a, b) => a - b)
                    });
                }
            }
        }

        // Check each potential pivot
        for (const pivot of potentialPivots) {
            const [x, y, z] = pivot.candidates;
            
            // Find potential pincers (must share two candidates with pivot, one being Z)
            const xzPincers = [];
            const yzPincers = [];
            
            for (const cell of bivalueCells) {
                // Skip the pivot itself
                if (cell.row === pivot.row && cell.col === pivot.col) continue;
                
                const [a, b] = cell.candidates;
                
                // Check for XZ pincer
                if ((a === x && b === z) || (a === z && b === x)) {
                    xzPincers.push(cell);
                }
                // Check for YZ pincer
                else if ((a === y && b === z) || (a === z && b === y)) {
                    yzPincers.push(cell);
                }
            }
            
            // Check all combinations of xzPincers and yzPincers
            for (const xzPincer of xzPincers) {
                for (const yzPincer of yzPincers) {
                    // Skip if pincers are the same cell (shouldn't happen with proper input)
                    if (xzPincer.row === yzPincer.row && xzPincer.col === yzPincer.col) continue;
                    
                    // Pincers must see each other (same row, col, or box)
                    if (xzPincer.row !== yzPincer.row && 
                        xzPincer.col !== yzPincer.col && 
                        !this.sameBox(xzPincer.row, xzPincer.col, yzPincer.row, yzPincer.col)) {
                        continue;
                    }
                    
                    // Find cells seen by all three: pivot and both pincers
                    const seenByAll = this.getCellsSeenByAllThree(
                        pivot.row, pivot.col,
                        xzPincer.row, xzPincer.col,
                        yzPincer.row, yzPincer.col
                    );
                    
                    const eliminations = [];
                    
                    // Check each cell seen by all three for Z candidate
                    for (const {row, col} of seenByAll) {
                        const cell = grid[row][col];
                        if (cell.value === 0 && cell.candidates && cell.candidates.has(z)) {
                            // Skip the pivot and pincers
                            if ((row === pivot.row && col === pivot.col) ||
                                (row === xzPincer.row && col === xzPincer.col) ||
                                (row === yzPincer.row && col === yzPincer.col)) {
                                continue;
                            }
                            
                            eliminations.push({
                                row,
                                col,
                                digit: z,
                                reason: `XYZ-Wing: Can remove ${z} from (${row+1},${col+1})`
                            });
                        }
                    }
                    
                    if (eliminations.length > 0) {
                        return {
                            type: 'xyz_wing',
                            cells: [
                                {row: pivot.row, col: pivot.col, value: null, candidates: pivot.candidates},
                                {row: xzPincer.row, col: xzPincer.col, value: null, candidates: xzPincer.candidates},
                                {row: yzPincer.row, col: yzPincer.col, value: null, candidates: yzPincer.candidates}
                            ],
                            eliminations,
                            explanation: `XYZ-Wing with pivot (${pivot.row+1},${pivot.col+1})[${x},${y},${z}], ` +
                                       `pincers (${xzPincer.row+1},${xzPincer.col+1})[${xzPincer.candidates.join(',')}] and ` +
                                       `(${yzPincer.row+1},${yzPincer.col+1})[${yzPincer.candidates.join(',')}]. ` +
                                       `Eliminates ${z} from ${eliminations.length} cells.`
                        };
                    }
                }
            }
        }
        
        return null;
    }
    
    /**
     * Helper method to get cells seen by all three given cells
     */
    getCellsSeenByAllThree(row1, col1, row2, col2, row3, col3) {
        // Get cells seen by first two cells
        const seenByFirstTwo = this.getCellsSeenByBoth(row1, col1, row2, col2);
        
        // Convert to a set for faster lookup
        const seenByFirstTwoSet = new Set(seenByFirstTwo.map(cell => `${cell.row},${cell.col}`));
        
        // Get cells seen by the third cell
        const seenByThird = [];
        for (let i = 0; i < 9; i++) {
            // Same row
            this.checkAndAddSeen(seenByFirstTwoSet, new Set(), seenByThird, row3, i);
            // Same column
            this.checkAndAddSeen(seenByFirstTwoSet, new Set(), seenByThird, i, col3);
            // Same box
            const boxRow = Math.floor(row3 / 3) * 3 + Math.floor(i / 3);
            const boxCol = Math.floor(col3 / 3) * 3 + (i % 3);
            this.checkAndAddSeen(seenByFirstTwoSet, new Set(), seenByThird, boxRow, boxCol);
        }
        
        return seenByThird;
    }

    /**
     * W-Wing
     * A pattern involving two cells with the same two candidates (X,Y) connected by a strong link
     * on one of the candidates, allowing eliminations of the other candidate.
     */
    findWWing(grid) {
        // Find all bivalue cells (cells with exactly two candidates)
        const bivalueCells = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = grid[r][c];
                if (cell.value === 0 && cell.candidates && cell.candidates.size === 2) {
                    bivalueCells.push({
                        row: r,
                        col: c,
                        candidates: Array.from(cell.candidates).sort((a, b) => a - b)
                    });
                }
            }
        }

        // For each pair of bivalue cells with the same two candidates
        for (let i = 0; i < bivalueCells.length; i++) {
            for (let j = i + 1; j < bivalueCells.length; j++) {
                const cell1 = bivalueCells[i];
                const cell2 = bivalueCells[j];
                
                // Skip if cells don't have the same two candidates
                if (cell1.candidates[0] !== cell2.candidates[0] || 
                    cell1.candidates[1] !== cell2.candidates[1]) {
                    continue;
                }
                
                const [x, y] = cell1.candidates;
                
                // Check for strong link on X (same row, column, or box with only two X candidates)
                let strongLink = null;
                
                // Check row for strong link on X
                let xInRow = [];
                for (let c = 0; c < 9; c++) {
                    const cell = grid[cell1.row][c];
                    if (cell.candidates && cell.candidates.has(x)) {
                        xInRow.push({row: cell1.row, col: c});
                    }
                }
                if (xInRow.length === 2 && xInRow.some(coord => 
                    coord.row === cell2.row && coord.col === cell2.col)) {
                    strongLink = {type: 'row', value: x, cells: xInRow};
                }
                
                // Check column for strong link on X
                if (!strongLink) {
                    let xInCol = [];
                    for (let r = 0; r < 9; r++) {
                        const cell = grid[r][cell1.col];
                        if (cell.candidates && cell.candidates.has(x)) {
                            xInCol.push({row: r, col: cell1.col});
                        }
                    }
                    if (xInCol.length === 2 && xInCol.some(coord => 
                        coord.row === cell2.row && coord.col === cell2.col)) {
                        strongLink = {type: 'col', value: x, cells: xInCol};
                    }
                }
                
                // Check box for strong link on X
                if (!strongLink) {
                    const boxRow = Math.floor(cell1.row / 3) * 3;
                    const boxCol = Math.floor(cell1.col / 3) * 3;
                    let xInBox = [];
                    
                    for (let r = 0; r < 3; r++) {
                        for (let c = 0; c < 3; c++) {
                            const cell = grid[boxRow + r][boxCol + c];
                            if (cell.candidates && cell.candidates.has(x)) {
                                xInBox.push({row: boxRow + r, col: boxCol + c});
                            }
                        }
                    }
                    
                    if (xInBox.length === 2 && xInBox.some(coord => 
                        coord.row === cell2.row && coord.col === cell2.col)) {
                        strongLink = {type: 'box', value: x, cells: xInBox};
                    }
                }
                
                // If we found a strong link on X, look for eliminations of Y
                if (strongLink) {
                    const eliminations = [];
                    
                    // Get cells seen by both bivalue cells
                    const seenByBoth = this.getCellsSeenByBoth(
                        cell1.row, cell1.col,
                        cell2.row, cell2.col
                    );
                    
                    // Check each cell seen by both for Y candidate
                    for (const {row, col} of seenByBoth) {
                        const cell = grid[row][col];
                        if (cell.value === 0 && cell.candidates && cell.candidates.has(y)) {
                            // Skip the two bivalue cells
                            if ((row === cell1.row && col === cell1.col) ||
                                (row === cell2.row && col === cell2.col)) {
                                continue;
                            }
                            
                            eliminations.push({
                                row,
                                col,
                                digit: y,
                                reason: `W-Wing: Can remove ${y} from (${row+1},${col+1})`
                            });
                        }
                    }
                    
                    if (eliminations.length > 0) {
                        return {
                            type: 'w_wing',
                            cells: [
                                {row: cell1.row, col: cell1.col, value: null, candidates: [x, y]},
                                ...strongLink.cells.map(c => ({
                                    row: c.row, 
                                    col: c.col, 
                                    value: null, 
                                    candidates: grid[c.row][c.col].candidates 
                                        ? Array.from(grid[c.row][c.col].candidates) 
                                        : []
                                })),
                                {row: cell2.row, col: cell2.col, value: null, candidates: [x, y]}
                            ],
                            eliminations,
                            explanation: `W-Wing with bivalue cells (${cell1.row+1},${cell1.col+1}) and ` +
                                       `(${cell2.row+1},${cell2.col+1})[${x},${y}], connected by strong ` +
                                       `link on ${x} in ${strongLink.type}. ` +
                                       `Eliminates ${y} from ${eliminations.length} cells.`
                        };
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * X-Chain
     * A chain of strong links for a single digit.
     */
    /**
     * X-Chain
     * A chain of strong links for a single digit that allows eliminations.
     * An X-Chain is a series of alternating strong and weak links for a single digit.
     * @param {Array} grid - The Sudoku grid
     * @returns {Object|null} Step object if X-Chain is found, null otherwise
     */
    findXChain(grid) {
        // Try each digit from 1 to 9
        for (let digit = 1; digit <= 9; digit++) {
            // Find all strong links for this digit
            const strongLinks = this.findStrongLinks(grid, digit);
            
            // If no strong links, skip this digit
            if (strongLinks.length === 0) continue;
            
            // Create a graph of strong links
            const graph = this.buildStrongLinkGraph(strongLinks);
            
            // Find all chains of length 3 or more (minimum for X-Chain)
            const chains = this.findAllChains(graph, 3);
            
            // Check each chain for eliminations
            for (const chain of chains) {
                const eliminations = this.getXChainEliminations(grid, chain, digit);
                if (eliminations.length > 0) {
                    return {
                        type: 'x_chain',
                        digit,
                        chain: chain.map(node => ({
                            row: node.row,
                            col: node.col,
                            candidates: grid[node.row][node.col].candidates 
                                ? Array.from(grid[node.row][node.col].candidates) 
                                : []
                        })),
                        eliminations,
                        explanation: `X-Chain of length ${chain.length} found for digit ${digit}, ` +
                                   `eliminating ${eliminations.length} candidates.`
                    };
                }
            }
        }
        
        return null;
    }
    
    /**
     * Build a graph of strong links for a digit
     * @param {Array} strongLinks - Array of strong links
     * @returns {Object} Graph representation with nodes and edges
     */
    buildStrongLinkGraph(strongLinks) {
        const graph = {};
        
        // Add nodes and edges for each strong link
        for (const link of strongLinks) {
            const [cell1, cell2] = link;
            const key1 = `${cell1.row},${cell1.col}`;
            const key2 = `${cell2.row},${cell2.col}`;
            
            // Add nodes if they don't exist
            if (!graph[key1]) graph[key1] = { row: cell1.row, col: cell1.col, edges: [] };
            if (!graph[key2]) graph[key2] = { row: cell2.row, col: cell2.col, edges: [] };
            
            // Add edges in both directions
            if (!graph[key1].edges.some(e => e.row === cell2.row && e.col === cell2.col)) {
                graph[key1].edges.push({ row: cell2.row, col: cell2.col });
            }
            if (!graph[key2].edges.some(e => e.row === cell1.row && e.col === cell1.col)) {
                graph[key2].edges.push({ row: cell1.row, col: cell1.col });
            }
        }
        
        return graph;
    }
    
    /**
     * Find all chains in the graph of a given minimum length
     * @param {Object} graph - Graph of strong links
     * @param {number} minLength - Minimum chain length
     * @returns {Array} Array of chains (each chain is an array of nodes)
     */
    findAllChains(graph, minLength) {
        const nodes = Object.values(graph);
        const allChains = [];
        
        // Perform DFS from each node to find all chains
        for (const startNode of nodes) {
            const visited = new Set();
            const path = [];
            this.dfsFindChains(
                graph, 
                startNode, 
                visited, 
                path, 
                allChains, 
                minLength
            );
        }
        
        return allChains;
    }
    
    /**
     * Depth-first search to find chains in the graph
     * @private
     */
    dfsFindChains(graph, node, visited, path, allChains, minLength) {
        const key = `${node.row},${node.col}`;
        
        // If we've already visited this node in the current path, we have a cycle
        if (path.some(n => n.row === node.row && n.col === node.col)) {
            // Only keep cycles of even length (alternating strong/weak links)
            if (path.length >= minLength && path.length % 2 === 0) {
                const cycleStart = path.findIndex(n => n.row === node.row && n.col === node.col);
                const cycle = path.slice(cycleStart);
                
                // Add the cycle if it's not already in our results
                if (!this.isChainDuplicate(allChains, cycle)) {
                    allChains.push([...cycle]);
                }
            }
            return;
        }
        
        // Mark as visited and add to path
        visited.add(key);
        path.push(node);
        
        // Continue DFS for all neighbors
        for (const neighbor of node.edges) {
            const neighborKey = `${neighbor.row},${neighbor.col}`;
            const neighborNode = graph[neighborKey];
            if (neighborNode) {
                this.dfsFindChains(graph, neighborNode, visited, path, allChains, minLength);
            }
        }
        
        // Backtrack
        path.pop();
        visited.delete(key);
    }
    
    /**
     * Check if a chain is a duplicate of one already found
     * @private
     */
    isChainDuplicate(chains, newChain) {
        if (newChain.length === 0) return false;
        
        // Create a normalized version of the new chain (sorted by position)
        const normalizedNew = [...newChain]
            .map(cell => ({ row: cell.row, col: cell.col }))
            .sort((a, b) => a.row === b.row ? a.col - b.col : a.row - b.row);
        
        // Check against all existing chains
        for (const chain of chains) {
            if (chain.length !== newChain.length) continue;
            
            const normalizedChain = [...chain]
                .map(cell => ({ row: cell.row, col: cell.col }))
                .sort((a, b) => a.row === b.row ? a.col - b.col : a.row - b.row);
                
            // Check if the normalized chains are the same
            const isSame = normalizedChain.every((cell, i) => 
                cell.row === normalizedNew[i].row && cell.col === normalizedNew[i].col
            );
            
            if (isSame) return true;
        }
        
        return false;
    }
    
    /**
     * Get eliminations from an X-Chain
     * @private
     */
    getXChainEliminations(grid, chain, digit) {
        const eliminations = [];
        const chainCells = new Set(chain.map(cell => `${cell.row},${cell.col}`));
        
        // The first and last cells in the chain must be able to see each other
        const first = chain[0];
        const last = chain[chain.length - 1];
        
        // If first and last cells don't see each other, no eliminations
        if (!this.isCellSeenBy(first.row, first.col, last.row, last.col)) {
            return [];
        }
        
        // Find all cells that can see both ends of the chain
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                // Skip cells in the chain
                if (chain.some(cell => cell.row === row && cell.col === col)) {
                    continue;
                }
                
                const cell = grid[row][col];
                if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                    // Check if this cell can see both ends of the chain
                    const seesFirst = this.isCellSeenBy(row, col, first.row, first.col);
                    const seesLast = this.isCellSeenBy(row, col, last.row, last.col);
                    
                    if (seesFirst && seesLast) {
                        eliminations.push({
                            row,
                            col,
                            candidate: digit,
                            reason: `X-Chain elimination - cell sees both ends of the chain for digit ${digit}`
                        });
                    }
                }
            }
        }
        
        return eliminations;
    }

    /**
     * XY-Chain
     * A chain of bivalue cells with alternating candidates.
     */
    findXYChain(grid) {
        // TODO: Implement XY-Chain detection
        return null;
    }

    /**
     * Nice Loop / AIC (Alternating Inference Chain)
     * A closed loop of alternating strong and weak links.
     */
    findNiceLoop(grid) {
        // TODO: Implement Nice Loop/AIC detection
        return null;
    }

    // ===== ALS (ALMOST LOCKED SETS) =====
    
    /**
     * ALS-XZ
     * Almost Locked Set XZ rule.
     */
    findALSXZ(grid) {
        // TODO: Implement ALS-XZ detection
        return null;
    }

    /**
     * Death Blossom
     * Complex pattern involving multiple ALS.
     */
    findDeathBlossom(grid) {
        // TODO: Implement Death Blossom detection
        return null;
    }

    // ===== METHODS OF LAST RESORT =====
    
    /**
     * Templates
     * Template-based solving approach.
     */
    findTemplates(grid) {
        // TODO: Implement template-based solving
        return null;
    }

    /**
     * Forcing Chain
     * Chain-based forcing pattern.
     */
    findForcingChain(grid) {
        // TODO: Implement Forcing Chain
        return null;
    }

    /**
     * BUG+1
     * Binary Universal Grave + 1 pattern.
     */
    findBUGPlusOne(grid) {
        // TODO: Implement BUG+1 detection
        return null;
    }

    /**
     * XY-Wing
     * A pattern involving three cells (pivot and two pincers) with candidates XY, XZ, and YZ.
     * If the pivot sees both pincers, Z can be eliminated from cells seen by both pincers.
     * Returns a step object with the XY-Wing details and eliminations, or null if not found.
     */
    findXYWing(grid) {
        // Find all bivalue cells (cells with exactly two candidates)
        const bivalueCells = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = grid[r][c];
                if (cell.value === 0 && cell.candidates && cell.candidates.size === 2) {
                    bivalueCells.push({
                        row: r,
                        col: c,
                        candidates: Array.from(cell.candidates).sort((a, b) => a - b)
                    });
                }
            }
        }
        
        // TODO: Implement XY-Wing logic
        return null;
    }
    
    /**
     * Find all strong links for a given digit in the grid
     * @param {Array} grid - The Sudoku grid
     * @param {number} digit - The digit to find strong links for
     * @returns {Array} Array of strong links, where each link is [cell1, cell2]
     */
    findStrongLinks(grid, digit) {
        const strongLinks = [];
        
        // Check rows for strong links
        for (let row = 0; row < 9; row++) {
            const cells = [];
            for (let col = 0; col < 9; col++) {
                const cell = grid[row][col];
                if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                    cells.push({row, col});
                }
            }
            // If exactly two cells with this digit in the row, it's a strong link
            if (cells.length === 2) {
                strongLinks.push([cells[0], cells[1]]);
            }
        }
        
        // Check columns for strong links
        for (let col = 0; col < 9; col++) {
            const cells = [];
            for (let row = 0; row < 9; row++) {
                const cell = grid[row][col];
                if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                    cells.push({row, col});
                }
            }
            // If exactly two cells with this digit in the column, it's a strong link
            if (cells.length === 2) {
                strongLinks.push([cells[0], cells[1]]);
            }
        }
        
        // Check boxes for strong links
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const cells = [];
                for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
                    for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
                        const cell = grid[r][c];
                        if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                            cells.push({row: r, col: c});
                        }
                    }
                }
                // If exactly two cells with this digit in the box, it's a strong link
                if (cells.length === 2) {
                    strongLinks.push([cells[0], cells[1]]);
                }
            }
        }
        
        return strongLinks;
    }
    
    /**
     * Check if two cells are strongly linked for a given digit
     * @param {Array} strongLinks - Array of strong links for a digit
     * @param {Object} cell1 - First cell {row, col}
     * @param {Object} cell2 - Second cell {row, col}
     * @returns {boolean} True if the cells are strongly linked
     */
    areStronglyLinked(strongLinks, cell1, cell2) {
        return strongLinks.some(link => {
            const [c1, c2] = link;
            return (c1.row === cell1.row && c1.col === cell1.col && 
                    c2.row === cell2.row && c2.col === cell2.col) ||
                   (c1.row === cell2.row && c1.col === cell2.col && 
                    c2.row === cell1.row && c2.col === cell1.col);
        });
    }
    
    /**
     * Get eliminations for a W-Wing pattern
     * @param {Array} grid - The Sudoku grid
     * @param {Object} cell1 - First bivalue cell {row, col, candidates}
     * @param {Object} cell2 - Second bivalue cell {row, col, candidates}
     * @param {number} candidate - The candidate to eliminate
     * @returns {Array} Array of elimination objects {row, col, candidate, reason}
     */
    /**
     * Check if one cell is seen by another cell (shares a row, column, or box)
     * @param {number} row1 - Row of first cell
     * @param {number} col1 - Column of first cell
     * @param {number} row2 - Row of second cell
     * @param {number} col2 - Column of second cell
     * @returns {boolean} True if the cells see each other
     */
    isCellSeenBy(row1, col1, row2, col2) {
        // Same row or column
        if (row1 === row2 || col1 === col2) return true;
        
        // Same 3x3 box
        const box1Row = Math.floor(row1 / 3) * 3;
        const box1Col = Math.floor(col1 / 3) * 3;
        const box2Row = Math.floor(row2 / 3) * 3;
        const box2Col = Math.floor(col2 / 3) * 3;
        
        return box1Row === box2Row && box1Col === box2Col;
    }

    getWingEliminations(grid, cell1, cell2, candidate) {
        const eliminations = [];
        const [x, y] = cell1.candidates;
        
        // Find the intersection of cells seen by both wing cells
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                // Skip the wing cells themselves
                if ((r === cell1.row && c === cell1.col) || 
                    (r === cell2.row && c === cell2.col)) {
                    continue;
                }
                
                const cell = grid[r][c];
                // Check if cell is empty, has the candidate, and is seen by both wing cells
                if (cell.value === 0 && cell.candidates && cell.candidates.has(candidate)) {
                    const seenByFirst = this.isCellSeenBy(cell1.row, cell1.col, r, c);
                    const seenBySecond = this.isCellSeenBy(cell2.row, cell2.col, r, c);
                    
                    if (seenByFirst && seenBySecond) {
                        eliminations.push({
                            row: r,
                            col: c,
                            candidate,
                            reason: `W-Wing: Candidate ${candidate} can be removed from (${r+1},${c+1}) as it sees both ends of the W-Wing`
                        });
                    }
                }
            }
        }
        
        return eliminations;
    }
    
    /**
     * Check if two cells see each other (same row, column, or box)
     * @param {number} r1 - First cell row
     * @param {number} c1 - First cell column
     * @param {number} r2 - Second cell row
     * @param {number} c2 - Second cell column
     * @returns {boolean} True if the cells see each other
     */
    /**
     * Check if two cells are in the same 3x3 box
     * @param {number} r1 - First cell row
     * @param {number} c1 - First cell column
     * @param {number} r2 - Second cell row
     * @param {number} c2 - Second cell column
     * @returns {boolean} True if cells are in the same 3x3 box
     */
    sameBox(r1, c1, r2, c2) {
        return Math.floor(r1 / 3) === Math.floor(r2 / 3) && 
               Math.floor(c1 / 3) === Math.floor(c2 / 3);
    }
    
    /**
     * Check if two cells see each other (same row, column, or box)
     * @param {number} r1 - First cell row
     * @param {number} c1 - First cell column
     * @param {number} r2 - Second cell row
     * @param {number} c2 - Second cell column
     * @returns {boolean} True if the cells see each other
     */
    isCellSeenBy(r1, c1, r2, c2) {
        return r1 === r2 || c1 === c2 || this.sameBox(r1, c1, r2, c2);
    }
    
    /**
     * W-Wing
     * A pattern involving two cells with the same two candidates (X,Y) connected by a strong link
     * on one of the candidates, allowing eliminations of the other candidate.
     */
    findWWing(grid) {
        // Find all bivalue cells (cells with exactly two candidates)
        const bivalueCells = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = grid[r][c];
                if (cell.value === 0 && cell.candidates && cell.candidates.size === 2) {
                    bivalueCells.push({
                        row: r,
                        col: c,
                        candidates: Array.from(cell.candidates).sort((a, b) => a - b)
                    });
                }
            }
        }

        // Find all strong links for each candidate (1-9)
        const strongLinks = {};
        for (let digit = 1; digit <= 9; digit++) {
            strongLinks[digit] = this.findStrongLinks(grid, digit);
        }

        // Check all pairs of bivalue cells with the same candidates
        for (let i = 0; i < bivalueCells.length; i++) {
            const cell1 = bivalueCells[i];
            const [x, y] = cell1.candidates;
            
            for (let j = i + 1; j < bivalueCells.length; j++) {
                const cell2 = bivalueCells[j];
                
                // Check if cells have the same two candidates
                if (cell2.candidates[0] !== x || cell2.candidates[1] !== y) {
                    continue;
                }
                
                // Check for strong link on candidate x
                if (this.areStronglyLinked(strongLinks[x], cell1, cell2)) {
                    const eliminations = this.getWingEliminations(grid, cell1, cell2, y);
                    if (eliminations.length > 0) {
                        return {
                            type: 'w_wing',
                            cells: [
                                {row: cell1.row, col: cell1.col, candidates: [x, y]},
                                {row: cell2.row, col: cell2.col, candidates: [x, y]}
                            ],
                            eliminations,
                            explanation: `W-Wing with cells (${cell1.row+1},${cell1.col+1}) and (${cell2.row+1},${cell2.col+1}) ` +
                                       `connected by strong link on ${x}. ` +
                                       `Eliminates ${y} from ${eliminations.length} cells.`
                        };
                    }
                }
                
                // Also check for strong link on candidate y
                if (this.areStronglyLinked(strongLinks[y], cell1, cell2)) {
                    const eliminations = this.getWingEliminations(grid, cell1, cell2, x);
                    if (eliminations.length > 0) {
                        return {
                            type: 'w_wing',
                            cells: [
                                {row: cell1.row, col: cell1.col, candidates: [x, y]},
                                {row: cell2.row, col: cell2.col, candidates: [x, y]}
                            ],
                            eliminations,
                            explanation: `W-Wing with cells (${cell1.row+1},${cell1.col+1}) and (${cell2.row+1},${cell2.col+1}) ` +
                                       `connected by strong link on ${y}. ` +
                                       `Eliminates ${x} from ${eliminations.length} cells.`
                        };
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Sue de Coq
     * A pattern involving two intersecting groups where candidates can be eliminated.
     */
    findSueDeCoq(grid) {
        // TODO: Implement Sue de Coq detection
        return null;
    }

    /**
     * Simple Coloring
     * Uses two colors to find contradictions or confirmations for each digit (1-9).
     * Colors are assigned to candidates where:
     * - Color A: The digit is in this cell
     * - Color B: The digit is not in this cell (must be in the other cell in the unit)
     * @param {Array} grid - The Sudoku grid
     * @returns {Object|null} Step object if coloring finds eliminations, null otherwise
     */
    findColoring(grid) {
        // Try each digit from 1 to 9
        for (let digit = 1; digit <= 9; digit++) {
            // Find all candidates for this digit
            const candidates = [];
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    const cell = grid[row][col];
                    if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                        candidates.push({ row, col });
                    }
                }
            }

            // If no candidates, skip this digit
            if (candidates.length === 0) continue;

            // Create a color map (0 = uncolored, 1 = color A, 2 = color B)
            const colorMap = Array(9).fill().map(() => Array(9).fill(0));
            const queue = [];
            const coloredCells = [];
            const eliminations = [];
            
            // Start with the first uncolored candidate
            const start = candidates[0];
            queue.push({ ...start, color: 1 });
            colorMap[start.row][start.col] = 1;

            // Process the queue
            while (queue.length > 0) {
                const current = queue.shift();
                coloredCells.push(current);
                const { row, col, color } = current;
                const oppositeColor = color === 1 ? 2 : 1;

                // Check all cells in the same unit (row, column, box)
                for (const [r, c] of this.getSeenCells(row, col)) {
                    if (grid[r][c].value === 0 && grid[r][c].candidates.has(digit)) {
                        // If this cell is already colored with the same color, we have a contradiction
                        if (colorMap[r][c] === color) {
                            // Contradiction found - the digit can be eliminated from all colored cells
                            const contradictionEliminations = [];
                            for (const cell of coloredCells) {
                                if (grid[cell.row][cell.col].candidates.has(digit)) {
                                    contradictionEliminations.push({
                                        row: cell.row,
                                        col: cell.col,
                                        candidate: digit,
                                        reason: `Contradiction in Simple Coloring for digit ${digit} - two cells with the same color see each other`
                                    });
                                }
                            }
                            
                            if (contradictionEliminations.length > 0) {
                                return {
                                    type: 'simple_coloring',
                                    digit,
                                    coloredCells: [...coloredCells],
                                    eliminations: contradictionEliminations,
                                    explanation: `Simple Coloring found a contradiction for digit ${digit} - ` +
                                               `two cells with the same color see each other, eliminating ${digit} from ${contradictionEliminations.length} cells.`
                                };
                            }
                        } else if (colorMap[r][c] === 0) {
                            // Color the seen cell with the opposite color
                            colorMap[r][c] = oppositeColor;
                            queue.push({ row: r, col: c, color: oppositeColor });
                        }
                    }
                }
            }


            // Check for cells that see both colors - the digit can be eliminated from them
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (grid[row][col].value === 0 && 
                        grid[row][col].candidates.has(digit) &&
                        colorMap[row][col] === 0) {
                        
                        let seesColor1 = false;
                        let seesColor2 = false;
                        
                        // Check all seen cells
                        for (const [r, c] of this.getSeenCells(row, col)) {
                            if (colorMap[r][c] === 1) seesColor1 = true;
                            if (colorMap[r][c] === 2) seesColor2 = true;
                        }
                        
                        // If this cell sees both colors, the digit can be eliminated
                        if (seesColor1 && seesColor2) {
                            eliminations.push({
                                row,
                                col,
                                candidate: digit,
                                reason: `Cell sees both colors in Simple Coloring for digit ${digit}`
                            });
                        }
                    }
                }
            }
            
            // If we found any eliminations, return them
            if (eliminations.length > 0) {
                return {
                    type: 'simple_coloring',
                    digit,
                    coloredCells: coloredCells.filter(c => colorMap[c.row][c.col] !== 0),
                    eliminations,
                    explanation: `Simple Coloring for digit ${digit} found ${eliminations.length} eliminations.`
                };
            }
        }
        
        return null;
    }
    
    /**
     * Get all cells that are seen by the given cell (same row, column, or box)
     * @param {number} row - The row of the cell
     * @param {number} col - The column of the cell
     * @returns {Array} Array of [row, col] pairs of seen cells
     */
    getSeenCells(row, col) {
        const seen = new Set();
        
        // Add cells in the same row
        for (let c = 0; c < 9; c++) {
            if (c !== col) seen.add(`${row},${c}`);
        }
        
        // Add cells in the same column
        for (let r = 0; r < 9; r++) {
            if (r !== row) seen.add(`${r},${col}`);
        }
        
        // Add cells in the same box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (r !== row || c !== col) seen.add(`${r},${c}`);
            }
        }
        
        // Convert back to [row, col] pairs
        return Array.from(seen).map(coord => {
            const [r, c] = coord.split(',').map(Number);
            return [r, c];
        });
    }

    /**
     * Remote Pair
     * A chain of cells with the same two candidates.
     */
    findRemotePair(grid) {
        // TODO: Implement remote pair detection
        return null;
    }

    /**
     * X-Chain
     * A chain of strong links for a single digit.
     */
    findXChain(grid) {
        // TODO: Implement X-chain detection
        return null;
    }

    /**
     * XY-Chain
     * A chain of cells with alternating candidates.
     */
    findXYChain(grid) {
        // Find all bivalue cells (cells with exactly two candidates)
        const bivalueCells = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = grid[r][c];
                if (cell.value === 0 && cell.candidates && cell.candidates.size === 2) {
                    bivalueCells.push({
                        row: r,
                        col: c,
                        candidates: Array.from(cell.candidates).sort((a, b) => a - b)
                    });
                }
            }
        }

        // For each bivalue cell, try to build chains
        for (const startCell of bivalueCells) {
            const [a, b] = startCell.candidates;
            
            // Try both candidates as starting points
            for (const startDigit of [a, b]) {
                const chain = [
                    { row: startCell.row, col: startCell.col, digit: startDigit }
                ];
                
                // Keep track of visited cells to avoid loops
                const visited = new Set([`${startCell.row},${startCell.col}`]);
                
                // Perform depth-first search to find chains
                const result = this.findXYChainRecursive(grid, bivalueCells, chain, visited);
                if (result) {
                    return result;
                }
            }
        }
        
        return null;
    }
    
    /**
     * Recursive helper function to find XY-Chains
     * @private
     */
    findXYChainRecursive(grid, bivalueCells, chain, visited) {
        const current = chain[chain.length - 1];
        const currentCell = grid[current.row][current.col];
        
        // Get the other candidate in the current cell (not the one we came from)
        const candidates = Array.from(currentCell.candidates);
        const nextDigit = candidates[0] === current.digit ? candidates[1] : candidates[0];
        
        // Find all cells that can be the next link in the chain
        for (const nextCell of bivalueCells) {
            const key = `${nextCell.row},${nextCell.col}`;
            
            // Skip if we've already visited this cell
            if (visited.has(key)) continue;
            
            // Check if this cell contains the next digit and is a valid link
            if (nextCell.candidates.includes(nextDigit)) {
                // Get the other candidate in the next cell
                const nextCellCandidates = nextCell.candidates;
                const nextLinkDigit = nextCellCandidates[0] === nextDigit ? 
                    nextCellCandidates[1] : nextCellCandidates[0];
                
                // Check if this completes a valid XY-Chain
                if (chain.length >= 3 && chain[0].digit === nextLinkDigit) {
                    // We've found a valid XY-Chain
                    const eliminations = this.getXYChainEliminations(
                        grid, 
                        [...chain, { row: nextCell.row, col: nextCell.col, digit: nextLinkDigit }]
                    );
                    
                    if (eliminations.length > 0) {
                        return {
                            type: 'xy_chain',
                            chain: chain.map(link => ({
                                row: link.row,
                                col: link.col,
                                value: null,
                                candidates: Array.from(grid[link.row][link.col].candidates)
                            })),
                            eliminations,
                            explanation: this.getXYChainExplanation(chain, nextCell, nextLinkDigit, eliminations)
                        };
                    }
                }
                
                // Continue building the chain
                visited.add(key);
                chain.push({ row: nextCell.row, col: nextCell.col, digit: nextLinkDigit });
                
                const result = this.findXYChainRecursive(grid, bivalueCells, chain, visited);
                if (result) {
                    return result;
                }
                
                // Backtrack
                chain.pop();
                visited.delete(key);
            }
        }
        
        return null;
    }
    
    /**
     * Get eliminations for an XY-Chain
     * @private
     */
    getXYChainEliminations(grid, chain) {
        const eliminations = [];
        const startCell = chain[0];
        const endCell = chain[chain.length - 1];
        const digit = startCell.digit; // Same as endCell.digit
        
        // Get all cells that see both the start and end of the chain
        const seenByBoth = this.getCellsSeenByBoth(
            startCell.row, startCell.col,
            endCell.row, endCell.col
        );
        
        // Check each cell that sees both ends of the chain
        for (const {row, col} of seenByBoth) {
            const cell = grid[row][col];
            
            // Skip cells that are part of the chain
            const isInChain = chain.some(link => link.row === row && link.col === col);
            if (isInChain) continue;
            
            // If the cell contains the digit as a candidate, we can eliminate it
            if (cell.value === 0 && cell.candidates && cell.candidates.has(digit)) {
                eliminations.push({
                    row,
                    col,
                    digit,
                    reason: `XY-Chain: Can remove ${digit} from (${row+1},${col+1})`
                });
            }
        }
        
        return eliminations;
    }
    
    /**
     * Generate explanation for XY-Chain
     * @private
     */
    getXYChainExplanation(chain, endCell, endDigit, eliminations) {
        const startDigit = chain[0].digit;
        const startCell = chain[0];
        const chainCells = chain.map(link => `(${link.row+1},${link.col+1})[${link.digit},${endDigit}]`).join(' -> ');
        
        let explanation = `XY-Chain found: ${chainCells} -> (${endCell.row+1},${endCell.col+1})[${endDigit}]\n`;
        explanation += `If (${startCell.row+1},${startCell.col+1}) is not ${startDigit}, then the chain `;
        explanation += `forces (${endCell.row+1},${endCell.col+1}) to be ${endDigit}.\n`;
        explanation += `Therefore, ${startDigit} can be removed from cells seen by both ends of the chain.`;
        
        if (eliminations.length > 0) {
            const elims = eliminations.map(e => `(${e.row+1},${e.col+1})`).join(', ');
            explanation += `\nEliminations: ${elims}`;
        }
        
        return explanation;
    }

    /**
     * Nice Loop / AIC
     * Alternating Inference Chains and Nice Loops.
     */
    findNiceLoop(grid) {
        // TODO: Implement nice loop detection
        return null;
    }

    // ===== ALS - ALMOST LOCKED SETS =====
    /**
     * ALS-XZ
     * Almost Locked Set XZ rule.
     */
    findALSXZ(grid) {
        // TODO: Implement ALS-XZ detection
        return null;
    }

    /**
     * ALS-XY-Wing
     * Almost Locked Set XY-Wing pattern.
     */
    findALSXYWing(grid) {
        // First, find all bivalue cells (cells with exactly 2 candidates)
        const bivalueCells = [];
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = grid[row][col];
                if (cell.value === 0 && cell.candidates && cell.candidates.size === 2) {
                    bivalueCells.push({
                        row,
                        col,
                        candidates: Array.from(cell.candidates).sort((a, b) => a - b)
                    });
                }
            }
        }
        
        // Check all possible triples of bivalue cells (pivot, pincer1, pincer2)
        for (let i = 0; i < bivalueCells.length; i++) {
            const pivot = bivalueCells[i];
            
            // Find pincer1 cells that share a unit with pivot and have one common candidate
            for (let j = 0; j < bivalueCells.length; j++) {
                if (i === j) continue;
                
                const pincer1 = bivalueCells[j];
                
                // Check if pincer1 shares a row, column, or box with pivot
                const sharesUnit = this.sharesUnit(pivot, pincer1);
                if (!sharesUnit) continue;
                
                // Find common candidate between pivot and pincer1
                const commonCandidates = pivot.candidates.filter(x => pincer1.candidates.includes(x));
                if (commonCandidates.length !== 1) continue;
                
                const x = commonCandidates[0]; // The common candidate
                const y = pivot.candidates.find(c => c !== x); // The other candidate in pivot
                
                // Find pincer2 cells that share a unit with pivot and have a different common candidate
                for (let k = 0; k < bivalueCells.length; k++) {
                    if (k === i || k === j) continue;
                    
                    const pincer2 = bivalueCells[k];
                    
                    // Check if pincer2 shares a unit with pivot (but not the same unit as pincer1)
                    if (!this.sharesUnit(pivot, pincer2)) continue;
                    
                    // Check if pincer2 shares a unit with pincer1 (they should not)
                    if (this.sharesUnit(pincer1, pincer2)) continue;
                    
                    // Find common candidate between pivot and pincer2
                    const commonCandidates2 = pivot.candidates.filter(c => pincer2.candidates.includes(c));
                    if (commonCandidates2.length !== 1) continue;
                    
                    const z = commonCandidates2[0]; // Should be y from the pivot
                    if (z !== y) continue; // Should be the other candidate in pivot
                    
                    const w = pincer2.candidates.find(c => c !== z); // The other candidate in pincer2
                    
                    // Now check if pincer1 and pincer2 share a candidate 'w'
                    if (!pincer1.candidates.includes(w)) continue;
                    
                    // We have an XY-Wing pattern
                    // The candidate 'w' can be eliminated from cells seen by both pincer1 and pincer2
                    const eliminations = [];
                    
                    // Find all cells that see both pincer1 and pincer2 and contain 'w'
                    for (let row = 0; row < 9; row++) {
                        for (let col = 0; col < 9; col++) {
                            // Skip the pivot and pincers
                            if ((row === pivot.row && col === pivot.col) ||
                                (row === pincer1.row && col === pincer1.col) ||
                                (row === pincer2.row && col === pincer2.col)) {
                                continue;
                            }
                            
                            const cell = grid[row][col];
                            if (cell.value !== 0 || !cell.candidates || !cell.candidates.has(w)) {
                                continue;
                            }
                            
                            // Check if this cell sees both pincer1 and pincer2
                            const seesPincer1 = this.seesCell({row, col}, pincer1);
                            const seesPincer2 = this.seesCell({row, col}, pincer2);
                            
                            if (seesPincer1 && seesPincer2) {
                                eliminations.push({
                                    row,
                                    col,
                                    candidates: [w],
                                    reason: `ALS-XY-Wing: Can remove ${w} from (${row+1},${col+1})`
                                });
                            }
                        }
                    }
                    
                    if (eliminations.length > 0) {
                        return {
                            type: 'als_xy_wing',
                            pivot: {
                                row: pivot.row,
                                col: pivot.col,
                                candidates: [...pivot.candidates]
                            },
                            pincer1: {
                                row: pincer1.row,
                                col: pincer1.col,
                                candidates: [...pincer1.candidates]
                            },
                            pincer2: {
                                row: pincer2.row,
                                col: pincer2.col,
                                candidates: [...pincer2.candidates]
                            },
                            x,
                            y,
                            z,
                            w,
                            eliminations: eliminations.map(e => ({
                                row: e.row,
                                col: e.col,
                                value: 0,
                                candidates: e.candidates,
                                reason: e.reason
                            })),
                            explanation: `ALS-XY-Wing found with pivot at (${pivot.row+1},${pivot.col+1})[${pivot.candidates.join(',')}], ` +
                                       `pincer1 at (${pincer1.row+1},${pincer1.col+1})[${pincer1.candidates.join(',')}], ` +
                                       `and pincer2 at (${pincer2.row+1},${pincer2.col+1})[${pincer2.candidates.join(',')}]. ` +
                                       `Candidate ${w} can be eliminated from cells seen by both pincers.`
                        };
                    }
                }
            }
        }
        
        return null;
    }
    
    // Helper function to check if two cells share a row, column, or box
    sharesUnit(cell1, cell2) {
        return cell1.row === cell2.row || 
               cell1.col === cell2.col || 
               (Math.floor(cell1.row / 3) === Math.floor(cell2.row / 3) && 
                Math.floor(cell1.col / 3) === Math.floor(cell2.col / 3));
    }
    
    // Helper function to check if cell1 can see cell2 (same row, column, or box)
    seesCell(cell1, cell2) {
        if (cell1.row === cell2.row && cell1.col === cell2.col) return false; // Same cell
        return cell1.row === cell2.row || 
               cell1.col === cell2.col || 
               (Math.floor(cell1.row / 3) === Math.floor(cell2.row / 3) && 
                Math.floor(cell1.col / 3) === Math.floor(cell2.col / 3));
    }

    /**
     * ALS Chain
     * Chain of Almost Locked Sets.
     */
    findALSChain(grid) {
        // TODO: Implement ALS chain detection
        return null;
    }

    /**
     * Death Blossom
     * Complex pattern involving multiple ALS.
     */
    findDeathBlossom(grid) {
        // TODO: Implement death blossom detection
        return null;
    }

    // ===== METHODS OF LAST RESORT =====
    /**
     * Templates
     * Template-based solving approach.
     */
    findTemplates(grid) {
        // TODO: Implement template-based solving
        return null;
    }

    /**
     * Forcing Chain
     * Chain-based forcing pattern.
     */
    findForcingChain(grid) {
        // TODO: Implement forcing chain detection
        return null;
    }

    /**
     * Forcing Net
     * Network of forcing chains.
     */
    findForcingNet(grid) {
        // TODO: Implement forcing net detection
        return null;
    }

    /**
     * Kraken Fish
     * Complex fish pattern with additional candidates.
     */
    findKrakenFish(grid) {
        // TODO: Implement kraken fish detection
        return null;
    }

    /**
     * Brute Force
     * Last resort solving method.
     */
    findBruteForce(grid) {
        // TODO: Implement brute force solving
        return null;
    }
}

// Make SudokuTechniques available globally
window.SudokuTechniques = SudokuTechniques;
})(); // End of IIFE