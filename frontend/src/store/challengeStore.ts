import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  generateSpeedScanningGrid, 
  generatePattern, 
  generateMentalMappingGrid,
  calculateChallengeScore,
  getChallengeConfig
} from '../utils/challengeUtils';

// Types
export type ChallengeType = 'pattern-recognition' | 'speed-scanning' | 'mental-mapping';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type ChallengeResult = {
  timeTaken: number;
  correctAnswers: number;
  mistakes: number;
  stars: number;
  score: number;
};

export type ChallengeSession = {
  type: ChallengeType;
  difficulty: DifficultyLevel;
  isActive: boolean;
  timer: number;
  timeLimit: number;
  score: number;
  correctAnswers: number;
  mistakes: number;
  currentRound: number;
  totalRounds: number;
  instructions: string;
  targetNumber?: number;
  pattern?: number[][];
  memorizedGrid?: number[][];
  currentGrid?: number[][];
  selectedCells: { row: number; col: number }[];
  feedback: {
    message: string;
    type: 'success' | 'error' | 'info';
    show: boolean;
  };
  phase: 'memorize' | 'recall' | 'active';
  memorizeTime?: number;
};

export type ChallengeStore = {
  // Current session
  currentSession: ChallengeSession | null;
  
  // Results and progress
  results: Record<ChallengeType, ChallengeResult[]>;
  totalStars: number;
  completedChallenges: number;
  
  // Actions
  startChallenge: (type: ChallengeType, difficulty: DifficultyLevel) => void;
  endChallenge: () => void;
  resetChallenge: () => void;
  updateScore: (correct: boolean) => void;
  selectCell: (row: number, col: number) => void;
  clearFeedback: () => void;
  setFeedback: (message: string, type: 'success' | 'error' | 'info') => void;
  tick: () => void;
  saveResult: (result: ChallengeResult) => void;
  nextPhase: () => void;
};

export const useChallengeStore = create<ChallengeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      results: {
        'pattern-recognition': [],
        'speed-scanning': [],
        'mental-mapping': []
      },
      totalStars: 0,
      completedChallenges: 0,

      // Actions
      startChallenge: (type: ChallengeType, difficulty: DifficultyLevel) => {
        const config = getChallengeConfig(type, difficulty);
        
        // Generate challenge-specific data
        let targetNumber: number | undefined;
        let pattern: number[][] | undefined;
        let memorizedGrid: number[][] | undefined;
        let currentGrid: number[][] | undefined;
        let phase: 'memorize' | 'recall' | 'active' = 'active';
        let memorizeTime: number | undefined;

        if (type === 'speed-scanning') {
          targetNumber = Math.floor(Math.random() * 9) + 1;
          currentGrid = generateSpeedScanningGrid(targetNumber, difficulty);
        } else if (type === 'pattern-recognition') {
          const patternData = generatePattern(difficulty);
          pattern = patternData.pattern;
        } else if (type === 'mental-mapping') {
          memorizedGrid = generateMentalMappingGrid(difficulty);
          currentGrid = memorizedGrid;
          phase = 'memorize';
          memorizeTime = difficulty === 'easy' ? 15 : difficulty === 'medium' ? 10 : 8;
        }

        set({
          currentSession: {
            type,
            difficulty,
            isActive: true,
            timer: config.timeLimit,
            timeLimit: config.timeLimit,
            score: 0,
            correctAnswers: 0,
            mistakes: 0,
            currentRound: 1,
            totalRounds: config.totalRounds,
            instructions: config.instructions,
            targetNumber,
            pattern,
            memorizedGrid,
            currentGrid,
            selectedCells: [],
            feedback: {
              message: '',
              type: 'info',
              show: false
            },
            phase,
            memorizeTime
          }
        });
      },

      endChallenge: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        const timeUsed = currentSession.timeLimit - currentSession.timer;
        const { score, stars } = calculateChallengeScore(
          currentSession.correctAnswers,
          currentSession.mistakes,
          timeUsed,
          currentSession.timeLimit
        );

        const result: ChallengeResult = {
          timeTaken: timeUsed,
          correctAnswers: currentSession.correctAnswers,
          mistakes: currentSession.mistakes,
          stars,
          score
        };

        get().saveResult(result);
        set({ currentSession: null });
      },

      resetChallenge: () => {
        set({ currentSession: null });
      },

      updateScore: (correct: boolean) => {
        const { currentSession } = get();
        if (!currentSession) return;

        set({
          currentSession: {
            ...currentSession,
            correctAnswers: currentSession.correctAnswers + (correct ? 1 : 0),
            mistakes: currentSession.mistakes + (correct ? 0 : 1),
            score: currentSession.score + (correct ? 10 : -5)
          }
        });
      },

      selectCell: (row: number, col: number) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const isAlreadySelected = currentSession.selectedCells.some(
          cell => cell.row === row && cell.col === col
        );

        if (isAlreadySelected) {
          // Deselect cell
          set({
            currentSession: {
              ...currentSession,
              selectedCells: currentSession.selectedCells.filter(
                cell => !(cell.row === row && cell.col === col)
              )
            }
          });
          return;
        }

        // Check if selection is correct based on challenge type
        let isCorrect = false;
        let feedbackMessage = '';

        if (currentSession.type === 'speed-scanning' && currentSession.targetNumber && currentSession.currentGrid) {
          isCorrect = currentSession.currentGrid[row][col] === currentSession.targetNumber;
          feedbackMessage = isCorrect ? 'Correct number!' : 'Wrong number!';
        } else if (currentSession.type === 'pattern-recognition' && currentSession.pattern) {
          isCorrect = currentSession.pattern[row][col] === 1;
          feedbackMessage = isCorrect ? 'Pattern found!' : 'Not part of the pattern!';
        } else if (currentSession.type === 'mental-mapping' && currentSession.memorizedGrid && currentSession.phase === 'recall') {
          isCorrect = currentSession.memorizedGrid[row][col] > 0;
          feedbackMessage = isCorrect ? 'Correct recall!' : 'Wrong position!';
        }

        get().updateScore(isCorrect);
        get().setFeedback(feedbackMessage, isCorrect ? 'success' : 'error');

        set({
          currentSession: {
            ...currentSession,
            selectedCells: [...currentSession.selectedCells, { row, col }]
          }
        });
      },

      clearFeedback: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        set({
          currentSession: {
            ...currentSession,
            feedback: {
              ...currentSession.feedback,
              show: false
            }
          }
        });
      },

      setFeedback: (message: string, type: 'success' | 'error' | 'info') => {
        const { currentSession } = get();
        if (!currentSession) return;

        set({
          currentSession: {
            ...currentSession,
            feedback: {
              message,
              type,
              show: true
            }
          }
        });

        // Auto-hide feedback after 2 seconds
        setTimeout(() => {
          get().clearFeedback();
        }, 2000);
      },

      tick: () => {
        const { currentSession } = get();
        if (!currentSession || !currentSession.isActive) return;

        if (currentSession.timer > 0) {
          set({
            currentSession: {
              ...currentSession,
              timer: currentSession.timer - 1
            }
          });
        } else {
          get().endChallenge();
        }
      },

      nextPhase: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        if (currentSession.type === 'mental-mapping' && currentSession.phase === 'memorize') {
          // Switch to recall phase
          set({
            currentSession: {
              ...currentSession,
              phase: 'recall',
              currentGrid: Array(9).fill(0).map(() => Array(9).fill(0)), // Empty grid for recall
              timer: currentSession.timeLimit // Reset timer for recall phase
            }
          });
        }
      },

      saveResult: (result: ChallengeResult) => {
        const { currentSession, results, totalStars, completedChallenges } = get();
        if (!currentSession) return;

        const newResults = {
          ...results,
          [currentSession.type]: [...results[currentSession.type], result]
        };

        set({
          results: newResults,
          totalStars: totalStars + result.stars,
          completedChallenges: completedChallenges + 1
        });
      }
    }),
    {
      name: 'challenge-store',
      partialize: (state) => ({
        results: state.results,
        totalStars: state.totalStars,
        completedChallenges: state.completedChallenges
      })
    }
  )
); 