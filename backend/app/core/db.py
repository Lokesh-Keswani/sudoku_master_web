import os
import asyncio
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

class DataBase:
    client: MongoClient = None
    
    def __init__(self):
        self.client = None
        self.db = None

db = DataBase()

async def connect_to_mongo():
    try:
        # Create a new client and connect to the server
        db.client = MongoClient(MONGODB_URL, server_api=ServerApi('1'))
        # Send a ping to confirm a successful connection
        db.client.admin.command('ping')
        print("Successfully connected to MongoDB")
        db.db = db.client.get_database('sudoku_master')
    except Exception as e:
        print(f"Warning: Could not connect to MongoDB: {e}")
        print("The application will start but database features may not work")
        db.client = None

async def close_mongo_connection():
    if db.client:
        db.client.close()

# Note: Create a .env file in your backend directory with:
# MONGODB_URL=your_mongodb_atlas_url
# JWT_SECRET_KEY=your_secret_key 