import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Move {
  row: number;
  col: number;
  number: number;
}

export interface MentalMappingStats {
  totalSessions: number;
  totalCorrectMoves: number;
  totalAttempts: number;
  bestStreak: number;
  currentStreak: number;
  lastAttempt: {
    moves: Move[];
    correctMoves: Move[];
    score: number;
    timestamp: number;
  } | null;
}

export type TrainingPhase = 'preview' | 'input' | 'comparison';

export interface MentalMappingStore {
  // Current session state
  phase: TrainingPhase;
  puzzle: number[][] | null;
  correctMoves: Move[];
  userMoves: Move[];
  countdown: number;
  isPuzzleVisible: boolean;
  
  // Stats
  stats: MentalMappingStats;
  
  // Actions
  startNewSession: () => void;
  setPhase: (phase: TrainingPhase) => void;
  setPuzzle: (puzzle: number[][], moves: Move[]) => void;
  addUserMove: (move: Move, index: number) => void;
  submitMoves: () => void;
  tickCountdown: () => void;
  resetSession: () => void;
}

const initialStats: MentalMappingStats = {
  totalSessions: 0,
  totalCorrectMoves: 0,
  totalAttempts: 0,
  bestStreak: 0,
  currentStreak: 0,
  lastAttempt: null,
};

export const useMentalMappingStore = create<MentalMappingStore>()(
  persist(
    (set, get) => ({
      // Initial state
      phase: 'preview',
      puzzle: null,
      correctMoves: [],
      userMoves: Array(3).fill(null),
      countdown: 10,
      isPuzzleVisible: true,
      stats: initialStats,

      startNewSession: () => {
        set({
          phase: 'preview',
          countdown: 10,
          isPuzzleVisible: true,
          userMoves: Array(3).fill(null),
        });
        
        // Generate new puzzle and moves
        import('../utils/puzzleUtils').then(utils => {
          const { puzzle, moves } = utils.generateMentalMappingPuzzle();
          set({ puzzle, correctMoves: moves });
        });
      },

      setPhase: (phase: TrainingPhase) => {
        set({ phase });
        if (phase === 'input') {
          set({ isPuzzleVisible: false });
        }
      },

      setPuzzle: (puzzle: number[][], moves: Move[]) => {
        set({ puzzle, correctMoves: moves });
      },

      addUserMove: (move: Move, index: number) => {
        const { userMoves } = get();
        const newUserMoves = [...userMoves];
        newUserMoves[index] = move;
        set({ userMoves: newUserMoves });
      },

      submitMoves: () => {
        const { userMoves, correctMoves, stats } = get();
        
        // Calculate score
        let correctCount = 0;
        const comparisons = userMoves.map((userMove, index) => {
          const correctMove = correctMoves[index];
          const isCorrect = userMove && correctMove && 
            userMove.row === correctMove.row && 
            userMove.col === correctMove.col && 
            userMove.number === correctMove.number;
          
          if (isCorrect) correctCount++;
          return { userMove, correctMove, isCorrect };
        });

        // Update stats
        const newStats = { ...stats };
        newStats.totalSessions++;
        newStats.totalAttempts += 3;
        newStats.totalCorrectMoves += correctCount;
        
        if (correctCount === 3) {
          newStats.currentStreak++;
          newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
        } else {
          newStats.currentStreak = 0;
        }

        newStats.lastAttempt = {
          moves: userMoves.filter(Boolean) as Move[],
          correctMoves,
          score: correctCount,
          timestamp: Date.now(),
        };

        set({ 
          phase: 'comparison',
          stats: newStats,
          isPuzzleVisible: true,
        });
      },

      tickCountdown: () => {
        const { countdown, phase } = get();
        if (phase === 'preview' && countdown > 0) {
          set({ countdown: countdown - 1 });
          if (countdown === 1) {
            // Transition to input phase
            setTimeout(() => {
              get().setPhase('input');
            }, 1000);
          }
        }
      },

      resetSession: () => {
        set({
          phase: 'preview',
          countdown: 10,
          isPuzzleVisible: true,
          userMoves: Array(3).fill(null),
        });
      },
    }),
    {
      name: 'mental-mapping-stats',
      partialize: (state) => ({ stats: state.stats }),
    }
  )
); 