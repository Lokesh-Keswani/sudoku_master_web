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

  // Full House Practice
  {
    id: 'full-house-001',
    techniqueName: 'Full House',
    techniqueId: 'full-house',
    difficulty: 'Beginner',
    initialBoard: [
      [1,2,3,4,5,6,7,8,0],
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
      [2,3,4,5,6,7,8,9,1],
      [5,6,7,8,9,1,2,3,4],
      [8,9,1,2,3,4,5,6,7],
      [3,4,5,6,7,8,9,1,2],
      [6,7,8,9,1,2,3,4,5],
      [9,1,2,3,4,5,6,7,8]
    ],
    description: 'Find the row that has only one empty cell remaining. This is a Full House.',
    hints: [
      'Look for rows, columns, or boxes that have only one empty cell',
      'Count the numbers 1-9 in the unit',
      'The missing number must go in the empty cell'
    ],
    teachingPoints: [
      {
        row: 0,
        col: 8,
        description: 'This row has numbers 1-8, so 9 must go here',
        color: 'bg-green-200 dark:bg-green-800'
      }
    ]
  },

  // Full House Practice - Column Example
  {
    id: 'full-house-002',
    techniqueName: 'Full House',
    techniqueId: 'full-house',
    difficulty: 'Beginner',
    initialBoard: [
      [1,0,0,0,0,0,0,0,0],
      [2,0,0,0,0,0,0,0,0],
      [3,0,0,0,0,0,0,0,0],
      [4,0,0,0,0,0,0,0,0],
      [5,0,0,0,0,0,0,0,0],
      [6,0,0,0,0,0,0,0,0],
      [7,0,0,0,0,0,0,0,0],
      [8,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    solution: [
      [1,4,7,2,5,8,3,6,9],
      [2,5,8,3,6,9,4,7,1],
      [3,6,9,4,7,1,5,8,2],
      [4,7,1,5,8,2,6,9,3],
      [5,8,2,6,9,3,7,1,4],
      [6,9,3,7,1,4,8,2,5],
      [7,1,4,8,2,5,9,3,6],
      [8,2,5,9,3,6,1,4,7],
      [9,3,6,1,4,7,2,5,8]
    ],
    description: 'Find the column that has only one empty cell remaining. This is a Full House.',
    hints: [
      'Look at the first column - it has numbers 1-8',
      'Only one cell is empty in this column',
      'The missing number 9 must go in the empty cell'
    ],
    teachingPoints: [
      {
        row: 8,
        col: 0,
        description: 'This column has numbers 1-8, so 9 must go here',
        color: 'bg-green-200 dark:bg-green-800'
      }
    ]
  },

  // Pointing Pair Practice
  {
    id: 'pointing-pair-001',
    techniqueName: 'Pointing Pair',
    techniqueId: 'pointing-pair',
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
    description: 'Find two cells in the top-left box that contain the same candidates and are aligned in a column.',
    hints: [
      'Look at the top-left 3x3 box (cells (0,2) and (1,2))',
      'These two cells both contain only candidates 2 and 4',
      'Since they are aligned in column 2, 2 and 4 can be eliminated from other cells in column 2'
    ],
    teachingPoints: [
      {
        row: 0,
        col: 2,
        description: 'This cell contains only candidates 2 and 4',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 1,
        col: 2,
        description: 'This cell also contains only candidates 2 and 4',
        color: 'bg-blue-200 dark:bg-blue-800'
      }
    ]
  },

  // Claiming Pair Practice
  {
    id: 'claiming-pair-001',
    techniqueName: 'Claiming Pair',
    techniqueId: 'claiming-pair',
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
    description: 'Find two cells in row 1 that contain the same candidates and are in the same box.',
    hints: [
      'Look at row 1 (the second row)',
      'Find two cells that contain identical candidates',
      'Check if these cells are in the same 3x3 box',
      'If they are, those candidates can be eliminated from other cells in that box'
    ],
    teachingPoints: [
      {
        row: 1,
        col: 2,
        description: 'This cell contains only candidates 2 and 7',
        color: 'bg-purple-200 dark:bg-purple-800'
      },
      {
        row: 1,
        col: 5,
        description: 'This cell also contains only candidates 2 and 7',
        color: 'bg-purple-200 dark:bg-purple-800'
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
  },

  // Naked Pair Practice
  {
    id: 'naked-pair-001',
    techniqueName: 'Naked Pair',
    techniqueId: 'naked-pair',
    difficulty: 'Intermediate',
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
    description: 'Find two cells in a row that contain exactly the same two candidates.',
    hints: [
      'Look for two cells in the same row that have identical candidates',
      'These candidates can be eliminated from other cells in that row',
      'This is a powerful elimination technique'
    ],
    teachingPoints: [
      {
        row: 0,
        col: 2,
        description: 'This cell contains only candidates 2 and 4',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 0,
        col: 5,
        description: 'This cell also contains only candidates 2 and 4',
        color: 'bg-blue-200 dark:bg-blue-800'
      }
    ]
  },

  // Hidden Pair Practice
  {
    id: 'hidden-pair-001',
    techniqueName: 'Hidden Pair',
    techniqueId: 'hidden-pair',
    difficulty: 'Intermediate',
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
    description: 'Find two candidates that can only go in two cells within a row.',
    hints: [
      'Look for two candidates that appear only in two cells in a row',
      'Check if no other candidates can go in those two cells',
      'If so, those cells must contain only those two candidates'
    ],
    teachingPoints: [
      {
        row: 1,
        col: 2,
        description: 'Candidates 2 and 7 can only go in these two cells',
        color: 'bg-green-200 dark:bg-green-800'
      },
      {
        row: 1,
        col: 5,
        description: 'No other candidates can go in these cells',
        color: 'bg-green-200 dark:bg-green-800'
      }
    ]
  },

  // Naked Triple Practice
  {
    id: 'naked-triple-001',
    techniqueName: 'Naked Triple',
    techniqueId: 'naked-triple',
    difficulty: 'Intermediate',
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
    description: 'Find three cells that contain exactly three candidates between them.',
    hints: [
      'Look for three cells that contain only three candidates total',
      'No candidate should appear in all three cells',
      'These candidates can be eliminated from other cells in the unit'
    ],
    teachingPoints: [
      {
        row: 0,
        col: 2,
        description: 'Contains candidates 2,4',
        color: 'bg-purple-200 dark:bg-purple-800'
      },
      {
        row: 0,
        col: 5,
        description: 'Contains candidates 2,8',
        color: 'bg-purple-200 dark:bg-purple-800'
      },
      {
        row: 0,
        col: 8,
        description: 'Contains candidates 4,8',
        color: 'bg-purple-200 dark:bg-purple-800'
      }
    ]
  },

  // Hidden Triple Practice
  {
    id: 'hidden-triple-001',
    techniqueName: 'Hidden Triple',
    techniqueId: 'hidden-triple',
    difficulty: 'Intermediate',
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
    description: 'Find three candidates that can only go in three cells within a row.',
    hints: [
      'Look for three candidates that appear only in three cells in a row',
      'Check if no other candidates can go in those three cells',
      'If so, those cells must contain only those three candidates'
    ],
    teachingPoints: [
      {
        row: 1,
        col: 2,
        description: 'Candidates 2,7,8 can only go in these three cells',
        color: 'bg-indigo-200 dark:bg-indigo-800'
      },
      {
        row: 1,
        col: 5,
        description: 'No other candidates can go in these cells',
        color: 'bg-indigo-200 dark:bg-indigo-800'
      },
      {
        row: 1,
        col: 6,
        description: 'This forms a hidden triple',
        color: 'bg-indigo-200 dark:bg-indigo-800'
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
    description: 'Find a candidate that appears exactly twice in two rows, forming a rectangle.',
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

  // Swordfish Practice
  {
    id: 'swordfish-001',
    techniqueName: 'Swordfish',
    techniqueId: 'swordfish',
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
    description: 'Find a candidate that appears exactly twice in three rows, forming a rectangle.',
    hints: [
      'Find a candidate that appears exactly twice in three rows',
      'Check if these appearances are in the same three columns',
      'If they form a rectangle, you can eliminate that candidate from other cells in those columns'
    ],
    teachingPoints: [
      {
        row: 1,
        col: 0,
        description: 'Candidate 5 appears here',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 1,
        col: 3,
        description: 'And here in row 2',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 3,
        col: 0,
        description: 'And here in row 4',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 3,
        col: 3,
        description: 'And here in row 4',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 5,
        col: 0,
        description: 'And here in row 6',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 5,
        col: 3,
        description: 'And here in row 6 - forming a Swordfish',
        color: 'bg-blue-200 dark:bg-blue-800'
      }
    ]
  },

  // XYZ-Wing Practice
  {
    id: 'xyz-wing-001',
    techniqueName: 'XYZ-Wing',
    techniqueId: 'xyz-wing',
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
    description: 'Find a three-cell pattern where the pivot contains three candidates.',
    hints: [
      'Look for a cell with three candidates (X,Y,Z)',
      'Find two other cells that share one candidate each with the pivot',
      'The common candidate Z can be eliminated from cells that see all three cells'
    ],
    teachingPoints: [
      {
        row: 0,
        col: 0,
        description: 'Pivot cell with candidates 1,2,3',
        color: 'bg-yellow-200 dark:bg-yellow-800'
      },
      {
        row: 0,
        col: 1,
        description: 'Pincer cell with candidates 1,4',
        color: 'bg-orange-200 dark:bg-orange-800'
      },
      {
        row: 1,
        col: 0,
        description: 'Pincer cell with candidates 2,4',
        color: 'bg-orange-200 dark:bg-orange-800'
      }
    ]
  },

  // Skyscraper Practice
  {
    id: 'skyscraper-001',
    techniqueName: 'Skyscraper',
    techniqueId: 'skyscraper',
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
    description: 'Find a candidate that appears twice in two rows, sharing a common column.',
    hints: [
      'Find a candidate that appears exactly twice in two rows',
      'Check if these appearances share a common column',
      'The candidate can be eliminated from cells that see both appearances'
    ],
    teachingPoints: [
      {
        row: 1,
        col: 0,
        description: 'Candidate 5 appears here',
        color: 'bg-green-200 dark:bg-green-800'
      },
      {
        row: 1,
        col: 3,
        description: 'And here in row 2',
        color: 'bg-green-200 dark:bg-green-800'
      },
      {
        row: 3,
        col: 0,
        description: 'And here in row 4',
        color: 'bg-green-200 dark:bg-green-800'
      },
      {
        row: 3,
        col: 3,
        description: 'And here in row 4 - forming a Skyscraper',
        color: 'bg-green-200 dark:bg-green-800'
      }
    ]
  },

  // Two-String Kite Practice
  {
    id: 'two-string-kite-001',
    techniqueName: 'Two-String Kite',
    techniqueId: 'two-string-kite',
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
    description: 'Find strong links in a row and column that share a common cell.',
    hints: [
      'Look for a candidate with strong links in both a row and column',
      'Check if these links share a common cell',
      'Eliminations can be made based on the strong link relationships'
    ],
    teachingPoints: [
      {
        row: 0,
        col: 2,
        description: 'Strong link in row 1',
        color: 'bg-purple-200 dark:bg-purple-800'
      },
      {
        row: 2,
        col: 0,
        description: 'Strong link in column 1',
        color: 'bg-purple-200 dark:bg-purple-800'
      },
      {
        row: 0,
        col: 0,
        description: 'Common cell connecting the links',
        color: 'bg-yellow-200 dark:bg-yellow-800'
      }
    ]
  },

  // Turbot Fish Practice
  {
    id: 'turbot-fish-001',
    techniqueName: 'Turbot Fish',
    techniqueId: 'turbot-fish',
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
    description: 'Find a pattern combining strong links with one weak link.',
    hints: [
      'Look for a candidate with strong links in two units',
      'Find a weak link connecting these strong links',
      'Eliminations can be made based on the chain relationship'
    ],
    teachingPoints: [
      {
        row: 0,
        col: 0,
        description: 'Strong link in row 1',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 0,
        col: 3,
        description: 'Weak link connecting the strong links',
        color: 'bg-red-200 dark:bg-red-800'
      },
      {
        row: 3,
        col: 0,
        description: 'Strong link in column 1',
        color: 'bg-blue-200 dark:bg-blue-800'
      }
    ]
  },

  // Naked Quad Practice
  {
    id: 'naked-quad-001',
    techniqueName: 'Naked Quad',
    techniqueId: 'naked-quad',
    difficulty: 'Advanced',
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
    description: 'Find four cells that contain exactly four candidates between them.',
    hints: [
      'Look for four cells that contain only four candidates total',
      'No candidate should appear in all four cells',
      'These candidates can be eliminated from other cells in the unit'
    ],
    teachingPoints: [
      {
        row: 0,
        col: 2,
        description: 'Contains candidates 2,4',
        color: 'bg-purple-200 dark:bg-purple-800'
      },
      {
        row: 0,
        col: 5,
        description: 'Contains candidates 2,8',
        color: 'bg-purple-200 dark:bg-purple-800'
      },
      {
        row: 0,
        col: 8,
        description: 'Contains candidates 4,8',
        color: 'bg-purple-200 dark:bg-purple-800'
      },
      {
        row: 1,
        col: 2,
        description: 'Contains candidates 2,7',
        color: 'bg-purple-200 dark:bg-purple-800'
      }
    ]
  },

  // Hidden Quad Practice
  {
    id: 'hidden-quad-001',
    techniqueName: 'Hidden Quad',
    techniqueId: 'hidden-quad',
    difficulty: 'Advanced',
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
    description: 'Find four candidates that can only go in four cells within a row.',
    hints: [
      'Look for four candidates that appear only in four cells in a row',
      'Check if no other candidates can go in those four cells',
      'If so, those cells must contain only those four candidates'
    ],
    teachingPoints: [
      {
        row: 1,
        col: 2,
        description: 'Candidates 2,7,8,9 can only go in these four cells',
        color: 'bg-indigo-200 dark:bg-indigo-800'
      },
      {
        row: 1,
        col: 5,
        description: 'No other candidates can go in these cells',
        color: 'bg-indigo-200 dark:bg-indigo-800'
      },
      {
        row: 1,
        col: 6,
        description: 'This forms a hidden quad',
        color: 'bg-indigo-200 dark:bg-indigo-800'
      },
      {
        row: 1,
        col: 7,
        description: 'All four cells must contain only these candidates',
        color: 'bg-indigo-200 dark:bg-indigo-800'
      }
    ]
  },

  // Jellyfish Practice
  {
    id: 'jellyfish-001',
    techniqueName: 'Jellyfish',
    techniqueId: 'jellyfish',
    difficulty: 'Advanced',
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
    description: 'Find a candidate that appears exactly twice in four rows, forming a rectangle.',
    hints: [
      'Find a candidate that appears exactly twice in four rows',
      'Check if these appearances are in the same four columns',
      'If they form a rectangle, you can eliminate that candidate from other cells in those columns'
    ],
    teachingPoints: [
      {
        row: 1,
        col: 0,
        description: 'Candidate 5 appears here',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 1,
        col: 3,
        description: 'And here in row 2',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 3,
        col: 0,
        description: 'And here in row 4',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 3,
        col: 3,
        description: 'And here in row 4',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 5,
        col: 0,
        description: 'And here in row 6',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 5,
        col: 3,
        description: 'And here in row 6',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 7,
        col: 0,
        description: 'And here in row 8',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 7,
        col: 3,
        description: 'And here in row 8 - forming a Jellyfish',
        color: 'bg-blue-200 dark:bg-blue-800'
      }
    ]
  },

  // W-Wing Practice
  {
    id: 'w-wing-001',
    techniqueName: 'W-Wing',
    techniqueId: 'w-wing',
    difficulty: 'Advanced',
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
    description: 'Find a two-cell pattern connected by a strong link.',
    hints: [
      'Look for two cells with candidates X,Y and Y,Z',
      'Find a strong link between candidate Y in these cells',
      'The common candidate Z can be eliminated from cells that see both cells'
    ],
    teachingPoints: [
      {
        row: 0,
        col: 0,
        description: 'Cell with candidates 1,2',
        color: 'bg-yellow-200 dark:bg-yellow-800'
      },
      {
        row: 0,
        col: 1,
        description: 'Cell with candidates 2,3',
        color: 'bg-orange-200 dark:bg-orange-800'
      },
      {
        row: 0,
        col: 2,
        description: 'Strong link between candidate 2',
        color: 'bg-red-200 dark:bg-red-800'
      }
    ]
  },

  // Remote Pair Practice
  {
    id: 'remote-pair-001',
    techniqueName: 'Remote Pair',
    techniqueId: 'remote-pair',
    difficulty: 'Advanced',
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
    description: 'Find a chain of conjugate pairs that form a loop.',
    hints: [
      'Look for a chain of conjugate pairs',
      'Check if the chain forms a loop',
      'Eliminations can be made based on the alternating nature of the chain'
    ],
    teachingPoints: [
      {
        row: 0,
        col: 0,
        description: 'Start of conjugate pair chain',
        color: 'bg-green-200 dark:bg-green-800'
      },
      {
        row: 0,
        col: 1,
        description: 'Conjugate pair with candidate 1',
        color: 'bg-green-200 dark:bg-green-800'
      },
      {
        row: 1,
        col: 1,
        description: 'Conjugate pair with candidate 2',
        color: 'bg-green-200 dark:bg-green-800'
      },
      {
        row: 1,
        col: 2,
        description: 'Conjugate pair with candidate 1',
        color: 'bg-green-200 dark:bg-green-800'
      },
      {
        row: 0,
        col: 2,
        description: 'End of chain - forms a loop',
        color: 'bg-green-200 dark:bg-green-800'
      }
    ]
  },

  // XY-Chain Practice
  {
    id: 'xy-chain-001',
    techniqueName: 'XY-Chain',
    techniqueId: 'xy-chain',
    difficulty: 'Advanced',
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
    description: 'Find a chain of cells where each cell contains exactly two candidates.',
    hints: [
      'Look for a chain of cells with exactly two candidates each',
      'Consecutive cells should share one candidate',
      'The chain allows eliminations based on the alternating nature'
    ],
    teachingPoints: [
      {
        row: 0,
        col: 0,
        description: 'Chain start: candidates 1,2',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 0,
        col: 1,
        description: 'Chain link: candidates 2,3',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 1,
        col: 1,
        description: 'Chain link: candidates 3,4',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 1,
        col: 2,
        description: 'Chain link: candidates 4,5',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 2,
        col: 2,
        description: 'Chain end: candidates 5,6',
        color: 'bg-blue-200 dark:bg-blue-800'
      }
    ]
  },

  // Forcing Chain Practice
  {
    id: 'forcing-chain-001',
    techniqueName: 'Forcing Chain',
    techniqueId: 'forcing-chain',
    difficulty: 'Advanced',
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
    description: 'Find a chain that forces a contradiction or confirms a value.',
    hints: [
      'Start with an assumption about a cell',
      'Follow the logical consequences of that assumption',
      'If it leads to a contradiction, the assumption is false'
    ],
    teachingPoints: [
      {
        row: 0,
        col: 0,
        description: 'Start assumption: cell contains 1',
        color: 'bg-red-200 dark:bg-red-800'
      },
      {
        row: 0,
        col: 1,
        description: 'This forces cell to contain 2',
        color: 'bg-red-200 dark:bg-red-800'
      },
      {
        row: 1,
        col: 0,
        description: 'This forces cell to contain 4',
        color: 'bg-red-200 dark:bg-red-800'
      },
      {
        row: 1,
        col: 1,
        description: 'This creates a contradiction',
        color: 'bg-red-200 dark:bg-red-800'
      }
    ]
  },

  // Simple Coloring Practice
  {
    id: 'simple-coloring-001',
    techniqueName: 'Simple Coloring',
    techniqueId: 'coloring',
    difficulty: 'Advanced',
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
    description: 'Find a candidate that can be colored in two alternating colors.',
    hints: [
      'Choose a candidate to color',
      'Color conjugate pairs in alternating colors',
      'Look for cells that see both colors of the same candidate'
    ],
    teachingPoints: [
      {
        row: 0,
        col: 0,
        description: 'Color 1: Red',
        color: 'bg-red-200 dark:bg-red-800'
      },
      {
        row: 0,
        col: 1,
        description: 'Color 1: Blue',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 1,
        col: 0,
        description: 'Color 1: Blue',
        color: 'bg-blue-200 dark:bg-blue-800'
      },
      {
        row: 1,
        col: 1,
        description: 'Color 1: Red',
        color: 'bg-red-200 dark:bg-red-800'
      },
      {
        row: 2,
        col: 2,
        description: 'Sees both colors - can eliminate candidate 1',
        color: 'bg-yellow-200 dark:bg-yellow-800'
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