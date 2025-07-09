export interface Technique {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  fullDescription?: string;
  example?: string;
  practiceRoute?: string;
}

export const techniques: Technique[] = [
  // BEGINNER TECHNIQUES
  {
    id: 'naked-single',
    name: 'Naked Single',
    description: 'A cell that contains only one possible candidate.',
    category: 'Singles',
    difficulty: 'Beginner',
    fullDescription: 'When a cell has only one possible number that can be placed in it, that number must be the solution for that cell. This is the most basic solving technique.',
    example: 'If a cell can only contain the number 5, then 5 must be the solution.',
    practiceRoute: '/training/techniques/naked-single'
  },
  {
    id: 'hidden-single',
    name: 'Hidden Single',
    description: 'A number that can only go in one cell within a unit.',
    category: 'Singles',
    difficulty: 'Beginner',
    fullDescription: 'When a number can only be placed in one cell within a row, column, or box, that cell must contain that number.',
    example: 'If the number 3 can only go in one cell in a row, then that cell must contain 3.',
    practiceRoute: '/training/techniques/hidden-single'
  },
  {
    id: 'full-house',
    name: 'Full House',
    description: 'A unit with only one empty cell remaining.',
    category: 'Singles',
    difficulty: 'Beginner',
    fullDescription: 'When a row, column, or box has only one empty cell remaining, that cell must contain the missing number.',
    example: 'If a row has numbers 1,2,3,4,5,6,7,8 and one empty cell, then that cell must contain 9.',
    practiceRoute: '/training/techniques/full-house'
  },
  {
    id: 'pointing-pair',
    name: 'Pointing Pair',
    description: 'Two candidates in a box that point to a row or column.',
    category: 'Locked Candidates',
    difficulty: 'Beginner',
    fullDescription: 'When two cells in a box contain the same two candidates and these cells are aligned in a row or column, those candidates can be eliminated from other cells in that row or column.',
    example: 'If cells (1,1) and (1,2) in box 1 both contain only 3 and 7, and they are in the same row, then 3 and 7 can be eliminated from other cells in row 1.',
    practiceRoute: '/training/techniques/pointing-pair'
  },
  {
    id: 'claiming-pair',
    name: 'Claiming Pair',
    description: 'Two candidates in a row/column that claim a box.',
    category: 'Locked Candidates',
    difficulty: 'Beginner',
    fullDescription: 'When two cells in a row or column contain the same two candidates and these cells are in the same box, those candidates can be eliminated from other cells in that box.',
    example: 'If cells (1,1) and (2,1) in row 1 both contain only 3 and 7, and they are in the same box, then 3 and 7 can be eliminated from other cells in that box.',
    practiceRoute: '/training/techniques/claiming-pair'
  },

  // INTERMEDIATE TECHNIQUES
  {
    id: 'naked-pair',
    name: 'Naked Pair',
    description: 'Two cells in a unit containing the same two candidates.',
    category: 'Subsets',
    difficulty: 'Intermediate',
    fullDescription: 'When two cells in a row, column, or box contain exactly the same two candidates, those candidates can be eliminated from other cells in that unit.',
    example: 'If cells (1,1) and (1,2) both contain only candidates 3 and 7, then 3 and 7 can be eliminated from all other cells in row 1.',
    practiceRoute: '/training/techniques/naked-pair'
  },
  {
    id: 'hidden-pair',
    name: 'Hidden Pair',
    description: 'Two candidates that can only go in two cells within a unit.',
    category: 'Subsets',
    difficulty: 'Intermediate',
    fullDescription: 'When two candidates can only be placed in two cells within a row, column, or box, and no other candidates can go in those cells, then those cells must contain those two candidates.',
    example: 'If candidates 3 and 7 can only go in cells (1,1) and (1,2) in row 1, and no other candidates can go in those cells, then those cells must contain 3 and 7.',
    practiceRoute: '/training/techniques/hidden-pair'
  },
  {
    id: 'naked-triple',
    name: 'Naked Triple',
    description: 'Three cells containing exactly three candidates between them.',
    category: 'Subsets',
    difficulty: 'Intermediate',
    fullDescription: 'When three cells in a unit contain exactly three candidates between them, those candidates can be eliminated from other cells in that unit.',
    example: 'If cells (1,1), (1,2), and (1,3) contain only candidates 1, 2, 3, 4, 5, and 6, and no candidate appears in all three cells, then 1, 2, 3, 4, 5, and 6 can be eliminated from other cells in row 1.',
    practiceRoute: '/training/techniques/naked-triple'
  },
  {
    id: 'hidden-triple',
    name: 'Hidden Triple',
    description: 'Three candidates that can only go in three cells within a unit.',
    category: 'Subsets',
    difficulty: 'Intermediate',
    fullDescription: 'When three candidates can only be placed in three cells within a unit, and no other candidates can go in those cells, then those cells must contain those three candidates.',
    example: 'If candidates 1, 2, and 3 can only go in cells (1,1), (1,2), and (1,3) in row 1, and no other candidates can go in those cells, then those cells must contain 1, 2, and 3.',
    practiceRoute: '/training/techniques/hidden-triple'
  },
  {
    id: 'x-wing',
    name: 'X-Wing',
    description: 'A pattern where a candidate forms a rectangle across two rows and columns.',
    category: 'Fish',
    difficulty: 'Intermediate',
    fullDescription: 'When a candidate appears exactly twice in two rows, and these appearances are in the same two columns, forming a rectangle, that candidate can be eliminated from other cells in those columns.',
    example: 'If candidate 5 appears only in cells (1,1) and (1,4) in row 1, and only in cells (3,1) and (3,4) in row 3, then 5 can be eliminated from other cells in columns 1 and 4.',
    practiceRoute: '/training/techniques/x-wing'
  },
  {
    id: 'swordfish',
    name: 'Swordfish',
    description: 'A pattern where a candidate forms a rectangle across three rows and columns.',
    category: 'Fish',
    difficulty: 'Intermediate',
    fullDescription: 'When a candidate appears exactly twice in three rows, and these appearances are in the same three columns, forming a rectangle, that candidate can be eliminated from other cells in those columns.',
    example: 'If candidate 5 appears only in cells (1,1) and (1,4) in row 1, only in cells (3,1) and (3,4) in row 3, and only in cells (5,1) and (5,4) in row 5, then 5 can be eliminated from other cells in columns 1 and 4.',
    practiceRoute: '/training/techniques/swordfish'
  },
  {
    id: 'xy-wing',
    name: 'XY-Wing',
    description: 'A three-cell pattern where one cell contains two candidates.',
    category: 'Wings',
    difficulty: 'Intermediate',
    fullDescription: 'A three-cell pattern where one cell (the pivot) contains candidates X and Y, and two other cells (the pincers) contain candidates X-Z and Y-Z respectively. The common candidate Z can be eliminated from cells that see both pincers.',
    example: 'If cell (1,1) contains candidates 1 and 2, cell (1,2) contains candidates 1 and 3, and cell (2,1) contains candidates 2 and 3, then candidate 3 can be eliminated from cells that see both (1,2) and (2,1).',
    practiceRoute: '/training/techniques/xy-wing'
  },
  {
    id: 'xyz-wing',
    name: 'XYZ-Wing',
    description: 'A three-cell pattern where the pivot contains three candidates.',
    category: 'Wings',
    difficulty: 'Intermediate',
    fullDescription: 'A three-cell pattern where one cell (the pivot) contains candidates X, Y, and Z, and two other cells (the pincers) contain candidates X-Z and Y-Z respectively. The common candidate Z can be eliminated from cells that see all three cells.',
    example: 'If cell (1,1) contains candidates 1, 2, and 3, cell (1,2) contains candidates 1 and 3, and cell (2,1) contains candidates 2 and 3, then candidate 3 can be eliminated from cells that see all three cells.',
    practiceRoute: '/training/techniques/xyz-wing'
  },
  {
    id: 'skyscraper',
    name: 'Skyscraper',
    description: 'A pattern where a candidate appears twice in two rows/columns.',
    category: 'Fish',
    difficulty: 'Intermediate',
    fullDescription: 'When a candidate appears exactly twice in two rows (or columns), and these appearances share a common column (or row), that candidate can be eliminated from cells that see both appearances.',
    example: 'If candidate 5 appears in cells (1,1) and (1,4) in row 1, and in cells (3,1) and (3,7) in row 3, then 5 can be eliminated from cells that see both (1,4) and (3,7).',
    practiceRoute: '/training/techniques/skyscraper'
  },
  {
    id: 'two-string-kite',
    name: 'Two-String Kite',
    description: 'A pattern using strong links in rows and columns.',
    category: 'Fish',
    difficulty: 'Intermediate',
    fullDescription: 'When a candidate has strong links in both a row and a column, and these links share a common cell, eliminations can be made based on the strong link relationships.',
    example: 'If candidate 5 has strong links in row 1 and column 3, and these links intersect at cell (1,3), then 5 can be eliminated from cells that see both ends of the chain.',
    practiceRoute: '/training/techniques/two-string-kite'
  },
  {
    id: 'turbot-fish',
    name: 'Turbot Fish',
    description: 'A pattern using strong links with one weak link.',
    category: 'Fish',
    difficulty: 'Intermediate',
    fullDescription: 'A pattern that combines strong links with one weak link to create eliminations. It\'s a generalization of the Skyscraper technique.',
    example: 'When a candidate has strong links in two units and a weak link connecting them, eliminations can be made based on the chain relationship.',
    practiceRoute: '/training/techniques/turbot-fish'
  },

  // ADVANCED TECHNIQUES
  {
    id: 'naked-quad',
    name: 'Naked Quad',
    description: 'Four cells containing exactly four candidates between them.',
    category: 'Subsets',
    difficulty: 'Advanced',
    fullDescription: 'When four cells in a unit contain exactly four candidates between them, those candidates can be eliminated from other cells in that unit.',
    example: 'If cells (1,1), (1,2), (1,3), and (1,4) contain only candidates 1, 2, 3, 4, 5, 6, 7, and 8, and no candidate appears in all four cells, then 1, 2, 3, 4, 5, 6, 7, and 8 can be eliminated from other cells in row 1.',
    practiceRoute: '/training/techniques/naked-quad'
  },
  {
    id: 'hidden-quad',
    name: 'Hidden Quad',
    description: 'Four candidates that can only go in four cells within a unit.',
    category: 'Subsets',
    difficulty: 'Advanced',
    fullDescription: 'When four candidates can only be placed in four cells within a unit, and no other candidates can go in those cells, then those cells must contain those four candidates.',
    example: 'If candidates 1, 2, 3, and 4 can only go in cells (1,1), (1,2), (1,3), and (1,4) in row 1, and no other candidates can go in those cells, then those cells must contain 1, 2, 3, and 4.',
    practiceRoute: '/training/techniques/hidden-quad'
  },
  {
    id: 'jellyfish',
    name: 'Jellyfish',
    description: 'A pattern where a candidate forms a rectangle across four rows and columns.',
    category: 'Fish',
    difficulty: 'Advanced',
    fullDescription: 'When a candidate appears exactly twice in four rows, and these appearances are in the same four columns, forming a rectangle, that candidate can be eliminated from other cells in those columns.',
    example: 'If candidate 5 appears only in cells (1,1) and (1,4) in row 1, only in cells (3,1) and (3,4) in row 3, only in cells (5,1) and (5,4) in row 5, and only in cells (7,1) and (7,4) in row 7, then 5 can be eliminated from other cells in columns 1 and 4.',
    practiceRoute: '/training/techniques/jellyfish'
  },
  {
    id: 'w-wing',
    name: 'W-Wing',
    description: 'A two-cell pattern connected by a strong link.',
    category: 'Wings',
    difficulty: 'Advanced',
    fullDescription: 'A two-cell pattern where one cell contains candidates X and Y, another cell contains candidates Y and Z, and there is a strong link between candidates Y in these cells. The common candidate Z can be eliminated from cells that see both cells.',
    example: 'If cell (1,1) contains candidates 1 and 2, cell (1,2) contains candidates 2 and 3, and there is a strong link between candidate 2 in these cells, then candidate 3 can be eliminated from cells that see both (1,1) and (1,2).',
    practiceRoute: '/training/techniques/w-wing'
  },
  {
    id: 'remote-pair',
    name: 'Remote Pair',
    description: 'A chain of conjugate pairs that form a loop.',
    category: 'Chains',
    difficulty: 'Advanced',
    fullDescription: 'A chain of conjugate pairs that form a loop, allowing eliminations based on the alternating nature of the chain.',
    example: 'If there is a chain of conjugate pairs: (1,1)1-(1,2)1-(2,2)2-(2,3)2-(3,3)1-(3,1)1-(1,1)1, then candidates 1 and 2 can be eliminated from cells that see both ends of the chain.',
    practiceRoute: '/training/techniques/remote-pair'
  },
  {
    id: 'xy-chain',
    name: 'XY-Chain',
    description: 'A chain of cells where each cell contains exactly two candidates.',
    category: 'Chains',
    difficulty: 'Advanced',
    fullDescription: 'A chain of cells where each cell contains exactly two candidates, and consecutive cells share one candidate. The chain allows eliminations based on the alternating nature of the chain.',
    example: 'If there is a chain: (1,1)1,2-(1,2)2,3-(2,2)3,4-(2,3)4,5-(3,3)5,6-(3,1)6,1-(1,1)1,2, then candidates 1 and 6 can be eliminated from cells that see both ends of the chain.',
    practiceRoute: '/training/techniques/xy-chain'
  },
  {
    id: 'forcing-chain',
    name: 'Forcing Chain',
    description: 'A chain that forces a contradiction or confirms a value.',
    category: 'Chains',
    difficulty: 'Advanced',
    fullDescription: 'A chain that, when followed to its logical conclusion, either forces a contradiction (proving the starting assumption is false) or confirms a value.',
    example: 'If assuming cell (1,1) contains 1 leads to a contradiction, then cell (1,1) cannot contain 1.',
    practiceRoute: '/training/techniques/forcing-chain'
  },
  {
    id: 'coloring',
    name: 'Simple Coloring',
    description: 'A technique that uses alternating colors to find eliminations.',
    category: 'Coloring',
    difficulty: 'Advanced',
    fullDescription: 'A technique that assigns alternating colors to conjugate pairs of a candidate, allowing eliminations based on the color relationships.',
    example: 'If candidate 5 is colored alternately in conjugate pairs, and a cell sees two cells of the same color, then candidate 5 can be eliminated from that cell.',
    practiceRoute: '/training/techniques/coloring'
  },
  {
    id: 'multi-coloring',
    name: 'Multi-Coloring',
    description: 'An advanced coloring technique using multiple colors.',
    category: 'Coloring',
    difficulty: 'Advanced',
    fullDescription: 'An advanced coloring technique that uses multiple colors to represent different relationships between candidates, allowing more complex eliminations.',
    example: 'Using multiple colors to represent different types of relationships between candidates, allowing eliminations based on complex color interactions.',
    practiceRoute: '/training/techniques/multi-coloring'
  },
  {
    id: 'als-xy-wing',
    name: 'ALS XY-Wing',
    description: 'An Almost Locked Set XY-Wing pattern.',
    category: 'ALS',
    difficulty: 'Advanced',
    fullDescription: 'A pattern involving Almost Locked Sets where one set contains candidates X and Y, and two other sets contain candidates X-Z and Y-Z respectively.',
    example: 'If ALS A contains candidates 1 and 2, ALS B contains candidates 1 and 3, and ALS C contains candidates 2 and 3, then candidate 3 can be eliminated from cells that see all three ALS.',
    practiceRoute: '/training/techniques/als-xy-wing'
  },
  {
    id: 'als-chain',
    name: 'ALS Chain',
    description: 'A chain of Almost Locked Sets.',
    category: 'ALS',
    difficulty: 'Advanced',
    fullDescription: 'A chain of Almost Locked Sets that allows eliminations based on the relationships between the sets.',
    example: 'A chain of ALS that, when followed, allows eliminations based on the alternating nature of the chain.',
    practiceRoute: '/training/techniques/als-chain'
  },
  {
    id: 'unique-rectangle-type1',
    name: 'Unique Rectangle Type 1',
    description: 'A pattern that prevents multiple solutions.',
    category: 'Unique Patterns',
    difficulty: 'Advanced',
    fullDescription: 'A pattern that uses the uniqueness of Sudoku solutions to make eliminations. Type 1 involves four cells forming a rectangle with two candidates.',
    example: 'If four cells form a rectangle with candidates 1 and 2, and two cells have additional candidates, then the additional candidates can be eliminated to prevent multiple solutions.',
    practiceRoute: '/training/techniques/unique-rectangle-type1'
  },
  {
    id: 'unique-rectangle-type2',
    name: 'Unique Rectangle Type 2',
    description: 'A pattern using strong links in unique rectangles.',
    category: 'Unique Patterns',
    difficulty: 'Advanced',
    fullDescription: 'A unique rectangle pattern that uses strong links between the rectangle cells to make eliminations.',
    example: 'When a unique rectangle has strong links between its cells, eliminations can be made based on the strong link relationships.',
    practiceRoute: '/training/techniques/unique-rectangle-type2'
  },
  {
    id: 'empty-rectangle',
    name: 'Empty Rectangle',
    description: 'A pattern where a candidate is absent from a box.',
    category: 'Fish',
    difficulty: 'Advanced',
    fullDescription: 'When a candidate is completely absent from a box, but appears in the same row or column in other boxes, eliminations can be made.',
    example: 'If candidate 5 is absent from box 1 but appears in row 1 in boxes 2 and 3, then 5 can be eliminated from other cells in row 1 in box 1.',
    practiceRoute: '/training/techniques/empty-rectangle'
  },
  {
    id: 'finned-x-wing',
    name: 'Finned X-Wing',
    description: 'An X-Wing pattern with additional candidates.',
    category: 'Fish',
    difficulty: 'Advanced',
    fullDescription: 'An X-Wing pattern where one of the cells has additional candidates (the fin), allowing eliminations based on the finned pattern.',
    example: 'If an X-Wing pattern exists for candidate 5, but one cell has additional candidates, then eliminations can be made based on the finned relationship.',
    practiceRoute: '/training/techniques/finned-x-wing'
  },
  {
    id: 'sue-de-coq',
    name: 'Sue de Coq',
    description: 'A pattern involving two cells and their shared units.',
    category: 'ALS',
    difficulty: 'Advanced',
    fullDescription: 'A pattern where two cells share candidates and units, allowing eliminations based on the relationship between the cells and their shared units.',
    example: 'When two cells share candidates and are in the same row, column, and box, eliminations can be made based on their shared relationships.',
    practiceRoute: '/training/techniques/sue-de-coq'
  },

  // EXPERT TECHNIQUES
  {
    id: 'death-blossom',
    name: 'Death Blossom',
    description: 'A complex pattern involving multiple Almost Locked Sets.',
    category: 'ALS',
    difficulty: 'Expert',
    fullDescription: 'A complex pattern involving multiple Almost Locked Sets that share common candidates, allowing eliminations based on the relationships between all sets.',
    example: 'Multiple ALS that share common candidates, allowing eliminations based on the complex interactions between all sets.',
    practiceRoute: '/training/techniques/death-blossom'
  },
  {
    id: 'forcing-net',
    name: 'Forcing Net',
    description: 'A complex network of forcing chains.',
    category: 'Chains',
    difficulty: 'Expert',
    fullDescription: 'A complex network of forcing chains that work together to make eliminations or confirm values.',
    example: 'Multiple forcing chains that interact with each other, creating a network of logical relationships.',
    practiceRoute: '/training/techniques/forcing-net'
  },
  {
    id: 'nice-loop',
    name: 'Nice Loop',
    description: 'A closed loop of alternating strong and weak links.',
    category: 'Chains',
    difficulty: 'Expert',
    fullDescription: 'A closed loop of alternating strong and weak links that allows eliminations based on the loop structure.',
    example: 'A loop of alternating strong and weak links that forms a closed circuit, allowing eliminations based on the loop properties.',
    practiceRoute: '/training/techniques/nice-loop'
  },
  {
    id: 'als-xz',
    name: 'ALS-XZ',
    description: 'A pattern using Almost Locked Sets with restricted common.',
    category: 'ALS',
    difficulty: 'Expert',
    fullDescription: 'A pattern where two Almost Locked Sets share a restricted common candidate, allowing eliminations based on the restricted relationship.',
    example: 'When two ALS share a candidate that is restricted in its placement, eliminations can be made based on this restriction.',
    practiceRoute: '/training/techniques/als-xz'
  },
  {
    id: 'kraken-fish',
    name: 'Kraken Fish',
    description: 'A complex fish pattern with multiple fins.',
    category: 'Fish',
    difficulty: 'Expert',
    fullDescription: 'A complex fish pattern that combines multiple fins and fish structures to make eliminations.',
    example: 'A fish pattern with multiple fins that work together to create eliminations based on their combined relationships.',
    practiceRoute: '/training/techniques/kraken-fish'
  },
  {
    id: 'templates',
    name: 'Templates',
    description: 'A technique using solution templates.',
    category: 'Templates',
    difficulty: 'Expert',
    fullDescription: 'A technique that uses templates of possible solutions to make eliminations based on template compatibility.',
    example: 'Using templates of possible solutions to identify incompatible candidates and make eliminations.',
    practiceRoute: '/training/techniques/templates'
  },
  {
    id: 'bug-plus-one',
    name: 'BUG+1',
    description: 'A pattern where almost all cells are bivalue except one.',
    category: 'BUG',
    difficulty: 'Expert',
    fullDescription: 'A pattern where almost all cells contain exactly two candidates (bivalue), except for one cell that contains three candidates. This pattern allows eliminations.',
    example: 'When almost all cells are bivalue except one trivalue cell, eliminations can be made based on the BUG+1 pattern.',
    practiceRoute: '/training/techniques/bug-plus-one'
  },
  {
    id: 'brute-force',
    name: 'Brute Force',
    description: 'Systematic trial and error approach.',
    category: 'Brute Force',
    difficulty: 'Expert',
    fullDescription: 'A systematic approach to trying different values in cells until a contradiction is found or the puzzle is solved.',
    example: 'Systematically trying different values in cells and following the logical consequences until a contradiction is found.',
    practiceRoute: '/training/techniques/brute-force'
  },
  {
    id: 'advanced-coloring',
    name: 'Advanced Coloring',
    description: 'Complex coloring techniques with multiple candidates.',
    category: 'Coloring',
    difficulty: 'Expert',
    fullDescription: 'Advanced coloring techniques that involve multiple candidates and complex color relationships.',
    example: 'Using multiple colors for multiple candidates to create complex elimination patterns.',
    practiceRoute: '/training/techniques/advanced-coloring'
  },
  {
    id: 'chain-coloring',
    name: 'Chain Coloring',
    description: 'Coloring techniques applied to chains.',
    category: 'Coloring',
    difficulty: 'Expert',
    fullDescription: 'Applying coloring techniques to chain structures to find eliminations.',
    example: 'Using colors to represent chain relationships and finding eliminations based on color interactions.',
    practiceRoute: '/training/techniques/chain-coloring'
  },
  {
    id: 'grouped-xy-chain',
    name: 'Grouped XY-Chain',
    description: 'XY-Chain with grouped cells.',
    category: 'Chains',
    difficulty: 'Expert',
    fullDescription: 'An XY-Chain where some of the cells are grouped together, allowing more complex chain structures.',
    example: 'An XY-Chain where multiple cells can be treated as a group, creating more complex elimination patterns.',
    practiceRoute: '/training/techniques/grouped-xy-chain'
  },
  {
    id: 'als-xy-chain',
    name: 'ALS XY-Chain',
    description: 'XY-Chain using Almost Locked Sets.',
    category: 'ALS',
    difficulty: 'Expert',
    fullDescription: 'An XY-Chain that uses Almost Locked Sets instead of individual cells, allowing more complex chain structures.',
    example: 'An XY-Chain where some of the cells are replaced by Almost Locked Sets, creating more powerful elimination patterns.',
    practiceRoute: '/training/techniques/als-xy-chain'
  },
  {
    id: 'complex-wings',
    name: 'Complex Wings',
    description: 'Advanced wing patterns with multiple cells.',
    category: 'Wings',
    difficulty: 'Expert',
    fullDescription: 'Advanced wing patterns that involve more than three cells and complex relationships.',
    example: 'Wing patterns that extend beyond the basic three-cell structure to involve multiple cells and complex elimination patterns.',
    practiceRoute: '/training/techniques/complex-wings'
  },
  {
    id: 'extended-unique-rectangles',
    name: 'Extended Unique Rectangles',
    description: 'Complex unique rectangle patterns.',
    category: 'Unique Patterns',
    difficulty: 'Expert',
    fullDescription: 'Extended unique rectangle patterns that go beyond the basic types to include more complex structures.',
    example: 'Unique rectangle patterns that involve more than four cells or more complex candidate relationships.',
    practiceRoute: '/training/techniques/extended-unique-rectangles'
  }
];

export const getTechniquesByDifficulty = (difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'): Technique[] => {
  return techniques.filter(technique => technique.difficulty === difficulty);
};

export const getTechniquesByCategory = (category: string): Technique[] => {
  return techniques.filter(technique => technique.category === category);
};

export const getTechniqueById = (id: string): Technique | undefined => {
  return techniques.find(technique => technique.id === id);
};

export const categories = [
  'Singles', 
  'Locked Candidates', 
  'Subsets', 
  'Fish', 
  'Wings', 
  'Chains', 
  'Coloring', 
  'ALS', 
  'Unique Patterns', 
  'Templates', 
  'BUG', 
  'Brute Force'
];

export const categoryColors = {
  'Singles': 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200',
  'Locked Candidates': 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
  'Subsets': 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
  'Fish': 'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
  'Wings': 'bg-pink-200 text-pink-800 dark:bg-pink-800 dark:text-pink-200',
  'Chains': 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
  'Coloring': 'bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200',
  'ALS': 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200',
  'Unique Patterns': 'bg-teal-200 text-teal-800 dark:bg-teal-800 dark:text-teal-200',
  'Templates': 'bg-cyan-200 text-cyan-800 dark:bg-cyan-800 dark:text-cyan-200',
  'BUG': 'bg-lime-200 text-lime-800 dark:bg-lime-800 dark:text-lime-200',
  'Brute Force': 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
}; 