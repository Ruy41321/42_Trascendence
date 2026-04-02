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
| **Luigi**    | PO, PM, Game Fronted Dev | Ensure the final product meets the project requirements. Develop the frontend rendering of the game. |
| **Alessio**  | Frontend Dev  | #todo |
| **Abdallah** | Tech Lead, Game Backend Dev   | #todo   |
| **Tobia**    | Auth Backend Dev   | #todo    |

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
| **Backend**  | #todo       | #todo                      |
| **Database** | #todo      | #todo       |
| **DevOps**   | Docker        | Chosen for environment consistency and deployment speed. |

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
| **Game Rendering** | Luigi          | Core game rendering based on events sent by game backend. |
| **Game Backend** | Tcaccava | Backend logic for game mechanics, physics, and real-time synchronization. |
| **Auth System**    | Abdallah       | Secure user registration and login backend. |
| **Auth API**       | Abdallah       | API endpoints for authentication. |

---

## Modules

**Total Points: 14/14** 

| Module                 | Type  | Member         | Justification & Implementation                                                                        |
|:---------------------- |:----- |:-------------- |:----------------------------------------------------------------------------------------------------- |

#TODO 

---

## Individual Contributions

### Luigi

* **Contributions:** Managed the github repository and Implemented the core game physics and WebSocket synchronization logic.
* **Challenges:** 
1. Synchronizing game state between client and server has been the major challenge, it has been overcome by implementing a robust event-driven architecture with a rigorous protocol for state updates.
2. Maintaining a clean and working repository has been a challenge when multiple branches and features were being developed simultaneously, it has been overcome by enforcing the use of Github Issues.

### Alessio

* **Contributions:** #todo
* **Challenges:** #todo

### Abdallah

* **Contributions:** #todo
* **Challenges:** #todo

### Tobia

* **Contributions:** #todo
* **Challenges:** #todo

---



## AI Usage

AI tools were used during the project for the following tasks:

#todo
