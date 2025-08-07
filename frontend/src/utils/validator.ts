import { Cell } from '../store/sudokuStore';

/**
 * Validates if a move is legal according to Sudoku rules
 * @param grid - The current Sudoku grid
 * @param row - Row index (0-8)
 * @param col - Column index (0-8)
 * @param value - Value to place (1-9)
 * @returns true if the move is valid, false otherwise
 */
export const isMoveValid = (grid: Cell[][], row: number, col: number, value: number): boolean => {
  // Check if the cell is already filled
  if (grid[row][col].value !== 0) {
    return false;
  }

  // Check row for duplicates
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c].value === value) {
      return false;
    }
  }

  // Check column for duplicates
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col].value === value) {
      return false;
    }
  }

  // Check 3x3 box for duplicates
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c].value === value) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Checks if the entire board is valid (no conflicts)
 * @param grid - The current Sudoku grid
 * @returns true if the board is valid, false otherwise
 */
export const isBoardValid = (grid: Cell[][]): boolean => {
  // Check rows
  for (let row = 0; row < 9; row++) {
    const seen = new Set<number>();
    for (let col = 0; col < 9; col++) {
      const value = grid[row][col].value;
      if (value !== 0) {
        if (seen.has(value)) {
          return false;
        }
        seen.add(value);
      }
    }
  }

  // Check columns
  for (let col = 0; col < 9; col++) {
    const seen = new Set<number>();
    for (let row = 0; row < 9; row++) {
      const value = grid[row][col].value;
      if (value !== 0) {
        if (seen.has(value)) {
          return false;
        }
        seen.add(value);
      }
    }
  }

  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const seen = new Set<number>();
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          const value = grid[r][c].value;
          if (value !== 0) {
            if (seen.has(value)) {
              return false;
            }
            seen.add(value);
          }
        }
      }
    }
  }

  return true;
};

/**
 * Checks if the board is completely filled
 * @param grid - The current Sudoku grid
 * @returns true if all cells are filled, false otherwise
 */
export const isBoardComplete = (grid: Cell[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col].value === 0) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Finds all cells that conflict with a given value at a specific position
 * @param grid - The current Sudoku grid
 * @param row - Row index
 * @param col - Column index
 * @param value - Value to check
 * @returns Array of conflicting cell positions
 */
export const findConflictingCells = (grid: Cell[][], row: number, col: number, value: number): Array<{row: number, col: number}> => {
  const conflicts: Array<{row: number, col: number}> = [];

  // Check row for conflicts
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c].value === value) {
      conflicts.push({ row, col: c });
    }
  }

  // Check column for conflicts
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col].value === value) {
      conflicts.push({ row: r, col });
    }
  }

  // Check 3x3 box for conflicts
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c].value === value) {
        conflicts.push({ row: r, col: c });
      }
    }
  }

  return conflicts;
};

/**
 * Gets all possible values for a cell based on current board state
 * @param grid - The current Sudoku grid
 * @param row - Row index
 * @param col - Column index
 * @returns Set of possible values (1-9)
 */
export const getPossibleValues = (grid: Cell[][], row: number, col: number): Set<number> => {
  const possible = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  // Remove values from row
  for (let c = 0; c < 9; c++) {
    if (grid[row][c].value !== 0) {
      possible.delete(grid[row][c].value);
    }
  }

  // Remove values from column
  for (let r = 0; r < 9; r++) {
    if (grid[r][col].value !== 0) {
      possible.delete(grid[r][col].value);
    }
  }

  // Remove values from 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c].value !== 0) {
        possible.delete(grid[r][c].value);
      }
    }
  }

  return possible;
}; 