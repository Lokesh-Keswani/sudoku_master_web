import { ChallengeType, DifficultyLevel } from '../store/challengeStore';

// Generate a Sudoku grid for speed scanning challenges
export const generateSpeedScanningGrid = (targetNumber: number, difficulty: DifficultyLevel): number[][] => {
  const grid = Array(9).fill(0).map(() => Array(9).fill(0));
  
  // Determine number of target numbers based on difficulty
  const numTargets = difficulty === 'easy' ? 8 : 
                    difficulty === 'medium' ? 12 : 16;
  
  // Place target numbers in random positions
  const positions: { row: number; col: number }[] = [];
  for (let i = 0; i < numTargets; i++) {
    let row: number, col: number;
    do {
      row = Math.floor(Math.random() * 9);
      col = Math.floor(Math.random() * 9);
    } while (positions.some(pos => pos.row === row && pos.col === col));
    
    positions.push({ row, col });
    grid[row][col] = targetNumber;
  }
  
  // Fill remaining cells with random numbers (1-9, excluding target)
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        let randomNum: number;
        do {
          randomNum = Math.floor(Math.random() * 9) + 1;
        } while (randomNum === targetNumber);
        grid[row][col] = randomNum;
      }
    }
  }
  
  return grid;
};

// Generate patterns for pattern recognition challenges
export const generatePattern = (difficulty: DifficultyLevel): { pattern: number[][]; description: string } => {
  const pattern = Array(9).fill(0).map(() => Array(9).fill(0));
  const patternTypes = [
    {
      name: 'Diagonal',
      generator: () => {
        for (let i = 0; i < 9; i++) {
          pattern[i][i] = 1;
        }
        return 'Find all cells on the main diagonal (top-left to bottom-right)';
      }
    },
    {
      name: 'Row',
      generator: () => {
        const row = Math.floor(Math.random() * 9);
        for (let j = 0; j < 9; j++) {
          pattern[row][j] = 1;
        }
        return `Find all cells in row ${row + 1}`;
      }
    },
    {
      name: 'Column',
      generator: () => {
        const col = Math.floor(Math.random() * 9);
        for (let i = 0; i < 9; i++) {
          pattern[i][col] = 1;
        }
        return `Find all cells in column ${col + 1}`;
      }
    },
    {
      name: 'Box',
      generator: () => {
        const boxRow = Math.floor(Math.random() * 3) * 3;
        const boxCol = Math.floor(Math.random() * 3) * 3;
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            pattern[boxRow + i][boxCol + j] = 1;
          }
        }
        const boxNumber = Math.floor(boxRow / 3) * 3 + Math.floor(boxCol / 3) + 1;
        return `Find all cells in 3x3 box ${boxNumber}`;
      }
    },
    {
      name: 'Cross',
      generator: () => {
        const centerRow = 4;
        const centerCol = 4;
        for (let i = 0; i < 9; i++) {
          pattern[centerRow][i] = 1; // Horizontal line
          pattern[i][centerCol] = 1; // Vertical line
        }
        return 'Find all cells in a cross pattern (center row and column)';
      }
    }
  ];
  
  // Select pattern type based on difficulty
  let selectedPattern;
  if (difficulty === 'easy') {
    selectedPattern = patternTypes[Math.floor(Math.random() * 3)]; // Diagonal, Row, Column
  } else if (difficulty === 'medium') {
    selectedPattern = patternTypes[Math.floor(Math.random() * 4)]; // Add Box
  } else {
    selectedPattern = patternTypes[Math.floor(Math.random() * patternTypes.length)]; // All patterns
  }
  
  const description = selectedPattern.generator();
  return { pattern, description };
};

// Generate a grid for mental mapping challenges
export const generateMentalMappingGrid = (difficulty: DifficultyLevel): number[][] => {
  const grid = Array(9).fill(0).map(() => Array(9).fill(0));
  
  // Determine number of cells to fill based on difficulty
  const numCells = difficulty === 'easy' ? 15 : 
                  difficulty === 'medium' ? 20 : 25;
  
  // Fill random cells with numbers
  const positions: { row: number; col: number; value: number }[] = [];
  for (let i = 0; i < numCells; i++) {
    let row: number, col: number;
    do {
      row = Math.floor(Math.random() * 9);
      col = Math.floor(Math.random() * 9);
    } while (positions.some(pos => pos.row === row && pos.col === col));
    
    const value = Math.floor(Math.random() * 9) + 1;
    positions.push({ row, col, value });
    grid[row][col] = value;
  }
  
  return grid;
};

// Calculate challenge score
export const calculateChallengeScore = (
  correctAnswers: number,
  mistakes: number,
  timeUsed: number,
  timeLimit: number
): { score: number; stars: number; accuracy: number } => {
  const totalAttempts = correctAnswers + mistakes;
  const accuracy = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;
  const timeEfficiency = Math.max(0, (timeLimit - timeUsed) / timeLimit);
  
  // Score calculation: 70% accuracy + 30% time efficiency
  const score = Math.round((accuracy * 0.7 + timeEfficiency * 100 * 0.3));
  
  // Star calculation
  let stars = 0;
  if (accuracy >= 90 && timeEfficiency >= 0.8) stars = 3;
  else if (accuracy >= 70 && timeEfficiency >= 0.6) stars = 2;
  else if (accuracy >= 50 && timeEfficiency >= 0.4) stars = 1;
  
  return { score, stars, accuracy };
};

// Get challenge configuration
export const getChallengeConfig = (type: ChallengeType, difficulty: DifficultyLevel) => {
  const configs = {
    'pattern-recognition': {
      easy: { 
        timeLimit: 90, 
        totalRounds: 3, 
        instructions: 'Find all cells that match the hidden pattern. Look for repeating numbers!' 
      },
      medium: { 
        timeLimit: 60, 
        totalRounds: 4, 
        instructions: 'Quickly identify the pattern and click matching cells!' 
      },
      hard: { 
        timeLimit: 45, 
        totalRounds: 5, 
        instructions: 'Advanced pattern recognition under intense time pressure!' 
      }
    },
    'speed-scanning': {
      easy: { 
        timeLimit: 120, 
        totalRounds: 3, 
        instructions: 'Find all cells containing the target number. Take your time!' 
      },
      medium: { 
        timeLimit: 90, 
        totalRounds: 4, 
        instructions: 'Scan quickly and accurately for the target number!' 
      },
      hard: { 
        timeLimit: 60, 
        totalRounds: 5, 
        instructions: 'Ultra-fast scanning with maximum accuracy required!' 
      }
    },
    'mental-mapping': {
      easy: { 
        timeLimit: 180, 
        totalRounds: 2, 
        instructions: 'Memorize the grid for 15 seconds, then recall number positions!' 
      },
      medium: { 
        timeLimit: 150, 
        totalRounds: 3, 
        instructions: 'Memorize for 10 seconds, then recall with precision!' 
      },
      hard: { 
        timeLimit: 120, 
        totalRounds: 4, 
        instructions: 'Quick memorization and perfect recall under pressure!' 
      }
    }
  };
  
  return configs[type][difficulty];
};

// Format time for display
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Get difficulty color classes
export const getDifficultyColor = (difficulty: DifficultyLevel) => {
  switch (difficulty) {
    case 'easy':
      return {
        bg: 'bg-blue-200',
        text: 'text-blue-800',
        border: 'border-blue-300'
      };
    case 'medium':
      return {
        bg: 'bg-green-200',
        text: 'text-green-800',
        border: 'border-green-300'
      };
    case 'hard':
      return {
        bg: 'bg-yellow-200',
        text: 'text-yellow-800',
        border: 'border-yellow-300'
      };
  }
};

// Validate cell selection for different challenge types
export const validateCellSelection = (
  row: number,
  col: number,
  challengeType: ChallengeType,
  challengeData: any
): { isCorrect: boolean; feedback: string } => {
  switch (challengeType) {
    case 'pattern-recognition':
      if (challengeData.pattern) {
        const isCorrect = challengeData.pattern[row][col] === 1;
        return {
          isCorrect,
          feedback: isCorrect ? 'Pattern found!' : 'Not part of the pattern!'
        };
      }
      break;
      
    case 'speed-scanning':
      if (challengeData.targetNumber && challengeData.grid) {
        const isCorrect = challengeData.grid[row][col] === challengeData.targetNumber;
        return {
          isCorrect,
          feedback: isCorrect ? 'Correct number!' : 'Wrong number!'
        };
      }
      break;
      
    case 'mental-mapping':
      if (challengeData.memorizedGrid) {
        const isCorrect = challengeData.memorizedGrid[row][col] > 0;
        return {
          isCorrect,
          feedback: isCorrect ? 'Correct recall!' : 'Wrong position!'
        };
      }
      break;
  }
  
  return { isCorrect: false, feedback: 'Invalid selection' };
}; 