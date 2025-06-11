import numpy as np
from typing import List, Optional, Tuple, Dict, Set
import random
from itertools import combinations

class SudokuGenerator:
    def __init__(self, size: int = 9):
        self.size = size
        self.box_size = int(np.sqrt(size))
        self.difficulty_map = {
            'easy':   {'score': 1, 'clues': (36, 49)},
            'medium': {'score': 2, 'clues': (32, 35)},
            'hard':   {'score': 3, 'clues': (28, 31)},
            'expert': {'score': 4, 'clues': (17, 27)},
            'master': {'score': 5, 'clues': (17, 27)}
        }
        
    def generate_puzzle(self, difficulty: str) -> Tuple[List[List[int]], List[List[int]]]:
        """Generate a Sudoku puzzle and its solution based on logical difficulty."""
        solution = self._generate_solved_grid()
        puzzle = self._create_puzzle(solution, difficulty)
        return puzzle, solution
    
    def _generate_solved_grid(self) -> List[List[int]]:
        """Generate a completely solved Sudoku grid."""
        # Initialize empty grid
        grid = [[0 for _ in range(self.size)] for _ in range(self.size)]
        
        # Fill the grid
        self._fill_grid(grid)
        
        return grid
    
    def _fill_grid(self, grid: List[List[int]], row: int = 0, col: int = 0) -> bool:
        """Recursively fill the grid using backtracking."""
        if col >= self.size:
            row += 1
            col = 0
        
        if row >= self.size:
            return True
            
        if grid[row][col] != 0:
            return self._fill_grid(grid, row, col + 1)
            
        numbers = list(range(1, self.size + 1))
        random.shuffle(numbers)
        
        for num in numbers:
            if self._is_valid(grid, row, col, num):
                grid[row][col] = num
                if self._fill_grid(grid, row, col + 1):
                    return True
                grid[row][col] = 0
                
        return False
    
    def _is_valid(self, grid: List[List[int]], row: int, col: int, num: int) -> bool:
        """Check if a number can be placed in the given position."""
        # Check row
        if num in grid[row]:
            return False
            
        # Check column
        if num in [grid[i][col] for i in range(self.size)]:
            return False
            
        # Check box
        box_row, box_col = row - row % self.box_size, col - col % self.box_size
        for i in range(self.box_size):
            for j in range(self.box_size):
                if grid[box_row + i][box_col + j] == num:
                    return False
                    
        return True
    
    def _create_puzzle(self, solution: List[List[int]], difficulty: str) -> List[List[int]]:
        """Create a puzzle by removing numbers until it reaches a target difficulty."""
        puzzle = [row[:] for row in solution]
        cells = list(np.ndindex(self.size, self.size))
        random.shuffle(cells)
        
        target = self.difficulty_map.get(difficulty.lower(), self.difficulty_map['medium'])
        min_clues, max_clues = target['clues']
        target_clues = random.randint(min_clues, max_clues)
        
        clues = self.size * self.size
        
        for r, c in cells:
            if clues <= target_clues:
                break 
            
            temp_val = puzzle[r][c]
            puzzle[r][c] = 0
            clues -= 1
            
            puzzle_copy = [row[:] for row in puzzle]
            if self._count_solutions(puzzle_copy) != 1:
                puzzle[r][c] = temp_val
                clues += 1
        
        return puzzle

    def _find_empty(self, grid: List[List[int]]) -> Optional[Tuple[int, int]]:
        """Find an empty cell in the grid."""
        for i in range(self.size):
            for j in range(self.size):
                if grid[i][j] == 0:
                    return (i, j)
        return None

    def _count_solutions_recursive(self, grid: List[List[int]], count: list):
        """Recursively count solutions using backtracking."""
        if count[0] > 1: # Optimization: stop if more than one solution is found
            return

        empty = self._find_empty(grid)
        if not empty:
            count[0] += 1
            return

        row, col = empty
        numbers_to_try = list(range(1, self.size + 1))
        random.shuffle(numbers_to_try)
        for num in numbers_to_try:
            if self._is_valid(grid, row, col, num):
                grid[row][col] = num
                self._count_solutions_recursive(grid, count)
                if count[0] > 1:
                    grid[row][col] = 0 # Backtrack before returning
                    return
                grid[row][col] = 0 # Backtrack

    def _count_solutions(self, grid: List[List[int]]) -> int:
        """Wrapper to count the number of solutions for a grid."""
        count = [0]
        self._count_solutions_recursive(grid, count)
        return count[0]
    
    def validate_move(self, grid: List[List[int]], row: int, col: int, num: int) -> bool:
        """Validate if a move is legal."""
        # Create a temporary grid
        temp_grid = [row[:] for row in grid]
        temp_grid[row][col] = 0  # Remove the number to check against itself
        
        return self._is_valid(temp_grid, row, col, num)
    
    def is_solved(self, grid: List[List[int]]) -> bool:
        """Check if the puzzle is solved correctly."""
        # Check if grid is complete
        if any(0 in row for row in grid):
            return False
            
        # Check all rows, columns and boxes
        for i in range(self.size):
            # Check rows
            if set(grid[i]) != set(range(1, self.size + 1)):
                return False
                
            # Check columns
            col = [grid[j][i] for j in range(self.size)]
            if set(col) != set(range(1, self.size + 1)):
                return False
                
            # Check boxes
            box_row = (i // self.box_size) * self.box_size
            box_col = (i % self.box_size) * self.box_size
            box = []
            for j in range(self.box_size):
                for k in range(self.box_size):
                    box.append(grid[box_row + j][box_col + k])
            if set(box) != set(range(1, self.size + 1)):
                return False
                
        return True
    
    def get_hint(self, puzzle: List[List[int]], solution: List[List[int]]) -> Optional[Tuple[int, int, int]]:
        """Get a hint for the next move."""
        moves = self.get_optimal_moves(puzzle, solution)
        if not moves:
            return None
        # Return the first optimal move
        best_move = moves[0]
        return (best_move['row'], best_move['col'], best_move['value'])

    def get_solution_path(self, puzzle: List[List[int]], solution: List[List[int]]) -> List[dict]:
        assessment = self._solve_and_assess(puzzle)
        path = assessment['path']
        
        if not assessment['solved']: # Solver got stuck, fill rest from solution
            grid = [row[:] for row in puzzle]
            for move in path:
                grid[move['row']][move['col']] = move['value']
            
            for r in range(self.size):
                for c in range(self.size):
                    if grid[r][c] == 0:
                        path.append({
                            'row': r, 'col': c, 'value': solution[r][c],
                            'strategy': 'Forced Move', 'difficulty': 5,
                            'reason': 'Completing puzzle from solution.'
                        })
        
        return path 

    def get_optimal_moves(self, puzzle: List[List[int]], solution: List[List[int]], limit: int = 3) -> List[dict]:
        assessment = self._solve_and_assess(puzzle)
        path = assessment['path']
        
        if not path and not assessment['solved']: # If solver gets stuck, use solution
            empty_cells = []
            for r in range(self.size):
                for c in range(self.size):
                    if puzzle[r][c] == 0:
                        empty_cells.append((r,c))
            if empty_cells:
                r, c = random.choice(empty_cells)
                return [{
                    'row': r, 'col': c, 'value': solution[r][c],
                    'reason': "This is the correct value for this cell",
                    'difficulty': 5
                }]
        
        return path[:limit]

    def _get_candidates(self, grid: List[List[int]]) -> Dict[Tuple[int, int], Set[int]]:
        candidates = {}
        for r in range(self.size):
            for c in range(self.size):
                if grid[r][c] == 0:
                    possible = set(range(1, self.size + 1))
                    # Row
                    possible -= set(grid[r])
                    # Col
                    possible -= set(grid[i][c] for i in range(self.size))
                    # Box
                    box_r, box_c = r // self.box_size * self.box_size, c // self.box_size * self.box_size
                    possible -= set(grid[br][bc] for br in range(box_r, box_r + self.box_size) for bc in range(box_c, box_c + self.box_size))
                    candidates[(r, c)] = possible
        return candidates
    
    def _apply_move(self, grid, candidates, r, c, val):
        grid[r][c] = val
        if (r,c) in candidates:
            del candidates[(r, c)]
        
        # Eliminate from row
        for col in range(self.size):
            if (r, col) in candidates:
                candidates[(r, col)].discard(val)

        # Eliminate from col
        for row in range(self.size):
            if (row, c) in candidates:
                candidates[(row, c)].discard(val)
        
        # Eliminate from box
        box_r, box_c = r // self.box_size * self.box_size, c // self.box_size * self.box_size
        for br in range(box_r, box_r + self.box_size):
            for bc in range(box_c, box_c + self.box_size):
                if (br, bc) in candidates:
                    candidates[(br, bc)].discard(val)

    def _find_naked_singles(self, candidates):
        singles = []
        for (r, c), possible in list(candidates.items()):
            if len(possible) == 1:
                val = possible.pop()
                singles.append((r, c, val))
                # Add it back for iteration safety, it will be removed by _apply_move
                candidates[(r,c)] = {val}
        return singles
    
    def _find_hidden_singles(self, candidates):
        singles = []
        # Rows, Cols, Boxes
        for i in range(self.size):
            # Row
            row_counts = {num: [] for num in range(1, 10)}
            # Col
            col_counts = {num: [] for num in range(1, 10)}
            # Box
            box_r, box_c = (i // 3) * 3, (i % 3) * 3
            box_counts = {num: [] for num in range(1, 10)}
            
            for j in range(self.size):
                # Row Check
                if (i, j) in candidates:
                    for num in candidates[(i,j)]:
                        row_counts[num].append((i,j))
                # Col Check
                if (j, i) in candidates:
                    for num in candidates[(j,i)]:
                        col_counts[num].append((j,i))
                # Box Check
                r, c = box_r + j // 3, box_c + j % 3
                if (r, c) in candidates:
                    for num in candidates[(r,c)]:
                        box_counts[num].append((r,c))

            for counts in [row_counts, col_counts, box_counts]:
                for num, cells in counts.items():
                    if len(cells) == 1:
                        r, c = cells[0]
                        # Make sure it's not already a naked single
                        if len(candidates.get((r,c), set())) > 1:
                            # Check if not already found
                            if not any(s[0] == r and s[1] == c for s in singles):
                                singles.append((r, c, num))
        
        return singles

    def _naked_pairs(self, candidates):
        made_change = False
        units = []
        # Rows, Cols, Boxes
        for i in range(self.size):
            units.append([(i, c) for c in range(self.size)])
            units.append([(r, i) for r in range(self.size)])
            box_r, box_c = (i // 3) * 3, (i % 3) * 3
            units.append([(box_r + r, box_c + c) for r in range(3) for c in range(3)])

        for unit in units:
            cells_in_unit = [cell for cell in unit if cell in candidates]
            pairs = [cell for cell in cells_in_unit if len(candidates[cell]) == 2]
            
            for c1, c2 in combinations(pairs, 2):
                if candidates[c1] == candidates[c2]:
                    pair_vals = candidates[c1]
                    for cell_to_clean in cells_in_unit:
                        if cell_to_clean not in [c1, c2]:
                            original_len = len(candidates[cell_to_clean])
                            candidates[cell_to_clean] -= pair_vals
                            if len(candidates[cell_to_clean]) != original_len:
                                made_change = True
        return made_change
    
    def _pointing_line(self, candidates):
        made_change = False
        for i in range(self.size): # Iterate through boxes
            box_r, box_c = (i // 3) * 3, (i % 3) * 3
            box_cells = [(box_r + r, box_c + c) for r in range(3) for c in range(3) if (box_r + r, box_c + c) in candidates]
            
            for num in range(1, 10):
                num_cells = [cell for cell in box_cells if num in candidates[cell]]
                if len(num_cells) > 1:
                    # Check if they are all in the same row
                    if all(c[0] == num_cells[0][0] for c in num_cells):
                        row = num_cells[0][0]
                        for col in range(self.size):
                            if col // 3 != box_c // 3: # Outside the box
                                if (row, col) in candidates and num in candidates[(row, col)]:
                                    candidates[(row, col)].discard(num)
                                    made_change = True
                    # Check if they are all in the same col
                    if all(c[1] == num_cells[0][1] for c in num_cells):
                        col = num_cells[0][1]
                        for row in range(self.size):
                           if row // 3 != box_r // 3: # Outside the box
                               if (row, col) in candidates and num in candidates[(row, col)]:
                                   candidates[(row, col)].discard(num)
                                   made_change = True
        return made_change

    def _box_line_reduction(self, candidates):
        made_change = False
        for i in range(self.size): # Iterate through rows and cols
            # Row
            row_cells = [(i, c) for c in range(self.size) if (i, c) in candidates]
            # Col
            col_cells = [(r, i) for r in range(self.size) if (r, i) in candidates]

            for unit in [row_cells, col_cells]:
                for num in range(1, 10):
                    num_cells = [cell for cell in unit if num in candidates[cell]]
                    if len(num_cells) > 1:
                        # Check if they are all in same box
                        box_idx = (num_cells[0][0] // 3, num_cells[0][1] // 3)
                        if all((c[0] // 3, c[1] // 3) == box_idx for c in num_cells):
                            box_r, box_c = box_idx[0] * 3, box_idx[1] * 3
                            for r in range(box_r, box_r + 3):
                                for c in range(box_c, box_c + 3):
                                    if (r, c) in candidates and (r,c) not in num_cells:
                                        if num in candidates[(r,c)]:
                                            candidates[(r,c)].discard(num)
                                            made_change = True
        return made_change 

    def _solve_and_assess(self, puzzle: List[List[int]]):
        grid = [row[:] for row in puzzle]
        candidates = self._get_candidates(grid)
        path = []
        max_difficulty = 0

        while True:
            solved_cells_this_turn = []
            
            # --- Technique 1: Naked/Hidden Singles (Difficulty 1) ---
            singles = self._find_naked_singles(candidates)
            if not singles:
                singles = self._find_hidden_singles(candidates)

            if singles:
                max_difficulty = max(max_difficulty, 1)
                for r, c, val in singles:
                    if grid[r][c] == 0: # Ensure not already processed
                        path.append({'row': r, 'col': c, 'value': val, 'strategy': 'Single', 'difficulty': 1})
                        self._apply_move(grid, candidates, r, c, val)
                        solved_cells_this_turn.append((r,c,val))
                if solved_cells_this_turn:
                    continue

            # --- Technique 2: Naked Pairs (Difficulty 2) ---
            if self._naked_pairs(candidates):
                max_difficulty = max(max_difficulty, 2)
                continue

            # --- Technique 3: Pointing/Reduction (Difficulty 3) ---
            if self._pointing_line(candidates) or self._box_line_reduction(candidates):
                max_difficulty = max(max_difficulty, 3)
                continue
            
            break # No more techniques can be applied

        is_solved = not self._find_empty(grid)
        if not is_solved:
             max_difficulty = 5 # Needs backtracking or harder techniques

        return {"path": path, "max_difficulty": max_difficulty, "solved": is_solved} 