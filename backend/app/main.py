import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import sudoku
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="Sudoku Master API",
    description="Backend API for Sudoku Master web application",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:5500",
        "http://localhost:8000",
        "https://lokesh-keswani.github.io",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sudoku.router, prefix="/api/sudoku", tags=["Sudoku"])

# Serve static files from the frontend directory
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend"))
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="static")