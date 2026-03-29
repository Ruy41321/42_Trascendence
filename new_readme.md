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

* **Docker & Docker Compose** (Latest version)
* **Git**
* **[working on it, ASAP** (List specific software versions here)

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
   # Edit .env with your specific configuration [working on it, ASAP
   ```
3. **Launch the Application:**
   
   ```bash
   docker-compose up --build
   ```
4. **Access the Project:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000` (example)

---

## Resources

[WORK ON IT ASAP]

---

## Team Information

Below is the information regarding the team members and their specific roles:

| Member       | Assigned Role(s)    | Responsibilities                                                                        |
|:------------ |:------------------- |:--------------------------------------------------------------------------------------- |
| **Luigi**    | Tech Lead, Game Dev | Game logic, mechanics, real-time multiplayer implementation, and WebSocket integration. |
| **Alessio**  | Frontend Developer  | UI/UX design, responsive layout, custom design system, and PWA features.                |
| **Abdallah** | Backend Developer   | Database schema design, Docker containerization, and API infrastructure.                |
| **Tobia**    | Backend Developer   | Login system, authentication security, and infrastructure setup.                        |

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
| **Frontend** | Vue.js + Vite | [working on it, ASAP.                                    |
| **Backend**  | Python        | [working on it, ASAP.                                    |
| **Database** | Postgres      | [working on it, ASAP.                                    |
| **DevOps**   | Docker        | Chosen for environment consistency and deployment speed. |

---

## Database Schema

### Structure Description

The database is structured to handle user accounts, authentication, and game persistence.

### Tables and Relationships

* **Users:** Stores credentials, profile data, and status.
* **Games:** Records match results and references to the participating players.
* **[working on it, ASAP:** (List remaining tables and relationships).

### Key Fields

* **User ID:** UUID (Primary Key).
* **[working on it, ASAP:** (List data types and key fields).

---

## Features List

| Feature            | Member(s)      | Functionality Description                     |
|:------------------ |:-------------- |:--------------------------------------------- |
| **Real-time Game** | Luigi          | Core Pong mechanics with multiplayer sync.    |
| **Auth System**    | Abdallah/Tobia | Secure user registration and login.           |
| **PWA Support**    | Alessio        | Ability to install the app on mobile/desktop. |

---

## Modules

**Total Points: 14/14** 

| Module                 | Type  | Member         | Justification & Implementation                                                                        |
|:---------------------- |:----- |:-------------- |:----------------------------------------------------------------------------------------------------- |
| **WebSockets**         | Major | Luigi          | **Justification:** Essential for real-time play. **Implementation:** [working on it, ASAP.            |
| **Full Web Game**      | Major | Luigi          | **Justification:** Core project requirement. **Implementation:** [working on it, ASAP.                |
| **Remote Players**     | Major | Luigi          | **Justification:** To allow play across different machines. **Implementation:** [working on it, ASAP. |
| **3+ Multiplayer**     | Major | Luigi          | **Justification:** Adds complexity and variety to the game. **Implementation:** [working on it, ASAP. |
| **Backend Framework**  | Minor | Abdallah/Tobia | **Justification:** Speed of development. **Implementation:** [working on it, ASAP.                    |
| **Public API**         | Major | Abdallah/Tobia | **Justification:** Scalability. **Implementation:** [working on it, ASAP.                             |
| **Frontend Framework** | Minor | Alessio        | **Justification:** Professional UI structure. **Implementation:** [working on it, ASAP.               |
| **Design System**      | Minor | Alessio        | **Justification:** Visual consistency. **Implementation:** [working on it, ASAP.                      |
| **PWA**                | Minor | Alessio        | **Justification:** Offline accessibility. **Implementation:** [working on it, ASAP.                   |

---

## Individual Contributions

### Luigi

* **Contributions:** Implemented the core game physics and WebSocket synchronization logic.
* **Challenges:** [working on it, ASAP.

### Alessio

* **Contributions:** Created the custom design system and integrated the frontend framework.
* **Challenges:** [working on it, ASAP.

### Abdallah

* **Contributions:** Designed the database schema and established the Docker infrastructure.
* **Challenges:** [working on it, ASAP.

### Tobia

* **Contributions:** Developed the authentication system and API security protocols.
* **Challenges:** [working on it, ASAP.

---



## AI Usage

AI tools were used during the project for the following tasks:

* **Task:** [working on it, ASAP (e.g., Boilerplate generation for API endpoints).
* **Part of Project:** [working on it, ASAP (e.g., Backend infrastructure).
* **Validation:** All AI-generated code was reviewed and tested to ensure security and compliance with project requirements.
