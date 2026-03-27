from pydantic import BaseModel

class UserStatsResponse(BaseModel):
    user_id: str
    username: str
    wins: int
    losses: int
    total_matches: int
    win_rate: float
