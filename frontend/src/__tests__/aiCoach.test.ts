import { renderHook, act } from '@testing-library/react';
import { useAICoachStore } from '../store/aiCoachStore';

// Mock localStorage for tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AI Coach Store', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useAICoachStore());
      
      expect(result.current.completedDrills).toEqual([]);
      expect(result.current.trainingHistory).toEqual([]);
      expect(result.current.streakCount).toBe(0);
      expect(result.current.lastTrainingDate).toBeNull();
      expect(result.current.currentAnalysis).toBeNull();
      
      // Check initial skill ratings
      const expectedRatings = {
        intersections: 50,
        patternRecognition: 50,
        speedScanning: 50,
        mentalMapping: 50,
        singles: 50,
        subsets: 50,
        fish: 50,
        wings: 50,
      };
      expect(result.current.skillRatings).toEqual(expectedRatings);
    });
  });

  describe('logDrillResult', () => {
    it('should log drill result and update training history', () => {
      const { result } = renderHook(() => useAICoachStore());
      
      const drillResult = {
        difficulty: 'medium',
        category: 'patternRecognition',
        successRate: 75,
        timeTaken: 120000, // 2 minutes
        mistakes: 2,
        hintsUsed: 1,
        technique: 'hidden-pairs',
        module: 'techniques',
      };

      act(() => {
        result.current.logDrillResult(drillResult);
      });

      expect(result.current.completedDrills).toHaveLength(1);
      expect(result.current.trainingHistory).toHaveLength(1);
      
      const loggedDrill = result.current.completedDrills[0];
      expect(loggedDrill.difficulty).toBe('medium');
      expect(loggedDrill.category).toBe('patternRecognition');
      expect(loggedDrill.successRate).toBe(75);
      expect(loggedDrill.id).toMatch(/^drill_\d+_[a-z0-9]+$/);
      expect(loggedDrill.date).toBeDefined();
    });

    it('should update skill ratings based on performance', () => {
      const { result } = renderHook(() => useAICoachStore());
      
      const initialRating = result.current.skillRatings.patternRecognition;
      
      act(() => {
        result.current.logDrillResult({
          difficulty: 'medium',
          category: 'patternRecognition',
          successRate: 80,
          timeTaken: 120000,
          mistakes: 1,
          hintsUsed: 0,
          module: 'techniques',
        });
      });

      // Rating should increase (70% old + 30% new = weighted average)
      const newRating = result.current.skillRatings.patternRecognition;
      expect(newRating).toBeGreaterThan(initialRating);
    });

    it('should increment streak on first drill', () => {
      const { result } = renderHook(() => useAICoachStore());
      
      expect(result.current.streakCount).toBe(0);
      
      act(() => {
        result.current.logDrillResult({
          difficulty: 'easy',
          category: 'singles',
          successRate: 90,
          timeTaken: 60000,
          mistakes: 0,
          hintsUsed: 0,
          module: 'techniques',
        });
      });

      expect(result.current.streakCount).toBe(1);
      expect(result.current.lastTrainingDate).toBeDefined();
    });
  });

  describe('Streak Management', () => {
    it('should increment streak on consecutive days', () => {
      const { result } = renderHook(() => useAICoachStore());
      
      // Set up initial state with yesterday's training
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      act(() => {
        result.current.lastTrainingDate = yesterday.toISOString();
        result.current.streakCount = 3;
      });

      act(() => {
        result.current.logDrillResult({
          difficulty: 'medium',
          category: 'speedScanning',
          successRate: 70,
          timeTaken: 90000,
          mistakes: 2,
          hintsUsed: 1,
          module: 'speed-scan',
        });
      });

      expect(result.current.streakCount).toBe(4);
    });

    it('should reset streak when more than one day has passed', () => {
      const { result } = renderHook(() => useAICoachStore());
      
      // Set up initial state with 2 days ago training
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      act(() => {
        result.current.lastTrainingDate = twoDaysAgo.toISOString();
        result.current.streakCount = 5;
      });

      act(() => {
        result.current.logDrillResult({
          difficulty: 'hard',
          category: 'mentalMapping',
          successRate: 60,
          timeTaken: 180000,
          mistakes: 3,
          hintsUsed: 2,
          module: 'mental-mapping',
        });
      });

      expect(result.current.streakCount).toBe(1); // Reset to 1
    });

    it('should not change streak on same day', () => {
      const { result } = renderHook(() => useAICoachStore());
      
      // Set up initial state with today's training
      const today = new Date();
      
      act(() => {
        result.current.lastTrainingDate = today.toISOString();
        result.current.streakCount = 2;
      });

      act(() => {
        result.current.logDrillResult({
          difficulty: 'easy',
          category: 'intersections',
          successRate: 85,
          timeTaken: 45000,
          mistakes: 1,
          hintsUsed: 0,
          module: 'techniques',
        });
      });

      expect(result.current.streakCount).toBe(2); // Should remain the same
    });
  });

  describe('Skill Rating Updates', () => {
    it('should update skill ratings with weighted average', () => {
      const { result } = renderHook(() => useAICoachStore());
      
      const initialRating = result.current.skillRatings.fish;
      
      act(() => {
        result.current.updateSkillRating('fish', 80);
      });

      const newRating = result.current.skillRatings.fish;
      // Should be weighted average: (50 * 0.7) + (80 * 0.3) = 35 + 24 = 59
      expect(newRating).toBe(59);
    });

    it('should cap ratings at 100', () => {
      const { result } = renderHook(() => useAICoachStore());
      
      act(() => {
        result.current.updateSkillRating('wings', 100);
      });

      expect(result.current.skillRatings.wings).toBeLessThanOrEqual(100);
    });

    it('should floor ratings at 0', () => {
      const { result } = renderHook(() => useAICoachStore());
      
      act(() => {
        result.current.updateSkillRating('subsets', -10);
      });

      expect(result.current.skillRatings.subsets).toBeGreaterThanOrEqual(0);
    });
  });

  describe('AI Analysis Generation', () => {
    it('should generate analysis with strongest and weakest areas', () => {
      const { result } = renderHook(() => useAICoachStore());
      
      // Set up varied skill ratings
      act(() => {
        result.current.skillRatings = {
          intersections: 90,
          patternRecognition: 30,
          speedScanning: 70,
          mentalMapping: 60,
          singles: 85,
          subsets: 45,
          fish: 20,
          wings: 75,
        };
      });

      act(() => {
        result.current.generateAnalysis();
      });

      expect(result.current.currentAnalysis).toBeDefined();
      expect(result.current.currentAnalysis?.strongestArea).toBe('intersections');
      expect(result.current.currentAnalysis?.weakestArea).toBe('fish');
      expect(result.current.currentAnalysis?.overallRating).toBe(59); // Average of all ratings
    });

    it('should generate suggestions based on performance', () => {
      const { result } = renderHook(() => useAICoachStore());
      
      // Set up weak performance
      act(() => {
        result.current.skillRatings = {
          intersections: 25,
          patternRecognition: 20,
          speedScanning: 30,
          mentalMapping: 15,
          singles: 35,
          subsets: 25,
          fish: 10,
          wings: 20,
        };
      });

      act(() => {
        result.current.generateAnalysis();
      });

      const analysis = result.current.currentAnalysis;
      expect(analysis?.suggestions.length).toBeGreaterThan(0);
      expect(analysis?.recommendedDrills.length).toBeGreaterThan(0);
      expect(analysis?.improvementAreas.length).toBeGreaterThan(0);
    });

    it('should handle empty drill history gracefully', () => {
      const { result } = renderHook(() => useAICoachStore());
      
      act(() => {
        result.current.generateAnalysis();
      });

      expect(result.current.currentAnalysis).toBeDefined();
      expect(result.current.currentAnalysis?.suggestions).toContain('Keep practicing regularly to see improvement');
    });
  });

  describe('Performance Statistics', () => {
    it('should calculate performance stats correctly', () => {
      const { result } = renderHook(() => useAICoachStore());
      
      // Add some drill results
      act(() => {
        result.current.logDrillResult({
          difficulty: 'easy',
          category: 'singles',
          successRate: 90,
          timeTaken: 60000,
          mistakes: 0,
          hintsUsed: 0,
          module: 'techniques',
        });
        
        result.current.logDrillResult({
          difficulty: 'medium',
          category: 'patternRecognition',
          successRate: 70,
          timeTaken: 120000,
          mistakes: 2,
          hintsUsed: 1,
          module: 'techniques',
        });
      });

      const stats = result.current.getPerformanceStats();
      
      expect(stats.totalDrills).toBe(2);
      expect(stats.averageSuccessRate).toBe(80); // (90 + 70) / 2
      expect(stats.totalTimeSpent).toBe(180000); // 60 + 120 seconds
      expect(stats.mostPlayedCategory).toBe('singles'); // First one logged
    });

    it('should handle empty history', () => {
      const { result } = renderHook(() => useAICoachStore());
      
      const stats = result.current.getPerformanceStats();
      
      expect(stats.totalDrills).toBe(0);
      expect(stats.averageSuccessRate).toBe(0);
      expect(stats.totalTimeSpent).toBe(0);
      expect(stats.mostPlayedCategory).toBe('None');
    });
  });

  describe('Streak Status', () => {
    it('should return current and longest streak', () => {
      const { result } = renderHook(() => useAICoachStore());
      
      act(() => {
        result.current.streakCount = 7;
      });

      const streakStatus = result.current.getStreakStatus();
      
      expect(streakStatus.current).toBe(7);
      expect(streakStatus.longest).toBe(7); // For now, same as current
    });
  });

  describe('Data Persistence', () => {
    it('should persist data to localStorage', () => {
      const { result } = renderHook(() => useAICoachStore());
      
      act(() => {
        result.current.logDrillResult({
          difficulty: 'hard',
          category: 'fish',
          successRate: 65,
          timeTaken: 180000,
          mistakes: 3,
          hintsUsed: 2,
          module: 'techniques',
        });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sudoku-ai-coach-storage',
        expect.any(String)
      );
    });
  });

  describe('Clear History', () => {
    it('should reset all data when clearing history', () => {
      const { result } = renderHook(() => useAICoachStore());
      
      // Add some data first
      act(() => {
        result.current.logDrillResult({
          difficulty: 'medium',
          category: 'speedScanning',
          successRate: 75,
          timeTaken: 90000,
          mistakes: 1,
          hintsUsed: 0,
          module: 'speed-scan',
        });
      });

      expect(result.current.completedDrills.length).toBeGreaterThan(0);
      expect(result.current.streakCount).toBeGreaterThan(0);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.completedDrills).toEqual([]);
      expect(result.current.trainingHistory).toEqual([]);
      expect(result.current.streakCount).toBe(0);
      expect(result.current.lastTrainingDate).toBeNull();
      expect(result.current.currentAnalysis).toBeNull();
      
      // Check if skill ratings are reset to initial values
      const expectedRatings = {
        intersections: 50,
        patternRecognition: 50,
        speedScanning: 50,
        mentalMapping: 50,
        singles: 50,
        subsets: 50,
        fish: 50,
        wings: 50,
      };
      expect(result.current.skillRatings).toEqual(expectedRatings);
    });
  });
}); 