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
  insights?: string[]; // Optional insights for additional context
  performanceTrend?: 'improving' | 'declining' | 'stable';
  consistencyScore?: number;
  trainingFrequency?: number;
  techniqueMastery?: Record<string, { successRate: number; avgTime: number; totalAttempts: number }>;
}

export interface AICoachStore {
  // Performance Data
  completedDrills: DrillResult[];
  trainingHistory: TrainingHistory[];
  streakCount: number;
  lastTrainingDate: string | null;
  longestStreak: number;
  
  // Skill Ratings (0-100 scale)
  skillRatings: SkillRatings;
  
  // AI Analysis
  currentAnalysis: AIAnalysis | null;
  
  // Actions
  logDrillResult: (drillResult: Omit<DrillResult, 'id' | 'date'>) => void;
  updateSkillRating: (category: keyof SkillRatings, score: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  checkAndUpdateStreak: () => { current: number; longest: number };
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
      longestStreak: 0,
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
        const state = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to midnight

        let lastDate: Date | null = state.lastTrainingDate ? new Date(state.lastTrainingDate) : null;
        if (lastDate) lastDate.setHours(0, 0, 0, 0);

        let streak = state.streakCount || 0;
        let longest = state.longestStreak || 0;

        // If first training ever
        if (!lastDate) {
          streak = 1;
          longest = 1;
          set({ streakCount: streak, longestStreak: longest, lastTrainingDate: today.toISOString() });
          return { current: streak, longest };
        }

        // If trained today, do not increment streak
        if (lastDate.getTime() === today.getTime()) {
          set({ streakCount: streak, longestStreak: Math.max(longest, streak), lastTrainingDate: today.toISOString() });
          return { current: streak, longest: Math.max(longest, streak) };
        }

        // Calculate difference in days
        const msPerDay = 24 * 60 * 60 * 1000;
        const diffDays = Math.round((today.getTime() - lastDate.getTime()) / msPerDay);

        // If last training was yesterday, increment streak
        if (diffDays === 1) {
          streak += 1;
          longest = Math.max(longest, streak);
          set({ streakCount: streak, longestStreak: longest, lastTrainingDate: today.toISOString() });
          return { current: streak, longest };
        }

        // If last training was more than one day ago, reset streak
        streak = 1;
        longest = Math.max(longest, streak, state.longestStreak || 0);
        set({ streakCount: streak, longestStreak: longest, lastTrainingDate: today.toISOString() });
        return { current: streak, longest };
      },

      // Generate AI analysis
      generateAnalysis: () => {
        const { skillRatings, completedDrills, trainingHistory, streakCount, longestStreak } = get();
        
        // Find strongest and weakest areas
        const ratings = Object.entries(skillRatings);
        const sortedRatings = ratings.sort(([,a], [,b]) => b - a);
        
        const strongestArea = sortedRatings[0][0];
        const weakestArea = sortedRatings[sortedRatings.length - 1][0];
        
        // Calculate overall rating
        const overallRating = Math.round(
          ratings.reduce((sum, [, rating]) => sum + rating, 0) / ratings.length
        );

        // Advanced analysis components
        const suggestions: string[] = [];
        const recommendedDrills: string[] = [];
        const improvementAreas: string[] = [];
        const insights: string[] = [];

        // 1. PERFORMANCE TREND ANALYSIS
        const recentDrills = completedDrills.filter(drill => {
          const drillDate = new Date(drill.date);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return drillDate > weekAgo;
        });

        const monthAgoDrills = completedDrills.filter(drill => {
          const drillDate = new Date(drill.date);
          const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return drillDate > monthAgo && drillDate <= weekAgo;
        });

        // Calculate trend metrics
        const recentAvgSuccess = recentDrills.length > 0 
          ? recentDrills.reduce((sum, drill) => sum + drill.successRate, 0) / recentDrills.length 
          : 0;
        const monthAvgSuccess = monthAgoDrills.length > 0 
          ? monthAgoDrills.reduce((sum, drill) => sum + drill.successRate, 0) / monthAgoDrills.length 
          : 0;

        // 2. DIFFICULTY PROGRESSION ANALYSIS
        const difficultyDistribution = completedDrills.reduce((acc, drill) => {
          acc[drill.difficulty] = (acc[drill.difficulty] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const mostPlayedDifficulty = Object.entries(difficultyDistribution)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'easy';

        // 3. TECHNIQUE MASTERY ANALYSIS
        const techniquePerformance = completedDrills.reduce((acc, drill) => {
          if (drill.technique) {
            if (!acc[drill.technique]) {
              acc[drill.technique] = { total: 0, success: 0, avgTime: 0, times: [] };
            }
            acc[drill.technique].total += 1;
            acc[drill.technique].success += drill.successRate;
            acc[drill.technique].times.push(drill.timeTaken);
          }
          return acc;
        }, {} as Record<string, { total: number; success: number; avgTime: number; times: number[] }>);

        // Calculate average times for techniques
        Object.keys(techniquePerformance).forEach(technique => {
          const times = techniquePerformance[technique].times;
          techniquePerformance[technique].avgTime = times.length > 0 
            ? times.reduce((sum, time) => sum + time, 0) / times.length 
            : 0;
        });

        // 4. TIME-BASED INSIGHTS
        const totalTimeSpent = trainingHistory.reduce((sum, session) => sum + session.timeSpent, 0);
        const avgSessionTime = trainingHistory.length > 0 ? totalTimeSpent / trainingHistory.length : 0;

        // 5. STREAK AND CONSISTENCY ANALYSIS
        const consistencyScore = Math.min(100, (streakCount / Math.max(longestStreak, 1)) * 100);
        const trainingFrequency = recentDrills.length / 7; // drills per day

        // 6. PERSONALIZED RECOMMENDATIONS BASED ON WEAKEST AREA
        if (skillRatings[weakestArea as keyof SkillRatings] < 40) {
          suggestions.push(`Focus on practicing ${weakestArea.replace(/([A-Z])/g, ' $1').toLowerCase()} techniques to improve your weakest area`);
          improvementAreas.push(weakestArea);
          
          // Add specific drill recommendations based on skill area
          switch (weakestArea) {
            case 'intersections':
              recommendedDrills.push('Intersection Practice', 'Locked Candidates Training', 'Pointing Pairs');
              insights.push('Intersection techniques help you eliminate candidates more efficiently');
              break;
            case 'patternRecognition':
              recommendedDrills.push('Pattern Recognition Speed Training', 'Visual Pattern Drills', 'Sudoku Pattern Flashcard');
              insights.push('Pattern recognition is crucial for solving puzzles quickly');
              break;
            case 'speedScanning':
              recommendedDrills.push('Speed Scanning Challenge', 'Rapid Number Detection', 'Quick Scan Training');
              insights.push('Speed scanning improves your ability to quickly identify opportunities');
              break;
            case 'mentalMapping':
              recommendedDrills.push('Mental Mapping Exercise', 'Spatial Memory Training', 'Visual Memory Challenge');
              insights.push('Mental mapping helps you track candidates without writing them down');
              break;
            case 'singles':
              recommendedDrills.push('Hidden Single Practice', 'Naked Single Detection', 'Single Candidate Training');
              insights.push('Mastering singles is fundamental to advanced solving');
              break;
            case 'subsets':
              recommendedDrills.push('Naked Pair Training', 'Hidden Pair Practice', 'Triple and Quad Training');
              insights.push('Subset techniques are powerful for eliminating candidates');
              break;
            case 'fish':
              recommendedDrills.push('X-Wing Practice', 'Swordfish Detection', 'Jellyfish Training');
              insights.push('Fish techniques are advanced but very effective');
              break;
            case 'wings':
              recommendedDrills.push('XY-Wing Training', 'XYZ-Wing Practice', 'W-Wing Detection');
              insights.push('Wing techniques require careful candidate tracking');
              break;
          }
        }

        // 7. DIFFICULTY PROGRESSION RECOMMENDATIONS
        if (mostPlayedDifficulty === 'easy' && overallRating > 70) {
          suggestions.push('You\'re ready to challenge yourself with medium difficulty puzzles');
          recommendedDrills.push('Medium Difficulty Challenge', 'Progressive Difficulty Training');
        } else if (mostPlayedDifficulty === 'medium' && overallRating > 80) {
          suggestions.push('Consider trying hard puzzles to push your skills further');
          recommendedDrills.push('Hard Difficulty Challenge', 'Expert Level Training');
        }

        // 8. CONSISTENCY AND MOTIVATION INSIGHTS
        if (trainingFrequency < 0.5) {
          suggestions.push('Try to practice more regularly for better improvement');
          insights.push('Consistent practice is key to skill development');
        } else if (trainingFrequency > 2) {
          suggestions.push('Great consistency! Consider focusing on quality over quantity');
          insights.push('You\'re showing excellent dedication to improvement');
        }

        if (consistencyScore < 50) {
          suggestions.push('Work on maintaining your training streak for better results');
          insights.push('Consistent daily practice leads to faster improvement');
        }

        // 9. PERFORMANCE TREND INSIGHTS
        if (recentAvgSuccess > monthAvgSuccess + 10) {
          insights.push('You\'re showing significant improvement in recent sessions');
          suggestions.push('Your recent progress is excellent - keep up the momentum!');
        } else if (recentAvgSuccess < monthAvgSuccess - 10) {
          insights.push('Your recent performance has declined slightly');
          suggestions.push('Consider reviewing basic techniques or taking a short break');
        }

        // 10. TECHNIQUE-SPECIFIC INSIGHTS
        const bestTechnique = Object.entries(techniquePerformance)
          .sort(([,a], [,b]) => (b.success / b.total) - (a.success / a.total))[0];
        
        const worstTechnique = Object.entries(techniquePerformance)
          .sort(([,a], [,b]) => (a.success / a.total) - (b.success / b.total))[0];

        if (bestTechnique) {
          insights.push(`You excel at ${bestTechnique[0]} with ${Math.round(bestTechnique[1].success / bestTechnique[1].total)}% success rate`);
        }

        if (worstTechnique && worstTechnique[1].total >= 3) {
          insights.push(`Consider focusing on ${worstTechnique[0]} - your success rate is ${Math.round(worstTechnique[1].success / worstTechnique[1].total)}%`);
          improvementAreas.push(worstTechnique[0]);
        }

        // 11. TIME MANAGEMENT INSIGHTS
        if (avgSessionTime > 1800) { // 30 minutes
          insights.push('Your training sessions are quite long - consider shorter, more frequent sessions');
        } else if (avgSessionTime < 300) { // 5 minutes
          insights.push('Your sessions are very short - try longer sessions for deeper learning');
        }

        // 12. OVERALL ASSESSMENT AND ENCOURAGEMENT
        if (overallRating < 40) {
          suggestions.push('Focus on mastering basic techniques before moving to advanced ones');
          suggestions.push('Practice with easier puzzles to build confidence');
          insights.push('Everyone starts somewhere - consistent practice will lead to improvement');
        } else if (overallRating < 60) {
          suggestions.push('You\'re making good progress - focus on intermediate techniques');
          suggestions.push('Try combining multiple techniques in single puzzles');
          insights.push('You have a solid foundation - time to build on it');
        } else if (overallRating < 80) {
          suggestions.push('You\'re becoming quite skilled - challenge yourself with complex puzzles');
          suggestions.push('Try teaching others to reinforce your understanding');
          insights.push('You\'re approaching expert level - keep pushing your boundaries');
        } else {
          suggestions.push('You\'re ready for expert-level challenges!');
          suggestions.push('Consider creating your own puzzles or joining competitions');
          insights.push('You\'ve achieved a high skill level - focus on speed and efficiency');
        }

        // 13. PERSONALIZED MOTIVATION
        if (streakCount > 7) {
          insights.push(`Amazing! You\'ve maintained a ${streakCount}-day streak`);
        } else if (streakCount > 3) {
          insights.push(`Great consistency with your ${streakCount}-day streak`);
        }

        if (longestStreak > 14) {
          insights.push(`Your longest streak of ${longestStreak} days shows incredible dedication`);
        }

        // 14. SPECIFIC DRILL RECOMMENDATIONS BASED ON PERFORMANCE
        if (recentDrills.length === 0) {
          recommendedDrills.push('Quick Start Training', 'Basic Technique Review', 'Warm-up Exercises');
        } else if (recentDrills.length < 5) {
          recommendedDrills.push('Daily Practice Routine', 'Skill Building Exercises', 'Technique Mastery');
        } else {
          recommendedDrills.push('Advanced Challenge Mode', 'Speed Training', 'Complex Puzzle Solving');
        }

        // 15. FALLBACK RECOMMENDATIONS
        if (recommendedDrills.length === 0) {
          recommendedDrills.push('General Sudoku Practice', 'Mixed Technique Training', 'Progressive Difficulty');
        }

        if (suggestions.length === 0) {
          suggestions.push('Keep practicing regularly to see improvement');
          suggestions.push('Try different techniques to expand your solving repertoire');
        }

        if (insights.length === 0) {
          insights.push('Your training data shows steady progress');
          insights.push('Continue with your current approach');
        }

        // Determine performance trend
        let performanceTrend: 'improving' | 'declining' | 'stable' = 'stable';
        if (recentAvgSuccess > monthAvgSuccess + 10) {
          performanceTrend = 'improving';
        } else if (recentAvgSuccess < monthAvgSuccess - 10) {
          performanceTrend = 'declining';
        }

        // Prepare technique mastery data
        const techniqueMastery: Record<string, { successRate: number; avgTime: number; totalAttempts: number }> = {};
        Object.entries(techniquePerformance).forEach(([technique, data]) => {
          techniqueMastery[technique] = {
            successRate: Math.round(data.success / data.total),
            avgTime: Math.round(data.avgTime),
            totalAttempts: data.total
          };
        });

        const analysis: AIAnalysis = {
          strongestArea,
          weakestArea,
          suggestions: suggestions.slice(0, 5), // Limit to top 5 suggestions
          recommendedDrills: recommendedDrills.slice(0, 5), // Limit to top 5 drills
          overallRating,
          improvementAreas: improvementAreas.filter((item, index) => improvementAreas.indexOf(item) === index), // Remove duplicates
          insights: insights.slice(0, 5), // Limit to top 5 insights
          performanceTrend,
          consistencyScore: Math.round(consistencyScore),
          trainingFrequency: Math.round(trainingFrequency * 100) / 100, // Round to 2 decimal places
          techniqueMastery: Object.keys(techniqueMastery).length > 0 ? techniqueMastery : undefined,
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