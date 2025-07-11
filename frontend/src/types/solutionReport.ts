   export interface SolutionStep {
  id: string;
  row: number;
  col: number;
  value: number;
  technique: string;
  techniqueId: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  explanation: string;
  relatedCells: Array<{ row: number; col: number; value?: number }>;
  timestamp: number;
  gridState: number[][];
  eliminations?: Array<{ row: number; col: number; value: number }>;
  score: number;
}

export interface SolvingReport {
  id: string;
  puzzleId: string;
  userId?: string;
  timestamp: number;
  solvingTime: number; // in milliseconds
  difficulty: string;
  steps: SolutionStep[];
  hintsUsed: number;
  checkCount: number;
  isComplete: boolean;
  initialGrid: number[][];
  finalGrid: number[][];
  solution: number[][];
  techniquesUsed: string[];
  totalScore: number;
  badges: string[];
  motivationalMessage: string;
}

export interface TechniqueInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  hodokuUrl: string;
  fullDescription: string;
  example: string;
  color: string;
}

export interface SolutionPlayerState {
  currentStep: number;
  isPlaying: boolean;
  isFastForward: boolean;
  playbackSpeed: number;
  autoPlay: boolean;
  showExplanations: boolean;
  showTechniqueDetails: boolean;
}

export interface PDFReportOptions {
  includeTechniqueDetails: boolean;
  includeVisualDiagrams: boolean;
  includeStatistics: boolean;
  includeBadges: boolean;
  customTitle?: string;
  customSubtitle?: string;
}

export interface SpeechOptions {
  enabled: boolean;
  rate: number;
  pitch: number;
  voice?: SpeechSynthesisVoice;
  language: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: string;
  earned: boolean;
}

export interface MotivationalMessage {
  id: string;
  message: string;
  category: 'speed' | 'technique' | 'efficiency' | 'persistence';
  conditions: {
    solvingTime?: number;
    techniquesUsed?: string[];
    hintsUsed?: number;
    difficulty?: string;
  };
} 