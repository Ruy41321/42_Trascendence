from fastapi import APIRouter
from app.api.v1.endpoints import auth, achievements, matches  # ← Ajoute matches

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(achievements.router, prefix="/achievements", tags=["Achievements"])
api_router.include_router(matches.router, prefix="/matches", tags=["Matches"])
