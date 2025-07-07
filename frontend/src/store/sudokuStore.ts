import { create } from 'zustand';
import { getRandomEmptyCell, validateBoard, notesKey } from '../utils/sudokuUtils';

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
  solutionBoard: number[][] | null;
  difficulty: string;
  selectedCell: { row: number; col: number } | null;
  isNotesMode: boolean;
  notes: Record<string, number[]>;
  hintsRemaining: number;
  wrongCells: Set<string>;
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
  checkSolution: () => void;
  undo: () => boolean;
  redo: () => boolean;
  erase: () => boolean;
  startTimer: () => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  getFormattedTime: () => string;
  resetGame: () => void;
  useHint: () => void;
  toggleNotesMode: () => void;
  updateNotes: (row: number, col: number, value: number) => void;
  clearNotes: (row: number, col: number) => void;
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
  solutionBoard: null,
  difficulty: 'medium',
  selectedCell: null,
  isNotesMode: false,
  notes: {},
  hintsRemaining: 3,
  wrongCells: new Set(),
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
    const { grid, solution, hintsRemaining, difficulty } = get();
    if (hintsRemaining <= 0 || !solution) return null;

    try {
      const response = await fetch(`${API_URL}/api/sudoku/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grid: grid.map(row => row.map(cell => cell.value)),
          solution,
          difficulty
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

  checkSolution: () => {
    const { grid, solution } = get();
    if (!solution) return;
    const wrong = validateBoard(grid, solution);
    set({ wrongCells: wrong });
    setTimeout(() => set({ wrongCells: new Set() }), 2000);
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
      timer: {
        startTime: 0,
        elapsedTime: 0,
        isPaused: false,
        isGameComplete: false
      }
    });
  },

  useHint: () => {
    const { grid, solution, hintsRemaining } = get();
    if (!solution || hintsRemaining <= 0) return;
    const cell = getRandomEmptyCell(grid);
    if (!cell) return;
    const { row, col } = cell;
    const value = solution[row][col];
    // Save state for undo if needed
    const newGrid = grid.map((r, i) =>
      r.map((c, j) =>
        i === row && j === col ? { ...c, value } : c
      )
    );
    set({
      grid: newGrid,
      hintsRemaining: hintsRemaining - 1,
    });
    // Optionally: trigger animation state for this cell
  },

  toggleNotesMode: () => {
    set((state) => ({ isNotesMode: !state.isNotesMode }));
  },

  updateNotes: (row, col, value) => {
    const { notes } = get();
    const key = notesKey(row, col);
    const current = notes[key] || [];
    let updated: number[];
    if (current.includes(value)) {
      updated = current.filter((v) => v !== value);
    } else {
      updated = [...current, value].sort();
    }
    set({ notes: { ...notes, [key]: updated } });
  },

  clearNotes: (row, col) => {
    const { notes } = get();
    const key = notesKey(row, col);
    if (notes[key]) {
      const newNotes = { ...notes };
      delete newNotes[key];
      set({ notes: newNotes });
    }
  },
})); 