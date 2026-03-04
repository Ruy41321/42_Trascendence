import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.models.user import User
from sqlalchemy.pool import StaticPool

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
local_engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread":False},poolclass=StaticPool)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind= local_engine)
Base.metadata.create_all(bind=local_engine)

@pytest.fixture()
def test_db():
    Base.metadata.create_all(bind=local_engine)
    def override_get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=local_engine)

@pytest.fixture()
def client(test_db):
    return TestClient(app)
