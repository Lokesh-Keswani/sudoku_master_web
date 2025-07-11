// User data types - safe for client-side import
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: {
    theme: 'light' | 'dark';
    difficulty: string;
    notifications: boolean;
  };
}

export interface UserStats {
  uid: string;
  totalPuzzlesCompleted: number;
  totalTimeSpent: number;
  averageTime: number;
  bestTime: number;
  currentStreak: number;
  longestStreak: number;
  hintsUsed: number;
  techniquesMastered: string[];
  lastUpdated: Date;
}

export interface UserTrainingProgress {
  uid: string;
  moduleId: string;
  completed: boolean;
  score: number;
  timeSpent: number;
  lastPlayed: Date;
  attempts: number;
}

export interface UserSolveReport {
  uid: string;
  reportId: string;
  puzzleData: {
    initialGrid: number[][];
    solution: number[][];
    difficulty: string;
  };
  solveData: {
    timeTaken: number;
    hintsUsed: number;
    techniquesUsed: string[];
    steps: any[];
  };
  createdAt: Date;
} 