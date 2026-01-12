# 42 Transcendence

*This project has been created as part of the 42 curriculum by Luigi, Alessio, Abdallah, Tobia.*

---

## Description

42 Transcendence is a web application project built as part of the 42 school curriculum. The project aims to create an engaging web-based platform featuring real-time multiplayer gaming capabilities combined with a modern, responsive user interface.

### Key Features
- Real-time multiplayer web-based game with WebSocket support
- User authentication and profile management
- Responsive and modern frontend design
- Robust backend API system with secure endpoints
- Containerized deployment with Docker
- Progressive Web App capabilities
- Multi-user concurrent support
- Custom design system with reusable components

---

## Team Information

| Team Member | Role(s) | Responsibilities |
|-------------|---------|-----------------|
| **Luigi** | Tech Lead - Game Development | Game logic, mechanics, real-time multiplayer implementation, WebSocket integration |
| **Alessio** | Frontend Developer | UI/UX design, responsive layout, custom design system, PWA features, browser compatibility |
| **Abdallah** | Backend Developer | Database schema design, Docker containerization, API infrastructure |
| **Tobia** | Backend Developer | Authentication system, backend logic, API endpoints, game-database integration |

---

## Project Management

### Work Organization
- **Task Distribution:** Each team member is responsible for their designated technical area (Game, Frontend, Backend)
- **Meetings:** Regular synchronization meetings to ensure component integration
- **Git Workflow:** Feature branches with meaningful commit messages from all team members

### Project Management Tools
*To be finalized during project kickoff:*
- Task tracking: GitHub Issues or Trello
- Communication: Discord or Slack
- Documentation: Shared wiki/documentation

### Communication Channels
*To be established at project start:*
- Primary: Discord/Slack
- Documentation sharing: GitHub/Google Drive
- Code reviews: GitHub Pull Requests

---

## Technical Stack

| Category | Technology | Justification |
|----------|-----------|---------------|
| **Frontend Framework** | *To be determined* | Modern, responsive web application requirements |
| **Backend Framework** | *To be determined* | Robust API and real-time feature support |
| **Database** | *To be determined* | User data, game statistics, and application state management |
| **WebSocket** | *To be determined* | Real-time multiplayer game synchronization |
| **Containerization** | Docker | Single-command deployment and environment consistency |
| **Version Control** | Git | Collaborative development and version tracking |
| **CSS Framework** | *To be determined* | Responsive design and styling solution |

---

## Database Schema

*[PLACEHOLDER - To be defined during backend development]*

The database will include the following main entities:

- **Users** - User accounts, authentication, profile information
- **Games** - Game sessions, state, player references
- **Game Statistics** - Win/loss records, player rankings
- **API Keys** - Secured API access management

*Detailed schema with relationships, field definitions, and data types will be provided once database design is finalized.*

---

## Instructions

### Prerequisites
- Docker & Docker Compose
- Git
- Node.js (or equivalent based on backend choice)
- npm/yarn or equivalent package manager

### Installation & Setup

*[PLACEHOLDER - Detailed installation steps will be provided once project structure is initialized]*

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd 42_Transcendence
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start the application with Docker:
   ```bash
   docker-compose up
   ```

4. Access the application:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000` (example)

---

## Features List

*[PLACEHOLDER - Complete feature list will be compiled once development begins]*

| Feature | Description | Assigned To | Status |
|---------|-------------|-------------|--------|
| *To be updated* | | | |

---

## Modules

### Target Points: 14/14 ✅

#### Gaming and User Experience (Luigi) - 8 points
- **Implement real-time features using WebSockets** (Major - 2 pts)
  - Real-time updates across clients, graceful connection handling, efficient message broadcasting
  
- **Implement a complete web-based game** (Major - 2 pts)
  - Real-time multiplayer gameplay with clear rules and win/loss conditions
  
- **Remote players support** (Major - 2 pts)
  - Enable two players on separate computers to play live, handle network latency and disconnections
  
- **Multiplayer game (3+ players)** (Major - 2 pts)
  - Support for simultaneous play of three or more players with proper synchronization

#### Backend Development (Abdallah & Tobia) - 3 points
- **Use a backend framework** (Minor - 1 pt)
  - Implement structured backend with routing, middleware, and state management
  
- **Public API with security** (Major - 2 pts)
  - Secured API key management, rate limiting, documentation, minimum 5 endpoints (GET, POST, PUT, DELETE)

#### Frontend Development (Alessio) - 3 points
- **Use a frontend framework** (Minor - 1 pt)
  - Modern responsive web framework implementation
  
- **Custom-made design system** (Minor - 1 pt)
  - Reusable components, color palette, typography, icons (minimum 10 components)
  
- **Progressive Web App (PWA)** (Minor - 1 pt)
  - Offline support and installability

---

## Individual Contributions

### Luigi - Game Development
*[PLACEHOLDER - To be detailed upon completion of work]*
- Implementation of core game logic and mechanics
- WebSocket integration for real-time multiplayer
- Player synchronization and game state management
- Handling remote players and connection management

### Alessio - Frontend Development
*[PLACEHOLDER - To be detailed upon completion of work]*
- UI/UX design and responsive layout implementation
- Frontend framework setup and component architecture
- Custom design system creation with reusable components
- PWA features and cross-browser compatibility optimization

### Abdallah - Backend Development
*[PLACEHOLDER - To be detailed upon completion of work]*
- Docker containerization and infrastructure setup
- Backend logic for game integration and login with framework
- Database implementation
- API infrastructure and endpoint creation
- API Documentation
- Authentication and login/registration system implementation

### Tobia - Backend Development
*[PLACEHOLDER - To be detailed upon completion of work]*
- Docker containerization and infrastructure setup
- Backend logic for game integration and login with framework
- Database implementation
- API infrastructure and endpoint creation
- API Documentation
- Authentication and login/registration system implementation
---

## Resources

### Documentation & References
*To be compiled during development with relevant links to:*
- Framework documentation
- WebSocket libraries and examples
- Database design patterns
- Docker best practices
- REST API design guidelines

### AI Usage
*[PLACEHOLDER - AI implementation tracking]*

This section will document:
- Which tasks leveraged AI assistance
- Specific AI tools used (ChatGPT, GitHub Copilot, etc.)
- Scope of AI assistance (code generation, debugging, documentation, etc.)
- How AI-generated content was validated and integrated

---

## Privacy Policy & Terms of Service

*[PLACEHOLDER - To be implemented as required]*

Accessible links to Privacy Policy and Terms of Service will be provided in the application footer with relevant and appropriate content for the project.

---

## Project Status

🚀 **Current Status:** In Planning Phase

- [x] Team roles assigned
- [x] Modules selected (14 points)
- [x] Initial README created
- [ ] Backend infrastructure setup
- [ ] Database design finalized
- [ ] Frontend framework initialization
- [ ] Game development begins
- [ ] Integration phase
- [ ] Testing and deployment

---

**Last Updated:** January 13, 2026  
**Project Start Date:** *To be announced*
