from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate,db: Session = Depends(get_db)):
    auth_service = AuthService()
    try:
        user = auth_service.register_user(db, user_data)
        return user
    except ValueError as e:
        raise HTTPException(status_code = 400, detail=str(e))


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    auth_service = AuthService()
    try:
        token = auth_service.login_user(db,credentials.email, credentials.password)
        return Token(access_token = token, token_type = "bearer")
    except ValueError as e:
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED , detail= str(e))

@router.get("/users/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
