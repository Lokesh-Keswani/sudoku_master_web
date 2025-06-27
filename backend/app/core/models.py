from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserInDB(BaseModel):
    id: Optional[str] = Field(alias="_id")
    email: EmailStr
    hashed_password: str
    created_at: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class HistoryCreate(BaseModel):
    puzzle: str
    solution: str
    timestamp: Optional[datetime] = None

class HistoryInDB(BaseModel):
    id: Optional[str] = Field(alias="_id")
    user_id: str
    puzzle: str
    solution: str
    timestamp: datetime 