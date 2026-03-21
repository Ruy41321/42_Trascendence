from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from uuid import uuid4
from datetime import datetime, timezone


class Match(Base):
    __tablename__ = "matches"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    player1_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    player2_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    player3_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    player4_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    winner_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    score_player1 = Column(Integer, nullable=False)
    score_player2 = Column(Integer, nullable=False)
    score_player3 = Column(Integer, nullable=True)
    score_player4 = Column(Integer, nullable=True)
    played_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    # Relations vers User
    player1 = relationship("User", foreign_keys=[player1_id], backref="matches_as_player1")
    player2 = relationship("User", foreign_keys=[player2_id], backref="matches_as_player2")
    player3 = relationship("User", foreign_keys=[player3_id], backref="matches_as_player3")
    player4 = relationship("User", foreign_keys=[player4_id], backref="matches_as_player4")
    winner = relationship("User", foreign_keys=[winner_id], backref="matches_won")
