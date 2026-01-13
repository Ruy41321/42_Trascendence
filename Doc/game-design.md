# Pew Pew - Game Concept

## Overview

**Game:** Top-down 2D multiplayer shooter (2-4 players + NPCs)  
**Win Condition:** First to 10 kills OR highest kills after 2 minutes  
**Core Gameplay:** WASD movement, mouse aiming, click to shoot (hitscan)

---

## Game Loop

1. **Join/Create Lobby** - Players create lobbies (named after creator) or join existing ones
2. **Add NPCs** - Optional: add NPC bots (max 4 total: players + NPCs)
3. **Start Game** - Owner starts when 2+ players present
4. **Combat** - Players move around map, aim with mouse, shoot to eliminate opponents
5. **Respawn** - Eliminated players respawn after 2 seconds at random spawn point
6. **Win** - Match ends when someone reaches 10 kills OR 2 minutes expire
7. **Return to Lobby** - Game ends, scores displayed, players return to menu

---

## Controls

| Input | Action |
|-------|--------|
| **WASD** | Move up/left/down/right |
| **Mouse** | Aim direction |
| **Left Click** | Fire weapon |

---

## Game Mechanics

### Movement
- Smooth movement in all directions (diagonal allowed)
- Can't move through solid cover objects or map boundaries
- Movement speed: constant (no acceleration)

### Combat
- **Weapon:** Hitscan (instant hit, no projectiles)
- **Aiming:** Mouse cursor direction shows aim
- **Fire Rate:** 10 shots/second (0.1s cooldown per shot)
- **Hit Detection:** Server validates all shots (fair for all players)
- **Visual Feedback:** Client shows instant muzzle flash (server confirms kill after)

### Health & Respawn
- **Health:** 1 HP (instant death on hit)
- **Respawn Time:** 2 seconds
- **Respawn Location:** Random from 4-6 spawn points around map
- **Safety:** 1 second invulnerability after respawn (visual effect: flashing player)
- **Weapon Reset:** Full ammo on respawn

### Kill Tracking
- Kill counter visible: "Kills: X/10"
- Kill notification shown to all: "PlayerA defeated PlayerB"
- First to 10 wins immediately
- If 2 minutes expires: highest kill count wins

---

## Lobby System

### Creating/Joining Lobbies

1. **Create:** Player enters name → click "Create Lobby" → lobby created (named after player)
2. **Join:** Player clicks "Browse Lobbies" → sees list of available lobbies → clicks "Join"
3. **Manage:** Players in lobby see who's there, owner can "Add NPC" or "Start Game"
4. **Max 4:** Lobby has max 4 total (players + NPCs combined)
5. **Min 2:** Game requires at least 2 players to start (NPCs count as players)

### Lobby UI

```
Available Lobbies:
  • Luigi's Lobby (1/4 players) [JOIN]
  • Alex's Arena (3/4 players) [JOIN]
  • Speed Run (4/4 players) [FULL]

In Lobby View:
  Players: Luigi (Owner) | Alex | NPC_Bot_1
  Total: 3/4
  [Add NPC] [Start Game] [Leave]
```

---

## NPC AI

### Behavior
- **Movement:** Move toward nearest player at 60% of player speed
- **Targeting:** Aim at nearest visible player
- **Shooting:** Fire automatically when facing target
- **Respawn:** Respawn like regular players (no visual distinction)
- **Sync:** Server controls NPC, sends position/rotation/health to all clients

### Difficulty
- Default: Medium (reasonable AI, not overpowered)
- Clients don't know if enemy is NPC or real player (identical treatment)

---

## Map Layout

### Size & Design
- **Size:** 800x600 pixels (top-down view)
- **Spawn Points:** 4-6 locations spread across map
- **Cover Objects:** 3-5 boxes/walls for tactical positioning
- **Boundaries:** Solid walls at edges (players can't leave)

### Example Layout
```
[Spawn]          [Spawn]
   |               |
   | [Cover] [Cover]
   |    |       |
[Spawn]---------[Spawn]
   |    |       |
   | [Cover] [Cover]
   |               |
```

---

## Scoring & Win Conditions

### Scoring
- **Kill:** +1 kill for hitting opponent with hitscan shot
- **No Assists:** Single-hit kills only
- **Visible:** Kill counter shown on HUD ("Kills: 3/10")
- **Notifications:** "PlayerA defeated PlayerB" announced to all

### Win Conditions
- **Primary:** First player to 10 kills wins match immediately
- **Secondary:** If 2 minutes elapsed, player with highest kill count wins
- **Minimum Players:** Match requires at least 2 participants (can include NPCs)

### Match End Screen
```
MATCH END
🏆 WINNER: Luigi (10 kills)

Scores:
  1. Luigi: 10 kills
  2. Alex: 7 kills
  3. NPC_Bot_1: 5 kills

[Return to Menu]
```

---

## Technical Specs

### Architecture
- **Model:** Client-Server (server authoritative)
- **Network:** WebSocket, 30 Hz updates
- **Client Prediction:** Local player predicts 50-100ms ahead, server confirms
- **Language:** All code/comments/UI in English only

### Performance
- **Client FPS:** 60 frames/second (smooth rendering)
- **Network Tick:** 30 Hz (state broadcast every ~33ms)
- **Bandwidth:** ~12 KB/s per player
- **Latency Tolerance:** Up to 200ms playable

### Browser
- Chrome, Firefox, Safari, Edge (latest versions)
- Responsive design, no plugins needed

---

## Game Mechanics

### Player Controls

| Control | Action |
|---------|--------|
| **W/A/S/D** | Move up/left/down/right |
| **Mouse Position** | Aim direction |
| **Left Click / Space** | Fire weapon in aimed direction |
| **E (optional)** | Interact (future: pick up items) |

### Movement

- **Speed:** Consistent movement velocity in all directions (WASD input mapped to velocity vector)
- **Acceleration:** Instant response to input (no acceleration ramp for simplicity)
- **Constraints:** Movement limited to map boundaries, collides with solid cover objects
- **Diagonal Movement:** Allowed and unrestricted (D+W = move diagonally northeast)

### Aiming & Shooting

- **Aiming:** Mouse cursor position determines direction; visual indicator (crosshair or weapon barrel) shows aim direction
- **Weapon Type:** Hitscan (instant-hit raycast) for simplicity and responsiveness
  - Alternative (not initial): Projectile-based with travel time (future expansion)
- **Fire Rate:** 10 shots per second (0.1s cooldown between shots) per player
- **Hit Detection:** Server-authoritative; client sends fire input, server validates trajectory and processes hits
- **Instant Feedback:** Client shows fired projectile/muzzle flash immediately; server confirms or denies hit

### Health & Respawn

- **Health:** 1 HP per player (instant kill on hit)
- **Respawn Mechanics:**
  - 2-second delay before respawn
  - Respawn location: Random from spawn point pool (distributed across map)
  - Respawn safety: 1-second invulnerability (visual indicator: player flashing/shield)
  - Weapon reset: Full ammo on respawn

### Kill Tracking & Scoring

- **Kill Credit:** Awarded to player who fired the final hit
- **Assists:** Not tracked (single-hit kills)
- **Display:** Kill counter visible on HUD (top-right: "Kills: X/10")
- **Kill Notifications:** Broadcast to all players when kill occurs (`PlayerA killed PlayerB`)

### Win Conditions

- **Primary:** First to 10 kills wins the match
- **Secondary:** If time limit (2 minutes) expires, highest kill count wins
- **Minimum Players:** Game requires minimum 2 participants (real players or NPCs)
- **Match End:** Game freezes, displays winner, shows final scores, returns to menu after 3-5 seconds or manual action

---

## Map Design

### Layout

- **Size:** 800x600 pixels (adjustable for performance)
- **Perspective:** Top-down orthogonal view
- **Visual Style:** Simple geometric shapes, pixel art or flat colors (minimize asset load for web)

### Environmental Elements

- **Spawn Points:** 4-6 distributed across map (corners + mid-arena)
- **Cover Objects:** Static obstacles (walls, boxes, pillars) that block movement and projectiles
  - Distributed to encourage tactical positioning
  - Examples: 3-5 cover zones per match
- **Boundaries:** Solid walls at map edges (player cannot leave bounds)
- **Background:** Simple color or grid (no dynamic effects initially)

### Example Map Layout

```
[Player Spawn] ─────────────────────── [Player Spawn]
      │                                       │
      │    [Cover Box]  [Cover Box]          │
      │         │              │              │
      ├─────────┼──────────────┼──────────────┤
      │         │              │              │
      │    [Center Arena]                     │
      │         │              │              │
      ├─────────┼──────────────┼──────────────┤
      │         │              │              │
      │    [Cover Box]  [Cover Box]          │
      │         │              │              │
[Player Spawn] ─────────────────────── [Player Spawn]
```

---

## NPC (AI) System

### NPC Role

- NPCs fill empty player slots in lobbies (max 4 total: players + NPCs combined)
- NPCs are indistinguishable from players in-game (same rendering, same mechanics)
- Server controls NPC behavior; clients receive NPC state updates identical to player updates

### NPC Behavior

**AI State Machine:**

1. **Idle/Patrol:** If no enemy detected, move randomly or follow predefined patrol path
2. **Targeting:** Upon detecting nearest visible enemy:
   - Calculate direction to enemy
   - Rotate aim toward enemy
   - Fire if enemy in line of sight
3. **Dodging (Optional):** Simple evasion if AI health low (rare for 1-HP game)
4. **Respawn:** Respawn at random spawn point after elimination (same as players)

**Targeting Logic:**
- **Enemy Detection:** Scan all players (real + NPC) within line of sight
- **Target Selection:** Acquire nearest enemy by distance
- **Fire Decision:** Fire automatically when target in crosshair for 0.5+ seconds
- **Movement:** Move toward target at 60% of player speed (tunable for difficulty)

**Difficulty Tuning (Future):**
- **Easy:** 50% accuracy, slower movement, longer fire delay
- **Medium (Default):** 70% accuracy, normal movement, standard fire rate
- **Hard:** 90% accuracy, faster movement, increased fire rate

Initial implementation: **Medium difficulty only**

### NPC Synchronization

- NPC state updated every 30 Hz network tick (same as player updates)
- Server broadcasts NPC position, rotation, health, fire events to all clients
- Clients render NPCs identically to real players with no AI-specific indicators (no labels or visual distinction)

---

## Lobby System

### Lobby Workflow

1. **Lobby Creation:**
   - Player enters name → click "Create Lobby"
   - Lobby created with player as owner
   - Lobby named after creator (e.g., "Luigi's Lobby")
   - Lobby appears in public list with player count

2. **Lobby Browsing:**
   - Players see list of active lobbies with player count (e.g., "1/4 players")
   - Click lobby to request join
   - Owner can accept/deny join (or auto-accept for simplicity)

3. **Lobby Management:**
   - Owner (creator) has "Add NPC" and "Start Game" buttons
   - Other players see read-only view with "Leave Lobby" button
   - "Add NPC" button disabled when 4 total entities reached
   - "Start Game" button enabled when 2+ players present

4. **Game Start:**
   - Owner clicks "Start Game"
   - All clients load game scene
   - Match begins with countdown (3-2-1-GO or instant)

### Lobby UI Elements

**Lobby List Screen:**
```
┌─────────────────────────────────────────────┐
│  Pew Pew - Browse Lobbies                   │
├─────────────────────────────────────────────┤
│ [Create Lobby]  [Refresh List]              │
├─────────────────────────────────────────────┤
│ Lobby Name (Creator)      | Players | Join  │
├─────────────────────────────────────────────┤
│ Luigi's Lobby             | 1/4     | [JOIN]│
│ Alex's Arena              | 2/4     | [JOIN]│
│ Speed Run                 | 4/4     | [FULL]│
├─────────────────────────────────────────────┤
│ [Back to Menu]                              │
└─────────────────────────────────────────────┘
```

**In-Lobby Screen (Owner View):**
```
┌─────────────────────────────────────────────┐
│  Pew Pew - Lobby: Luigi's Lobby             │
├─────────────────────────────────────────────┤
│ Players in Lobby:                           │
│  1. Luigi (Owner)                           │
│  2. Alex                                    │
│  3. NPC_Bot_1                               │
│                                             │
│ Total: 3/4 Players                          │
├─────────────────────────────────────────────┤
│ [Add NPC]           [Start Game]            │
├─────────────────────────────────────────────┤
│ [Leave Lobby]                               │
└─────────────────────────────────────────────┘
```

**In-Lobby Screen (Non-Owner View):**
```
┌─────────────────────────────────────────────┐
│  Pew Pew - Lobby: Luigi's Lobby             │
├─────────────────────────────────────────────┤
│ Players in Lobby:                           │
│  1. Luigi (Owner)                           │
│  2. Alex                                    │
│  3. NPC_Bot_1                               │
│                                             │
│ Total: 3/4 Players                          │
│ Waiting for owner to start...               │
├─────────────────────────────────────────────┤
│ [Leave Lobby]                               │
└─────────────────────────────────────────────┘
```

---

## In-Game UI

### HUD Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Kills: 3/10                    Time: 1:45                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                        GAME ARENA                           │
│                       (800x600)                             │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Players: Luigi (3) | Alex (2) | NPC_Bot_1 (1)             │
└─────────────────────────────────────────────────────────────┘
```

**HUD Elements:**
- **Top-Left:** Kill counter (current/target: "Kills: 3/10")
- **Top-Right:** Match timer (countdown from 2:00)
- **Bottom:** Player list with current kill counts (updates in real-time)
- **Center (Crosshair):** Aiming indicator (stays centered, shows aimed direction)

### Kill Notifications

- When kill occurs: Broadcast message to all players
- Format: `[PlayerA] defeated [PlayerB]` or similar
- Display: 2-second popup notification in center-top or chat area
- Log: Last 5 kills shown in scrolling list (optional)

---

## Win Screen

**Match End Trigger:**
- First player reaches 10 kills, OR
- 2-minute timer expires

**Win Screen Display:**
```
┌─────────────────────────────────────────────┐
│         MATCH END                           │
├─────────────────────────────────────────────┤
│ 🏆 WINNER: Luigi (10 kills)                 │
├─────────────────────────────────────────────┤
│ Final Scores:                               │
│  1. Luigi           10 kills                │
│  2. Alex             7 kills                │
│  3. NPC_Bot_1        5 kills                │
│  4. (empty)                                 │
├─────────────────────────────────────────────┤
│ [Return to Menu]  [Play Again]              │
│ (Auto-return in 5 seconds...)               │
└─────────────────────────────────────────────┘
```

---

## Assets & Art Direction

### Minimalist Approach (Web-Friendly)

- **Player Character:** Simple colored circle or square (16x16 pixels)
- **Weapon/Crosshair:** Line indicating aim direction or simple crosshair (+)
- **Projectiles:** If used, small circles or lines (hitscan = instant)
- **Cover Objects:** Rectangles, varied colors for visual distinction
- **NPC Appearance:** Identical to player character (no visual distinction required)

### Color Palette

- **Player:** Blue, Red, Green, Yellow (one per player)
- **NPC:** Gray or distinct color (optional; can match player color)
- **Background:** Light gray or white
- **Cover:** Dark gray or brown
- **UI Text:** Black on white or light backgrounds

---

## Technical Specifications

### Performance Targets

- **Frame Rate:** 60 FPS client-side (smooth rendering)
- **Network Tick Rate:** 30 Hz (server state updates)
- **Latency Compensation:** 50-100ms client prediction window
- **Max Concurrent Games:** 100+ simultaneous 4-player lobbies (scalable via backend)

### Browser Compatibility

- **Target:** Chrome, Firefox, Safari, Edge (latest stable versions)
- **Resolution:** Responsive; game renders at configurable size (default 800x600 or viewport-scaled)

### Godot Version

- **Engine:** Godot 4.5
- **Rendering:** GL Compatibility (mobile-friendly)
- **Export:** HTML5/WebGL for browser deployment

---

## Future Expansion (Post-MVP)

1. **Weapon Variety:** Different fire rates, damage, reload (currently single weapon)
2. **Projectile-Based Combat:** Replace hitscan with projectiles for more tactical play
3. **Power-ups:** Temporary buffs (speed, damage, health)
4. **Team Modes:** 2v2 or free-for-all variant
5. **Ranked Statistics:** Per-player win/loss tracking, leaderboards
6. **Cosmetics:** Player skins, weapon skins (no gameplay impact)
7. **Map Variety:** Multiple maps with different layouts
8. **Sound Design:** Gunfire, hit sounds, voice chat (optional)

---

## Design Priorities

1. **Simplicity:** Code is straightforward and maintainable
2. **Responsiveness:** All client actions feel immediate (client prediction)
3. **Real-Time Sync:** All players see identical game state (30 Hz updates)
4. **Fun First:** Fast gameplay, clear feedback, low cognitive load
5. **Web-Friendly:** Minimal file size, quick load time, no external dependencies

---

## Success Criteria

✓ Players can create and join lobbies  
✓ 2-4 players (real + NPC) participate in concurrent matches  
✓ Combat mechanics responsive and fair  
✓ Real-time synchronization across all clients  
✓ Match ends correctly on 10 kills or 2-minute timer  
✓ No console errors or warnings  
✓ Sub-100ms latency compensation (playable experience)  
