# Development Plan - Step by Step

## Overview

This document outlines the **exact steps** to build Pew Pew from scratch.

**Architecture:** Client-Server (server-authoritative, 30 Hz network tick)  
**Team Distribution:**
- **Luigi:** Game development (all game code, mechanics, UI, NPC AI)
- **Others (Abdallah, Tobia, Alessio):** Website (frontend, backend, database)

---

## Godot Project Structure

```
Srcs/Game/Pew-pew/
├── Scenes/
│   ├── Player/
│   │   ├── Player.tscn
│   │   └── Scripts/
│   │       └── player.gd
│   ├── NPC/
│   │   ├── NPC.tscn
│   │   └── Scripts/
│   │       └── npc.gd
│   ├── Map/
│   │   ├── Map.tscn
│   │   └── Scripts/
│   │       └── map.gd
│   ├── GameScene/
│   │   ├── GameScene.tscn
│   │   └── Scripts/
│   │       └── game_manager.gd
│   ├── Lobby/
│   │   ├── Lobby.tscn
│   │   └── Scripts/
│   │       └── lobby_manager.gd
│   ├── UI/
│   │   ├── HUD.tscn
│   │   └── Scripts/
│   │       └── hud.gd
│   └── Main/
│       ├── Main.tscn
│       └── Scripts/
│           └── main.gd
├── Scripts/
│   ├── NetworkManager.gd
│   ├── Constants.gd
│   └── Utils.gd
├── Assets/
│   ├── Sprites/
│   ├── Audio/
│   └── UI/
└── project.godot
```

---

## Development Phases

## Phase 1: Core Game Mechanics

**Goal:** Build functional single-player game (no networking).

### Setup & Foundation
- [ ] Initialize Godot project structure
- [ ] Create scene hierarchy and folder organization
- [ ] Set up input handling (WASD, mouse, click)

### Player System
- [ ] Implement player movement (WASD controls)
- [ ] Implement aiming system (mouse-based direction)
- [ ] Implement shooting mechanic (hitscan detection)
- [ ] Add weapon feedback (muzzle flash, sound)

### Map & Environment
- [ ] Create game map layout (800x600)
- [ ] Add spawn points
- [ ] Add cover objects with collision
- [ ] Implement boundary collision

### Combat System
- [ ] Implement hit detection (raycast)
- [ ] Implement health system (1 HP)
- [ ] Implement respawn mechanics
- [ ] Add respawn invulnerability

### NPC System
- [ ] Create NPC entity
- [ ] Implement NPC movement behavior
- [ ] Implement NPC targeting system
- [ ] Implement NPC shooting

### Game State & UI
- [ ] Implement kill counter and tracking
- [ ] Implement match timer
- [ ] Display HUD (kills, time, player list)
- [ ] Implement win conditions (10 kills or timer)
- [ ] Create game end screen with scores

**Acceptance:** Single-player game fully playable (spawn → play → win)

---

## Phase 2: Lobby System & WebSocket Integration

**Goal:** Connect game to backend server and implement lobby management.

### WebSocket Connection
- [ ] Setup WebSocket connection to server
- [ ] Implement connection lifecycle
- [ ] Handle authentication
- [ ] Implement message sending/receiving

### Lobby Scene & UI
- [ ] Create lobby browser scene
- [ ] Display available lobbies
- [ ] Implement "Create Lobby" interface
- [ ] Implement "Join Lobby" functionality
- [ ] Display current lobby status and players
- [ ] Add NPC management UI
- [ ] Implement "Start Game" button

### Lobby Logic
- [ ] Request lobby list from server
- [ ] Create new lobby (send to server)
- [ ] Join existing lobby (send to server)
- [ ] Add NPC to lobby (increment counter)
- [ ] Leave lobby
- [ ] Notify other players of lobby changes

### Game Session Initialization
- [ ] Receive game start message from server
- [ ] Load game scene with correct players
- [ ] Assign player IDs and spawn points
- [ ] Initialize game state

**Acceptance:** Lobbies work, players can create/join/start games

---

## Phase 3: Real-Time Multiplayer Synchronization

**Goal:** Synchronize game state across all connected players in real-time.

### Client-Side Networking
- [ ] Send player input to server (movement, aim, fire)
- [ ] Receive game state from server (30 Hz)
- [ ] Handle game events (kills, respawns, etc.)

### Client Prediction
- [ ] Predict local player movement ahead
- [ ] Reconcile prediction with server state
- [ ] Smooth visual correction for remote players

### Remote Player Rendering
- [ ] Render remote player positions
- [ ] Interpolate remote player movement
- [ ] Display remote player rotations

### Game State Synchronization
- [ ] Update all player positions
- [ ] Update kill counts in real-time
- [ ] Handle respawn events
- [ ] Update HUD for all players
- [ ] Synchronize game timer

### Kill & Event Handling
- [ ] Process kill events (server validates)
- [ ] Display kill notifications
- [ ] Update killer and victim
- [ ] Handle NPC kills/respawns

### Match End Detection
- [ ] Detect when match ends (10 kills or timer)
- [ ] Display final scores
- [ ] Send results to server
- [ ] Transition back to lobby/menu

**Acceptance:** 2-4 players synchronized, identical game state across clients

---

## Phase 4: Polish & Optimization

**Goal:** Refine gameplay, optimize performance, prepare for production.

### Visual Polish
- [ ] Add animations and effects
- [ ] Add audio feedback
- [ ] Improve UI appearance
- [ ] Add visual feedback for events

### Performance Optimization
- [ ] Optimize network message size
- [ ] Test and tune client prediction window
- [ ] Optimize rendering performance

### Testing & Debugging
- [ ] Test with multiple clients simultaneously
- [ ] Test latency compensation
- [ ] Verify no desynchronization
- [ ] Cross-browser compatibility testing
- [ ] Console error/warning cleanup

### Result Persistence
- [ ] Send match results to server/database
- [ ] Integrate with leaderboard system
- [ ] Update player statistics

### Deployment Preparation
- [ ] Build WebGL export for web
- [ ] Docker setup
- [ ] Server deployment

**Acceptance:** Game polished, deployable, zero console errors

---

## Phase 5: Testing & Launch

- [ ] Load testing with multiple concurrent games
- [ ] Final bug fixes
- [ ] Production deployment
- [ ] Monitor and support

---

## Team & Responsibilities

| Role | Owner | Modules |
|------|-------|---------|
| **Game Development** | Luigi | Godot client, gameplay mechanics, NPC AI |
| **Backend** | Abdallah & Tobia | Game server, WebSocket, database, API |
| **Frontend** | Alessio | Web UI, lobby interface, leaderboards |
| **DevOps/Integration** | Team | Docker, deployment, CI/CD |

---

## Project Scope

### In Scope (MVP)
- [ ] Lobby system (create, list, join, add NPC)
- [ ] Top-down 2D movement (WASD)
- [ ] Mouse aiming and hitscan shooting
- [ ] Server-authoritative physics and hit detection
- [ ] Client prediction with server reconciliation
- [ ] NPC AI (basic targeting and shooting)
- [ ] Kill tracking and scoring (10 kills or 2-minute timer)
- [ ] Real-time multiplayer (4 players max)
- [ ] Match results persistent to database
- [ ] Web deployment (Docker)

### Out of Scope (Future)
- Team/squad modes
- Advanced matchmaking (Elo rating, skill-based)
- Voice chat
- Cosmetics (skins, emotes)
- Advanced anti-cheat
- Replays and spectating
- Mobile optimization

### Constraints
- **Scholastic project:** No anti-cheat needed; focus on code quality and real-time responsiveness
- **Web-based:** Must run in modern browsers (Chrome, Firefox, Safari, Edge)
- **Godot 4.5:** Use existing project structure
- **Network Tick Rate:** 30 Hz for synchronization
- **Max Players:** 4 concurrent per match (scalable to 100+ concurrent lobbies)

---

## Architecture Overview

### Client-Server Model

```
Godot Client (Browser)
  ├─ Input handling (WASD, mouse)
  ├─ Client prediction (50-100ms ahead)
  ├─ Local rendering (60 FPS)
  └─ WebSocket connection to game server

Game Server (Node.js/Python/Go)
  ├─ Authoritative game simulation (30 Hz tick)
  ├─ Input validation and physics
  ├─ Player state broadcasts
  ├─ NPC AI and behavior
  └─ Match lifecycle and scoring

Database (PostgreSQL/MySQL)
  ├─ User accounts and authentication
  ├─ Match history and results
  ├─ Player statistics and leaderboards
  └─ Lobby data (optional persistence)

Frontend (Web UI - Alessio)
  ├─ Login/signup pages
  ├─ Lobby browser and creation
  ├─ Leaderboards and stats
  └─ Game UI (HUD, kill feed)
```

### Key Technical Decisions

1. **Client-Server (not P2P):** Ensures fair play, eliminates host advantage, enables persistence
2. **Server-Authoritative:** All game logic runs on server; clients predict locally with reconciliation
3. **30 Hz Tick Rate:** Balance between responsiveness (20 Hz too slow) and bandwidth (~12 KB/s)
4. **WebSocket for Real-Time:** Lower latency than HTTP polling; persistent connection
5. **Godot 4.5:** Native 2D rendering, built-in physics, easy web export (HTML5)
6. **JSON Protocol:** Simple to debug; binary optimization deferred to Phase 4

---

## Development Phases

### Phase 1: Core Single-Player Mechanics (Weeks 1-2)

**Goal:** Establish solid local gameplay foundation before networking.

**Deliverables:**
- [x] Godot project structure (Scenes, Scripts, Assets)
- [x] Player character with WASD movement
- [x] Mouse-based aiming and visual crosshair
- [x] Hitscan shooting with visual feedback (muzzle flash)
- [x] Simple map layout with spawn points and cover objects
- [x] Health/respawn system (1 HP = instant respawn)
- [x] Kill counter and score tracking
- [x] Basic NPC AI (random movement, basic targeting)
- [x] Win conditions (10 kills or 2-minute timer)
- [x] Game loop and HUD (kill counter, timer)

**Testing:**
- Manual testing: Movement responsive, aiming smooth, shots register locally
- Performance: Consistent 60 FPS on test hardware

**Acceptance Criteria:**
- Player can move smoothly with WASD
- Aiming with mouse and firing works
- NPC moves and shoots (visible, even if dumb)
- Kill counter increments
- Match ends correctly after 10 kills or 2 minutes

**Estimated Time:** 8-10 working days

---

### Phase 2: Lobby System & Basic Networking (Weeks 3-4)

**Goal:** Integrate with backend, establish WebSocket connection, implement lobby flow.

**Backend Dependencies:**
- Authentication endpoint (`POST /api/auth/login`)
- WebSocket endpoint (`wss://...`)
- Lobby message handlers (create, list, join, add NPC, start game)

**Deliverables:**
- [ ] Frontend integration: Login flow, lobby browser UI (Alessio handles UI)
- [ ] Godot client: WebSocket connection and authentication
- [ ] Godot client: Lobby UI (list, create, join, NPC management)
- [ ] Backend: Lobby session management (create, list, join, start)
- [ ] Backend: WebSocket connection lifecycle
- [ ] Database: Lobby table and game session table
- [ ] Backend: Broadcast lobby updates to all participants

**Testing:**
- Lobby creation and listing works
- Player join/leave updates visible to all
- Adding NPC respects 4-player limit
- Game transitions from lobby to game scene
- No console errors

**Acceptance Criteria:**
- Multiple players can join same lobby
- Lobby list updates in real-time
- NPC can be added (up to 4 total)
- Game starts when owner clicks "Start Game" (2+ players required)

**Estimated Time:** 10-12 working days

---

### Phase 3: Real-Time Multiplayer Synchronization (Weeks 5-6)

**Goal:** Implement 30 Hz game state synchronization and client prediction.

**Backend Dependencies:**
- Game state message handling and broadcasting
- Player input validation
- Server-side game simulation (movement, physics, hit detection)
- NPC AI tick simulation
- Kill detection and notifications

**Deliverables:**
- [ ] Backend: Game state loop (30 Hz tick, input processing, state broadcast)
- [ ] Backend: Physics simulation (movement, collision, map bounds)
- [ ] Backend: Hit detection (raycast from player to all enemies)
- [ ] Backend: NPC AI tick (movement, targeting, shooting)
- [ ] Backend: Kill detection and scoring
- [ ] Godot client: Input sending (WASD, mouse angle, fire)
- [ ] Godot client: Server state reception and rendering
- [ ] Godot client: Client prediction (local player moves ahead)
- [ ] Godot client: Reconciliation (smooth correction toward server state)
- [ ] Both: Kill notifications and HUD updates
- [ ] Both: Match end detection and scoring screen

**Testing:**
- Network synchronization: All clients see identical game state
- Client prediction: Movement smooth and responsive (not rubbery)
- Reconciliation: Corrections imperceptible (<20ms jitter)
- Kill detection: Accurate and fair (tested across latency ranges: 0ms, 50ms, 100ms, 200ms)
- Latency compensation: Playable up to 200ms without significant rubber-banding

**Acceptance Criteria:**
- 2-4 players in same match move and shoot in real-time
- All players see identical game state
- Kills register correctly
- Match ends on 10 kills or 2 minutes
- No desync or major latency issues

**Estimated Time:** 12-14 working days

---

### Phase 4: Polish, Optimization & Deployment (Weeks 7-8)

**Goal:** Finalize game feel, optimize bandwidth, deploy to production.

**Deliverables:**
- [ ] Backend: Optimize network messages (delta compression, consider binary)
- [ ] Backend: Match result persistence (POST `/api/game/result` endpoint)
- [ ] Backend: Player stats updates (wins, kills, history)
- [ ] Godot client: Visual polish (animations, sound effects, particle effects)
- [ ] Godot client: UI/UX refinement (cleaner menus, tooltips)
- [ ] Godot client: Error handling and disconnection recovery
- [ ] Frontend: Leaderboards and profile pages (Alessio)
- [ ] Frontend: Match history view
- [ ] Team: Docker containerization (backend + database)
- [ ] Team: Deployment to staging/production
- [ ] Team: Load testing (100+ concurrent lobbies)
- [ ] Documentation: Copilot instructions, code comments, API docs

**Testing:**
- Load test: 100 concurrent games (10 servers × 10 games each)
- Latency test: Simulate 50ms, 100ms, 200ms network delay
- Cross-browser: Chrome, Firefox, Safari, Edge
- Responsiveness: All actions complete within 50ms (perceived)
- Error recovery: Reconnection after temporary disconnect

**Acceptance Criteria:**
- Game polished and feature-complete
- Deployable via Docker
- Handles 100+ concurrent games
- Sub-100ms latency compensation
- All code documented
- No console warnings/errors

**Estimated Time:** 8-10 working days

---

## Technical Milestones

| Milestone | Week | Status | Owner |
|-----------|------|--------|-------|
| Project setup & scene structure | 1 | In-Progress | Luigi |
| Local gameplay (movement, aiming, shooting) | 2 | Planned | Luigi |
| Lobby system (frontend UI) | 3 | Planned | Alessio |
| Lobby system (backend) | 3 | Planned | Abdallah & Tobia |
| WebSocket integration (Godot client) | 4 | Planned | Luigi |
| Server-client synchronization | 5-6 | Planned | All |
| NPC AI implementation | 5-6 | Planned | Luigi |
| Match result persistence | 7 | Planned | Abdallah & Tobia |
| Polish and optimization | 7-8 | Planned | All |
| Docker deployment | 8 | Planned | Team |
| Testing and bug fixes | 8-9 | Planned | All |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Latency higher than expected | Medium | High | Early load testing, optimize message format if needed |
| NPC AI too difficult to tune | Low | Medium | Start simple, iterate based on playtesting |
| Scope creep (extra features) | High | Medium | Strict MVP definition, defer features to Phase 5 |
| Team coordination delays | Medium | Medium | Weekly sync meetings, clear task ownership |
| Browser compatibility issues | Low | Medium | Early cross-browser testing |
| Database bottleneck | Low | High | Optimize queries, add indexes, consider caching |

---

## Testing Strategy

### Unit Testing
- Godot: Behavior tests for movement, aiming, collision
- Backend: API endpoint tests, game logic validation

### Integration Testing
- Client-server synchronization
- Lobby lifecycle (create → join → start → play → end)
- Matchmaking and NPC selection

### Load Testing
- Simulate 100+ concurrent games
- Monitor server CPU, memory, bandwidth
- Identify bottlenecks at scale

### Latency Testing
- Simulate network delays (50ms, 100ms, 200ms, 500ms)
- Verify client prediction smooths gameplay
- Test reconnection behavior

### Cross-Browser Testing
- Chrome, Firefox, Safari, Edge (latest)
- Mobile browsers (future optimization)

---

## Deployment Strategy

### Staging Environment
- Deploy to staging server weekly
- Internal testing and playtesting
- Identify bugs before production

### Production Deployment
- Docker containers for all services
- Blue-green deployment (zero downtime)
- Automated database migrations

### Monitoring
- Server logs (game events, errors)
- Performance metrics (CPU, memory, latency)
- Player analytics (matches played, average session duration)

---

## Success Metrics

**Gameplay:**
- [ ] 60 FPS client-side rendering
- [ ] <50ms latency perceived by players
- [ ] <2% packet loss tolerance
- [ ] Smooth movement and accurate shooting

**Functionality:**
- [ ] Lobby creation and joining works reliably
- [ ] 4-player matches run without desync
- [ ] NPC AI behaves intelligently
- [ ] Match results saved to database

**Code Quality:**
- [ ] All code in English (comments, UI, variables)
- [ ] Zero console warnings/errors
- [ ] Clear code structure (scene organization, script patterns)
- [ ] Comprehensive documentation

**Scalability:**
- [ ] 100+ concurrent games without degradation
- [ ] Database queries <100ms
- [ ] Server CPU <50% at peak load

**User Experience:**
- [ ] Login to first game <30 seconds
- [ ] Smooth matchmaking and lobby experience
- [ ] Clear win/loss feedback
- [ ] Leaderboards visible and accurate

---

## Documentation Deliverables

- [ ] [game-design.md](game-design.md) - Game mechanics and design
- [ ] [network-protocol.md](network-protocol.md) - WebSocket message spec
- [ ] [backend-api.md](backend-api.md) - API endpoints and database schema
- [ ] [development-plan.md](development-plan.md) - This document
- [ ] [.github/copilot-instruction.md](../Srcs/Game/Pew-pew/.github/copilot-instruction.md) - Code guidelines
- [ ] Godot code documentation (inline comments, scene structure)
- [ ] Backend API documentation (OpenAPI/Swagger)
- [ ] Database schema documentation

---

## Next Steps

1. **Week 1 (This Week):**
   - [ ] Finalize game design and document in [game-design.md](game-design.md)
   - [ ] Define network protocol in [network-protocol.md](network-protocol.md)
   - [ ] Set up Godot project structure
   - [ ] Begin Phase 1: Local gameplay mechanics

2. **Weekly Sync Meetings:**
   - Mondays: 30-min standup (blockers, progress)
   - Thursdays: 60-min sprint review and planning

3. **Git Workflow:**
   - Feature branches for each component
   - Pull requests with code review
   - Merge to main upon approval

4. **Communication:**
   - Slack for quick questions
   - Discord for voice sync during pairing
   - GitHub Issues for task tracking

---

## Timeline Summary

```
Week 1-2: Phase 1 (Core Mechanics)
Week 3-4: Phase 2 (Lobbies + Networking)
Week 5-6: Phase 3 (Multiplayer Sync)
Week 7-8: Phase 4 (Polish + Deployment)
Week 9: Testing, bug fixes, final tweaks
Week 10: Launch readiness, documentation
```

**Estimated Total Duration:** 10 weeks (adjustable per team velocity)

---

## Contact & Escalation

- **Game Lead:** Luigi (game mechanics, Godot integration)
- **Backend Lead:** Abdallah & Tobia (server, database, API)
- **Frontend Lead:** Alessio (UI, leaderboards, profile)
- **Questions:** Post to #pew-pew-dev channel or reach out directly

---

**Document Version:** 1.0  
**Last Updated:** January 13, 2026  
**Next Review:** Weekly during development
