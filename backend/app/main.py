import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import sudoku, user
from .core import db as mongo_db

app = FastAPI(
    title="Sudoku Master API",
    description="Backend API for Sudoku Master web application",
    version="1.0.0"
)

# Get allowed origins from environment variable
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,https://your-frontend-domain.vercel.app").split(",")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sudoku.router, prefix="/api/sudoku", tags=["Sudoku"])
app.include_router(user.router, prefix="/api/user", tags=["User"])

@app.get("/api/status")
def status():
    from .core import db as mongo_db
    db_status = mongo_db.db.client is not None
    return {
        "server": "ok",
        "mongodb_connected": db_status
    }

@app.get("/")
def root():
    return {
        "message": "Sudoku Master API",
        "version": "1.0.0",
        "status": "running"
    }

@app.on_event("startup")
async def startup_db_client():
    await mongo_db.connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await mongo_db.close_mongo_connection()