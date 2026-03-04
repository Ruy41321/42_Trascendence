from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import create_hashed_password, check_hashed_password, create_access_token

class AuthService:
    def register_user(self, db: Session, user_data: UserCreate) -> User:
        if db.query(User).filter(User.email == user_data.email).first():
            raise ValueError("Email already exists")
        hashed_password_find = create_hashed_password(user_data.password)
        user = User(
                username=user_data.username,
                email=user_data.email,
                hashed_password=hashed_password_find
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def authenticate_user(self, db: Session, email: str, password: str):
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not check_hashed_password(password, user.hashed_password):
            return None
        return user 
    
    def login_user(self, db: Session, email: str, password: str) -> str:
        user = self.authenticate_user(db, email, password)
        if not user:
            raise ValueError("Invalid credentials")
        token = create_access_token(data={"sub": user.id})
        return token
