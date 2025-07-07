import { Move } from '../store/mentalMappingStore';

// Generate a valid Sudoku puzzle with 3 logical deductions
export function generateMentalMappingPuzzle(): { puzzle: number[][]; moves: Move[] } {
  // Start with a solved Sudoku grid
  const solvedGrid = generateSolvedSudoku();
  
  // Create a puzzle by removing some numbers
  const puzzle = createPuzzleFromSolved(solvedGrid);
  
  // Find 3 logical deductions (naked singles, hidden singles, etc.)
  const moves = findLogicalMoves(puzzle, solvedGrid);
  
  return { puzzle, moves };
}

// Generate a solved Sudoku grid
function generateSolvedSudoku(): number[][] {
  const grid = Array(9).fill(0).map(() => Array(9).fill(0));
  
  // Fill the first row with 1-9
  for (let i = 0; i < 9; i++) {
    grid[0][i] = i + 1;
  }
  
  // Use a simple algorithm to complete the grid
  // This is a simplified version - in practice you'd want a more robust solver
  for (let row = 1; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const usedNumbers = new Set();
      
      // Check row
      for (let c = 0; c < 9; c++) {
        if (grid[row][c] !== 0) usedNumbers.add(grid[row][c]);
      }
      
      // Check column
      for (let r = 0; r < 9; r++) {
        if (grid[r][col] !== 0) usedNumbers.add(grid[r][col]);
      }
      
      // Check 3x3 box
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          if (grid[r][c] !== 0) usedNumbers.add(grid[r][c]);
        }
      }
      
      // Find first available number
      for (let num = 1; num <= 9; num++) {
        if (!usedNumbers.has(num)) {
          grid[row][col] = num;
          break;
        }
      }
    }
  }
  
  return grid;
}

// Create a puzzle by removing some numbers from a solved grid
function createPuzzleFromSolved(solvedGrid: number[][]): number[][] {
  const puzzle = solvedGrid.map(row => [...row]);
  
  // Remove random numbers (keep about 30-35 numbers)
  const cellsToRemove = 45 + Math.floor(Math.random() * 10); // Remove 45-55 cells
  
  for (let i = 0; i < cellsToRemove; i++) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    puzzle[row][col] = 0;
  }
  
  return puzzle;
}

// Find logical moves (naked singles, hidden singles)
function findLogicalMoves(puzzle: number[][], solvedGrid: number[][]): Move[] {
  const moves: Move[] = [];
  const usedPositions = new Set<string>();
  
  // Find naked singles (cells with only one possible number)
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (puzzle[row][col] !== 0) continue;
      
      const possibleNumbers = getPossibleNumbers(puzzle, row, col);
      if (possibleNumbers.length === 1) {
        const posKey = `${row}-${col}`;
        if (!usedPositions.has(posKey)) {
          moves.push({
            row,
            col,
            number: possibleNumbers[0]
          });
          usedPositions.add(posKey);
        }
      }
    }
  }
  
  // If we don't have enough naked singles, add some obvious moves
  while (moves.length < 3) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (puzzle[row][col] !== 0) continue;
        
        const posKey = `${row}-${col}`;
        if (!usedPositions.has(posKey)) {
          moves.push({
            row,
            col,
            number: solvedGrid[row][col]
          });
          usedPositions.add(posKey);
          break;
        }
      }
      if (moves.length >= 3) break;
    }
    if (moves.length >= 3) break;
  }
  
  // Return first 3 moves
  return moves.slice(0, 3);
}

// Get possible numbers for a cell
function getPossibleNumbers(puzzle: number[][], row: number, col: number): number[] {
  const usedNumbers = new Set<number>();
  
  // Check row
  for (let c = 0; c < 9; c++) {
    if (puzzle[row][c] !== 0) usedNumbers.add(puzzle[row][c]);
  }
  
  // Check column
  for (let r = 0; r < 9; r++) {
    if (puzzle[r][col] !== 0) usedNumbers.add(puzzle[r][col]);
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (puzzle[r][c] !== 0) usedNumbers.add(puzzle[r][c]);
    }
  }
  
  // Return available numbers
  const possible: number[] = [];
  for (let num = 1; num <= 9; num++) {
    if (!usedNumbers.has(num)) {
      possible.push(num);
    }
  }
  
  return possible;
}

// Validate if a move is correct
export function validateMove(puzzle: number[][], move: Move): boolean {
  const { row, col, number } = move;
  
  // Check if cell is empty
  if (puzzle[row][col] !== 0) return false;
  
  // Check if number is valid (1-9)
  if (number < 1 || number > 9) return false;
  
  // Check row
  for (let c = 0; c < 9; c++) {
    if (puzzle[row][c] === number) return false;
  }
  
  // Check column
  for (let r = 0; r < 9; r++) {
    if (puzzle[r][col] === number) return false;
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (puzzle[r][c] === number) return false;
    }
  }
  
  return true;
} 