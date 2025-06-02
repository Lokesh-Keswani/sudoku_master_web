from fastapi import APIRouter, HTTPException, Depends
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
async def new_game(difficulty: str = "medium", size: int = 9):
    """Generate a new Sudoku puzzle."""
    try:
        generator = SudokuGenerator(size)
        puzzle, solution = generator.generate_puzzle(difficulty)
        return {
            "grid": puzzle,
            "solution": solution,
            "difficulty": difficulty,
            "size": size
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
    """Check if the puzzle is solved correctly."""
    try:
        is_solved = generator.is_solved(puzzle.grid)
        return {"solved": is_solved}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/hint")
async def get_hint(puzzle: SudokuPuzzle):
    """Get a hint for the next move."""
    try:
        if not puzzle.solution:
            raise HTTPException(status_code=400, detail="No solution available")
            
        hint = generator.get_hint(puzzle.grid, puzzle.solution)
        if hint is None:
            return {"hint": None}
            
        row, col, value = hint
        return {
            "hint": {
                "row": row,
                "col": col,
                "value": value
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 