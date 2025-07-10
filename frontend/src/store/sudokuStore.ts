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
  
  // Actions
  newGame: (difficulty?: string) => Promise<boolean>;
  selectCell: (row: number, col: number) => boolean;
  makeMove: (value: number) => Promise<boolean>;
  toggleNote: (row: number, col: number, value: number) => boolean;
  getHint: () => Promise<any>;
  checkSolution: () => Promise<any>;
  undo: () => boolean;
  redo: () => boolean;
  erase: () => boolean;
  startTimer: () => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  getFormattedTime: () => string;
  setDifficulty: (difficulty: string) => void;
  resetGame: () => void;
  saveState: () => void;
};

const API_URL = 'http://localhost:8000';

// Helper function to create a cell
const createCell = (value: number = 0, isFixed: boolean = false): Cell => ({
  value,
  isFixed,
  notes: new Set<number>()
});

// Helper function to create a grid
const createGrid = (puzzle?: number[][]): SudokuGrid => {
  const grid = Array(9).fill(null).map(() => 
    Array(9).fill(null).map(() => createCell())
  );

  if (puzzle) {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        grid[i][j] = createCell(puzzle[i][j], puzzle[i][j] !== 0);
      }
    }
  }

  return grid;
};

export const useSudokuStore = create<GameState>((set, get) => ({
  // Initial state
  grid: createGrid(),
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

  // Save current state for undo/redo
  saveState: () => {
    const { grid, undoStack } = get();
    const newUndoStack = [...undoStack];
    const gridCopy = grid.map(row => 
      row.map(cell => createCell(cell.value, cell.isFixed))
    );
    newUndoStack.push(gridCopy);
    set({ undoStack: newUndoStack, redoStack: [] });
  },

  // Actions
  newGame: async (difficulty = 'medium') => {
    try {
      // Get a new puzzle from the backend
      const response = await fetch(`${API_URL}/api/new`, {
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
      const puzzle = data.puzzle;

      // Initialize grid with puzzle values
      const grid = createGrid(puzzle);

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
    const { selectedCell, grid, isNotesMode } = get();
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
          ? { ...c, value, notes: new Set() }
          : c
      )
    );

    set({ grid: newGrid });
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

    try {
      const response = await fetch(`${API_URL}/api/sudoku/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grid: grid.map(row => row.map(cell => cell.value)),
          solution
        })
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (data.moves && data.moves.length > 0) {
        const hint = data.moves[0];
        set({ hintsRemaining: hintsRemaining - 1 });
        return hint;
      }
    } catch (error) {
      console.error('Error getting hint:', error);
    }
    return null;
  },

  checkSolution: async () => {
    const { grid, solution } = get();
    
    try {
      const response = await fetch(`${API_URL}/api/sudoku/check-solution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grid: grid.map(row => row.map(cell => cell.value)),
          solution
        })
      });

      if (!response.ok) return { solved: false, error: 'Check failed' };

      const data = await response.json();
      if (data.solved) {
        get().stopTimer();
      }
      return data;
    } catch (error) {
      console.error('Error checking solution:', error);
      return { solved: false, error: 'Check failed' };
    }
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
          ? { ...c, value: 0, notes: new Set() }
          : c
      )
    );

    set({ grid: newGrid });
    return true;
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

  resetGame: () => {
    set({
      grid: createGrid(),
      solution: null,
      selectedCell: null,
      isNotesMode: false,
      hintsRemaining: 3,
      checkCount: 0,
      undoStack: [],
      redoStack: [],
      isCreating: false,
      isPlaying: false,
      timer: {
        startTime: 0,
        elapsedTime: 0,
        isPaused: false,
        isGameComplete: false
      }
    });
  }
})); 