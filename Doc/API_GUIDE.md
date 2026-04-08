# How It Works - Auth Service API

**Base URL:** `https://localhost:8001/api/v1`

**Swagger docs:** `https://localhost:8001/api/v1/docs`

---

## Getting Started

```bash
# From project root /transcendance
docker compose up --build
```

Backend runs on port **8001**, PostgreSQL on **5433**.

### Seed achievements (run once)

```bash
docker exec -it transcendence_auth python -m app.seed_achievements
```

---

## 1. Authentication

### POST `/auth/register` - Create account

**Request:**
```json
{
  "username": "alessio",
  "email": "alessio@example.com",
  "password": "mypassword"
}
```

**Validation rules:**
- `username`: 3 to 36 characters
- `email`: valid email format
- `password`: minimum 8 characters

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "alessio",
  "email": "alessio@example.com",
  "login_42": null,
  "created_at": "2026-02-09T14:30:00.000000",
  "updated_at": "2026-02-09T14:30:00.000000"
}
```

**Errors:**
- `400`: `"Email already exists"`

---

### POST `/auth/login` - Log in

**Request:**
```json
{
  "email": "alessio@example.com",
  "password": "mypassword"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errors:**
- `401`: `"Invalid credentials"`

---

### GET `/auth/users/me` - Get current user profile (auth required)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "alessio",
  "email": "alessio@example.com",
  "login_42": null,
  "created_at": "2026-02-09T14:30:00.000000",
  "updated_at": "2026-02-09T14:30:00.000000"
}
```

**Errors:**
- `401`: `"Invalid token"` or `"User not found"`
- `403`: `"Not authenticated"` (no token provided)

---

## 2. Matches

### POST `/matches/` - Record a match (auth required)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "player1_id": "player-1-uuid",
  "player2_id": "player-2-uuid",
  "winner_id": "player-1-uuid",
  "score_player1": 11,
  "score_player2": 7
}
```

**What it does automatically:**
- Creates the match in database
- Increments winner's `wins` counter
- Increments loser's `losses` counter
- Unlocks achievements if the winner reaches 1, 5, 10, 50 or 100 wins

**Response (201):**
```json
{
  "id": "match-uuid",
  "player1_id": "player-1-uuid",
  "player2_id": "player-2-uuid",
  "winner_id": "player-1-uuid",
  "score_player1": 11,
  "score_player2": 7,
  "played_at": "2026-02-09T15:00:00.000000"
}
```

**Warning:** `winner_id` must be either `player1_id` or `player2_id`. Both player IDs must exist in the database.

---

### GET `/matches/users/{user_id}/matches` - Get match history for a player

**Response (200):**
```json
[
  {
    "id": "match-uuid",
    "player1_id": "...",
    "player2_id": "...",
    "winner_id": "...",
    "score_player1": 11,
    "score_player2": 7,
    "played_at": "2026-02-09T15:00:00.000000"
  }
]
```

Returns all matches where the user is player1 OR player2.

---

### GET `/matches/{match_id}` - Get match details

**Response (200):** Single match object (same format as above)

**Errors:**
- `404`: `"Match not found"`

---

## 3. Achievements

### GET `/achievements/` - List all achievements

**Response (200):**
```json
[
  {
    "id": "achiev-uuid",
    "name": "First victory",
    "description": "Win first game",
    "icon": null,
    "category": "combat",
    "created_at": "2026-02-09T14:00:00.000000"
  }
]
```

**Available achievements (after seed):**

| Name | Condition |
|------|-----------|
| First victory | 1 win |
| Five victory | 5 wins |
| Ten victory | 10 wins |
| Fifty victory | 50 wins |
| Hundred victory | 100 wins |

---

### GET `/achievements/users/{user_id}/achievements` - Get player achievements

**Response (200):**
```json
[
  {
    "id": "user-achiev-uuid",
    "user_id": "user-uuid",
    "achievement": {
      "id": "achiev-uuid",
      "name": "First victory",
      "description": "Win first game",
      "icon": null,
      "category": "combat",
      "created_at": "2026-02-09T14:00:00.000000"
    },
    "unlocked_at": "2026-02-09T15:30:00.000000",
    "progress": 0
  }
]
```

---

### POST `/achievements/users/{user_id}/achievements` - Unlock an achievement manually (auth required)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "achievement_id": "achiev-uuid"
}
```

**Response (201):** Same format as above (single object)

**Errors:**
- `404`: `"User not found"` or `"Achievement does not exist"`
- `400`: `"Achievement already unlocked"`

**Note:** Achievements also unlock **automatically** when recording a match via POST `/matches/`.

---

## 4. Health Check

### GET `/health` (no /api/v1 prefix)

**URL:** `https://localhost:8001/health`

**Response:**
```json
{
  "message": "Auth Service API",
  "version": "1.0.0",
  "status": "running"
}
```

---

## Frontend Usage Example (fetch)

```javascript
const API = "https://localhost:8001/api/v1";

// 1. Register
const register = await fetch(`${API}/auth/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "alessio",
    email: "alessio@example.com",
    password: "mypassword"
  })
});
const user = await register.json();

// 2. Login -> get the token
const login = await fetch(`${API}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "alessio@example.com",
    password: "mypassword"
  })
});
const { access_token } = await login.json();

// 3. Authenticated call -> my profile
const me = await fetch(`${API}/auth/users/me`, {
  headers: { "Authorization": `Bearer ${access_token}` }
});
const profile = await me.json();

// 4. Record a match (auth required)
const newMatch = await fetch(`${API}/matches/`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${access_token}`
  },
  body: JSON.stringify({
    player1_id: user.id,
    player2_id: "opponent-uuid",
    winner_id: user.id,
    score_player1: 11,
    score_player2: 7
  })
});
const matchData = await newMatch.json();

// 5. Match history
const matches = await fetch(`${API}/matches/users/${user.id}/matches`);
const matchList = await matches.json();

// 6. Player achievements
const achievs = await fetch(`${API}/achievements/users/${user.id}/achievements`);
const achievList = await achievs.json();
```

---

## JWT Token

- **Lifetime:** 30 minutes
- **Algorithm:** HS256
- **Payload:** `{ "sub": "user-uuid", "exp": timestamp }`
- **Header to send:** `Authorization: Bearer <token>`
- When the token expires, the frontend must call `/auth/login` again
