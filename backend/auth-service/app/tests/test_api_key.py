from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, get_db
from app.api.deps import verify_api_key
from app.tests.conftest import local_engine, SessionLocal, API_KEY, API_HEADERS

import pytest

@pytest.fixture()
def raw_client():
    Base.metadata.create_all(bind=local_engine)
    def override_get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    app.dependency_overrides = {get_db: override_get_db}
    yield TestClient(app)
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=local_engine)

def test_request_without_api_key(raw_client):
    response = raw_client.post("/api/v1/auth/register", json={"username": "user_test", "email": "test@test.com", "password": "testpassword"})
    assert response.status_code == 422

def test_request_with_wrong_api_key(raw_client):
    response = raw_client.post("/api/v1/auth/register", json={"username": "user_test", "email": "test@test.com", "password": "testpassword"}, headers={"X-API-Key": "wrong_key"})
    assert response.status_code == 403
    assert response.json()["detail"] == "Invalid API key"

def test_request_with_valid_api_key(raw_client):
    response = raw_client.post("/api/v1/auth/register", json={"username": "user_test", "email": "test@test.com", "password": "testpassword"}, headers=API_HEADERS)
    assert response.status_code == 201

def test_health_check_without_api_key(raw_client):
    response = raw_client.get("/health")
    assert response.status_code == 200
