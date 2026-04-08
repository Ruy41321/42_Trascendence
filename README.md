*This project has been created as part of the 42 curriculum by abkhefif, atucci, lpennisi, tcaccava.*

# ft_transcendence

## Description

**ft_transcendence** is the final project of the 42 common core.
The **goal** is to create a web-based platform for users to play Pong in real-time against others, featuring a complete user management system and a modern functional interface.

### Key Features

* **Real-time Multiplayer:** High-performance gameplay via WebSockets.
* **Social System:** User profiles, match history, and statistics.
* **Responsive Design:** A custom-made UI that works across all devices.
* **Deployment:** Fully containerized architecture using Docker.

---

## Instructions

### Prerequisites

The following tools must be installed to run the project:

* **Docker & Docker Compose** (v.29.1.3 or later)
* **Make** (for build automation)
* **Git** (to clone the repository)

### Installation & Execution

Follow these steps to set up the project locally:

1. **Clone the repository:**
   
   ```bash
   git clone https://github.com/Ruy41321/42_Trascendence.git
   cd 42_Transcendence
   ```
2. **Environment Configuration:**
   
   ```bash
   cp .env.example .env
   # Edit .env with your specific configuration
   ```
3. **Launch the Application:**
   
   ```bash
   make up
   ```
4. **Access the Project:**
   - `https://localhost` (Port 443)

---

## Resources

#todo

---

## Team Information

Below is the information regarding the team members and their specific roles:

| Member       | Assigned Role(s)    | Responsibilities                                                                        |
|:------------ |:------------------- |:--------------------------------------------------------------------------------------- |
| **Lpennisi**    | PO, PM, Game Fronted Dev | Ensure the final product meets the project requirements. Develop the frontend rendering of the game. |
| **Atucci**  | Frontend Dev  | #todo |
| **Tcaccava** | Game Logic & Web Socket Backend Dev   | Develop the game logic and Real-time socketing. |
| **Abkhefif**    | REST Backend Dev   | Develop the REST API and database integration. |

---

## Project Management

### Work Organization

* **Task Distribution:** Work was split by technical domain (Frontend, Backend, Game) with tasks tracked via `Github Issues`.
* **Meetings:** The team held regular synchronization meetings to ensure smooth integration, using `Discord` .

### Communication & Tools

* **Management Tools:** GitHub Issues.
* **Communication:** Discord and Whatsapp were used as the primary channel for daily updates.

---

## Technical Stack

| Category     | Technology    | Justification                                            |
|:------------ |:------------- |:-------------------------------------------------------- |
| **Frontend** | Vue.js | Used as frontend framework for its reactivity and component-based architecture |
| **Backend**  | FastAPI | Used as backend framework to learn python |
| **Database** | PostgreSQL, Alembic, PyTest, SQLAlchemy | PostegreSQL because it's light and fast, Alembic for database migrations, PyTest for testing database operations, SQLAlchemy for ORM |
| **DevOps**   | Docker  | Chosen for environment consistency and deployment speed. |

---

## Database Schema

### Structure Description

#todo

### Tables and Relationships

#todo

### Key Fields

#todo

---

## Features List

| Feature            | Member(s)      | Functionality Description                     |
|:------------------ |:-------------- |:--------------------------------------------- |
| **Base Web-App Frontend** | Atucci & Lpennisi | Frontend implementation for the web application. |
| **Game Rendering** | Lpennisi | Core game rendering based on events sent by game backend. |
| **Game Backend** | Tcaccava | Backend logic for game mechanics, physics, and real-time synchronization. |
| **Auth System**    | Abkhefif       | Secure user registration and login backend. |
| **Auth API**       | Abkhefif       | API endpoints for authentication. |

---

## Modules

**Total Points: 14/14** 

| Module                 | Type  | Member         | Justification |  Implementation                                                                        |
|:---------------------- |:----- |:-------------- |:--------------------------------------- |:------------------------------------ |
| **Implement a complete web-based game where users can play against each other.** | Major (2) | Everyone | Because we are passionated about gaming | Implemented a real-time Pong game. |
| **Remote players — Enable two players on separate computers to play the same game in real-time** | Major (2) | Tcaccava | All the modern games work like this so we wanted to learn how to implement it. | Implemented Real-time async.io routine running on 60hz. |
| **Multiplayer game (more than two players).** | Major (2) | Tcaccava | It's funnier to play with more people | Implemented a lobby based game with four players room. |
| **Implement spectator mode for games.** | Minor (1) | Tcaccava | To include who joins the lobby after the match starts | Implemented spectator based payload. |
| **Use a backend framework (Express, Fastify, NestJS, Django, etc.).** | Minor (1) | Abkhefif & Tcaccava | To learn how to use a backend framework & to learn python | Implemented FastAPI as backend framework. |
| **Implement real-time features using WebSockets or similar technology** | Major (2) | Tcaccava | To learn how to implement real-time features | Implemented native WebSocket communication for game state broadcasting. |
| **A public API to interact with the database with a secured API key, rate limiting, documentation, and at least 5 endpoints** | Major (2) | Abkhefif | #todo | #todo |
|**Use an ORM for the database.** | Minor (1) | Abkhefif | #todo | #todo |

---

## Individual Contributions

### Lpennisi

* **Contributions:** Managed the github repository and Implemented the core game physics and WebSocket synchronization logic.
* **Challenges:** 
1. Synchronizing game state between client and server has been the major challenge, it has been overcome by implementing a robust event-driven architecture with a rigorous protocol for state updates.
2. Maintaining a clean and working repository has been a challenge when multiple branches and features were being developed simultaneously, it has been overcome by enforcing the use of Github Issues.

### Atucci

* **Contributions:** #todo
* **Challenges:** #todo

### Abkhefif

* **Contributions:** #todo
* **Challenges:** #todo

### Tcaccava

* **Contributions:** #todo
* **Challenges:** #todo

---


## AI Usage

AI tools were used during the project for the following tasks:

* **ChatGPT chatbot** has been used to learn the FastAPI theory.
* **Gemini chatbot** has been used to learn python basics and Typing/Pydantic Library.

