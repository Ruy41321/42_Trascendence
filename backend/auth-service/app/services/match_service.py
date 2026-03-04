from sqlalchemy.orm import Session
from app.models.match import Match
from app.models.user import User
from app.models.achievement import Achievement
from app.models.user_achievement import UserAchievement
from app.schemas.match import MatchResult

class MatchService:
    def _unlock_achievement_by_wins(self, db: Session, winner: User, wins_required: int, achievement_name: str):
        if winner.wins == wins_required:
            achievement = db.query(Achievement).filter(Achievement.name == achievement_name).first()
            if achievement:
                existing = db.query(UserAchievement).filter(UserAchievement.user_id == winner.id,UserAchievement.achievement_id == achievement.id).first()
                if not existing:
                    unlock = UserAchievement(user_id=winner.id,achievement_id=achievement.id)
                    db.add(unlock)

    def record_match(self, db: Session, match_data: MatchResult) -> Match:
        player1 = db.query(User).filter(User.id == match_data.player1_id).first()
        if not player1:
            raise ValueError("Player 1 not found")
        player2 = db.query(User).filter(User.id == match_data.player2_id).first()
        if not player2:
            raise ValueError("Player 2 not found")
        if match_data.winner_id not in [match_data.player1_id, match_data.player2_id]:
            raise ValueError("Winner must be player 1 or player 2")
        data_dict = match_data.model_dump()
        match = Match(**data_dict)
        db.add(match)
        db.flush()
        if match_data.winner_id == match_data.player1_id:
            winner, loser = player1, player2
        else:
            winner, loser = player2, player1
        winner.wins += 1
        loser.losses += 1
        self._unlock_achievement_by_wins(db, winner, 1, "First victory")
        self._unlock_achievement_by_wins(db, winner, 5, "Five victory")
        self._unlock_achievement_by_wins(db, winner, 10, "Ten victory")
        self._unlock_achievement_by_wins(db, winner, 50, "Fifty victory")
        self._unlock_achievement_by_wins(db, winner, 100, "Hundred victory")
        db.commit()
        db.refresh(match)
        return match
