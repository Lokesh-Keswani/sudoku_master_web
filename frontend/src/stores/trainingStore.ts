import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TrainingProgress {
  techniquesMastered: number;
  puzzlesCompleted: number;
  averageRating: number;
  currentStreak: number;
  totalTimeSpent: number;
  modulesCompleted: {
    [key: string]: {
      completed: boolean;
      score: number;
      timeSpent: number;
      lastPlayed: string;
    };
  };
}

interface TrainingSession {
  moduleId: string;
  startTime: Date;
  endTime?: Date;
  score?: number;
  mistakes: number;
  hintsUsed: number;
}

interface TrainingStore {
  // State
  progress: TrainingProgress;
  currentSession: TrainingSession | null;
  isTraining: boolean;
  
  // Actions
  startTraining: (moduleId: string) => void;
  endTraining: (score: number, mistakes: number, hintsUsed: number) => void;
  updateProgress: (moduleId: string, score: number, timeSpent: number) => void;
  resetProgress: () => void;
  getModuleProgress: (moduleId: string) => TrainingProgress['modulesCompleted'][string] | null;
  getOverallProgress: () => {
    totalModules: number;
    completedModules: number;
    averageScore: number;
    totalTimeSpent: number;
  };
}

const initialProgress: TrainingProgress = {
  techniquesMastered: 0,
  puzzlesCompleted: 0,
  averageRating: 0,
  currentStreak: 0,
  totalTimeSpent: 0,
  modulesCompleted: {
    techniques: { completed: false, score: 0, timeSpent: 0, lastPlayed: '' },
    patterns: { completed: false, score: 0, timeSpent: 0, lastPlayed: '' },
    speed: { completed: false, score: 0, timeSpent: 0, lastPlayed: '' },
    mapping: { completed: false, score: 0, timeSpent: 0, lastPlayed: '' },
    'ai-coach': { completed: false, score: 0, timeSpent: 0, lastPlayed: '' },
    challenge: { completed: false, score: 0, timeSpent: 0, lastPlayed: '' },
  }
};

export const useTrainingStore = create<TrainingStore>()(
  persist(
    (set, get) => ({
      // Initial state
      progress: initialProgress,
      currentSession: null,
      isTraining: false,

      // Actions
      startTraining: (moduleId: string) => {
        set({
          isTraining: true,
          currentSession: {
            moduleId,
            startTime: new Date(),
            mistakes: 0,
            hintsUsed: 0
          }
        });
      },

      endTraining: (score: number, mistakes: number, hintsUsed: number) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const endTime = new Date();
        const timeSpent = endTime.getTime() - currentSession.startTime.getTime();

        set((state) => ({
          isTraining: false,
          currentSession: {
            ...currentSession,
            endTime,
            score,
            mistakes,
            hintsUsed
          },
          progress: {
            ...state.progress,
            puzzlesCompleted: state.progress.puzzlesCompleted + 1,
            totalTimeSpent: state.progress.totalTimeSpent + timeSpent,
            modulesCompleted: {
              ...state.progress.modulesCompleted,
              [currentSession.moduleId]: {
                completed: score >= 70, // 70% threshold for completion
                score: Math.max(score, state.progress.modulesCompleted[currentSession.moduleId]?.score || 0),
                timeSpent: state.progress.modulesCompleted[currentSession.moduleId]?.timeSpent + timeSpent || timeSpent,
                lastPlayed: endTime.toISOString()
              }
            }
          }
        }));

        // Update average rating
        const { progress } = get();
        const completedModules = Object.values(progress.modulesCompleted).filter(m => m.completed);
        if (completedModules.length > 0) {
          const averageScore = completedModules.reduce((sum, m) => sum + m.score, 0) / completedModules.length;
          set((state) => ({
            progress: {
              ...state.progress,
              averageRating: Math.round(averageScore * 10) / 10
            }
          }));
        }
      },

      updateProgress: (moduleId: string, score: number, timeSpent: number) => {
        set((state) => ({
          progress: {
            ...state.progress,
            modulesCompleted: {
              ...state.progress.modulesCompleted,
              [moduleId]: {
                ...state.progress.modulesCompleted[moduleId],
                score: Math.max(score, state.progress.modulesCompleted[moduleId]?.score || 0),
                timeSpent: (state.progress.modulesCompleted[moduleId]?.timeSpent || 0) + timeSpent,
                lastPlayed: new Date().toISOString()
              }
            }
          }
        }));
      },

      resetProgress: () => {
        set({
          progress: initialProgress,
          currentSession: null,
          isTraining: false
        });
      },

      getModuleProgress: (moduleId: string) => {
        const { progress } = get();
        return progress.modulesCompleted[moduleId] || null;
      },

      getOverallProgress: () => {
        const { progress } = get();
        const modules = Object.values(progress.modulesCompleted);
        const completedModules = modules.filter(m => m.completed);
        const totalModules = modules.length;
        const averageScore = completedModules.length > 0 
          ? completedModules.reduce((sum, m) => sum + m.score, 0) / completedModules.length 
          : 0;

        return {
          totalModules,
          completedModules: completedModules.length,
          averageScore: Math.round(averageScore * 10) / 10,
          totalTimeSpent: progress.totalTimeSpent
        };
      }
    }),
    {
      name: 'sudoku-training-storage',
      partialize: (state) => ({ 
        progress: state.progress 
      })
    }
  )
); 