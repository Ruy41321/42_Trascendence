from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.config import settings
from app.models.user import User


# HTTPBearer (outil) pour extraire le token du header
#GET /api/v1/users/me
#Headers:
  #Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 #                ↑      ↑
  #            Type    Token JWT
security = HTTPBearer()

def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != settings.API_KEY:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid API key")
    return x_api_key

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session =       Depends(get_db)) -> User:
#Depends, appel automatoqie un fonction qui retourne quelque chose dans une variable avec la var rempli par la method 

    token_decoded = decode_access_token(credentials.credentials)
    if not token_decoded:
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user =  db.query(User).filter(User.id == token_decoded).first()
    if not user:
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
