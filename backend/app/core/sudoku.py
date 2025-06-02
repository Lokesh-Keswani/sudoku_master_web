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
        empty_cells = [
            (i, j) for i in range(self.size) 
            for j in range(self.size) 
            if puzzle[i][j] == 0
        ]
        
        if not empty_cells:
            return None
            
        # Return a random empty cell and its solution
        row, col = random.choice(empty_cells)
        return (row, col, solution[row][col]) 