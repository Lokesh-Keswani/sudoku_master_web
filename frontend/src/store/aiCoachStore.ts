import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface DrillResult {
  id: string;
  date: string;
  difficulty: string;
  category: string;
  successRate: number;
  timeTaken: number;
  mistakes: number;
  hintsUsed: number;
  technique?: string;
  module: string;
}

export interface TrainingHistory {
  moduleId: string;
  timestamp: string;
  score: number;
  timeSpent: number;
  mistakes: number;
  hintsUsed: number;
  difficulty: string;
  technique?: string;
}

export interface SkillRatings {
  intersections: number;
  patternRecognition: number;
  speedScanning: number;
  mentalMapping: number;
  singles: number;
  subsets: number;
  fish: number;
  wings: number;
}

export interface AIAnalysis {
  strongestArea: string;
  weakestArea: string;
  suggestions: string[];
  recommendedDrills: string[];
  overallRating: number;
  improvementAreas: string[];
}

export interface AICoachStore {
  // Performance Data
  completedDrills: DrillResult[];
  trainingHistory: TrainingHistory[];
  streakCount: number;
  lastTrainingDate: string | null;
  
  // Skill Ratings (0-100 scale)
  skillRatings: SkillRatings;
  
  // AI Analysis
  currentAnalysis: AIAnalysis | null;
  
  // Actions
  logDrillResult: (drillResult: Omit<DrillResult, 'id' | 'date'>) => void;
  updateSkillRating: (category: keyof SkillRatings, score: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  generateAnalysis: () => void;
  clearHistory: () => void;
  getStreakStatus: () => { current: number; longest: number };
  getPerformanceStats: () => {
    totalDrills: number;
    averageSuccessRate: number;
    totalTimeSpent: number;
    mostPlayedCategory: string;
    improvementTrend: 'improving' | 'declining' | 'stable';
  };
}

// Initial skill ratings
const initialSkillRatings: SkillRatings = {
  intersections: 50,
  patternRecognition: 50,
  speedScanning: 50,
  mentalMapping: 50,
  singles: 50,
  subsets: 50,
  fish: 50,
  wings: 50,
};

// Initial AI analysis
const initialAnalysis: AIAnalysis = {
  strongestArea: 'singles',
  weakestArea: 'fish',
  suggestions: [
    'Focus on practicing Fish techniques to improve your weakest area',
    'Your Singles skills are excellent - try more advanced techniques',
    'Consider spending more time on Pattern Recognition exercises'
  ],
  recommendedDrills: [
    'X-Wing Practice',
    'Swordfish Detection',
    'Pattern Recognition Speed Training'
  ],
  overallRating: 50,
  improvementAreas: ['fish', 'wings']
};

export const useAICoachStore = create<AICoachStore>()(
  persist(
    (set, get) => ({
      // Initial state
      completedDrills: [],
      trainingHistory: [],
      streakCount: 0,
      lastTrainingDate: null,
      skillRatings: initialSkillRatings,
      currentAnalysis: null,

      // Log drill result
      logDrillResult: (drillResult) => {
        const newDrill: DrillResult = {
          ...drillResult,
          id: `drill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: new Date().toISOString(),
        };

        const newHistory: TrainingHistory = {
          moduleId: drillResult.module,
          timestamp: new Date().toISOString(),
          score: drillResult.successRate,
          timeSpent: drillResult.timeTaken,
          mistakes: drillResult.mistakes,
          hintsUsed: drillResult.hintsUsed,
          difficulty: drillResult.difficulty,
          technique: drillResult.technique,
        };

        set((state) => ({
          completedDrills: [...state.completedDrills, newDrill],
          trainingHistory: [...state.trainingHistory, newHistory],
        }));

        // Update skill ratings based on performance
        get().updateSkillRating(drillResult.category as keyof SkillRatings, drillResult.successRate);
        
        // Check and update streak
        get().checkAndUpdateStreak();
        
        // Generate new analysis
        get().generateAnalysis();
      },

      // Update skill rating
      updateSkillRating: (category, score) => {
        set((state) => ({
          skillRatings: {
            ...state.skillRatings,
            [category]: Math.min(100, Math.max(0, 
              Math.round((state.skillRatings[category] * 0.7) + (score * 0.3))
            )),
          },
        }));
      },

      // Increment streak
      incrementStreak: () => {
        set((state) => ({
          streakCount: state.streakCount + 1,
          lastTrainingDate: new Date().toISOString(),
        }));
      },

      // Reset streak
      resetStreak: () => {
        set({
          streakCount: 0,
          lastTrainingDate: null,
        });
      },

      // Check and update streak
      checkAndUpdateStreak: () => {
        const { lastTrainingDate, streakCount } = get();
        
        if (!lastTrainingDate) {
          get().incrementStreak();
          return;
        }

        const lastDate = new Date(lastTrainingDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day
          get().incrementStreak();
        } else if (diffDays > 1) {
          // Streak broken
          get().resetStreak();
          get().incrementStreak();
        }
        // If diffDays === 0, same day, don't update
      },

      // Generate AI analysis
      generateAnalysis: () => {
        const { skillRatings, completedDrills } = get();
        
        // Find strongest and weakest areas
        const ratings = Object.entries(skillRatings);
        const sortedRatings = ratings.sort(([,a], [,b]) => b - a);
        
        const strongestArea = sortedRatings[0][0];
        const weakestArea = sortedRatings[sortedRatings.length - 1][0];
        
        // Calculate overall rating
        const overallRating = Math.round(
          ratings.reduce((sum, [, rating]) => sum + rating, 0) / ratings.length
        );

        // Generate suggestions based on performance
        const suggestions: string[] = [];
        const recommendedDrills: string[] = [];
        const improvementAreas: string[] = [];

        // Add suggestions based on weakest area
        if (skillRatings[weakestArea as keyof SkillRatings] < 40) {
          suggestions.push(`Focus on practicing ${weakestArea.replace(/([A-Z])/g, ' $1').toLowerCase()} techniques to improve your weakest area`);
          improvementAreas.push(weakestArea);
          
          // Add specific drill recommendations
          switch (weakestArea) {
            case 'intersections':
              recommendedDrills.push('Intersection Practice', 'Locked Candidates Training');
              break;
            case 'patternRecognition':
              recommendedDrills.push('Pattern Recognition Speed Training', 'Visual Pattern Drills');
              break;
            case 'speedScanning':
              recommendedDrills.push('Speed Scanning Challenge', 'Rapid Number Detection');
              break;
            case 'mentalMapping':
              recommendedDrills.push('Mental Mapping Exercise', 'Spatial Memory Training');
              break;
            case 'singles':
              recommendedDrills.push('Hidden Single Practice', 'Naked Single Detection');
              break;
            case 'subsets':
              recommendedDrills.push('Naked Pair Training', 'Hidden Pair Practice');
              break;
            case 'fish':
              recommendedDrills.push('X-Wing Practice', 'Swordfish Detection');
              break;
            case 'wings':
              recommendedDrills.push('XY-Wing Training', 'XYZ-Wing Practice');
              break;
          }
        }

        // Add encouragement for strong areas
        if (skillRatings[strongestArea as keyof SkillRatings] > 80) {
          suggestions.push(`Your ${strongestArea.replace(/([A-Z])/g, ' $1').toLowerCase()} skills are excellent - try more advanced techniques`);
        }

        // Add general improvement suggestions
        if (overallRating < 60) {
          suggestions.push('Consider spending more time on Pattern Recognition exercises');
          suggestions.push('Try practicing with easier puzzles to build confidence');
        } else if (overallRating > 80) {
          suggestions.push('You\'re ready for expert-level challenges!');
          suggestions.push('Try combining multiple techniques in complex puzzles');
        }

        // Add time-based suggestions
        const recentDrills = completedDrills.filter(drill => {
          const drillDate = new Date(drill.date);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return drillDate > weekAgo;
        });

        if (recentDrills.length < 3) {
          suggestions.push('Try to practice more regularly for better improvement');
        }

        const analysis: AIAnalysis = {
          strongestArea,
          weakestArea,
          suggestions: suggestions.length > 0 ? suggestions : ['Keep practicing regularly to see improvement'],
          recommendedDrills: recommendedDrills.length > 0 ? recommendedDrills : ['General Sudoku Practice'],
          overallRating,
          improvementAreas,
        };

        set({ currentAnalysis: analysis });
      },

      // Clear history
      clearHistory: () => {
        set({
          completedDrills: [],
          trainingHistory: [],
          streakCount: 0,
          lastTrainingDate: null,
          skillRatings: initialSkillRatings,
          currentAnalysis: null,
        });
      },

      // Get streak status
      getStreakStatus: () => {
        const { streakCount } = get();
        // For now, return current streak as longest (could be enhanced with persistent longest streak)
        return {
          current: streakCount,
          longest: streakCount,
        };
      },

      // Get performance stats
      getPerformanceStats: () => {
        const { completedDrills, trainingHistory } = get();
        
        const totalDrills = completedDrills.length;
        const averageSuccessRate = totalDrills > 0 
          ? Math.round(completedDrills.reduce((sum, drill) => sum + drill.successRate, 0) / totalDrills)
          : 0;
        
        const totalTimeSpent = trainingHistory.reduce((sum, session) => sum + session.timeSpent, 0);
        
        // Find most played category
        const categoryCounts = completedDrills.reduce((acc, drill) => {
          acc[drill.category] = (acc[drill.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const mostPlayedCategory = Object.entries(categoryCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

        // Determine improvement trend (simplified)
        const recentDrills = completedDrills.slice(-5);
        const olderDrills = completedDrills.slice(-10, -5);
        
        let improvementTrend: 'improving' | 'declining' | 'stable' = 'stable';
        if (recentDrills.length >= 3 && olderDrills.length >= 3) {
          const recentAvg = recentDrills.reduce((sum, drill) => sum + drill.successRate, 0) / recentDrills.length;
          const olderAvg = olderDrills.reduce((sum, drill) => sum + drill.successRate, 0) / olderDrills.length;
          
          if (recentAvg > olderAvg + 5) improvementTrend = 'improving';
          else if (recentAvg < olderAvg - 5) improvementTrend = 'declining';
        }

        return {
          totalDrills,
          averageSuccessRate,
          totalTimeSpent,
          mostPlayedCategory,
          improvementTrend,
        };
      },
    }),
    {
      name: 'sudoku-ai-coach-storage',
      partialize: (state) => ({
        completedDrills: state.completedDrills,
        trainingHistory: state.trainingHistory,
        streakCount: state.streakCount,
        lastTrainingDate: state.lastTrainingDate,
        skillRatings: state.skillRatings,
        currentAnalysis: state.currentAnalysis,
      }),
    }
  )
); 