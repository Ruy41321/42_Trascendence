from app.models.match import Match
from app.models.user import User
from app.models.achievement import Achievement
from app.models.user_achievement import UserAchievement
from app.tests.conftest import local_engine
from sqlalchemy.orm import Session


def _get_token(client, email, password):
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return response.json()["access_token"]


def test_create_match(client, test_db):
    alice = client.post("/api/v1/auth/register", json={"username":"alice","email":"alice@example.com","password":"password123"}).json()
    bob = client.post("/api/v1/auth/register", json={"username":"bob","email":"bob@example.com","password":"password123"}).json()
    token = _get_token(client, "alice@example.com", "password123")

    response = client.post("/api/v1/matches/", json={"player1_id":alice["id"],"player2_id":bob["id"],"winner_id":alice["id"],"score_player1":11,"score_player2":7}, headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 201
    data = response.json()
    assert data["winner_id"] == alice["id"]
    assert data["score_player1"] == 11
    assert data["score_player2"] == 7


def test_wins_losses_update(client, test_db):
    db = Session(bind=local_engine)

    alice = client.post("/api/v1/auth/register", json={"username":"alice","email":"alice@example.com","password":"password123"}).json()
    bob = client.post("/api/v1/auth/register", json={"username":"bob","email":"bob@example.com","password":"password123"}).json()
    token = _get_token(client, "alice@example.com", "password123")

    alice_before = db.query(User).filter(User.id == alice["id"]).first()
    bob_before = db.query(User).filter(User.id == bob["id"]).first()
    assert alice_before.wins == 0
    assert alice_before.losses == 0
    assert bob_before.wins == 0
    assert bob_before.losses == 0

    client.post("/api/v1/matches/", json={"player1_id":alice["id"],"player2_id":bob["id"],"winner_id":alice["id"],"score_player1":11,"score_player2":7}, headers={"Authorization": f"Bearer {token}"})

    db.expire_all()
    alice_after = db.query(User).filter(User.id == alice["id"]).first()
    bob_after = db.query(User).filter(User.id == bob["id"]).first()
    assert alice_after.wins == 1
    assert alice_after.losses == 0
    assert bob_after.wins == 0
    assert bob_after.losses == 1

    db.close()


def test_achievements_unlock(client, test_db):
    db = Session(bind=local_engine)

    alice = client.post("/api/v1/auth/register", json={"username":"alice","email":"alice@example.com","password":"password123"}).json()
    bob = client.post("/api/v1/auth/register", json={"username":"bob","email":"bob@example.com","password":"password123"}).json()
    token = _get_token(client, "alice@example.com", "password123")

    achievement = Achievement(name="First victory",description="Win first game",category="COMBAT")
    db.add(achievement)
    db.commit()
    achievement_id = achievement.id

    client.post("/api/v1/matches/", json={"player1_id":alice["id"],"player2_id":bob["id"],"winner_id":alice["id"],"score_player1":11,"score_player2":7}, headers={"Authorization": f"Bearer {token}"})

    unlocked = db.query(UserAchievement).filter(UserAchievement.user_id == alice["id"],UserAchievement.achievement_id == achievement_id).first()
    assert unlocked is not None
    assert unlocked.achievement_id == achievement_id

    db.close()


def test_get_user_matches(client, test_db):
    alice = client.post("/api/v1/auth/register", json={"username":"alice","email":"alice@example.com","password":"password123"}).json()
    bob = client.post("/api/v1/auth/register", json={"username":"bob","email":"bob@example.com","password":"password123"}).json()
    charlie = client.post("/api/v1/auth/register", json={"username":"charlie","email":"charlie@example.com","password":"password123"}).json()
    token = _get_token(client, "alice@example.com", "password123")

    client.post("/api/v1/matches/", json={"player1_id":alice["id"],"player2_id":bob["id"],"winner_id":alice["id"],"score_player1":11,"score_player2":7}, headers={"Authorization": f"Bearer {token}"})
    client.post("/api/v1/matches/", json={"player1_id":alice["id"],"player2_id":charlie["id"],"winner_id":alice["id"],"score_player1":11,"score_player2":5}, headers={"Authorization": f"Bearer {token}"})

    response = client.get(f"/api/v1/matches/users/{alice['id']}/matches")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_create_match_4_players(client, test_db):
    alice = client.post("/api/v1/auth/register", json={"username":"alice","email":"alice@example.com","password":"password123"}).json()
    bob = client.post("/api/v1/auth/register", json={"username":"bob","email":"bob@example.com","password":"password123"}).json()
    charlie = client.post("/api/v1/auth/register", json={"username":"charlie","email":"charlie@example.com","password":"password123"}).json()
    dave = client.post("/api/v1/auth/register", json={"username":"dave","email":"dave@example.com","password":"password123"}).json()
    token = _get_token(client, "alice@example.com", "password123")

    response = client.post("/api/v1/matches/", json={
        "player1_id":alice["id"],"player2_id":bob["id"],
        "player3_id":charlie["id"],"player4_id":dave["id"],
        "winner_id":alice["id"],
        "score_player1":11,"score_player2":7,"score_player3":5,"score_player4":3
    }, headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 201
    data = response.json()
    assert data["winner_id"] == alice["id"]
    assert data["player3_id"] == charlie["id"]
    assert data["player4_id"] == dave["id"]
    assert data["score_player3"] == 5
    assert data["score_player4"] == 3


def test_create_match_3_players(client, test_db):
    alice = client.post("/api/v1/auth/register", json={"username":"alice","email":"alice@example.com","password":"password123"}).json()
    bob = client.post("/api/v1/auth/register", json={"username":"bob","email":"bob@example.com","password":"password123"}).json()
    charlie = client.post("/api/v1/auth/register", json={"username":"charlie","email":"charlie@example.com","password":"password123"}).json()
    token = _get_token(client, "alice@example.com", "password123")

    response = client.post("/api/v1/matches/", json={
        "player1_id":alice["id"],"player2_id":bob["id"],
        "player3_id":charlie["id"],
        "winner_id":charlie["id"],
        "score_player1":7,"score_player2":5,"score_player3":11
    }, headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 201
    data = response.json()
    assert data["winner_id"] == charlie["id"]
    assert data["player3_id"] == charlie["id"]
    assert data["player4_id"] is None
    assert data["score_player4"] is None


def test_wins_losses_update_multiplayer(client, test_db):
    db = Session(bind=local_engine)

    alice = client.post("/api/v1/auth/register", json={"username":"alice","email":"alice@example.com","password":"password123"}).json()
    bob = client.post("/api/v1/auth/register", json={"username":"bob","email":"bob@example.com","password":"password123"}).json()
    charlie = client.post("/api/v1/auth/register", json={"username":"charlie","email":"charlie@example.com","password":"password123"}).json()
    dave = client.post("/api/v1/auth/register", json={"username":"dave","email":"dave@example.com","password":"password123"}).json()
    token = _get_token(client, "alice@example.com", "password123")

    client.post("/api/v1/matches/", json={
        "player1_id":alice["id"],"player2_id":bob["id"],
        "player3_id":charlie["id"],"player4_id":dave["id"],
        "winner_id":alice["id"],
        "score_player1":11,"score_player2":7,"score_player3":5,"score_player4":3
    }, headers={"Authorization": f"Bearer {token}"})

    db.expire_all()
    alice_after = db.query(User).filter(User.id == alice["id"]).first()
    bob_after = db.query(User).filter(User.id == bob["id"]).first()
    charlie_after = db.query(User).filter(User.id == charlie["id"]).first()
    dave_after = db.query(User).filter(User.id == dave["id"]).first()

    assert alice_after.wins == 1
    assert alice_after.losses == 0
    assert bob_after.wins == 0
    assert bob_after.losses == 1
    assert charlie_after.wins == 0
    assert charlie_after.losses == 1
    assert dave_after.wins == 0
    assert dave_after.losses == 1

    db.close()


def test_get_match_by_id(client, test_db):
    alice = client.post("/api/v1/auth/register", json={"username":"alice","email":"alice@example.com","password":"password123"}).json()
    bob = client.post("/api/v1/auth/register", json={"username":"bob","email":"bob@example.com","password":"password123"}).json()
    token = _get_token(client, "alice@example.com", "password123")

    match_response = client.post("/api/v1/matches/", json={"player1_id":alice["id"],"player2_id":bob["id"],"winner_id":alice["id"],"score_player1":11,"score_player2":7}, headers={"Authorization": f"Bearer {token}"})
    match_id = match_response.json()["id"]

    response = client.get(f"/api/v1/matches/{match_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == match_id
    assert data["winner_id"] == alice["id"]
    assert data["score_player1"] == 11
