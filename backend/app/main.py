from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import sudoku

app = FastAPI(
    title="Sudoku Master API",
    description="Backend API for Sudoku Master web application",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:5500", "*"],  # Add all frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sudoku.router, prefix="/api/sudoku", tags=["Sudoku"])

@app.get("/")
async def root():
    return {"message": "Welcome to Sudoku Master API"}