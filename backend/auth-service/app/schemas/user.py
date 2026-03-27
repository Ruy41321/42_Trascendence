from pydantic import BaseModel, ConfigDict, Field, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=36)
    email: EmailStr
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    login_42: Optional[str] = None
    username: str
    email: str
    wins: int
    losses: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=36)
    email: Optional[EmailStr] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
