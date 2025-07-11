import { TechniqueInfo } from '../types/solutionReport';

export const enhancedTechniques: TechniqueInfo[] = [
  // BEGINNER TECHNIQUES
  {
    id: 'naked-single',
    name: 'Naked Single',
    description: 'A cell that contains only one possible candidate.',
    category: 'Singles',
    difficulty: 'Beginner',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#ns',
    fullDescription: 'When a cell has only one possible number that can be placed in it, that number must be the solution for that cell. This is the most basic solving technique.',
    example: 'If a cell can only contain the number 5, then 5 must be the solution.',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    id: 'hidden-single',
    name: 'Hidden Single',
    description: 'A number that can only go in one cell within a unit.',
    category: 'Singles',
    difficulty: 'Beginner',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#hs',
    fullDescription: 'When a number can only be placed in one cell within a row, column, or box, that cell must contain that number.',
    example: 'If the number 3 can only go in one cell in a row, then that cell must contain 3.',
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  {
    id: 'full-house',
    name: 'Full House',
    description: 'A unit with only one empty cell remaining.',
    category: 'Singles',
    difficulty: 'Beginner',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#fh',
    fullDescription: 'When a row, column, or box has only one empty cell remaining, that cell must contain the missing number.',
    example: 'If a row has numbers 1,2,3,4,5,6,7,8 and one empty cell, then that cell must contain 9.',
    color: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  {
    id: 'pointing-pair',
    name: 'Pointing Pair',
    description: 'Two candidates in a box that point to a row or column.',
    category: 'Locked Candidates',
    difficulty: 'Beginner',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#lc1',
    fullDescription: 'When two cells in a box contain the same two candidates and these cells are aligned in a row or column, those candidates can be eliminated from other cells in that row or column.',
    example: 'If cells (1,1) and (1,2) in box 1 both contain only 3 and 7, and they are in the same row, then 3 and 7 can be eliminated from other cells in row 1.',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  },
  {
    id: 'claiming-pair',
    name: 'Claiming Pair',
    description: 'Two candidates in a row/column that claim a box.',
    category: 'Locked Candidates',
    difficulty: 'Beginner',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#lc2',
    fullDescription: 'When two cells in a row or column contain the same two candidates and these cells are in the same box, those candidates can be eliminated from other cells in that box.',
    example: 'If cells (1,1) and (2,1) in row 1 both contain only 3 and 7, and they are in the same box, then 3 and 7 can be eliminated from other cells in that box.',
    color: 'bg-orange-100 text-orange-800 border-orange-300'
  },

  // INTERMEDIATE TECHNIQUES
  {
    id: 'naked-pair',
    name: 'Naked Pair',
    description: 'Two cells in a unit containing the same two candidates.',
    category: 'Subsets',
    difficulty: 'Intermediate',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#np',
    fullDescription: 'When two cells in a row, column, or box contain exactly the same two candidates, those candidates can be eliminated from other cells in that unit.',
    example: 'If cells (1,1) and (1,2) both contain only candidates 3 and 7, then 3 and 7 can be eliminated from all other cells in row 1.',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },
  {
    id: 'hidden-pair',
    name: 'Hidden Pair',
    description: 'Two candidates that can only go in two cells within a unit.',
    category: 'Subsets',
    difficulty: 'Intermediate',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#hp',
    fullDescription: 'When two candidates can only be placed in two cells within a row, column, or box, and no other candidates can go in those cells, then those cells must contain those two candidates.',
    example: 'If candidates 3 and 7 can only go in cells (1,1) and (1,2) in row 1, and no other candidates can go in those cells, then those cells must contain 3 and 7.',
    color: 'bg-pink-100 text-pink-800 border-pink-300'
  },
  {
    id: 'naked-triple',
    name: 'Naked Triple',
    description: 'Three cells containing exactly three candidates between them.',
    category: 'Subsets',
    difficulty: 'Intermediate',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#nt',
    fullDescription: 'When three cells in a unit contain exactly three candidates between them, those candidates can be eliminated from other cells in that unit.',
    example: 'If cells (1,1), (1,2), and (1,3) contain only candidates 1, 2, 3, 4, 5, and 6, and no candidate appears in all three cells, then 1, 2, 3, 4, 5, and 6 can be eliminated from other cells in row 1.',
    color: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  {
    id: 'hidden-triple',
    name: 'Hidden Triple',
    description: 'Three candidates that can only go in three cells within a unit.',
    category: 'Subsets',
    difficulty: 'Intermediate',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#ht',
    fullDescription: 'When three candidates can only be placed in three cells within a unit, and no other candidates can go in those cells, then those cells must contain those three candidates.',
    example: 'If candidates 1, 2, and 3 can only go in cells (1,1), (1,2), and (1,3) in row 1, and no other candidates can go in those cells, then those cells must contain 1, 2, and 3.',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-300'
  },
  {
    id: 'x-wing',
    name: 'X-Wing',
    description: 'A pattern where a candidate forms a rectangle across two rows and columns.',
    category: 'Fish',
    difficulty: 'Intermediate',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#xw',
    fullDescription: 'When a candidate appears exactly twice in two rows, and these appearances are in the same two columns, forming a rectangle, that candidate can be eliminated from other cells in those columns.',
    example: 'If candidate 5 appears only in cells (1,1) and (1,4) in row 1, and only in cells (3,1) and (3,4) in row 3, then 5 can be eliminated from other cells in columns 1 and 4.',
    color: 'bg-red-100 text-red-800 border-red-300'
  },
  {
    id: 'swordfish',
    name: 'Swordfish',
    description: 'A pattern where a candidate forms a rectangle across three rows and columns.',
    category: 'Fish',
    difficulty: 'Intermediate',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#sf',
    fullDescription: 'When a candidate appears exactly twice in three rows, and these appearances are in the same three columns, forming a rectangle, that candidate can be eliminated from other cells in those columns.',
    example: 'If candidate 5 appears only in cells (1,1) and (1,4) in row 1, only in cells (3,1) and (3,4) in row 3, and only in cells (5,1) and (5,4) in row 5, then 5 can be eliminated from other cells in columns 1 and 4.',
    color: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    id: 'xy-wing',
    name: 'XY-Wing',
    description: 'A three-cell pattern where one cell contains two candidates.',
    category: 'Wings',
    difficulty: 'Intermediate',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#xyw',
    fullDescription: 'A three-cell pattern where one cell (the pivot) contains candidates X and Y, and two other cells (the pincers) contain candidates X-Z and Y-Z respectively. The common candidate Z can be eliminated from cells that see both pincers.',
    example: 'If cell (1,1) contains candidates 1 and 2, cell (1,2) contains candidates 1 and 3, and cell (2,1) contains candidates 2 and 3, then candidate 3 can be eliminated from cells that see both (1,2) and (2,1).',
    color: 'bg-lime-100 text-lime-800 border-lime-300'
  },
  {
    id: 'xyz-wing',
    name: 'XYZ-Wing',
    description: 'A three-cell pattern where the pivot contains three candidates.',
    category: 'Wings',
    difficulty: 'Intermediate',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#xyzw',
    fullDescription: 'A three-cell pattern where one cell (the pivot) contains candidates X, Y, and Z, and two other cells (the pincers) contain candidates X-Z and Y-Z respectively. The common candidate Z can be eliminated from cells that see all three cells.',
    example: 'If cell (1,1) contains candidates 1, 2, and 3, cell (1,2) contains candidates 1 and 3, and cell (2,1) contains candidates 2 and 3, then candidate 3 can be eliminated from cells that see all three cells.',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 'skyscraper',
    name: 'Skyscraper',
    description: 'A pattern where a candidate appears twice in two rows/columns.',
    category: 'Fish',
    difficulty: 'Intermediate',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#sk',
    fullDescription: 'When a candidate appears exactly twice in two rows (or columns), and these appearances share a common column (or row), that candidate can be eliminated from cells that see both appearances.',
    example: 'If candidate 5 appears in cells (1,1) and (1,4) in row 1, and in cells (3,1) and (3,7) in row 3, then 5 can be eliminated from cells that see both (1,4) and (3,7).',
    color: 'bg-violet-100 text-violet-800 border-violet-300'
  },
  {
    id: 'two-string-kite',
    name: 'Two-String Kite',
    description: 'A pattern using strong links in rows and columns.',
    category: 'Fish',
    difficulty: 'Intermediate',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#tsk',
    fullDescription: 'When a candidate has strong links in both a row and a column, and these links share a common cell, eliminations can be made based on the strong link relationships.',
    example: 'If candidate 5 has strong links in row 1 and column 3, and these links intersect at cell (1,3), then 5 can be eliminated from cells that see both ends of the chain.',
    color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300'
  },
  {
    id: 'turbot-fish',
    name: 'Turbot Fish',
    description: 'A pattern using strong links with one weak link.',
    category: 'Fish',
    difficulty: 'Intermediate',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#tf',
    fullDescription: 'A pattern that combines strong links with one weak link to create eliminations. It\'s a generalization of the Skyscraper technique.',
    example: 'When a candidate has strong links in two units and a weak link connecting them, eliminations can be made based on the chain relationship.',
    color: 'bg-rose-100 text-rose-800 border-rose-300'
  },

  // ADVANCED TECHNIQUES
  {
    id: 'naked-quad',
    name: 'Naked Quad',
    description: 'Four cells containing exactly four candidates between them.',
    category: 'Subsets',
    difficulty: 'Advanced',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#nq',
    fullDescription: 'When four cells in a unit contain exactly four candidates between them, those candidates can be eliminated from other cells in that unit.',
    example: 'If cells (1,1), (1,2), (1,3), and (1,4) contain only candidates 1, 2, 3, 4, 5, 6, 7, and 8, and no candidate appears in all four cells, then 1, 2, 3, 4, 5, 6, 7, and 8 can be eliminated from other cells in row 1.',
    color: 'bg-slate-100 text-slate-800 border-slate-300'
  },
  {
    id: 'hidden-quad',
    name: 'Hidden Quad',
    description: 'Four candidates that can only go in four cells within a unit.',
    category: 'Subsets',
    difficulty: 'Advanced',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#hq',
    fullDescription: 'When four candidates can only be placed in four cells within a unit, and no other candidates can go in those cells, then those cells must contain those four candidates.',
    example: 'If candidates 1, 2, 3, and 4 can only go in cells (1,1), (1,2), (1,3), and (1,4) in row 1, and no other candidates can go in those cells, then those cells must contain 1, 2, 3, and 4.',
    color: 'bg-gray-100 text-gray-800 border-gray-300'
  },
  {
    id: 'jellyfish',
    name: 'Jellyfish',
    description: 'A pattern where a candidate forms a rectangle across four rows and columns.',
    category: 'Fish',
    difficulty: 'Advanced',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#jf',
    fullDescription: 'When a candidate appears exactly twice in four rows, and these appearances are in the same four columns, forming a rectangle, that candidate can be eliminated from other cells in those columns.',
    example: 'If candidate 5 appears exactly twice in each of rows 1, 3, 5, and 7, and these appearances are in the same four columns, then 5 can be eliminated from other cells in those columns.',
    color: 'bg-zinc-100 text-zinc-800 border-zinc-300'
  },
  {
    id: 'unique-rectangle',
    name: 'Unique Rectangle',
    description: 'A pattern that prevents multiple solutions.',
    category: 'Uniqueness',
    difficulty: 'Advanced',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#ur',
    fullDescription: 'A pattern that uses the uniqueness of Sudoku solutions to make eliminations. If certain patterns would lead to multiple solutions, eliminations can be made to prevent this.',
    example: 'When four cells form a rectangle and certain candidates would create multiple solutions, those candidates can be eliminated.',
    color: 'bg-neutral-100 text-neutral-800 border-neutral-300'
  },
  {
    id: 'bivalue-universal-grave',
    name: 'Bivalue Universal Grave',
    description: 'A pattern that prevents multiple solutions in bivalue cells.',
    category: 'Uniqueness',
    difficulty: 'Advanced',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#bug',
    fullDescription: 'A pattern that uses the uniqueness of Sudoku solutions to make eliminations in bivalue cells. If certain eliminations would create multiple solutions, those eliminations can be prevented.',
    example: 'When all remaining cells are bivalue and certain eliminations would create multiple solutions, those eliminations can be prevented.',
    color: 'bg-stone-100 text-stone-800 border-stone-300'
  },

  // EXPERT TECHNIQUES
  {
    id: 'xy-chain',
    name: 'XY-Chain',
    description: 'A chain of bivalue cells that creates eliminations.',
    category: 'Chains',
    difficulty: 'Expert',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#xyc',
    fullDescription: 'A chain of bivalue cells where each cell shares a candidate with the next cell in the chain. This can create eliminations based on the chain relationships.',
    example: 'A chain of cells where each cell contains exactly two candidates and shares one candidate with the next cell in the chain.',
    color: 'bg-red-200 text-red-900 border-red-400'
  },
  {
    id: 'remote-pair',
    name: 'Remote Pair',
    description: 'A pattern using pairs of candidates in a chain.',
    category: 'Chains',
    difficulty: 'Expert',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#rp',
    fullDescription: 'A pattern that uses pairs of candidates in a chain to create eliminations. The chain alternates between two candidates.',
    example: 'A chain where cells alternate between containing candidates A and B, creating eliminations based on the chain relationships.',
    color: 'bg-orange-200 text-orange-900 border-orange-400'
  },
  {
    id: 'als-xy-wing',
    name: 'ALS XY-Wing',
    description: 'An Almost Locked Set XY-Wing pattern.',
    category: 'ALS',
    difficulty: 'Expert',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#als',
    fullDescription: 'A pattern that uses Almost Locked Sets to create eliminations. An Almost Locked Set is a set of cells that would be locked if one candidate were removed.',
    example: 'When three Almost Locked Sets share common candidates, eliminations can be made based on the ALS relationships.',
    color: 'bg-amber-200 text-amber-900 border-amber-400'
  },
  {
    id: 'death-blossom',
    name: 'Death Blossom',
    description: 'A complex pattern using multiple Almost Locked Sets.',
    category: 'ALS',
    difficulty: 'Expert',
    hodokuUrl: 'https://hodoku.sourceforge.net/en/techniques.php#db',
    fullDescription: 'A complex pattern that uses multiple Almost Locked Sets to create eliminations. The pattern resembles a flower with multiple petals.',
    example: 'When multiple Almost Locked Sets interact in a specific pattern, eliminations can be made based on their complex relationships.',
    color: 'bg-yellow-200 text-yellow-900 border-yellow-400'
  }
];

export const getTechniqueById = (id: string): TechniqueInfo | undefined => {
  return enhancedTechniques.find(technique => technique.id === id);
};

export const getTechniquesByDifficulty = (difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'): TechniqueInfo[] => {
  return enhancedTechniques.filter(technique => technique.difficulty === difficulty);
};

export const getTechniquesByCategory = (category: string): TechniqueInfo[] => {
  return enhancedTechniques.filter(technique => technique.category === category);
};

export const getTechniqueColor = (difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'): string => {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'Intermediate':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Advanced':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'Expert':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}; 