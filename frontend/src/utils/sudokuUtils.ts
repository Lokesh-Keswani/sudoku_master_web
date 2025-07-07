import { SudokuGrid } from '../store/sudokuStore';

export function getRandomEmptyCell(grid: SudokuGrid): { row: number; col: number } | null {
  const empties: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col].value === 0) {
        empties.push({ row, col });
      }
    }
  }
  if (empties.length === 0) return null;
  return empties[Math.floor(Math.random() * empties.length)];
}

export function validateBoard(grid: SudokuGrid, solution: number[][]): Set<string> {
  const wrong = new Set<string>();
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col].value !== 0 && grid[row][col].value !== solution[row][col]) {
        wrong.add(`${row}_${col}`);
      }
    }
  }
  return wrong;
}

export function notesKey(row: number, col: number): string {
  return `${row}_${col}`;
} 