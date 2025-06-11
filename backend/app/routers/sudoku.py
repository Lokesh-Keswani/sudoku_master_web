from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Optional
from pydantic import BaseModel
from ..core.sudoku import SudokuGenerator

router = APIRouter()
generator = SudokuGenerator()

class SudokuMove(BaseModel):
    row: int
    col: int
    value: int

class SudokuPuzzle(BaseModel):
    grid: List[List[int]]
    solution: Optional[List[List[int]]] = None
    difficulty: str

@router.post("/new")
async def new_game(
    data: dict = Body(...),
    size: int = 9
):
    """Generate a new Sudoku puzzle."""
    try:
        difficulty = data.get("difficulty", "medium")
        generator = SudokuGenerator(size)
        puzzle, solution = generator.generate_puzzle(difficulty)
        clue_count = sum(cell != 0 for row in puzzle for cell in row)
        return {
            "grid": puzzle,
            "solution": solution,
            "difficulty": difficulty,
            "size": size,
            "clue_count": clue_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/validate")
async def validate_move(move: SudokuMove, puzzle: SudokuPuzzle):
    """Validate a move in the puzzle."""
    try:
        is_valid = generator.validate_move(
            puzzle.grid,
            move.row,
            move.col,
            move.value
        )
        return {"valid": is_valid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/check-solution")
async def check_solution(puzzle: SudokuPuzzle):
    """Check if the puzzle is solved correctly and return solution path if requested."""
    try:
        is_solved = generator.is_solved(puzzle.grid)
        if not is_solved and puzzle.solution:
            # Get the complete solution path
            solution_path = generator.get_solution_path(puzzle.grid, puzzle.solution)
            return {
                "solved": False,
                "solution_path": solution_path
            }
        return {"solved": is_solved, "solution_path": []}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/hint")
async def get_hint(puzzle: SudokuPuzzle):
    """Get optimal moves with explanations for the next steps."""
    try:
        if not puzzle.solution:
            raise HTTPException(status_code=400, detail="No solution available")
            
        moves = generator.get_optimal_moves(puzzle.grid, puzzle.solution)
        if not moves:
            return {"moves": []}
            
        return {"moves": moves}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 