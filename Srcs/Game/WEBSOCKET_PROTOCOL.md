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
```json
{
  "ball": { "x": 400, "y": 300, "vx": 200, "vy": -150, "radius": 8 },
  "players": [
    {
      "id": 0, "side": "left",
      "x": 10, "y": 250, "width": 10, "height": 80,
      "score": 3, "connected": true, "name": "Luigi",
      "input": "UP", "votedToAbandon": false
    }
  ],
  "spectators": [{ "name": "Viewer1" }],
  "status": "playing",
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

- Expected Backend URL: `ws[s]://<host>:<port>` (same host as frontend, port 3000 default)
- On reconnect, client re-sends `joinLobby` with same name to allow session recovery
