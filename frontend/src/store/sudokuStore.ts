import { create } from 'zustand';

// Types
export type Cell = {
  value: number;
  isFixed: boolean;
  notes: Set<number>;
};

export type SudokuGrid = Cell[][];

export type GameState = {
  // Game state
  grid: SudokuGrid;
  solution: number[][] | null;
  difficulty: string;
  selectedCell: { row: number; col: number } | null;
  isNotesMode: boolean;
  hintsRemaining: number;
  checkCount: number;
  
  // Timer
  timer: {
    startTime: number;
    elapsedTime: number;
    isPaused: boolean;
    isGameComplete: boolean;
  };
  
  // History
  undoStack: SudokuGrid[];
  redoStack: SudokuGrid[];
  
  // Game features
  isCreating: boolean;
  isPlaying: boolean;
  
  // Solution Report
  showSolutionReport: boolean;
  initialGrid: number[][];
  
  // Actions
  newGame: (difficulty?: string) => Promise<boolean>;
  selectCell: (row: number, col: number) => boolean;
  makeMove: (value: number) => Promise<boolean>;
  toggleNote: (row: number, col: number, value: number) => boolean;
  getHint: () => Promise<any>;
  useHint: () => Promise<{ success: boolean; type?: string; message: string }>;
  completePuzzle: () => Promise<any>;
  undo: () => boolean;
  redo: () => boolean;
  erase: () => boolean;
  saveState: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  getFormattedTime: () => string;
  setDifficulty: (difficulty: string) => void;
  resetGame: () => void;
  toggleNotesMode: () => void;
  updateNotes: (row: number, col: number, value: number) => void;
  showSolutionReportModal: () => void;
  hideSolutionReportModal: () => void;
  findConflicts: (grid: SudokuGrid) => Array<{row: number, col: number, value: number}>;
  checkCellConflict: (grid: SudokuGrid, row: number, col: number, value: number) => boolean;
};

const API_URL = 'http://localhost:8000';

export const useSudokuStore = create<GameState>((set, get) => ({
  // Initial state
  grid: Array(9).fill(null).map(() => 
    Array(9).fill(null).map(() => ({
      value: 0,
      isFixed: false,
      notes: new Set()
    }))
  ),
  solution: null,
  difficulty: 'medium',
  selectedCell: null,
  isNotesMode: false,
  hintsRemaining: 3,
  checkCount: 0,
  
  timer: {
    startTime: 0,
    elapsedTime: 0,
    isPaused: false,
    isGameComplete: false
  },
  
  undoStack: [],
  redoStack: [],
  isCreating: false,
  isPlaying: false,
  showSolutionReport: false,
  initialGrid: Array(9).fill(null).map(() => Array(9).fill(0)),

  // Actions
  newGame: async (difficulty = 'medium') => {
    try {
      const response = await fetch(`${API_URL}/api/sudoku/new`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({ difficulty })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();

      // Initialize grid with cell objects
      const grid = data.grid.map((row: number[]) => 
        row.map((value: number) => ({
          value: value,
          isFixed: value !== 0,
          notes: new Set()
        }))
      );

      // Set hint levels based on difficulty
      const hintLevels = {
        'easy': 4,
        'medium': 3,
        'hard': 2,
        'expert': 1,
        'master': 0
      };
      const hintsRemaining = hintLevels[difficulty as keyof typeof hintLevels] ?? 3;

      set({
        grid,
        solution: data.solution,
        difficulty,
        selectedCell: null,
        hintsRemaining,
        checkCount: 0,
        undoStack: [],
        redoStack: [],
        isCreating: false,
        isPlaying: true,
        showSolutionReport: false,
        initialGrid: data.grid,
        timer: {
          startTime: Date.now(),
          elapsedTime: 0,
          isPaused: false,
          isGameComplete: false
        }
      });

      // Start timer
      get().startTimer();
      return true;
    } catch (error) {
      console.error('Error starting new game:', error);
      return false;
    }
  },

  selectCell: (row: number, col: number) => {
    if (row >= 0 && row < 9 && col >= 0 && col < 9) {
      set({ selectedCell: { row, col } });
      return true;
    }
    return false;
  },

  makeMove: async (value: number) => {
    const { selectedCell, grid, isNotesMode, solution, stopTimer } = get();
    if (!selectedCell) return false;
    
    const { row, col } = selectedCell;
    const cell = grid[row][col];
    
    if (cell.isFixed) return false;

    // If in notes mode, handle note toggling
    if (isNotesMode) {
      return get().toggleNote(row, col, value);
    }

    // Save state for undo
    get().saveState();

    // Update the cell
    const newGrid = grid.map((r, i) => 
      r.map((c, j) => 
        i === row && j === col 
          ? { ...c, value, notes: new Set<number>() }
          : c
      )
    );

    set({ grid: newGrid });

    // Check if puzzle is solved
    if (solution) {
      const isSolved = newGrid.every((row, r) =>
        row.every((cell, c) => cell.value === solution[r][c])
      );
      if (isSolved) {
        stopTimer();
      }
    }
    return true;
  },

  toggleNote: (row: number, col: number, value: number) => {
    const { grid } = get();
    const cell = grid[row][col];
    
    if (cell.value !== 0) return false;

    get().saveState();
    
    const newNotes = new Set(cell.notes);
    if (newNotes.has(value)) {
      newNotes.delete(value);
    } else {
      newNotes.add(value);
    }

    const newGrid = grid.map((r, i) => 
      r.map((c, j) => 
        i === row && j === col 
          ? { ...c, notes: newNotes }
          : c
      )
    );

    set({ grid: newGrid });
    return true;
  },

  getHint: async () => {
    const { grid, solution, hintsRemaining } = get();
    if (hintsRemaining <= 0 || !solution) return null;

    // First, check for conflicts in the current grid
    const conflicts = get().findConflicts(grid);
    if (conflicts.length > 0) {
      // If there are conflicts, return the first conflict as a hint
      const firstConflict = conflicts[0];
      set({ hintsRemaining: hintsRemaining - 1 });
      return {
        ...firstConflict,
        type: 'conflict',
        message: `There's a conflict in this cell. The number ${firstConflict.value} cannot be placed here.`
      };
    }

    // Find empty cells that can be filled
    const emptyCells = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col].value === 0) {
          const correctValue = solution[row][col];
          emptyCells.push({ row, col, value: correctValue });
        }
      }
    }

    if (emptyCells.length === 0) {
      return null; // No empty cells to fill
    }

    // Return a random empty cell as hint
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const hint = emptyCells[randomIndex];
    
    set({ hintsRemaining: hintsRemaining - 1 });
    return {
      ...hint,
      type: 'fill',
      message: `You can place ${hint.value} in this cell.`
    };
  },

  useHint: async () => {
    const hint = await get().getHint();
    if (hint && hint.row !== undefined && hint.col !== undefined) {
      const { grid, selectCell } = get();
      
      if (hint.type === 'conflict') {
        // For conflicts, just select the cell to highlight the issue
        selectCell(hint.row, hint.col);
        return { success: true, type: 'conflict', message: hint.message };
      } else if (hint.type === 'fill' && hint.value !== undefined) {
        // For fill hints, apply the value
        const newGrid = grid.map((r, i) => 
          r.map((c, j) => 
            i === hint.row && j === hint.col 
              ? { ...c, value: hint.value, notes: new Set<number>() }
              : c
          )
        );
        set({ grid: newGrid });
        selectCell(hint.row, hint.col);
        return { success: true, type: 'fill', message: hint.message };
      }
    }
    return { success: false, message: 'No hints available' };
  },

  // Helper function to find conflicts in the grid
  findConflicts: (grid: SudokuGrid) => {
    const conflicts = [];
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = grid[row][col];
        if (cell.value !== 0) {
          // Check if this value conflicts with other cells in the same row, column, or box
          const hasConflict = get().checkCellConflict(grid, row, col, cell.value);
          if (hasConflict) {
            conflicts.push({ row, col, value: cell.value });
          }
        }
      }
    }
    
    return conflicts;
  },

  // Helper function to check if a specific cell has conflicts
  checkCellConflict: (grid: SudokuGrid, row: number, col: number, value: number) => {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && grid[row][c].value === value) {
        return true;
      }
    }
    
    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && grid[r][col].value === value) {
        return true;
      }
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && grid[r][c].value === value) {
          return true;
        }
      }
    }
    
    return false;
  },

  completePuzzle: async () => {
    const { grid, solution } = get();
    
    if (!solution) {
      return { completed: false, error: 'No solution available' };
    }

    // Find all empty cells and fill them with solution values
    const newGrid = grid.map((row, rowIndex) => 
      row.map((cell, colIndex) => {
        if (cell.value === 0 && solution[rowIndex][colIndex]) {
          return { ...cell, value: solution[rowIndex][colIndex], notes: new Set<number>() };
        }
        return cell;
      })
    );

    set({ grid: newGrid });
    get().stopTimer();
    
    return { 
      completed: true, 
      message: 'Puzzle completed successfully!',
      solutionPath: solution
    };
  },

  undo: () => {
    const { undoStack, redoStack, grid } = get();
    if (undoStack.length === 0) return false;
    
    const previousState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    const newRedoStack = [...redoStack, grid];
    
    set({ 
      grid: previousState, 
      undoStack: newUndoStack, 
      redoStack: newRedoStack 
    });
    return true;
  },

  redo: () => {
    const { undoStack, redoStack, grid } = get();
    if (redoStack.length === 0) return false;
    
    const nextState = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    const newUndoStack = [...undoStack, grid];
    
    set({ 
      grid: nextState, 
      undoStack: newUndoStack, 
      redoStack: newRedoStack 
    });
    return true;
  },

  erase: () => {
    const { selectedCell, grid } = get();
    if (!selectedCell) return false;
    
    const { row, col } = selectedCell;
    const cell = grid[row][col];
    
    if (cell.isFixed) return false;

    get().saveState();
    
    const newGrid = grid.map((r, i) => 
      r.map((c, j) => 
        i === row && j === col 
          ? { ...c, value: 0, notes: new Set<number>() }
          : c
      )
    );

    set({ grid: newGrid });
    return true;
  },

  saveState: () => {
    const { grid, undoStack } = get();
    set({ undoStack: [...undoStack, JSON.parse(JSON.stringify(grid))] });
  },

  startTimer: () => {
    const { timer } = get();
    if (timer.isPaused) {
      set({
        timer: {
          ...timer,
          startTime: Date.now() - timer.elapsedTime,
          isPaused: false
        }
      });
    } else {
      set({
        timer: {
          ...timer,
          startTime: Date.now(),
          elapsedTime: 0,
          isPaused: false,
          isGameComplete: false
        }
      });
    }
    
    // Start the timer interval
    const interval = setInterval(() => {
      const { timer } = get();
      if (!timer.isPaused && !timer.isGameComplete) {
        set({
          timer: {
            ...timer,
            elapsedTime: Date.now() - timer.startTime
          }
        });
      }
    }, 1000);
    
    // Store the interval ID for cleanup
    (window as any).sudokuTimerInterval = interval;
  },

  stopTimer: () => {
    const { timer } = get();
    set({
      timer: {
        ...timer,
        isGameComplete: true
      }
    });
    
    // Clear the timer interval
    if ((window as any).sudokuTimerInterval) {
      clearInterval((window as any).sudokuTimerInterval);
      (window as any).sudokuTimerInterval = null;
    }
  },

  pauseTimer: () => {
    const { timer } = get();
    if (!timer.isGameComplete) {
      set({
        timer: {
          ...timer,
          elapsedTime: Date.now() - timer.startTime,
          isPaused: true
        }
      });
    }
  },

  resumeTimer: () => {
    const { timer } = get();
    if (!timer.isGameComplete && timer.isPaused) {
      set({
        timer: {
          ...timer,
          startTime: Date.now() - timer.elapsedTime,
          isPaused: false
        }
      });
    }
  },

  getFormattedTime: () => {
    const { timer } = get();
    const totalSeconds = Math.floor(timer.elapsedTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },

  setDifficulty: (difficulty: string) => {
    set({ difficulty });
  },

  toggleNotesMode: () => {
    const { isNotesMode } = get();
    set({ isNotesMode: !isNotesMode });
  },

  updateNotes: (row: number, col: number, value: number) => {
    get().toggleNote(row, col, value);
  },

  resetGame: () => {
    set({
      grid: Array(9).fill(null).map(() => 
        Array(9).fill(null).map(() => ({
          value: 0,
          isFixed: false,
          notes: new Set()
        }))
      ),
      solution: null,
      selectedCell: null,
      isNotesMode: false,
      hintsRemaining: 3,
      checkCount: 0,
      undoStack: [],
      redoStack: [],
      isCreating: false,
      isPlaying: false,
      showSolutionReport: false,
      initialGrid: Array(9).fill(null).map(() => Array(9).fill(0)),
      timer: {
        startTime: 0,
        elapsedTime: 0,
        isPaused: false,
        isGameComplete: false
      }
    });
  },

  showSolutionReportModal: () => {
    set({ showSolutionReport: true });
  },

  hideSolutionReportModal: () => {
    set({ showSolutionReport: false });
  }
})); 