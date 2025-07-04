// Utility functions for generating Sudoku puzzles and helpers for speed scanning trainer

export function generateSpeedTrainerPuzzle(difficulty: string, technique: string) {
  // For demo: generate a 9x9 grid with random numbers 1-9, 0 for empty
  const grid = Array(9).fill(0).map(() => Array(9).fill(0).map(() => Math.random() > 0.7 ? Math.ceil(Math.random() * 9) : 0));
  return grid;
}

export function getRandomSection(): { type: 'row' | 'col' | 'box'; index: number } {
  // Randomly select row, col, or box
  const types: Array<'row' | 'col' | 'box'> = ['row', 'col', 'box'];
  const type = types[Math.floor(Math.random() * 3)];
  const index = Math.floor(Math.random() * 9);
  return { type, index };
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