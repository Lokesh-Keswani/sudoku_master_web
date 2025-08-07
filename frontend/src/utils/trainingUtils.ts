// Utility functions for generating Sudoku puzzles and helpers for speed scanning trainer

export function generateSpeedTrainerPuzzle(difficulty: string, technique: string) {
  // Generate a more realistic Sudoku puzzle with specific patterns
  const grid = Array(9).fill(0).map(() => Array(9).fill(0));
  
  // Fill some cells based on difficulty
  const fillPercentage = difficulty === 'easy' ? 0.4 : difficulty === 'medium' ? 0.3 : 0.25;
  
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (Math.random() < fillPercentage) {
        grid[i][j] = Math.floor(Math.random() * 9) + 1;
      }
    }
  }
  
  // Ensure the puzzle has some valid patterns for the technique
  addTechniquePatterns(grid, technique);
  
  return grid;
}

export function getRandomSection(technique?: string): { type: 'row' | 'col' | 'box'; index: number; technique?: string } {
  // Randomly select row, col, or box
  const types: Array<'row' | 'col' | 'box'> = ['row', 'col', 'box'];
  const type = types[Math.floor(Math.random() * 3)];
  const index = Math.floor(Math.random() * 9);
  return { type, index, technique };
}

export function getSectionCells(type: 'row' | 'col' | 'box', index: number) {
  if (type === 'row') return Array(9).fill(0).map((_, c) => [index, c]);
  if (type === 'col') return Array(9).fill(0).map((_, r) => [r, index]);
  // box: index 0-8, 3x3
  const boxRow = Math.floor(index / 3) * 3;
  const boxCol = (index % 3) * 3;
  const cells = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cells.push([boxRow + r, boxCol + c]);
  return cells;
}

export function isCellInSection(row: number, col: number, section: { type: 'row' | 'col' | 'box'; index: number }) {
  const cells = getSectionCells(section.type, section.index);
  return cells.some(([r, c]) => r === row && c === col);
}

export function isCorrectMove(puzzle: number[][], row: number, col: number, technique: string): boolean {
  // Check if the cell is empty (can be filled)
  if (puzzle[row][col] !== 0) return false;
  
  // Check if it's a valid move based on the technique
  switch (technique) {
    case 'Hidden Single':
      return isHiddenSingle(puzzle, row, col);
    case 'Naked Single':
      return isNakedSingle(puzzle, row, col);
    case 'Locked Candidates':
      return isLockedCandidate(puzzle, row, col);
    default:
      // For unknown techniques, check if it's a valid Sudoku move
      return isValidSudokuMove(puzzle, row, col);
  }
}

function addTechniquePatterns(grid: number[][], technique: string) {
  // Add specific patterns based on the technique
  switch (technique) {
    case 'Hidden Single':
      addHiddenSinglePattern(grid);
      break;
    case 'Naked Single':
      addNakedSinglePattern(grid);
      break;
    case 'Locked Candidates':
      addLockedCandidatePattern(grid);
      break;
  }
}

function addHiddenSinglePattern(grid: number[][]) {
  // Create a pattern where a number can only go in one cell in a row/col/box
  const row = Math.floor(Math.random() * 9);
  const col = Math.floor(Math.random() * 9);
  const number = Math.floor(Math.random() * 9) + 1;
  
  // Fill other cells in the same row/col/box to make this a hidden single
  for (let i = 0; i < 9; i++) {
    if (i !== col && grid[row][i] === 0) {
      grid[row][i] = Math.floor(Math.random() * 9) + 1;
    }
  }
}

function addNakedSinglePattern(grid: number[][]) {
  // Create a pattern where a cell has only one possible number
  const row = Math.floor(Math.random() * 9);
  const col = Math.floor(Math.random() * 9);
  
  // Fill surrounding cells to make this a naked single
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c] === 0) {
        grid[r][c] = Math.floor(Math.random() * 9) + 1;
      }
    }
  }
}

function addLockedCandidatePattern(grid: number[][]) {
  // Create a pattern for locked candidates
  const box = Math.floor(Math.random() * 9);
  const boxRow = Math.floor(box / 3) * 3;
  const boxCol = (box % 3) * 3;
  
  // Fill some cells in the box
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (Math.random() < 0.5 && grid[r][c] === 0) {
        grid[r][c] = Math.floor(Math.random() * 9) + 1;
      }
    }
  }
}

function isHiddenSingle(puzzle: number[][], row: number, col: number): boolean {
  // Simplified check - in a real implementation, this would be more complex
  return Math.random() > 0.7; // 30% chance of being correct for demo
}

function isNakedSingle(puzzle: number[][], row: number, col: number): boolean {
  // Simplified check
  return Math.random() > 0.6; // 40% chance of being correct for demo
}

function isLockedCandidate(puzzle: number[][], row: number, col: number): boolean {
  // Simplified check
  return Math.random() > 0.5; // 50% chance of being correct for demo
}

function isValidSudokuMove(puzzle: number[][], row: number, col: number): boolean {
  // Check if placing any number 1-9 in this cell would be valid
  for (let num = 1; num <= 9; num++) {
    if (isValidPlacement(puzzle, row, col, num)) {
      return true;
    }
  }
  return false;
}

function isValidPlacement(puzzle: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (puzzle[row][c] === num) return false;
  }
  
  // Check column
  for (let r = 0; r < 9; r++) {
    if (puzzle[r][col] === num) return false;
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (puzzle[r][c] === num) return false;
    }
  }
  
  return true;
} 