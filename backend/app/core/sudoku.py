import numpy as np
from typing import List, Optional, Tuple
import random

class SudokuGenerator:
    def __init__(self, size: int = 9):
        self.size = size
        self.box_size = int(np.sqrt(size))
        
    def generate_puzzle(self, difficulty: str) -> Tuple[List[List[int]], List[List[int]]]:
        """Generate a Sudoku puzzle and its solution."""
        # Generate a solved puzzle
        solution = self._generate_solved_grid()
        
        # Create the puzzle by removing numbers
        cells_to_remove = self._get_cells_to_remove(difficulty)
        puzzle = self._create_puzzle(solution, cells_to_remove)
        
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
    
    def _get_cells_to_remove(self, difficulty: str) -> int:
        """Determine how many cells to remove based on difficulty."""
        difficulty_levels = {
            'easy': 0.4,      # Remove 40% of cells
            'medium': 0.5,    # Remove 50% of cells
            'hard': 0.6,      # Remove 60% of cells
            'expert': 0.7     # Remove 70% of cells
        }
        
        ratio = difficulty_levels.get(difficulty.lower(), 0.5)
        return int(self.size * self.size * ratio)
    
    def _create_puzzle(self, solution: List[List[int]], cells_to_remove: int) -> List[List[int]]:
        """Create a puzzle by removing numbers from the solution."""
        puzzle = [row[:] for row in solution]
        cells = [(i, j) for i in range(self.size) for j in range(self.size)]
        random.shuffle(cells)
        
        for i, j in cells[:cells_to_remove]:
            puzzle[i][j] = 0
            
        return puzzle
    
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

    def get_optimal_moves(self, puzzle: List[List[int]], solution: List[List[int]], limit: int = 3) -> List[dict]:
        """Get a list of optimal moves with explanations."""
        moves = []
        
        # First look for cells that have only one possible value
        for row in range(self.size):
            for col in range(self.size):
                if puzzle[row][col] == 0:
                    possible_values = self._get_possible_values(puzzle, row, col)
                    if len(possible_values) == 1:
                        value = possible_values.pop()
                        moves.append({
                            'row': row,
                            'col': col,
                            'value': value,
                            'reason': f"This cell can only be {value} as all other numbers are used in its row, column, or box",
                            'difficulty': 1
                        })
                        
        # Look for hidden singles in rows, columns, and boxes
        if len(moves) < limit:
            moves.extend(self._find_hidden_singles(puzzle))
            
        # If we still need more moves, look for pairs and triples
        if len(moves) < limit:
            moves.extend(self._find_naked_pairs(puzzle))
            
        # Sort moves by difficulty (easier moves first)
        moves.sort(key=lambda x: x['difficulty'])
        
        # If we still don't have any moves, just give a correct move from the solution
        if not moves:
            empty_cells = [(i, j) for i in range(self.size) for j in range(self.size) if puzzle[i][j] == 0]
            if empty_cells:
                row, col = empty_cells[0]
                moves.append({
                    'row': row,
                    'col': col,
                    'value': solution[row][col],
                    'reason': "This is the correct value for this cell",
                    'difficulty': 3
                })
        
        return moves[:limit]

    def _get_possible_values(self, grid: List[List[int]], row: int, col: int) -> set:
        """Get all possible values for a cell."""
        values = set(range(1, self.size + 1))
        
        # Remove values from same row
        values -= set(grid[row])
        
        # Remove values from same column
        values -= set(grid[i][col] for i in range(self.size))
        
        # Remove values from same box
        box_row, box_col = row - row % self.box_size, col - col % self.box_size
        for i in range(self.box_size):
            for j in range(self.box_size):
                values.discard(grid[box_row + i][box_col + j])
                
        return values

    def _find_hidden_singles(self, grid: List[List[int]]) -> List[dict]:
        """Find cells that are the only possible position for a number in a row, column, or box."""
        moves = []
        
        # Check rows
        for row in range(self.size):
            for value in range(1, self.size + 1):
                possible_cols = []
                for col in range(self.size):
                    if grid[row][col] == 0 and self._is_valid(grid, row, col, value):
                        possible_cols.append(col)
                if len(possible_cols) == 1:
                    moves.append({
                        'row': row,
                        'col': possible_cols[0],
                        'value': value,
                        'reason': f"This is the only cell in row {row + 1} where {value} can be placed",
                        'difficulty': 2
                    })
                    
        # Check columns
        for col in range(self.size):
            for value in range(1, self.size + 1):
                possible_rows = []
                for row in range(self.size):
                    if grid[row][col] == 0 and self._is_valid(grid, row, col, value):
                        possible_rows.append(row)
                if len(possible_rows) == 1:
                    moves.append({
                        'row': possible_rows[0],
                        'col': col,
                        'value': value,
                        'reason': f"This is the only cell in column {col + 1} where {value} can be placed",
                        'difficulty': 2
                    })
        
        return moves

    def _find_naked_pairs(self, grid: List[List[int]]) -> List[dict]:
        """Find naked pairs in rows and columns."""
        moves = []
        
        # Check rows
        for row in range(self.size):
            empty_cells = [(row, col) for col in range(self.size) if grid[row][col] == 0]
            for i, (_, col1) in enumerate(empty_cells):
                poss1 = self._get_possible_values(grid, row, col1)
                if len(poss1) == 2:
                    for _, col2 in empty_cells[i+1:]:
                        poss2 = self._get_possible_values(grid, row, col2)
                        if poss1 == poss2:
                            moves.append({
                                'row': row,
                                'col': col1,
                                'value': min(poss1),
                                'reason': f"Found a naked pair {poss1} in row {row + 1}",
                                'difficulty': 3
                            }) 

    def get_solution_path(self, puzzle: List[List[int]], solution: List[List[int]]) -> List[dict]:
        """Get the complete solution path with explanations for each move."""
        solution_path = []
        current_grid = [row[:] for row in puzzle]
        
        while not self.is_solved(current_grid):
            # Get next best moves using different strategies
            moves = []
            
            # Strategy 1: Single candidates (cells with only one possible value)
            for row in range(self.size):
                for col in range(self.size):
                    if current_grid[row][col] == 0:
                        possible_values = self._get_possible_values(current_grid, row, col)
                        if len(possible_values) == 1:
                            value = possible_values.pop()
                            moves.append({
                                'row': row,
                                'col': col,
                                'value': value,
                                'reason': f"This cell can only be {value} as all other numbers are used in its row, column, or box",
                                'strategy': 'Single Candidate',
                                'difficulty': 1
                            })
            
            # Strategy 2: Hidden singles in rows
            if not moves:
                for row in range(self.size):
                    for value in range(1, self.size + 1):
                        if value not in current_grid[row]:
                            possible_cols = []
                            for col in range(self.size):
                                if current_grid[row][col] == 0 and self._is_valid(current_grid, row, col, value):
                                    possible_cols.append(col)
                            if len(possible_cols) == 1:
                                moves.append({
                                    'row': row,
                                    'col': possible_cols[0],
                                    'value': value,
                                    'reason': f"In row {row + 1}, {value} can only go in this cell",
                                    'strategy': 'Hidden Single in Row',
                                    'difficulty': 2
                                })

            # Strategy 3: Hidden singles in columns
            if not moves:
                for col in range(self.size):
                    col_values = [current_grid[r][col] for r in range(self.size)]
                    for value in range(1, self.size + 1):
                        if value not in col_values:
                            possible_rows = []
                            for row in range(self.size):
                                if current_grid[row][col] == 0 and self._is_valid(current_grid, row, col, value):
                                    possible_rows.append(row)
                            if len(possible_rows) == 1:
                                moves.append({
                                    'row': possible_rows[0],
                                    'col': col,
                                    'value': value,
                                    'reason': f"In column {col + 1}, {value} can only go in this cell",
                                    'strategy': 'Hidden Single in Column',
                                    'difficulty': 2
                                })

            # Strategy 4: Hidden singles in boxes
            if not moves:
                for box in range(self.size):
                    box_row = (box // 3) * 3
                    box_col = (box % 3) * 3
                    box_values = []
                    for i in range(3):
                        for j in range(3):
                            box_values.append(current_grid[box_row + i][box_col + j])
                    
                    for value in range(1, self.size + 1):
                        if value not in box_values:
                            possible_positions = []
                            for i in range(3):
                                for j in range(3):
                                    row = box_row + i
                                    col = box_col + j
                                    if current_grid[row][col] == 0 and self._is_valid(current_grid, row, col, value):
                                        possible_positions.append((row, col))
                            if len(possible_positions) == 1:
                                row, col = possible_positions[0]
                                moves.append({
                                    'row': row,
                                    'col': col,
                                    'value': value,
                                    'reason': f"In box {box + 1}, {value} can only go in this cell",
                                    'strategy': 'Hidden Single in Box',
                                    'difficulty': 2
                                })

            # Strategy 5: Naked Pairs in rows
            if not moves:
                for row in range(self.size):
                    empty_cells = [(row, col) for col in range(self.size) if current_grid[row][col] == 0]
                    for i, (_, col1) in enumerate(empty_cells):
                        poss1 = self._get_possible_values(current_grid, row, col1)
                        if len(poss1) == 2:
                            for _, col2 in empty_cells[i+1:]:
                                poss2 = self._get_possible_values(current_grid, row, col2)
                                if poss1 == poss2:
                                    moves.append({
                                        'row': row,
                                        'col': col1,
                                        'value': min(poss1),
                                        'reason': f"Found a naked pair {poss1} in row {row + 1}",
                                        'strategy': 'Naked Pair',
                                        'difficulty': 3
                                    })

            # If no logical moves found, take the next move from solution
            if not moves:
                for row in range(self.size):
                    for col in range(self.size):
                        if current_grid[row][col] == 0:
                            moves.append({
                                'row': row,
                                'col': col,
                                'value': solution[row][col],
                                'reason': "Next step in the solution",
                                'strategy': 'Solution Step',
                                'difficulty': 4
                            })
                            break
                    if moves:
                        break

            # Apply the best move
            best_move = min(moves, key=lambda x: x['difficulty'])
            current_grid[best_move['row']][best_move['col']] = best_move['value']
            solution_path.append(best_move)

        return solution_path 