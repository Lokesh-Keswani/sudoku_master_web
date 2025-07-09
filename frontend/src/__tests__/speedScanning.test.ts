import { renderHook, act } from '@testing-library/react';
import { useSpeedTrainerStore } from '../store/speedTrainerStore';

// Mock the store for testing
const mockStore = useSpeedTrainerStore.getState();

describe('Speed Scanning Trainer', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useSpeedTrainerStore.setState({
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
      });
    });
  });

  describe('Store Initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      expect(result.current.gameState).toBe('setup');
      expect(result.current.challengeActive).toBe(false);
      expect(result.current.puzzle).toBeNull();
      expect(result.current.section).toBeNull();
      expect(result.current.correctCell).toBeNull();
      expect(result.current.timer).toBe(0);
      expect(result.current.wrongAttempts).toBe(0);
      expect(result.current.maxWrongAttempts).toBe(3);
    });
  });

  describe('Challenge Start', () => {
    it('should start a challenge with correct parameters', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.startChallenge('Easy', 'Hidden Single', 30);
      });

      expect(result.current.gameState).toBe('playing');
      expect(result.current.challengeActive).toBe(true);
      expect(result.current.currentDifficulty).toBe('Easy');
      expect(result.current.currentTechnique).toBe('Hidden Single');
      expect(result.current.timer).toBe(30);
      expect(result.current.timeLimit).toBe(30);
      expect(result.current.timerActive).toBe(true);
      expect(result.current.puzzle).not.toBeNull();
      expect(result.current.section).not.toBeNull();
      expect(result.current.correctCell).not.toBeNull();
    });

    it('should generate a valid puzzle', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.startChallenge('Medium', 'Naked Single', 20);
      });

      const puzzle = result.current.puzzle;
      expect(puzzle).not.toBeNull();
      expect(puzzle!.length).toBe(9);
      expect(puzzle![0].length).toBe(9);
      
      // Check that puzzle has some filled cells
      const filledCells = puzzle!.flat().filter(cell => cell !== 0).length;
      expect(filledCells).toBeGreaterThan(0);
    });

    it('should generate a valid section', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.startChallenge('Hard', 'Locked Candidates', 45);
      });

      const section = result.current.section;
      expect(section).not.toBeNull();
      expect(['row', 'col', 'box']).toContain(section!.type);
      expect(section!.index).toBeGreaterThanOrEqual(0);
      expect(section!.index).toBeLessThan(9);
    });

    it('should find a correct cell', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.startChallenge('Easy', 'Hidden Single', 30);
      });

      const correctCell = result.current.correctCell;
      expect(correctCell).not.toBeNull();
      expect(correctCell!.row).toBeGreaterThanOrEqual(0);
      expect(correctCell!.row).toBeLessThan(9);
      expect(correctCell!.col).toBeGreaterThanOrEqual(0);
      expect(correctCell!.col).toBeLessThan(9);
      expect(correctCell!.value).toBeGreaterThanOrEqual(1);
      expect(correctCell!.value).toBeLessThanOrEqual(9);
    });
  });

  describe('Cell Click Handling', () => {
    it('should handle correct cell click', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.startChallenge('Easy', 'Hidden Single', 30);
      });

      const correctCell = result.current.correctCell;
      expect(correctCell).not.toBeNull();

      act(() => {
        result.current.clickCell(correctCell!.row, correctCell!.col);
      });

      expect(result.current.gameState).toBe('success');
      expect(result.current.challengeActive).toBe(false);
      expect(result.current.timerActive).toBe(false);
      expect(result.current.hits).toBe(1);
      expect(result.current.userSelection).toEqual({
        row: correctCell!.row,
        col: correctCell!.col
      });
    });

    it('should handle incorrect cell click', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.startChallenge('Easy', 'Hidden Single', 30);
      });

      const correctCell = result.current.correctCell;
      expect(correctCell).not.toBeNull();

      // Click on a different cell in the same section
      const wrongRow = correctCell!.row === 0 ? 1 : 0;
      const wrongCol = correctCell!.col;

      act(() => {
        result.current.clickCell(wrongRow, wrongCol);
      });

      expect(result.current.gameState).toBe('playing');
      expect(result.current.challengeActive).toBe(true);
      expect(result.current.misses).toBe(1);
      expect(result.current.wrongAttempts).toBe(1);
      expect(result.current.userSelection).toEqual({
        row: wrongRow,
        col: wrongCol
      });
    });

    it('should end challenge after max wrong attempts', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.startChallenge('Easy', 'Hidden Single', 30);
      });

      const correctCell = result.current.correctCell;
      expect(correctCell).not.toBeNull();

      // Make 3 wrong attempts
      for (let i = 0; i < 3; i++) {
        const wrongRow = (correctCell!.row + i + 1) % 9;
        const wrongCol = correctCell!.col;
        
        act(() => {
          result.current.clickCell(wrongRow, wrongCol);
        });
      }

      expect(result.current.gameState).toBe('failed');
      expect(result.current.challengeActive).toBe(false);
      expect(result.current.timerActive).toBe(false);
      expect(result.current.misses).toBe(3);
      expect(result.current.wrongAttempts).toBe(3);
    });

    it('should not allow clicks outside target section', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.startChallenge('Easy', 'Hidden Single', 30);
      });

      const section = result.current.section;
      expect(section).not.toBeNull();

      // Find a cell outside the section
      let outsideRow = 0;
      let outsideCol = 0;
      
      if (section!.type === 'row') {
        outsideRow = (section!.index + 1) % 9;
        outsideCol = 0;
      } else if (section!.type === 'col') {
        outsideRow = 0;
        outsideCol = (section!.index + 1) % 9;
      } else {
        // For box, find a cell outside the box
        const boxRow = Math.floor(section!.index / 3) * 3;
        const boxCol = (section!.index % 3) * 3;
        outsideRow = (boxRow + 3) % 9;
        outsideCol = (boxCol + 3) % 9;
      }

      const initialHits = result.current.hits;
      const initialMisses = result.current.misses;

      act(() => {
        result.current.clickCell(outsideRow, outsideCol);
      });

      expect(result.current.hits).toBe(initialHits);
      expect(result.current.misses).toBe(initialMisses);
    });

    it('should not allow clicks on filled cells', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.startChallenge('Easy', 'Hidden Single', 30);
      });

      const puzzle = result.current.puzzle;
      expect(puzzle).not.toBeNull();

      // Find a filled cell in the section
      const section = result.current.section;
      expect(section).not.toBeNull();

      let filledCell = { row: 0, col: 0 };
      for (let i = 0; i < 9; i++) {
        let row = 0, col = 0;
        if (section!.type === 'row') {
          row = section!.index;
          col = i;
        } else if (section!.type === 'col') {
          row = i;
          col = section!.index;
        } else {
          const boxRow = Math.floor(section!.index / 3) * 3;
          const boxCol = (section!.index % 3) * 3;
          row = boxRow + Math.floor(i / 3);
          col = boxCol + (i % 3);
        }
        
        if (puzzle![row][col] !== 0) {
          filledCell = { row, col };
          break;
        }
      }

      const initialHits = result.current.hits;
      const initialMisses = result.current.misses;

      act(() => {
        result.current.clickCell(filledCell.row, filledCell.col);
      });

      expect(result.current.hits).toBe(initialHits);
      expect(result.current.misses).toBe(initialMisses);
    });
  });

  describe('Timer Functionality', () => {
    it('should countdown timer correctly', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.startChallenge('Easy', 'Hidden Single', 5);
      });

      expect(result.current.timer).toBe(5);

      // Simulate timer ticks
      for (let i = 0; i < 3; i++) {
        act(() => {
          result.current.tick();
        });
      }

      expect(result.current.timer).toBe(2);
    });

    it('should end challenge on timeout', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.startChallenge('Easy', 'Hidden Single', 3);
      });

      expect(result.current.timer).toBe(3);

      // Simulate timer running out
      for (let i = 0; i < 3; i++) {
        act(() => {
          result.current.tick();
        });
      }

      expect(result.current.gameState).toBe('timeout');
      expect(result.current.challengeActive).toBe(false);
      expect(result.current.timerActive).toBe(false);
    });
  });

  describe('Solution Reveal', () => {
    it('should show solution reveal after success', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.startChallenge('Easy', 'Hidden Single', 30);
      });

      const correctCell = result.current.correctCell;
      expect(correctCell).not.toBeNull();

      act(() => {
        result.current.clickCell(correctCell!.row, correctCell!.col);
      });

      // Solution should be shown automatically after success
      setTimeout(() => {
        expect(result.current.showSolutionReveal).toBe(true);
      }, 1100);
    });

    it('should show solution reveal after failure', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.startChallenge('Easy', 'Hidden Single', 30);
      });

      const correctCell = result.current.correctCell;
      expect(correctCell).not.toBeNull();

      // Make 3 wrong attempts to trigger failure
      for (let i = 0; i < 3; i++) {
        const wrongRow = (correctCell!.row + i + 1) % 9;
        const wrongCol = correctCell!.col;
        
        act(() => {
          result.current.clickCell(wrongRow, wrongCol);
        });
      }

      // Solution should be shown automatically after failure
      setTimeout(() => {
        expect(result.current.showSolutionReveal).toBe(true);
      }, 600);
    });

    it('should hide solution reveal', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.showSolution = true;
      });

      expect(result.current.showSolutionReveal).toBe(true);

      act(() => {
        result.current.hideSolution();
      });

      expect(result.current.showSolutionReveal).toBe(false);
    });
  });

  describe('Navigation Actions', () => {
    it('should retry drill', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.startChallenge('Easy', 'Hidden Single', 30);
      });

      const initialPuzzle = result.current.puzzle;
      const initialSection = result.current.section;

      act(() => {
        result.current.retryDrill();
      });

      expect(result.current.gameState).toBe('playing');
      expect(result.current.challengeActive).toBe(true);
      expect(result.current.timer).toBe(30);
      expect(result.current.wrongAttempts).toBe(0);
      
      // Should generate new puzzle/section
      expect(result.current.puzzle).not.toEqual(initialPuzzle);
      expect(result.current.section).not.toEqual(initialSection);
    });

    it('should start next drill', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.startChallenge('Easy', 'Hidden Single', 30);
      });

      const initialPuzzle = result.current.puzzle;
      const initialSection = result.current.section;

      act(() => {
        result.current.nextDrill();
      });

      expect(result.current.gameState).toBe('playing');
      expect(result.current.challengeActive).toBe(true);
      expect(result.current.timer).toBe(30);
      expect(result.current.wrongAttempts).toBe(0);
      
      // Should generate new puzzle/section
      expect(result.current.puzzle).not.toEqual(initialPuzzle);
      expect(result.current.section).not.toEqual(initialSection);
    });

    it('should reset challenge', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.startChallenge('Easy', 'Hidden Single', 30);
      });

      expect(result.current.gameState).toBe('playing');

      act(() => {
        result.current.resetChallenge();
      });

      expect(result.current.gameState).toBe('setup');
      expect(result.current.challengeActive).toBe(false);
      expect(result.current.puzzle).toBeNull();
      expect(result.current.section).toBeNull();
      expect(result.current.correctCell).toBeNull();
      expect(result.current.timer).toBe(0);
      expect(result.current.hits).toBe(0);
      expect(result.current.misses).toBe(0);
      expect(result.current.wrongAttempts).toBe(0);
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate correct statistics on success', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.startChallenge('Easy', 'Hidden Single', 30);
      });

      const correctCell = result.current.correctCell;
      expect(correctCell).not.toBeNull();

      act(() => {
        result.current.clickCell(correctCell!.row, correctCell!.col);
      });

      expect(result.current.stats).not.toBeNull();
      expect(result.current.stats!.hits).toBe(1);
      expect(result.current.stats!.misses).toBe(0);
      expect(result.current.stats!.accuracy).toBe(100);
      expect(result.current.stats!.successRate).toBe(100);
    });

    it('should calculate correct statistics on failure', () => {
      const { result } = renderHook(() => useSpeedTrainerStore());
      
      act(() => {
        result.current.startChallenge('Easy', 'Hidden Single', 30);
      });

      const correctCell = result.current.correctCell;
      expect(correctCell).not.toBeNull();

      // Make 3 wrong attempts
      for (let i = 0; i < 3; i++) {
        const wrongRow = (correctCell!.row + i + 1) % 9;
        const wrongCol = correctCell!.col;
        
        act(() => {
          result.current.clickCell(wrongRow, wrongCol);
        });
      }

      expect(result.current.stats).not.toBeNull();
      expect(result.current.stats!.hits).toBe(0);
      expect(result.current.stats!.misses).toBe(3);
      expect(result.current.stats!.accuracy).toBe(0);
      expect(result.current.stats!.successRate).toBe(0);
    });
  });
}); 