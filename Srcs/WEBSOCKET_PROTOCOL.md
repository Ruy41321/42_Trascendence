# WebSocket Protocol – Pong 4-Player

All messages are JSON: `{ "type": "<type>", "payload": { ... } }`

---

## Client → Server

| Type | Payload | When |
|------|---------|------|
| `joinLobby` | `{ "playerName": "Luigi" }` | Player wants to enter lobby |
| `spectate` | `{ "name": "Luigi" }` *(optional)* | Join as spectator |
| `startGame` | `{ "vsAI": true/false }` | Request game start from lobby |
| `move` | `{ "direction": "UP"\|"DOWN"\|null, "inputId": 0 }` | Player input during gameplay |
| `voteAbandon` | `{}` | Vote to abandon current game |
| `restartGame` | `{}` | Request restart after game over |

### `move` details
- `direction`: `"UP"`, `"DOWN"`, or `null` (stop)
- `inputId`: integer, starts at `0`, increments by `1` for each input sent
- **Resets to `0`** when game status transitions to `playing`

---

## Server → Client

| Type | Payload | Frequency |
|------|---------|-----------|
| `lobbyJoined` | `{ "name": "Luigi" }` | Once, after successful join |
| `lobbyUpdate` | `{ "players": [...], "spectators": [...], "canStart": bool }` | On lobby change |
| `playerAssigned` | `{ "playerId": 0, "side": "left", "name": "Luigi", "roomId": "...", "gameStatus": "..." }` | At game start / reconnect |
| `spectatorAssigned` | `{ "name": "Luigi" }` | When spectator enters |
| `gameState` | *see below* | Every tick (~60fps, 16.6ms) |
| `gameEvent` | `{ "type": "score"\|"gameOver"\|"gameStart"\|"gameAbandoned"\|"gameReset"\|"playerReconnected", "data": {...} }` | On special events |
| `error` | `{ "message": "...", "code": "NAME_TAKEN" }` | On errors |

### `gameState` payload (serialized)

> **Note:** all coordinates and velocities are **normalized (0.0–1.0)**.
> The frontend multiplies by canvas width/height (800×600) to get pixels.
> Ball velocity is per-tick (1/60s); the frontend converts to pixels/sec for interpolation.

```json
{
  "ball": { "x": 0.5, "y": 0.5, "vx": 0.008, "vy": 0.004, "radius": 0.013 },
  "players": [
    {
      "id": 0, "side": "left",
      "x": 0.02, "y": 0.435, "width": 0.015, "height": 0.13,
      "score": 3, "connected": true, "name": "Luigi",
      "lastProcessedInputId": 42, "votedToAbandon": false
    }
  ],
  "spectators": [{ "name": "Viewer1" }],
  "status": "playing",
  "winner": null,
  "activePlayerCount": 2,
  "tick": 1234
}
```
  "winner": null,
  "activePlayerCount": 2,
  "tick": 1234
}
```

### `gameEvent` examples
```json
{ "type": "gameEvent", "payload": { "type": "score", "data": { "missedSide": "left", "scoringPlayers": [...] } } }
{ "type": "gameEvent", "payload": { "type": "gameOver", "data": { "winner": 0, "finalScores": [...] } } }
{ "type": "gameEvent", "payload": { "type": "gameStart", "data": { "playerCount": 2 } } }
{ "type": "gameEvent", "payload": { "type": "gameAbandoned", "data": { "reason": "..." } } }
{ "type": "gameEvent", "payload": { "type": "gameReset" } }
```

---

## Connection

- Backend URL: `ws[s]://<host>/ws` — served by FastAPI via uvicorn
- Frontend connects through `wss://localhost/ws` in the production stack
- On reconnect, client re-sends `joinLobby` with same name to allow session recovery
