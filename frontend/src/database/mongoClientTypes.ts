// Types for MongoDB operations - safe for client-side import
export interface UserStats {
  userId: string;
  totalPuzzlesSolved: number;
  averageSolveTime: number;
  fastestSolveTime: number;
  slowestSolveTime: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
    expert: number;
    master: number;
  };
  techniquesUsed: {
    [technique: string]: number;
  };
  lastUpdated: Date;
}

export interface SavedPuzzle {
  userId: string;
  puzzleId: string;
  puzzle: number[][];
  solution: number[][];
  difficulty: string;
  createdAt: Date;
  lastPlayed: Date;
  isCompleted: boolean;
  solveTime?: number;
}

export interface UserReport {
  userId: string;
  puzzleId: string;
  reportType: 'solution' | 'training' | 'speed_scanning' | 'technique_practice';
  reportData: {
    accuracy: number;
    timeSpent: number;
    mistakes: number;
    technique?: string;
    difficulty?: string;
    score?: number;
    [key: string]: any;
  };
  createdAt: Date;
}

export interface CompletedPuzzle {
  userId: string;
  puzzleId: string;
  puzzle: number[][];
  solution: number[][];
  difficulty: string;
  solveTime: number;
  mistakes: number;
  hintsUsed: number;
  technique: string;
  completedAt: Date;
}

export interface LeaderboardScore {
  userId: string;
  username: string;
  score: number;
  difficulty: string;
  technique: string;
  solveTime: number;
  timestamp: Date;
}

export interface LiveGame {
  userId: string;
  gameId: string;
  gameState: {
    puzzle: number[][];
    solution: number[][];
    difficulty: string;
    startTime: Date;
    currentTime: number;
    isActive: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RealTimeLeaderboard {
  userId: string;
  username: string;
  score: number;
  difficulty: string;
  technique: string;
  solveTime: number;
  rank?: number;
  timestamp: Date;
}

export interface GameSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  totalPuzzles: number;
  completedPuzzles: number;
  averageTime: number;
  isActive: boolean;
} 