export interface Pattern {
  id: string;
  technique: string;
  image: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  hints: string[];
}

export const patterns: Pattern[] = [
  // Easy Patterns
  {
    id: 'naked_single_001',
    technique: 'Naked Single',
    image: '/patterns/placeholder.svg',
    question: 'Which technique is this?',
    options: ['Naked Single', 'Hidden Pair', 'X-Wing', 'XY-Wing'],
    correctAnswer: 'Naked Single',
    explanation: 'A Naked Single occurs when a cell has only one possible candidate remaining. In this pattern, the highlighted cell can only contain the number 4.',
    difficulty: 'Easy',
    category: 'Singles',
    hints: [
      'Look for cells that have only one possible number',
      'Check each empty cell and count its possible candidates',
      'If a cell has only one candidate, that must be the solution'
    ]
  },
  {
    id: 'hidden_single_001',
    technique: 'Hidden Single',
    image: '/patterns/placeholder.svg',
    question: 'Which technique is this?',
    options: ['Hidden Single', 'Naked Pair', 'X-Wing', 'Locked Candidates'],
    correctAnswer: 'Hidden Single',
    explanation: 'A Hidden Single occurs when a number can only be placed in one cell within a row, column, or box. In this pattern, the number 3 can only go in the highlighted cell.',
    difficulty: 'Easy',
    category: 'Singles',
    hints: [
      'Look for numbers that appear only once in a row, column, or box',
      'Check if that number can only go in one cell',
      'If a number can only go in one cell, that cell must contain that number'
    ]
  },
  {
    id: 'naked_pair_001',
    technique: 'Naked Pair',
    image: '/patterns/placeholder.svg',
    question: 'Which technique is this?',
    options: ['Naked Pair', 'Hidden Single', 'X-Wing', 'XY-Wing'],
    correctAnswer: 'Naked Pair',
    explanation: 'A Naked Pair occurs when two cells in a unit contain exactly the same two candidates. These candidates can be eliminated from other cells in that unit.',
    difficulty: 'Easy',
    category: 'Subsets',
    hints: [
      'Look for two cells that contain exactly the same two candidates',
      'Check if these cells are in the same row, column, or box',
      'Those candidates can be eliminated from other cells in that unit'
    ]
  },

  // Medium Patterns
  {
    id: 'x_wing_001',
    technique: 'X-Wing',
    image: '/patterns/placeholder.svg',
    question: 'Which technique is this?',
    options: ['Swordfish', 'X-Wing', 'Naked Pair', 'Hidden Single'],
    correctAnswer: 'X-Wing',
    explanation: 'An X-Wing is a pattern where a candidate appears exactly twice in two rows, and these appearances are in the same two columns, forming a rectangle.',
    difficulty: 'Medium',
    category: 'Fish',
    hints: [
      'Find a candidate that appears exactly twice in two rows',
      'Check if these appearances are in the same two columns',
      'If they form a rectangle, you can eliminate that candidate from other cells in those columns'
    ]
  },
  {
    id: 'locked_candidates_001',
    technique: 'Locked Candidates',
    image: '/patterns/placeholder.svg',
    question: 'Which technique is this?',
    options: ['Locked Candidates', 'X-Wing', 'Naked Triple', 'Hidden Pair'],
    correctAnswer: 'Locked Candidates',
    explanation: 'Locked Candidates occur when candidates in a box are restricted to one row or column, allowing eliminations in other boxes.',
    difficulty: 'Medium',
    category: 'Locked Candidates',
    hints: [
      'Look for candidates in a box that are restricted to one row or column',
      'Check if those candidates can be eliminated from other boxes',
      'This creates eliminations in the same row or column in other boxes'
    ]
  },
  {
    id: 'hidden_pair_001',
    technique: 'Hidden Pair',
    image: '/patterns/placeholder.svg',
    question: 'Which technique is this?',
    options: ['Hidden Pair', 'Naked Pair', 'X-Wing', 'XY-Wing'],
    correctAnswer: 'Hidden Pair',
    explanation: 'A Hidden Pair occurs when two candidates can only be placed in two cells within a unit, and no other candidates can go in those cells.',
    difficulty: 'Medium',
    category: 'Subsets',
    hints: [
      'Look for two candidates that can only go in two cells',
      'Check if no other candidates can go in those cells',
      'Those cells must contain those two candidates'
    ]
  },

  // Hard Patterns
  {
    id: 'xy_wing_001',
    technique: 'XY-Wing',
    image: '/patterns/placeholder.svg',
    question: 'Which technique is this?',
    options: ['XY-Wing', 'X-Wing', 'Naked Triple', 'Hidden Triple'],
    correctAnswer: 'XY-Wing',
    explanation: 'An XY-Wing is a three-cell pattern where one cell contains candidates X and Y, and two other cells contain X-Z and Y-Z respectively.',
    difficulty: 'Hard',
    category: 'Wings',
    hints: [
      'Look for a cell with two candidates (X,Y)',
      'Find two other cells that share one candidate each with the first cell',
      'The common candidate Z can be eliminated from cells that see both pincers'
    ]
  },
  {
    id: 'swordfish_001',
    technique: 'Swordfish',
    image: '/patterns/placeholder.svg',
    question: 'Which technique is this?',
    options: ['Swordfish', 'X-Wing', 'Jellyfish', 'XY-Wing'],
    correctAnswer: 'Swordfish',
    explanation: 'A Swordfish is a pattern where a candidate appears exactly twice in three rows, and these appearances are in the same three columns.',
    difficulty: 'Hard',
    category: 'Fish',
    hints: [
      'Find a candidate that appears exactly twice in three rows',
      'Check if these appearances are in the same three columns',
      'If they form a rectangle, you can eliminate that candidate from other cells in those columns'
    ]
  },
  {
    id: 'naked_triple_001',
    technique: 'Naked Triple',
    image: '/patterns/placeholder.svg',
    question: 'Which technique is this?',
    options: ['Naked Triple', 'Hidden Triple', 'X-Wing', 'XY-Wing'],
    correctAnswer: 'Naked Triple',
    explanation: 'A Naked Triple occurs when three cells in a unit contain exactly three candidates between them, allowing eliminations of those candidates from other cells.',
    difficulty: 'Hard',
    category: 'Subsets',
    hints: [
      'Look for three cells that contain exactly three candidates between them',
      'Check if no candidate appears in all three cells',
      'Those candidates can be eliminated from other cells in that unit'
    ]
  }
];

export const getPatternsByDifficulty = (difficulty: 'Easy' | 'Medium' | 'Hard'): Pattern[] => {
  return patterns.filter(pattern => pattern.difficulty === difficulty);
};

export const getPatternsByCategory = (category: string): Pattern[] => {
  return patterns.filter(pattern => pattern.category === category);
};

export const getPatternById = (id: string): Pattern | undefined => {
  return patterns.find(pattern => pattern.id === id);
}; 