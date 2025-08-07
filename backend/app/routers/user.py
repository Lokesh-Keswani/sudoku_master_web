from fastapi import APIRouter, HTTPException, Depends, status, Request, Body
from ..core.models import UserCreate, UserLogin, HistoryCreate
from ..core.db import db
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
import os
from typing import Optional
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId

router = APIRouter()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

security = HTTPBearer()

def get_current_user_or_guest(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        email = payload.get("email")
        is_guest = payload.get("guest", False)
        if is_guest:
            return {"user_id": "guest", "email": None, "guest": True}
        if user_id is None or email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"user_id": user_id, "email": email, "guest": False}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/signup")
async def signup(user: UserCreate):
    if not db.client:
        raise HTTPException(status_code=503, detail="Database not available")
    users_collection = db.client["sudoku_master"]["users"]
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    user_doc = {
        "email": user.email,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow()
    }
    await users_collection.insert_one(user_doc)
    return {"msg": "User registered successfully"}

@router.post("/login")
async def login(user: UserLogin):
    if not db.client:
        raise HTTPException(status_code=503, detail="Database not available")
    users_collection = db.client["sudoku_master"]["users"]
    user_doc = await users_collection.find_one({"email": user.email})
    if not user_doc:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    if not verify_password(user.password, user_doc["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = create_access_token(
        data={"sub": str(user_doc["_id"]), "email": user_doc["email"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/guest")
async def guest_login():
    """Allow a guest user to get a guest token."""
    access_token = create_access_token(
        data={"sub": "guest", "email": None, "guest": True},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer", "guest": True}

@router.post("/history")
async def save_history(history: HistoryCreate, user=Depends(get_current_user_or_guest)):
    if user.get("guest"):
        raise HTTPException(status_code=403, detail="Guest users cannot save history.")
    if not db.client:
        raise HTTPException(status_code=503, detail="Database not available")
    history_collection = db.client["sudoku_master"]["history"]
    doc = {
        "user_id": user["user_id"],
        "puzzle": history.puzzle,
        "solution": history.solution,
        "timestamp": history.timestamp or datetime.utcnow()
    }
    await history_collection.insert_one(doc)
    return {"msg": "History saved"}

@router.get("/history")
async def get_history(user=Depends(get_current_user_or_guest)):
    if user.get("guest"):
        raise HTTPException(status_code=403, detail="Guest users have no history.")
    if not db.client:
        raise HTTPException(status_code=503, detail="Database not available")
    history_collection = db.client["sudoku_master"]["history"]
    cursor = history_collection.find({"user_id": user["user_id"]})
    history_list = []
    async for item in cursor:
        item["id"] = str(item["_id"])
        del item["_id"]
        history_list.append(item)
    return {"history": history_list}

@router.get("/profile")
async def get_profile(user=Depends(get_current_user_or_guest)):
    if user.get("guest"):
        raise HTTPException(status_code=403, detail="Guest users have no profile.")
    if not db.client:
        raise HTTPException(status_code=503, detail="Database not available")
    users_collection = db.client["sudoku_master"]["users"]
    user_doc = await users_collection.find_one({"_id": ObjectId(user["user_id"])})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "email": user_doc["email"],
        "created_at": user_doc["created_at"]
    }

@router.put("/profile")
async def update_profile(
    email: str = Body(None),
    password: str = Body(None),
    user=Depends(get_current_user_or_guest)
):
    if user.get("guest"):
        raise HTTPException(status_code=403, detail="Guest users cannot update profile.")
    if not db.client:
        raise HTTPException(status_code=503, detail="Database not available")
    users_collection = db.client["sudoku_master"]["users"]
    update_data = {}
    if email:
        update_data["email"] = email
    if password:
        update_data["hashed_password"] = get_password_hash(password)
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    result = await users_collection.update_one(
        {"_id": ObjectId(user["user_id"])},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Update failed")
    return {"msg": "Profile updated"} 