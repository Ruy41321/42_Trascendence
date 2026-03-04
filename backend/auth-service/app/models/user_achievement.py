from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from uuid import uuid4
from datetime import datetime , timezone

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    achievement_id = Column(String(36), ForeignKey("achievements.id"), nullable=False)
    unlocked_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    progress = Column(Integer, default=0)  # Pour tracking progressif
    
    user = relationship("User", back_populates="user_achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")
