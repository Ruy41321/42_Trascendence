from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from app.core.database import get_db
from app.schemas.match import MatchResult, MatchResponse
from app.models.match import Match
from app.models.user import User
from app.services.match_service import MatchService
from app.api.deps import get_current_user

router = APIRouter()
match_service = MatchService()

@router.post("/", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
def create_match(
    match_data: MatchResult,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        match = match_service.record_match(db, match_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return (match)

@router.get("/users/{user_id}/matches", response_model=List[MatchResponse])
def get_user_matches(
    user_id: str,
    db: Session = Depends(get_db)
):
    matches = db.query(Match).filter(or_(Match.player1_id == user_id, Match.player2_id == user_id, Match.player3_id == user_id, Match.player4_id == user_id)).all()
    return (matches)


@router.get("/{match_id}", response_model=MatchResponse)
def get_match(match_id: str, db: Session = Depends(get_db)):
    """
    Récupérer les détails d'un match spécifique.
    """
    # TO-DO : Query Match par ID
    # TO-DO : Si pas trouvé, raise HTTPException 404
    # TO-DO : Retourner le match
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code = 404, detail="Match not found")
    return match

