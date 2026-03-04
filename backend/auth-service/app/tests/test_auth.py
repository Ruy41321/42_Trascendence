def test_register_success(client):
    #POST /api/v1/auth/register
    response = client.post("/api/v1/auth/register", json = {"username" : "user_test", "email" : "test@test.com", "password" : "testpassword"})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}") 
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@test.com"
    assert "id" in data

def test_register_duplicate_email(client):
    response = client.post("/api/v1/auth/register", json = {"username" : "user_test", "email" : "test@test.com", "password" : "testpassword"})
    assert response.status_code == 201
    response2 = client.post("/api/v1/auth/register", json = {"username" : "user_test2", "email" : "test@test.com", "password" : "testpassword2"})
    data = response2.json()
    assert response2.status_code == 400
    assert data["detail"] == "Email already exists"


def test_login_success(client):
    client.post("/api/v1/auth/register", json = {"username" : "user_test", "email" : "test@test.com", "password" : "testpassword"})
    response = client.post("/api/v1/auth/login", json = {"email" : "test@test.com", "password" : "testpassword"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client):
    response = client.post("/api/v1/auth/register", json = {"username" : "user_test", "email" : "test@test.com", "password" : "testpassword"})
    assert response.status_code == 201
    response = client.post("/api/v1/auth/login", json = {"email" : "test@test.com", "password" : "testwrongpassword"})
    assert response.status_code == 401

def test_get_me_with_token(client):
    client.post("/api/v1/auth/register", json = {"username" : "user_test", "email" : "test@test.com", "password" : "testpassword"})
    login_response = client.post("/api/v1/auth/login", json = {"email" : "test@test.com", "password" : "testpassword"})
    token = login_response.json()["access_token"]
    response = client.get("/api/v1/auth/users/me", headers = {"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "user_test"
    assert data["email"] == "test@test.com"
def test_get_me_without_token(client):
    response = client.get("/api/v1/auth/users/me")
    assert response.status_code == 403  # Forbidden
