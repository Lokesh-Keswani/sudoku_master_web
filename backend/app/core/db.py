import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

class DataBase:
    client: AsyncIOMotorClient = None

db = DataBase()

async def connect_to_mongo():
    try:
        db.client = AsyncIOMotorClient(MONGODB_URL)
        # Test the connection
        await db.client.admin.command('ping')
        print("Successfully connected to MongoDB")
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