# Copilot Instructions: Pew Pew Game Development

## Overview

This document contains essential guidelines for GitHub Copilot and all developers working on the **Pew Pew** multiplayer game project. Follow these instructions to maintain code quality, consistency, and alignment with project architecture.

---

## Language & Localization

### Golden Rule: English Only

**ALL code, comments, variable names, function names, and UI text MUST be in English.**

✅ **CORRECT:**
```gdscript
# Player movement speed
var movement_speed: float = 200.0

func handle_input() -> void:
    var input_direction = Input.get_vector("move_left", "move_right", "move_up", "move_down")
    velocity = input_direction * movement_speed
```

❌ **WRONG:**
```gdscript
# Velocità del giocatore
var velocita_movimento: float = 200.0

func gestisci_input() -> void:
    var direzione_input = Input.get_vector("sinistra", "destra", "su", "giu")
    velocita = direzione_input * velocita_movimento
```

### UI Text

All UI labels, buttons, and messages must be in English:
- "Create Lobby" (not "Crea Lobby")
- "Add NPC" (not "Aggiungi NPC")
- "Start Game" (not "Inizia Partita")
- Kill notifications: "Luigi defeated Alex" (not "Luigi ha sconfitto Alex")

---

## Architecture & Design Patterns

### Client-Server Model

The game uses **server-authoritative architecture**:

1. **Client (Godot):** Handles input, local prediction, rendering
2. **Server (Backend):** Authoritative game state, input validation, physics, NPC AI
3. **Communication:** WebSocket with 30 Hz state sync

**Never:**
- Send game logic decisions to client (e.g., "did this shot hit?")
- Trust client input without validation
- Implement physics locally without server confirmation

**Always:**
- Validate all player input on server before applying
- Send authoritative game state from server to all clients
- Use client prediction for responsiveness, but reconcile with server truth

### Client Prediction & Reconciliation Pattern

Local player movement should predict ahead; remote players interpolate from server updates.

```gdscript
# Local Player (Client-Side Prediction)
var predicted_position: Vector2 = position
var last_server_position: Vector2 = position

func update_local_prediction(input: InputState) -> void:
    predicted_position += input.movement * movement_speed * delta
    # Render using predicted_position

func on_server_state_received(server_pos: Vector2) -> void:
    # Reconcile: smooth correction toward server truth
    var difference = server_pos.distance_to(predicted_position)
    if difference > 5:  # Noticeable mismatch
        predicted_position = predicted_position.lerp(server_pos, 0.2)  # Smooth blend
    else:
        predicted_position = server_pos
```

### WebSocket Integration Pattern

All network communication goes through a centralized WebSocket client manager:

```gdscript
# NetworkManager.gd (Singleton)
extends Node

var socket: WebSocketPeer
var is_connected: bool = false

func _ready() -> void:
    socket = WebSocketPeer.new()
    socket.connect_to_url("wss://game-server.example.com/ws")

func send_message(type: String, data: Dictionary) -> void:
    if not is_connected:
        return
    var message = {"type": type, "timestamp": Time.get_ticks_msec()}
    message.merge(data)
    socket.send_text(JSON.stringify(message))

func _process(_delta: float) -> void:
    socket.poll()
    while socket.get_ready_state() == WebSocketPeer.STATE_OPEN:
        var message = socket.get_message()
        if message:
            on_message_received(JSON.parse_string(message))
```

---

## Godot Project Structure

Maintain this folder hierarchy:

```
Srcs/Game/Pew-pew/
├── Scenes/
│   ├── Main/
│   │   └── Main.tscn              # Main entry point
│   ├── UI/
│   │   ├── LobbyMenu.tscn         # Lobby browser and creation
│   │   ├── GameHUD.tscn           # In-game HUD (kill counter, timer)
│   │   └── WinScreen.tscn         # Match end screen
│   ├── Game/
│   │   ├── GameScene.tscn         # Main game arena
│   │   ├── Map.tscn               # Map with cover objects
│   │   ├── Player.tscn            # Player character
│   │   ├── NPC.tscn               # NPC character
│   │   └── Projectile.tscn        # (Optional) Projectile entity
│   └── Entities/
│       ├── Cover.tscn             # Static cover object
│       └── SpawnPoint.tscn        # (Invisible) spawn marker
├── Scripts/
│   ├── Managers/
│   │   ├── GameManager.gd         # Game loop, match state
│   │   ├── NetworkManager.gd      # WebSocket connection and messaging
│   │   ├── PlayerManager.gd       # Track all players (real + NPC)
│   │   └── LobbyManager.gd        # Lobby state management
│   ├── Player/
│   │   ├── PlayerController.gd    # Local player movement and aiming
│   │   ├── RemotePlayer.gd        # Render remote player updates
│   │   └── PlayerModel.gd         # Data class for player state
│   ├── NPC/
│   │   ├── NPCController.gd       # (Client-side) Render NPC movements
│   │   └── NPCAIBehavior.gd       # (Server-side) NPC logic
│   ├── Game/
│   │   ├── MapController.gd       # Map boundaries and cover collision
│   │   └── GameState.gd           # Track game state (kills, timer, etc.)
│   └── Utils/
│       ├── Constants.gd           # Game constants (speeds, durations)
│       ├── InputHandler.gd        # Centralized input handling
│       └── Logger.gd             # Logging utility
├── Assets/
│   ├── Sprites/
│   │   ├── player.png
│   │   ├── npc.png
│   │   ├── cover.png
│   │   └── ...
│   ├── Audio/
│   │   ├── gunfire.ogg
│   │   ├── hit.ogg
│   │   └── ...
│   └── UI/
│       ├── fonts/
│       └── icons/
├── project.godot                  # Godot project config
└── README.md                       # Project setup instructions
```

### Scene Organization Rules

1. **One Scene = One Responsibility**
   - `Player.tscn`: Only player sprite, collision, animations
   - `PlayerController.gd`: Movement, aiming, input logic
   - Don't mix rendering and game logic in scenes

2. **Node Naming Convention**
   - Use descriptive names: `Player`, `Crosshair`, `HealthBar` (not `Node2D`, `Sprite`, etc.)
   - Prefix invisible nodes: `_SpawnPoint`, `_CollisionArea`
   - Prefix internal nodes: `_Body`, `_Visual` (for organization)

3. **Signal Usage**
   - Emit signals for important events: `player_moved`, `player_fired`, `player_died`
   - Never call methods across scene boundaries directly; use signals or a central manager

---

## Code Style & Conventions

### GDScript Standards

**Language:** GDScript (Godot 4.5+)

**Formatting:**
- 4-space indentation (never tabs)
- Line length: max 100 characters
- Blank line between functions

**Naming:**
```gdscript
# Classes (PascalCase)
class PlayerState:
    pass

# Functions and variables (snake_case)
func handle_player_input() -> void:
    var movement_speed: float = 200.0
    
# Constants (UPPER_SNAKE_CASE)
const MAX_PLAYER_COUNT: int = 4
const NETWORK_TICK_RATE_HZ: int = 30
```

**Type Hints (Always):**
```gdscript
# ✅ CORRECT
func update_position(delta: float) -> void:
    position += velocity * delta

var player_count: int = 0
var spawn_points: Array[Vector2] = []

# ❌ WRONG (missing type hints)
func update_position(delta):
    position += velocity * delta

var player_count = 0
var spawn_points = []
```

**Comments:**
```gdscript
# Use comments for "why", not "what"
func calculate_damage(distance: float) -> float:
    # Damage falls off with distance squared (balances close-range effectiveness)
    return BASE_DAMAGE / (distance * distance)
    
# ❌ Avoid obvious comments:
func calculate_damage(distance: float) -> float:
    return BASE_DAMAGE / (distance * distance)  # divide by distance squared
```

### Network Message Handling

```gdscript
# Use match statements for message types
func on_network_message(message: Dictionary) -> void:
    match message.get("type"):
        "game_state":
            on_game_state_received(message)
        "fire_event":
            on_fire_event_received(message)
        "kill_event":
            on_kill_event_received(message)
        _:
            Logger.warning("Unknown message type: %s" % message.get("type"))
```

### Physics & Collision

```gdscript
# Use meaningful layer/mask names (via Project Settings → Physics)
# Layers: PLAYER, ENEMY, NPC, COVER, PROJECTILE, WORLD

# Collision detection pattern
func detect_hit(fire_position: Vector2, fire_angle: float) -> bool:
    var space_state = get_world_2d().direct_space_state
    var query = PhysicsRayQueryParameters2D.create(fire_position, fire_position + Vector2.from_angle(fire_angle) * MAX_RANGE)
    query.collision_mask = 1 << LAYER_ENEMY | 1 << LAYER_NPC
    var result = space_state.intersect_ray(query)
    return result != null
```

---

## Network Protocol Integration

### WebSocket Message Format

All messages must match the spec in [Doc/network-protocol.md](../../Doc/network-protocol.md).

```gdscript
# Example: Send player input
func send_player_input(movement: Vector2, aim_angle: float, fire: bool) -> void:
    var message = {
        "type": "player_input",
        "gameId": current_game_id,
        "playerId": local_player_id,
        "tick": current_server_tick,
        "inputSequence": input_sequence_counter,
        "input": {
            "movement": {"x": movement.x, "y": movement.y},
            "aimAngle": aim_angle,
            "fire": fire
        },
        "timestamp": Time.get_ticks_msec()
    }
    NetworkManager.send_message(message)
```

### State Update Handling

```gdscript
# On receiving game state from server
func on_game_state_received(state: Dictionary) -> void:
    current_server_tick = state.get("serverTick")
    remaining_time_ms = state.get("remainingTime")
    
    # Update all players (including local player for reconciliation)
    for player_data in state.get("players", []):
        update_player_entity(player_data)
    
    # Process events (fires, kills, respawns)
    for event in state.get("events", []):
        on_game_event(event)
```

---

## NPC AI (Server-Side)

NPCs run exclusively on the server and synchronize like regular players via game state messages.

**Server-Side NPC Controller (Backend):**
```pseudocode
class NPCController:
    def update(game_state):
        # Find nearest enemy
        nearest_enemy = find_nearest_player(game_state)
        if nearest_enemy:
            # Aim toward enemy
            aim_angle = calculate_angle_to(nearest_enemy.position)
            
            # Move toward enemy at 60% of player speed
            direction = normalize(nearest_enemy.position - self.position)
            self.velocity = direction * BASE_SPEED * 0.6
            
            # Shoot if facing enemy and cooldown expired
            if abs(difference_angle(aim_angle, self.rotation)) < 10:
                if time_since_last_shot > FIRE_COOLDOWN:
                    fire_weapon()
                    time_since_last_shot = 0
```

**Client-Side NPC Rendering (Godot):**
```gdscript
# Just render the NPC using server state; no local simulation
func update_npc_from_server(npc_data: Dictionary) -> void:
    npc.position = Vector2(npc_data["position"]["x"], npc_data["position"]["y"])
    npc.rotation = npc_data["rotation"]
    npc.is_alive = npc_data["health"] > 0
```

---

## Performance & Optimization

### Client Prediction Budget

- **Prediction Window:** 50-100ms (tunable per network conditions)
- **Never predict:** Opponent movement, NPC behavior, hit detection (server-only)
- **Always predict:** Local player movement, aim angle

### Memory Management

```gdscript
# Use object pooling for frequent allocations
var bullet_pool: Array[Node2D] = []

func fire_weapon() -> void:
    var bullet = get_from_pool()
    if bullet == null:
        bullet = Projectile.new()  # Create if pool empty
    bullet.initialize(position, rotation)
    # Return to pool when done (signals, etc.)
```

### Network Bandwidth Targets

- **Per-Client Input:** ~100 bytes × 60 fps = 6 KB/s (batched to 30 Hz = 3 KB/s)
- **Per-Client State:** ~200 bytes × 30 Hz = 6 KB/s
- **Total Bidirectional:** ~12 KB/s per client (acceptable on residential internet)

### Frame Rate

- **Target:** 60 FPS client-side (local prediction must be smooth)
- **Network Tick:** 30 Hz (server broadcasts state updates)
- **Server Simulation:** 30-60 Hz (dependent on load)

---

## Testing & Debugging

### Local Testing

1. **Single-Player Testing:**
   ```
   Run local Godot instance (no network).
   Verify movement, aiming, shooting, respawn.
   Check kill counter and timer.
   ```

2. **Mock Server Testing:**
   ```
   Use mock WebSocket messages to simulate server state.
   Test client prediction and reconciliation.
   Verify HUD updates.
   ```

3. **Multiplayer Testing:**
   ```
   Connect 2-4 local clients to dev server.
   Verify all clients see identical state.
   Test latency compensation (use proxy to add network delay).
   ```

### Debugging Checklist

- [ ] **Console Errors:** No errors in browser console or Godot output
- [ ] **Network Traffic:** Inspect WebSocket messages in browser DevTools
- [ ] **Desynchronization:** All players see same kills, scores, player positions
- [ ] **Latency:** Measure round-trip time (RTT) and ensure sub-100ms
- [ ] **Client Prediction:** Verify no rubber-banding or jitter
- [ ] **NPC Behavior:** NPCs move smoothly, target correctly, shoot on cue

### Logging

```gdscript
# Use Logger utility for debugging
Logger.info("Player joined: %s" % player_name)
Logger.warning("High latency detected: %d ms" % ping_ms)
Logger.error("Failed to hit server: %s" % error_message)

# Never use print() directly (use Logger instead)
```

---

## Integration Points

### With Backend Team (Abdallah & Tobia)

**Handoff Points:**
1. **Lobby Messages:** Godot sends/receives lobby JSON per [network-protocol.md](../../Doc/network-protocol.md)
2. **Game State:** Server broadcasts state; Godot renders it
3. **Match Results:** Backend calls `/api/game/result` with final scores
4. **NPC AI:** Server simulates; Godot only renders

**Communication:**
- Use #backend-integration channel for questions
- Weekly sync on API changes
- Document any message format changes

### With Frontend Team (Alessio)

**Handoff Points:**
1. **Lobby UI:** Frontend displays lobby list; Godot loads from API
2. **Game Launch:** Frontend hands off to Godot WebGL build
3. **Stats/Leaderboards:** Frontend queries API after game ends

---

## Common Pitfalls & Solutions

| Pitfall | Problem | Solution |
|---------|---------|----------|
| **Client-side hit detection** | Unfair; favors high-ping players | Server validates all shots; client gets instant feedback |
| **No server validation** | Players can cheat | Validate movement speed, fire rate, position on server |
| **Blocking network calls** | UI freezes | Use async coroutines; never block on socket.send() |
| **Desynchronization** | Players see different state | Send full state every tick; log state mismatches |
| **Over-predicting** | Rubber-banding on reconciliation | Keep prediction window ≤100ms; reconcile smoothly |
| **NPC in client code** | Hard to balance, not synced | Keep NPC logic on server only; client just renders |
| **Hard-coded values** | Difficult to tune | Use Constants.gd for all game parameters |

---

## Checklist Before Submitting Code

- [ ] **Language:** All code/comments/UI in English
- [ ] **Type Hints:** All variables and function returns have types
- [ ] **No Console Errors:** Run in Godot and browser; fix all warnings
- [ ] **Formatting:** 4-space indent, max 100 chars per line
- [ ] **Naming:** Variables snake_case, constants UPPER_SNAKE_CASE
- [ ] **Comments:** "Why" not "what"; meaningful and sparse
- [ ] **Architecture:** Client doesn't run game logic; server does
- [ ] **Network Messages:** Match spec in [network-protocol.md](../../Doc/network-protocol.md)
- [ ] **Tested:** Manual test in single-player, then multiplayer if applicable
- [ ] **No Secrets:** No API keys, passwords, or internal IPs in code

---

## Resources & References

- **Game Design:** [Doc/game-design.md](../../Doc/game-design.md)
- **Network Protocol:** [Doc/network-protocol.md](../../Doc/network-protocol.md)
- **Backend API:** [Doc/backend-api.md](../../Doc/backend-api.md)
- **Development Plan:** [Doc/development-plan.md](../../Doc/development-plan.md)
- **Godot Docs:** https://docs.godotengine.org/en/stable/
- **GDScript Docs:** https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/index.html

---

## Questions & Support

- **Game Design Questions:** Check [game-design.md](../../Doc/game-design.md) or ask Luigi
- **Network Protocol Questions:** Check [network-protocol.md](../../Doc/network-protocol.md) or ask backend team
- **Godot/Code Questions:** Ask Luigi or check Godot documentation
- **Team Communication:** #pew-pew-dev channel

---

**Version:** 1.0  
**Last Updated:** January 13, 2026  
**Maintained By:** Luigi (Game Lead)
