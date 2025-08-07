import { create } from 'zustand';

// Types
export type Section = { 
  type: 'row' | 'col' | 'box'; 
  index: number; 
  technique?: string;
  targetCell?: { row: number; col: number; value: number };
};

export type GameState = 'setup' | 'playing' | 'success' | 'failed' | 'timeout';

export type Metrics = {
  avgTime: number;
  accuracy: number;
  missed: number;
  hits: number;
  misses: number;
  heatmap: number[][];
  totalDrills: number;
  successRate: number;
};

export type SpeedTrainerStore = {
  // Game State
  gameState: GameState;
  challengeActive: boolean;
  puzzle: number[][] | null;
  section: Section | null;
  correctCell: { row: number; col: number; value: number } | null;
  userSelection: { row: number; col: number } | null;
  
  // Timer
  timer: number;
  timeLimit: number;
  timerActive: boolean;
  
  // Statistics
  hits: number;
  misses: number;
  responseTimes: number[];
  heatmap: number[][];
  stats: Metrics | null;
  currentTechnique: string;
  currentDifficulty: string;
  
  // UI State
  showSolutionReveal: boolean;
  wrongAttempts: number;
  maxWrongAttempts: number;
  
  // Actions
  startChallenge: (difficulty: string, technique: string, timeLimit: number) => void;
  clickCell: (row: number, col: number) => void;
  tick: () => void;
  endChallenge: (outcome: 'success' | 'failed' | 'timeout') => void;
  resetChallenge: () => void;
  showSolution: () => void;
  hideSolution: () => void;
  nextDrill: () => void;
  retryDrill: () => void;
};

export const useSpeedTrainerStore = create<SpeedTrainerStore>((set, get) => ({
  // Initial State
  gameState: 'setup',
  challengeActive: false,
  puzzle: null,
  section: null,
  correctCell: null,
  userSelection: null,
  timer: 0,
  timeLimit: 0,
  timerActive: false,
  hits: 0,
  misses: 0,
  responseTimes: [],
  heatmap: Array(9).fill(0).map(() => Array(9).fill(0)),
  stats: null,
  currentTechnique: '',
  currentDifficulty: '',
  showSolutionReveal: false,
  wrongAttempts: 0,
  maxWrongAttempts: 3,

  startChallenge: (difficulty, technique, timeLimit) => {
    // Generate puzzle and section
    const puzzle = generateSpeedTrainerPuzzle(difficulty, technique);
    const section = getRandomSection(technique);
    const correctCell = findCorrectCell(puzzle, section, technique);
    
    if (!correctCell) {
      // If no correct cell found, generate a new puzzle
      const newPuzzle = generateSpeedTrainerPuzzle(difficulty, technique);
      const newSection = getRandomSection(technique);
      const newCorrectCell = findCorrectCell(newPuzzle, newSection, technique);
      
      set({
        gameState: 'playing',
        challengeActive: true,
        puzzle: newPuzzle,
        section: { ...newSection, targetCell: newCorrectCell || undefined },
        correctCell: newCorrectCell,
        userSelection: null,
        timer: timeLimit,
        timeLimit,
        timerActive: true,
        hits: 0,
        misses: 0,
        responseTimes: [],
        heatmap: Array(9).fill(0).map(() => Array(9).fill(0)),
        stats: null,
        currentTechnique: technique,
        currentDifficulty: difficulty,
        showSolutionReveal: false,
        wrongAttempts: 0,
      });
    } else {
      set({
        gameState: 'playing',
        challengeActive: true,
        puzzle,
        section: { ...section, targetCell: correctCell },
        correctCell,
        userSelection: null,
        timer: timeLimit,
        timeLimit,
        timerActive: true,
        hits: 0,
        misses: 0,
        responseTimes: [],
        heatmap: Array(9).fill(0).map(() => Array(9).fill(0)),
        stats: null,
        currentTechnique: technique,
        currentDifficulty: difficulty,
        showSolutionReveal: false,
        wrongAttempts: 0,
      });
    }
  },

  clickCell: (row, col) => {
    const { 
      section, 
      puzzle, 
      correctCell, 
      timerActive, 
      wrongAttempts, 
      maxWrongAttempts,
      responseTimes,
      heatmap 
    } = get();
    
    if (!section || !puzzle || !correctCell || !timerActive) return;
    
    // Check if cell is in the target section
    if (!isCellInSection(row, col, section)) return;
    
    // Check if cell is empty (can be selected)
    if (puzzle[row][col] !== 0) return;
    
    const startTime = Date.now();
    const newHeatmap = heatmap.map((r, i) => 
      r.map((v, j) => (i === row && j === col ? v + 1 : v))
    );
    
    // Check if selection is correct
    const isCorrect = row === correctCell.row && col === correctCell.col;
    
    if (isCorrect) {
      // Success!
      const newResponseTimes = [...responseTimes, startTime];
      set({
        gameState: 'success',
        challengeActive: false,
        timerActive: false,
        userSelection: { row, col },
        hits: get().hits + 1,
        responseTimes: newResponseTimes,
        heatmap: newHeatmap,
      });
      
      // Auto-show solution after a brief delay
      setTimeout(() => {
        set({ showSolutionReveal: true });
      }, 1000);
    } else {
      // Wrong selection
      const newWrongAttempts = wrongAttempts + 1;
      set({
        userSelection: { row, col },
        misses: get().misses + 1,
        heatmap: newHeatmap,
        wrongAttempts: newWrongAttempts,
      });
      
      // Check if max wrong attempts reached
      if (newWrongAttempts >= maxWrongAttempts) {
        get().endChallenge('failed');
      }
    }
  },

  tick: () => {
    const { timer, timerActive } = get();
    if (timerActive && timer > 0) {
      set({ timer: timer - 1 });
    } else if (timerActive && timer <= 0) {
      get().endChallenge('timeout');
    }
  },

  endChallenge: (outcome) => {
    const { hits, misses, responseTimes, heatmap, currentTechnique, currentDifficulty } = get();
    const total = hits + misses;
    const avgTime = responseTimes.length > 1 
      ? Math.round((responseTimes[responseTimes.length - 1] - responseTimes[0]) / (responseTimes.length - 1)) 
      : 0;
    const accuracy = total > 0 ? Math.round((hits / total) * 100) : 0;
    
    set({
      gameState: outcome === 'success' ? 'success' : 'failed',
      challengeActive: false,
      timerActive: false,
      stats: {
        avgTime,
        accuracy,
        missed: misses,
        hits,
        misses,
        heatmap,
        totalDrills: 1,
        successRate: outcome === 'success' ? 100 : 0,
      },
    });
    
    // Auto-show solution for failures
    if (outcome !== 'success') {
      setTimeout(() => {
        set({ showSolutionReveal: true });
      }, 500);
    }
  },

  resetChallenge: () => {
    set({
      gameState: 'setup',
      challengeActive: false,
      puzzle: null,
      section: null,
      correctCell: null,
      userSelection: null,
      timer: 0,
      timeLimit: 0,
      timerActive: false,
      hits: 0,
      misses: 0,
      responseTimes: [],
      heatmap: Array(9).fill(0).map(() => Array(9).fill(0)),
      stats: null,
      currentTechnique: '',
      currentDifficulty: '',
      showSolutionReveal: false,
      wrongAttempts: 0,
    });
  },

  showSolution: () => {
    set({ showSolutionReveal: true });
  },

  hideSolution: () => {
    set({ showSolutionReveal: false });
  },

  nextDrill: () => {
    const { currentDifficulty, currentTechnique, timeLimit } = get();
    get().startChallenge(currentDifficulty, currentTechnique, timeLimit);
  },

  retryDrill: () => {
    const { currentDifficulty, currentTechnique, timeLimit } = get();
    get().startChallenge(currentDifficulty, currentTechnique, timeLimit);
  },
}));

// Helper functions
function generateSpeedTrainerPuzzle(difficulty: string, technique: string): number[][] {
  const grid = Array(9).fill(0).map(() => Array(9).fill(0));
  
  // Fill some cells based on difficulty
  const fillPercentage = difficulty === 'Easy' ? 0.4 : difficulty === 'Medium' ? 0.3 : 0.25;
  
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

function getRandomSection(technique?: string): { type: 'row' | 'col' | 'box'; index: number; technique?: string } {
  const types: Array<'row' | 'col' | 'box'> = ['row', 'col', 'box'];
  const type = types[Math.floor(Math.random() * 3)];
  const index = Math.floor(Math.random() * 9);
  return { type, index, technique };
}

function getSectionCells(type: 'row' | 'col' | 'box', index: number): [number, number][] {
  if (type === 'row') return Array(9).fill(0).map((_, c) => [index, c]);
  if (type === 'col') return Array(9).fill(0).map((_, r) => [r, index]);
  
  // box: index 0-8, 3x3
  const boxRow = Math.floor(index / 3) * 3;
  const boxCol = (index % 3) * 3;
  const cells: [number, number][] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      cells.push([boxRow + r, boxCol + c]);
    }
  }
  return cells;
}

function isCellInSection(row: number, col: number, section: { type: 'row' | 'col' | 'box'; index: number }): boolean {
  const cells = getSectionCells(section.type, section.index);
  return cells.some(([r, c]) => r === row && c === col);
}

function findCorrectCell(puzzle: number[][], section: { type: 'row' | 'col' | 'box'; index: number }, technique: string): { row: number; col: number; value: number } | null {
  const cells = getSectionCells(section.type, section.index);
  
  // Find empty cells in the section
  const emptyCells = cells.filter(([row, col]) => puzzle[row][col] === 0);
  
  if (emptyCells.length === 0) return null;
  
  // For demo purposes, randomly select an empty cell and assign a valid number
  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = findValidNumber(puzzle, row, col);
  
  return value ? { row, col, value } : null;
}

function findValidNumber(puzzle: number[][], row: number, col: number): number | null {
  for (let num = 1; num <= 9; num++) {
    if (isValidPlacement(puzzle, row, col, num)) {
      return num;
    }
  }
  return null;
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

function addTechniquePatterns(grid: number[][], technique: string) {
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