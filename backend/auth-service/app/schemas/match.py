from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

class MatchResult(BaseModel):
    player1_id : str
    player2_id : str
    player3_id : Optional[str] = None
    player4_id : Optional[str] = None
    winner_id : str
    score_player1 : int
    score_player2 : int
    score_player3 : Optional[int] = None
    score_player4 : Optional[int] = None

class MatchResponse(BaseModel):
    id : str
    player1_id: str
    player2_id: str
    player3_id: Optional[str] = None
    player4_id: Optional[str] = None
    winner_id: str
    score_player1: int
    score_player2: int
    score_player3: Optional[int] = None
    score_player4: Optional[int] = None
    played_at: datetime

    model_config = ConfigDict(from_attributes=True)
