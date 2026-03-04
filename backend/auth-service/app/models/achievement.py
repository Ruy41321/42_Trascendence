from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime, timezone
from uuid import uuid4
import enum

class AchievementCategory(str, enum.Enum):
    COMBAT = "combat"

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), nullable=False)
    icon = Column(String(255), nullable=True)
    category = Column(Enum(AchievementCategory), nullable=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    user_achievements = relationship("UserAchievement", back_populates="achievement")
