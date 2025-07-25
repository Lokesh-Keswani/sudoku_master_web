export interface PracticePuzzle {
  id: string;
  techniqueName: string;
  techniqueId: string;
  initialBoard: number[][];
  solution: number[][];
  description: string;
  hints: string[];
  teachingPoints: {
    row: number;
    col: number;
    description: string;
    color: string;
  }[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export const practicePuzzles: PracticePuzzle[] = [
  // Naked Single Practice
  {
    id: 'naked-single-001',
    techniqueName: 'Naked Single',
    techniqueId: 'naked-single',
    difficulty: 'Beginner',
    initialBoard: [
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
    solution: [
      [5,3,4,6,7,8,9,1,2],
      [6,7,2,1,9,5,3,4,8],
      [1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],
      [4,2,6,8,5,3,7,9,1],
      [7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],
      [2,8,7,4,1,9,6,3,5],
      [3,4,5,2,8,6,1,7,9]
    ],
    description: 'Find the cell that has only one possible candidate remaining. This is a Naked Single.',
    hints: [
      'Look for cells that have only one possible number',
      'Check each empty cell and count its possible candidates',
      'If a cell has only one candidate, that must be the solution'
    ],
    teachingPoints: [
      {
        row: 0,
        col: 2,
        description: 'This cell can only contain 4',
        color: 'bg-green-200 dark:bg-green-800'
      }
    ]
  },

  // Hidden Single Practice
  {
    id: 'hidden-single-001',
    techniqueName: 'Hidden Single',
    techniqueId: 'hidden-single',
    difficulty: 'Beginner',
    initialBoard: [
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
    solution: [
      [4,3,5,2,6,9,7,8,1],
      [6,8,2,5,7,1,4,9,3],
      [1,9,7,8,3,4,5,6,2],
      [8,2,6,1,9,5,3,4,7],
      [3,7,4,6,8,2,9,1,5],
      [9,5,1,7,4,3,6,2,8],
      [5,1,9,3,2,6,8,7,4],
      [2,4,8,9,5,7,1,3,6],
      [7,6,3,4,1,8,2,5,9]
    ],
    description: 'Find a number that can only be placed in one cell within a row, column, or box.',
    hints: [
      'Look for numbers that appear only once in a row, column, or box',
      'Check if that number can only go in one cell',
      'If a number can only go in one cell, that cell must contain that number'
    ],
    teachingPoints: [
      {
        row: 0,
        col: 0,
        description: 'Number 4 can only go in this cell in row 1',
        color: 'bg-blue-200 dark:bg-blue-800'
      }
    ]
  },

  // X-Wing Practice
  {
    id: 'x-wing-001',
    techniqueName: 'X-Wing',
    techniqueId: 'x-wing',
    difficulty: 'Intermediate',
    initialBoard: [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    solution: [
      [1,2,3,4,5,6,7,8,9],
      [4,5,6,7,8,9,1,2,3],
      [7,8,9,1,2,3,4,5,6],
      [2,3,1,5,6,4,8,9,7],
      [5,6,4,8,9,7,2,3,1],
      [8,9,7,2,3,1,5,6,4],
      [3,1,2,6,4,5,9,7,8],
      [6,4,5,9,7,8,3,1,2],
      [9,7,8,3,1,2,6,4,5]
    ],
    description: 'Look for a candidate that appears exactly twice in two rows, forming a rectangle.',
    hints: [
      'Find a candidate that appears exactly twice in two rows',
      'Check if these appearances are in the same two columns',
      'If they form a rectangle, you can eliminate that candidate from other cells in those columns'
    ],
    teachingPoints: [
      {
        row: 1,
        col: 0,
        description: 'Candidate 5 appears here',
        color: 'bg-red-200 dark:bg-red-800'
      },
      {
        row: 1,
        col: 3,
        description: 'And here in row 2',
        color: 'bg-red-200 dark:bg-red-800'
      },
      {
        row: 3,
        col: 0,
        description: 'And here in row 4',
        color: 'bg-red-200 dark:bg-red-800'
      },
      {
        row: 3,
        col: 3,
        description: 'And here in row 4 - forming an X-Wing',
        color: 'bg-red-200 dark:bg-red-800'
      }
    ]
  },

  // XY-Wing Practice
  {
    id: 'xy-wing-001',
    techniqueName: 'XY-Wing',
    techniqueId: 'xy-wing',
    difficulty: 'Intermediate',
    initialBoard: [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    solution: [
      [1,2,3,4,5,6,7,8,9],
      [4,5,6,7,8,9,1,2,3],
      [7,8,9,1,2,3,4,5,6],
      [2,3,1,5,6,4,8,9,7],
      [5,6,4,8,9,7,2,3,1],
      [8,9,7,2,3,1,5,6,4],
      [3,1,2,6,4,5,9,7,8],
      [6,4,5,9,7,8,3,1,2],
      [9,7,8,3,1,2,6,4,5]
    ],
    description: 'Find a three-cell pattern where one cell contains candidates X and Y, and two other cells contain X-Z and Y-Z.',
    hints: [
      'Look for a cell with two candidates (X,Y)',
      'Find two other cells that share one candidate each with the first cell',
      'The common candidate Z can be eliminated from cells that see both pincers'
    ],
    teachingPoints: [
      {
        row: 0,
        col: 0,
        description: 'Pivot cell with candidates 1,2',
        color: 'bg-yellow-200 dark:bg-yellow-800'
      },
      {
        row: 0,
        col: 1,
        description: 'Pincer cell with candidates 1,3',
        color: 'bg-orange-200 dark:bg-orange-800'
      },
      {
        row: 1,
        col: 0,
        description: 'Pincer cell with candidates 2,3',
        color: 'bg-orange-200 dark:bg-orange-800'
      }
    ]
  }
];

export const getPracticePuzzleByTechnique = (techniqueId: string): PracticePuzzle | undefined => {
  return practicePuzzles.find(puzzle => puzzle.techniqueId === techniqueId);
};

export const getPracticePuzzleById = (id: string): PracticePuzzle | undefined => {
  return practicePuzzles.find(puzzle => puzzle.id === id);
}; 