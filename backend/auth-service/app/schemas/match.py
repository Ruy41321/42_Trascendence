from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

class MatchResult(BaseModel):
    player1_id : str
    player2_id : str
    winner_id : str
    score_player1 : int
    score_player2 : int

class MatchResponse(BaseModel):
    id : str
    player1_id: str
    player2_id: str
    winner_id: str
    score_player1: int
    score_player2: int
    played_at: datetime

    model_config = ConfigDict(from_attributes=True)
