from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo = True, pool_pre_ping=True)
#create engine, cree le moteur sql alchemy
#Echo = true c'est pour afficher les requests Sql dans terminal
#pool pre ping , sqlalchemy envois un petit select1, si la co est est mort il en ouvre une nouvelle 

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
#bind = engine , cette session utilisera ce moteur ( engine) pour parler a la base de donnees


Base = declarative_base()


def init_db():
    from app.models import achievement, match, user, user_achievement

    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
