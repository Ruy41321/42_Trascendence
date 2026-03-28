from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.stats import UserStatsResponse
from app.models.user import User

router = APIRouter()

@router.get("/{user_id}", response_model=UserStatsResponse)
def get_user_stats(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    total = user.wins + user.losses
    win_rate = round((user.wins / total) * 100, 1) if total > 0 else 0.0
    return UserStatsResponse(
        user_id=user.id,
        username=user.username,
        wins=user.wins,
        losses=user.losses,
        total_matches=total,
        win_rate=win_rate,
    )
