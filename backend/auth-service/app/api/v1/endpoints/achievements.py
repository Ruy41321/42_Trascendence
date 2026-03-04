from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.achievement import AchievementResponse, UserAchievementResponse
from app.models.achievement import Achievement
from app.models.user_achievement import UserAchievement
from app.models.user import User
from app.api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter()

@router.get("/", response_model=List[AchievementResponse])
def get_achievements(db:Session = Depends(get_db)):
    achievements = db.query(Achievement).all()
    return achievements

@router.get("/users/{user_id}/achievements", response_model=List[UserAchievementResponse])
def get_user_achievements(user_id: str, db:Session = Depends(get_db)):
    user_achievements = db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()
    return user_achievements

class UnlockAchievementRequest(BaseModel):
    achievement_id : str

@router.post("/users/{user_id}/achievements", response_model=UserAchievementResponse, status_code = 201)
def post_user_achievement(user_id: str, request: UnlockAchievementRequest, current_user: User = Depends(get_current_user), db:Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code = 404, detail = "User not found")
    achievement_exist = db.query(Achievement).filter(Achievement.id == request.achievement_id).first()
    if achievement_exist is None:
        raise HTTPException(status_code = 404, detail = "Achievement does not exist")
    achievement_available = db.query(UserAchievement).filter(UserAchievement.user_id == user_id, UserAchievement.achievement_id == request.achievement_id).first()
    if achievement_available is not None:
        raise HTTPException(status_code=400, detail="Achievement already unlocked")
    user_achievement = UserAchievement( user_id = user_id, achievement_id = request.achievement_id)
    db.add(user_achievement)
    db.commit()
    db.refresh(user_achievement)
    
    return user_achievement
