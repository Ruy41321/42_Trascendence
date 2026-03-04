from app.models.achievement import Achievement, AchievementCategory
from app.models.user_achievement import UserAchievement

from app.models.achievement import Achievement, AchievementCategory
from app.core.database import Base
from app.tests.conftest import local_engine
from sqlalchemy.orm import Session


def _get_token(client, email, password):
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return response.json()["access_token"]


def test_all_achievements(client, test_db):
    db = Session(bind=local_engine)

    achiev_1 = Achievement(name = "test1 name", description="test1 description", category=AchievementCategory.COMBAT)
    achiev_2 = Achievement(name = "test2_name", description="test2 description", category=AchievementCategory.COMBAT)
    db.add(achiev_1)
    db.add(achiev_2)
    db.commit()
    db.close()
    response = client.get("/api/v1/achievements/")
    assert response.status_code == 200
    data = response.json()
    assert data[0]["name"] == "test1 name"

def test_user_achievements(client, test_db):
    db = Session(bind=local_engine)
    register_response = client.post("/api/v1/auth/register",json={"username" : "testuser", "email" : "test@email.com", "password" : "passtest"})
    user_id = register_response.json()["id"]
    token = _get_token(client, "test@email.com", "passtest")
    achiev_1 = Achievement(name = "test1 name", description="test1 description", category=AchievementCategory.COMBAT)
    achiev_2 = Achievement(name = "test2_name", description="test2 description", category=AchievementCategory.COMBAT)
    db.add(achiev_1)
    db.add(achiev_2)
    db.commit()

    achiev_1_id = achiev_1.id
    achiev_2_id = achiev_2.id

    db.close()

    client.post(f"/api/v1/achievements/users/{user_id}/achievements", json={"achievement_id" : achiev_1_id}, headers={"Authorization": f"Bearer {token}"})
    client.post(f"/api/v1/achievements/users/{user_id}/achievements", json={"achievement_id" : achiev_2_id}, headers={"Authorization": f"Bearer {token}"})

    response = client.get(f"/api/v1/achievements/users/{user_id}/achievements")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_unlock_achievement(client, test_db):
    db = Session(bind=local_engine)
    register_response = client.post("/api/v1/auth/register",json={"username" : "testuser", "email" : "test@email.com", "password" : "passtest"})
    user_id = register_response.json()["id"]
    token = _get_token(client, "test@email.com", "passtest")
    achiev_1 = Achievement(name = "test1 name", description="test1 description", category=AchievementCategory.COMBAT)
    db.add(achiev_1)
    db.commit()
    achiev_1_id = achiev_1.id
    db.close()

    response = client.post(f"/api/v1/achievements/users/{user_id}/achievements", json={"achievement_id" : achiev_1_id}, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    data = response.json()
    assert data["achievement"]["name"] == "test1 name"
    assert data["user_id"] == user_id

def test_unlock_achiev_already_unlocked(client, test_db):
    db = Session(bind=local_engine)
    register_response = client.post("/api/v1/auth/register",json={"username" : "testuser", "email" : "test@email.com", "password" : "passtest"})
    user_id = register_response.json()["id"]
    token = _get_token(client, "test@email.com", "passtest")
    achiev_1 = Achievement(name = "test1 name", description="test1 description", category=AchievementCategory.COMBAT)
    db.add(achiev_1)
    db.commit()
    achiev_1_id = achiev_1.id
    db.close()

    response = client.post(f"/api/v1/achievements/users/{user_id}/achievements", json={"achievement_id" : achiev_1_id}, headers={"Authorization": f"Bearer {token}"})

    response_2 = client.post(f"/api/v1/achievements/users/{user_id}/achievements", json={"achievement_id" : achiev_1_id}, headers={"Authorization": f"Bearer {token}"})
    assert response_2.status_code == 400

def test_unlock_nonexistent_achiev(client, test_db):
    db = Session(bind=local_engine)
    register_response = client.post("/api/v1/auth/register",json={"username" : "testuser", "email" : "test@email.com", "password" : "passtest"})
    user_id = register_response.json()["id"]
    token = _get_token(client, "test@email.com", "passtest")
    achiev_1_id = "00000000-0000-0000-0000-000000000000"
    response = client.post(f"/api/v1/achievements/users/{user_id}/achievements", json={"achievement_id" : achiev_1_id}, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404
    assert "not" in response.json()["detail"].lower()

# === TO-DO 6 : Test unlock nonexistent user ===
# OBJECTIF : Erreur si user n'existe pas
# INDICES :
# - Créer un achievement
# - POST avec user_id bidon
# - assert status_code == 404

def test_unlock_nonexistent_user(client, test_db):
    db = Session(bind=local_engine)
    register_response = client.post("/api/v1/auth/register",json={"username" : "testuser", "email" : "test@email.com", "password" : "passtest"})
    token = _get_token(client, "test@email.com", "passtest")
    user_id = "00000000-0000-0000-0000-000000000000"
    achiev_1 = Achievement(name = "test1 name", description="test1 description", category=AchievementCategory.COMBAT)
    db.add(achiev_1)
    db.commit()
    achiev_1_id = achiev_1.id
    db.close()
    response = client.post(f"/api/v1/achievements/users/{user_id}/achievements", json={"achievement_id" : achiev_1_id}, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404
