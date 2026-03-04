from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class AchievementResponse(BaseModel):
    id : str
    name : str
    description : str
    icon : Optional[str] = None
    category : str
    created_at : datetime
    model_config = ConfigDict(from_attributes=True)

class UserAchievementResponse(BaseModel):
    id : str
    user_id : str
    achievement : AchievementResponse
    unlocked_at : datetime
    progress : int = 0
    model_config = ConfigDict(from_attributes=True)
