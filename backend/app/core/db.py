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
    db.client = AsyncIOMotorClient(MONGODB_URL)

async def close_mongo_connection():
    db.client.close()

# Note: Create a .env file in your backend directory with:
# MONGODB_URL=your_mongodb_atlas_url
# JWT_SECRET_KEY=your_secret_key 