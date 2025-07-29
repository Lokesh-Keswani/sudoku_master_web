import { create } from 'zustand';
import { techniques, Technique } from '../data/techniques';

// Types
export type SpeedScannerQuestion = {
  id: string;
  puzzle: number[][];
  targetCell: { row: number; col: number };
  correctTechnique: string;
  correctValue: number;
  explanation: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
};

export type SpeedScannerState = {
  // Current question state
  currentQuestion: SpeedScannerQuestion | null;
  selectedTechnique: string | null;
  selectedValue: number | null;
  feedback: 'correct' | 'incorrect' | null;
  showExplanation: boolean;
  
  // Progress tracking
  questionIndex: number;
  totalQuestions: number;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  responseTimes: number[];
  
  // Game state
  loading: boolean;
  gameStarted: boolean;
  gameCompleted: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  
  // Actions
  startGame: (difficulty: 'Easy' | 'Medium' | 'Hard', totalQuestions?: number) => void;
  loadNextQuestion: () => void;
  selectTechnique: (technique: string) => void;
  selectValue: (value: number) => void;
  submitAnswer: () => void;
  toggleExplanation: () => void;
  resetGame: () => void;
};

// Sample questions data
const sampleQuestions: SpeedScannerQuestion[] = [
  {
    id: 'q1',
    puzzle: [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9]
    ],
    targetCell: { row: 0, col: 2 },
    correctTechnique: 'Hidden Single',
    correctValue: 4,
    explanation: [
      'In row 0, the number 4 can only be placed in cell (0,2).',
      'All other cells in row 0 already contain numbers or cannot contain 4 due to column/box constraints.'
    ],
    difficulty: 'Easy'
  },
  {
    id: 'q2',
    puzzle: [
      [0,0,0,2,6,0,7,0,1],
      [6,8,0,0,7,0,0,9,0],
      [1,9,0,0,0,4,5,0,0],
      [8,2,0,1,0,0,0,4,0],
      [0,0,4,6,0,2,9,0,0],
      [0,5,0,0,0,3,0,2,8],
      [0,0,9,3,0,0,0,7,4],
      [0,4,0,0,5,0,0,3,6],
      [7,0,3,0,1,8,0,0,0]
    ],
    targetCell: { row: 0, col: 0 },
    correctTechnique: 'Naked Single',
    correctValue: 4,
    explanation: [
      'Cell (0,0) can only contain the number 4.',
      'All other numbers 1-9 are either already in the row, column, or 3x3 box.'
    ],
    difficulty: 'Medium'
  },
  {
    id: 'q3',
    puzzle: [
      [0,0,0,6,0,0,4,0,0],
      [7,0,0,0,0,3,6,0,0],
      [0,0,0,0,9,1,0,8,0],
      [0,0,0,0,0,0,0,0,0],
      [0,5,0,1,8,0,0,0,3],
      [0,0,0,3,0,6,0,4,5],
      [0,4,0,2,0,0,0,6,0],
      [9,0,3,0,0,0,0,0,0],
      [0,2,0,0,0,0,1,0,0]
    ],
    targetCell: { row: 3, col: 0 },
    correctTechnique: 'Full House',
    correctValue: 8,
    explanation: [
      'Row 3 has only one empty cell remaining: (3,0).',
      'The missing number in row 3 is 8, so cell (3,0) must contain 8.'
    ],
    difficulty: 'Hard'
  }
];

export const useSpeedScannerStore = create<SpeedScannerState>((set, get) => ({
  // Initial state
  currentQuestion: null,
  selectedTechnique: null,
  selectedValue: null,
  feedback: null,
  showExplanation: false,
  questionIndex: 0,
  totalQuestions: 10,
  score: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  responseTimes: [],
  loading: false,
  gameStarted: false,
  gameCompleted: false,
  difficulty: 'Easy',

  startGame: (difficulty, totalQuestions = 10) => {
    set({
      difficulty,
      totalQuestions,
      questionIndex: 0,
      score: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      responseTimes: [],
      gameStarted: true,
      gameCompleted: false,
      loading: true
    });

    // Load first question
    setTimeout(() => {
      get().loadNextQuestion();
    }, 500);
  },

  loadNextQuestion: () => {
    const { questionIndex, totalQuestions, difficulty } = get();
    
    if (questionIndex >= totalQuestions) {
      set({ gameCompleted: true, loading: false });
      return;
    }

    // For now, cycle through sample questions
    const questionIndexInSample = questionIndex % sampleQuestions.length;
    const question = sampleQuestions[questionIndexInSample];
    
    // Adjust difficulty if needed
    const adjustedQuestion = {
      ...question,
      difficulty: difficulty as 'Easy' | 'Medium' | 'Hard'
    };

    set({
      currentQuestion: adjustedQuestion,
      selectedTechnique: null,
      selectedValue: null,
      feedback: null,
      showExplanation: false,
      questionIndex: questionIndex + 1,
      loading: false
    });
  },

  selectTechnique: (technique: string) => {
    set({ selectedTechnique: technique });
  },

  selectValue: (value: number) => {
    set({ selectedValue: value });
  },

  submitAnswer: () => {
    const { currentQuestion, selectedTechnique, selectedValue, questionIndex, correctAnswers, incorrectAnswers, responseTimes } = get();
    
    if (!currentQuestion || !selectedTechnique || selectedValue === null) return;

    const isCorrect = selectedTechnique === currentQuestion.correctTechnique && 
                     selectedValue === currentQuestion.correctValue;

    const newCorrectAnswers = isCorrect ? correctAnswers + 1 : correctAnswers;
    const newIncorrectAnswers = isCorrect ? incorrectAnswers : incorrectAnswers + 1;
    const newScore = Math.round((newCorrectAnswers / questionIndex) * 100);

    set({
      feedback: isCorrect ? 'correct' : 'incorrect',
      correctAnswers: newCorrectAnswers,
      incorrectAnswers: newIncorrectAnswers,
      score: newScore,
      showExplanation: true
    });
  },

  toggleExplanation: () => {
    const { showExplanation } = get();
    set({ showExplanation: !showExplanation });
  },

  resetGame: () => {
    set({
      currentQuestion: null,
      selectedTechnique: null,
      selectedValue: null,
      feedback: null,
      showExplanation: false,
      questionIndex: 0,
      totalQuestions: 10,
      score: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      responseTimes: [],
      loading: false,
      gameStarted: false,
      gameCompleted: false,
      difficulty: 'Easy'
    });
  }
}));

// Helper function to get random technique options
export const getRandomTechniqueOptions = (correctTechnique: string, count: number = 4): string[] => {
  const allTechniques = techniques.map(t => t.name);
  const otherTechniques = allTechniques.filter(t => t !== correctTechnique);
  
  // Shuffle and take random techniques
  const shuffled = otherTechniques.sort(() => 0.5 - Math.random());
  const randomTechniques = shuffled.slice(0, count - 1);
  
  // Add correct technique and shuffle again
  const options = [...randomTechniques, correctTechnique];
  return options.sort(() => 0.5 - Math.random());
}; 