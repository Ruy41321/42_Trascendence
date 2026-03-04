from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
#schemes = bcrypt  == utilise bcrypt pour hash les mdp
#depecated = auto == si hash utilise un algo ancien ou not recommanded/obsolet , considere le comme depetrecie

def create_hashed_password(password: str)->str:
    return pwd_context.hash(password)

def check_hashed_password(input_password: str, hashed_password: str)->bool:
    return pwd_context.verify(input_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp" : expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm = settings.ALGORITHM)
    return encoded_jwt

#
def decode_access_token(token:str)->Optional[str]:
    try:
        payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
                )
        user_id: str = payload.get("sub")
        return user_id
    except JWTError:
        return None

