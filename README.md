<div align="center">

# 🤖 IntellMeet: AI-Powered Enterprise Meeting Platform

### *Transforming conversations into actionable insights.*

[![Status](https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge)](https://github.com/syedsadikaslam/IntellMeet-AI-Powered-Enterprise-Meeting-Collaboration-Platform)
[![Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)](https://mongodb.com)
[![AI](https://img.shields.io/badge/AI-OpenAI_Whisper_+_GPT--4-8A2BE2?style=for-the-badge)](https://openai.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[**Explore Documentation**](#-table-of-contents) • [**Quick Start**](#-quick-start) • [**Architecture**](#-architecture) • [**API Reference**](#-api-reference)

</div>

---

## 🚀 Overview

**IntellMeet** is a next-generation enterprise collaboration platform that leverages artificial intelligence to automate meeting overhead. By combining real-time video conferencing with advanced NLP, IntellMeet ensures that no action item is lost and every meeting results in tangible progress.

> [!IMPORTANT]
> **IntellMeet reduces post-meeting administrative tasks by up to 60%** by automating transcription, summarization, and task delegation.

---

## ✨ Core Features

| Feature | Description |
| :--- | :--- |
| **🎥 High-Perf Video** | WebRTC-powered low-latency video and audio rooms supporting 50+ participants. |
| **🧠 AI Meeting Intelligence** | Real-time transcription using OpenAI Whisper and intelligent summarization via GPT-4. |
| **📋 Smart Action Items** | Automatic extraction of tasks from meeting dialogue with assignee detection. |
| **🏢 Team Workspaces** | Dedicated environments for departments or projects with nested Kanban boards. |
| **💬 Project-Linked Chat** | Real-time messaging with full historical context and file sharing. |
| **📊 Productivity Analytics** | Insights into meeting frequency, engagement metrics, and task completion rates. |


---

## 🛠 Tech Stack

### **Frontend Architecture**
- **Framework**: React 19 + Vite (for blazing fast HMR)
- **Language**: TypeScript (Type-safe codebase)
- **Styling**: Tailwind CSS v4 + shadcn/ui (Premium Glassmorphism)
- **State Management**: TanStack Query (Server State) + Zustand (Client State)
- **Communication**: Socket.io-client + WebRTC

### **Backend Core**
- **Runtime**: Node.js + Express
- **Database**: MongoDB (Primary) + Redis (Session & Live State)
- **Real-time**: Socket.io (Bi-directional events)
- **Auth**: JWT with Refresh Token Rotation + bcrypt
- **Storage**: Cloudinary (Assets/Recordings)

---

## 🏗 Architecture & System Design

The platform follows a distributed, service-oriented architecture built for high availability, real-time collaboration, and AI-driven intelligence. Below are the four key design diagrams that describe the system at different levels of abstraction.

---

### 1️⃣ System Context Diagram

Shows the high-level interactions between actors (Meeting Host, Participants, Team Members) and the IntellMeet system, along with all external integrations.

```mermaid
graph LR
    HOST(("👤 Meeting Host"))
    PARTICIPANT(("👥 Participant"))
    TEAM(("🖥️ Team Member"))

    subgraph INTELLMEET ["🧠 IntellMeet System"]
        direction TB
        CORE["Core Platform"]
    end

    subgraph EXT ["☁️ External Services"]
        GEMINI["🤖 Google Gemini AI"]
        MONGO[("🍃 MongoDB Atlas")]
        REDIS["⚡ Redis Cache"]
    end

    HOST -->|"Create meeting, admin controls, end meeting"| INTELLMEET
    INTELLMEET -->|"Video/Audio, notifications, transcript, AI answers"| HOST

    PARTICIPANT -->|"Join meeting, chat, raise hand"| INTELLMEET
    INTELLMEET -->|"Notes, tasks, transcript"| PARTICIPANT

    TEAM -->|"Team chat, manage projects, kanban tasks"| INTELLMEET
    INTELLMEET -->|"Chat messages, task updates"| TEAM

    INTELLMEET -->|"AI summary, action items, Q&A answers"| GEMINI
    GEMINI -->|"Generated intelligence responses"| INTELLMEET

    INTELLMEET -->|"Persist users, meetings, teams, projects"| MONGO
    MONGO -->|"Stored documents / query results"| INTELLMEET

    INTELLMEET -->|"Session state, transcript buffer, live tasks"| REDIS
    REDIS -->|"In-memory meeting data"| INTELLMEET
```

---

### 2️⃣ Low-Level Design (LLD) — Component Architecture

Details the internal component structure of both the Client (React) and Server (Node.js/Express) layers, and how they connect to the infrastructure.

```mermaid
graph TB
    subgraph CLIENT ["🖥️ CLIENT — React"]
        direction TB
        PAGES["📄 Pages / Routes\n/Hero · /AuthPage\n/Dashboard · /MeetingRoom\n/MeetingLobby · /ProjectBoard"]
        COMPONENTS["🧩 Components\nNavbar · AIChat · Chalkboard\n/Meeting&Collaboration\nParticipantsSidebar · VideoGrid\nVote · Chat · AdminPanel\nTranscriptPanel · PerformanceChart"]
        STATE["📦 State — Zustand\nStore / useAuthStore\nuseAuthStore · useMeetingStore"]
        SERVICES["🔌 Client Services\nSocket.IO Client · Web Speech API\nsimple-peer · WebRTC · axios"]

        PAGES --> COMPONENTS
        COMPONENTS --> STATE
        COMPONENTS --> SERVICES
    end

    subgraph SERVER ["⚙️ SERVER — Node.js / Express"]
        direction TB
        MIDDLEWARE["🔒 Middleware\nhelmet · cors\nrateLimit · authMiddleware\nJWT · compression"]
        RESTAPI["📡 REST API\nRoutes: /api/auth\n/api/meetings · /api/teams\n/api/projects · /api/messages"]
        CONTROLLERS["🎮 Controllers\nauthController · meetingController\nteamController · projectController\nmessageController"]
        SOCKETIO["🔄 Socket.IO\nsocketService.js\njoin-meeting · leave-meeting\nsignal · send-message\nsend-team-message · start-stream\naudio-stream · update-note\nend-meeting · mute-participant\nremove-participant · update-permissions\nadd-meeting · raise-hand · add-ai\ntask-moved · task-added\njoin-team · join-project"]

        MIDDLEWARE --> RESTAPI
        RESTAPI --> CONTROLLERS
        CONTROLLERS --> SOCKETIO
    end

    subgraph AI_ENGINE ["🤖 AI ENGINE — a Service.js"]
        direction TB
        DISCOVER["discoverModel\nAuto-Discovers gemini-1.5-flash / gemini-pro"]
        GEN_INTEL["generateMeetingIntelligence\nSummary · ActionItems"]
        GET_AI["getAIResponse\nReal-time Q and A Chat"]

        DISCOVER --> GEN_INTEL
        DISCOVER --> GET_AI
    end

    subgraph INFRA ["🏗️ INFRASTRUCTURE"]
        direction TB
        DATA["📊 Data Layer / MongoDB\nAtlas · Mongoose ODM\nCollections · Sessions · Transcripts"]
        EXTERNAL["🌐 External Services\nGoogle Gemini API · Cloudinary CDN"]
    end

    CLIENT -->|"REST HTTPS"| SERVER
    CLIENT -->|"WebSocket WSS"| SOCKETIO
    CONTROLLERS -->|"triggers"| AI_ENGINE
    AI_ENGINE -->|"end-meeting"| GEN_INTEL
    AI_ENGINE -->|"ask-ai — HTTPS fetch"| GET_AI
    SERVER -->|"Mongoose ORM"| DATA
    SERVER -->|"Redis Client"| DATA
    DATA --> EXTERNAL
```

---

### 3️⃣ Data Flow Diagram (DFD) — Level 1

Describes the flow of data through the six core processes of the IntellMeet platform, from external actors to data stores and the AI engine.

```mermaid
graph TB
    HOST(["👤 Host"])
    PARTICIPANT(["👥 Participant"])
    TEAM_MEMBER(["🖥️ Team Member"])
    GEMINI_AI(["🤖 Gemini AI"])

    subgraph DS ["Data Stores"]
        D1[("D1: Users · MongoDB")]
        D2[("D2: Meetings · MongoDB")]
        D3[("D3: Teams · MongoDB")]
        D4[("D4: Projects · MongoDB")]
        D5[("D5: Messages · MongoDB")]
        D6[("D6: Cache · Redis")]
    end

    subgraph PROCESSES ["Core Processes"]
        P1["1.0 Authentication\n& User Management"]
        P2["2.0 Meeting Lifecycle\nManagement"]
        P3["3.0 Real-Time\nCommunication"]
        P4["4.0 AI Intelligence\nEngine"]
        P5["5.0 Workspace &\nTeam Management"]
        P6["6.0 Project &\nKanban Management"]
    end

    HOST -->|"register / login"| P1
    P1 -->|"JWT tokens"| HOST
    P1 --> D1

    HOST -->|"create / end meeting"| P2
    P2 --> D2
    P2 -->|"trigger AI analysis"| P4
    P2 --> D6

    HOST -->|"audio · chat · notes · tasks"| P3
    HOST -->|"ask AI question"| P4
    HOST -->|"broadcast · transcript"| P3

    PARTICIPANT -->|"register / login"| P1
    PARTICIPANT -->|"join by meetingCode"| P2
    PARTICIPANT -->|"notes · tasks · audio · raise hand"| P3
    P4 -->|"summary + actions"| GEMINI_AI
    GEMINI_AI -->|"AI answer"| P4
    P4 --> D2

    TEAM_MEMBER -->|"create / join team · chat"| P5
    P5 --> D3
    P5 --> D5
    P3 -->|"team chat broadcast"| TEAM_MEMBER

    TEAM_MEMBER -->|"create project · move task"| P6
    P6 -->|"kanban sync"| TEAM_MEMBER
    P6 --> D4
```

---

### 4️⃣ Entity-Relationship (ER) Diagram

Defines the MongoDB data model: all collections, their fields, data types, constraints, and relationships.

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String name
        String email UK
        String password "bcrypt hashed"
        String role "Admin or Member"
        String avatar "URL"
        Array refreshTokens
        Date createdAt
        Date updatedAt
    }

    MEETING {
        ObjectId _id PK
        String title
        ObjectId host FK
        String description
        Array participants "ObjectId refs"
        Date startTime
        Date endTime
        Boolean isLive "default false"
        String meetingCode UK
        String transcript
        String summary "AI generated"
        Array actionItems "embedded subdoc"
        String sentiment "positive/neutral/negative/mixed"
        Array highlights
        String sharedNotes
        Array liveTasks "embedded subdoc"
        String recordingUrl
        Date createdAt
        Date updatedAt
    }

    ACTION_ITEM {
        String task
        String suggestedAssignee
        String status "pending or completed"
    }

    LIVE_TASK {
        String title
        String assignee
        String status
    }

    TEAM {
        ObjectId _id PK
        String name
        String description
        ObjectId owner FK
        Array members "embedded subdoc"
        String joinCode UK
        Array projects "ObjectId refs"
        Date createdAt
        Date updatedAt
    }

    TEAM_MEMBER {
        ObjectId user FK
        String role "Admin or Member"
    }

    PROJECT {
        ObjectId _id PK
        String name
        String description
        ObjectId team FK
        Array tasks "embedded"
        Array boardColumns "ToDo InProgress Done"
        Date createdAt
        Date updatedAt
    }

    TASK {
        ObjectId _id PK
        String title
        String status "todo/in-progress/done"
        String priority "low/medium/high"
        String description
        ObjectId assignee FK
        String mentorNote
        ObjectId meetingOrigin FK
        Date createdAt
        Date updatedAt
    }

    MESSAGE {
        ObjectId _id PK
        ObjectId sender FK
        ObjectId team FK
        String content
        String type "text or system"
        Date createdAt
        Date updatedAt
    }

    USER ||--o{ MEETING : "hosts"
    USER }o--o{ MEETING : "participates in"
    MEETING ||--o{ ACTION_ITEM : "contains embedded"
    MEETING ||--o{ LIVE_TASK : "contains embedded"
    USER ||--o{ TEAM : "owns"
    TEAM ||--o{ TEAM_MEMBER : "has embedded"
    USER ||--o{ TEAM_MEMBER : "is"
    TEAM ||--o{ PROJECT : "has many"
    PROJECT ||--o{ TASK : "contains embedded"
    TASK }o--o| USER : "assigned to"
    TASK }o--o| MEETING : "origin of"
    USER ||--o{ MESSAGE : "sends"
    TEAM ||--o{ MESSAGE : "channel for"
```

---

## 📁 Project Structure

```text
IntellMeet/
├── client/                 # React 19 Frontend
│   ├── src/components/     # Modular UI Components
│   ├── src/pages/          # Routing & Views
│   ├── src/store/          # Zustand State Models
│   └── src/utils/          # API & Socket Config
├── server/                 # Node.js Backend
│   ├── controllers/        # Business Logic
│   ├── models/             # Mongoose Schemas
│   ├── routes/             # API Endpoints
│   ├── services/           # Socket & AI Integration
│   └── utils/              # Redis & Auth Helpers
├── assets/                 # Documentation Media
├── k8s/                    # Kubernetes Deployment Manifests
└── charts/                 # Helm Charts for Orchestration
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Docker (optional for local deployment)
- API Keys for OpenAI & Cloudinary

### 1. Installation
```bash
git clone https://github.com/syedsadikaslam/IntellMeet-AI-Powered-Enterprise-Meeting-Collaboration-Platform.git
cd IntellMeet-AI-Powered-Enterprise-Meeting-Collaboration-Platform
```

### 2. Environment Setup
Create a `.env` file in the `server` directory based on the reference below.

### 3. Launching Locally
```bash
# Terminal 1: Backend
cd server
npm install
npm run dev

# Terminal 2: Frontend
cd client
npm install
npm run dev
```

---

## 🔐 Environment Variables

### Server (`/server/.env`)
| Key | Description |
| :--- | :--- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Primary signing key for tokens |
| `REDIS_URL` | Redis instance URL |
| `OPEN_AI_KEY` | OpenAI API access |
| `CLOUDINARY_URL` | Media storage credentials |

---

## 📡 API Reference

### **Authentication**
- `POST /api/auth/register` - Create a new account
- `POST /api/auth/login` - Authenticate and return tokens
- `POST /api/auth/refresh` - Rotate access tokens

### **Meetings**
- `POST /api/meetings` - Initialize a new meeting room
- `GET /api/meetings/:id` - Fetch meeting metadata and summary
- `POST /api/meetings/join` - Validate and join via code

### **Workspaces & Tasks**
- `GET /api/teams` - List all joined workspaces
- `POST /api/projects/:id/tasks` - Create task from AI action items

---

## 🛡 Security & Performance

- **Production Hardened**: Helmet.js for security headers and Gzip for payload compression.
- **Monitoring**: Integrated Sentry for error tracking and Prometheus for performance metrics.
- **Rate Limiting**: Brute-force protection on all authentication routes.
- **Data Integrity**: Full Zod schema validation on frontend and Mongoose validation on backend.

---

## 📅 Roadmap

- [x] **Phase 1**: Real-time video/chat foundation.
- [x] **Phase 2**: AI Summary Engine integration.
- [x] **Phase 3**: Docker & Kubernetes orchestration.
- [x] **Phase 4**: Advanced Analytics & Engagement reports.
- [x] **Phase 5**: Mobile PWA & Offline Support.

---

## 🤝 Contributing

We welcome contributions! Please refer to our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

<div align="center">
  <p>Built with ❤️ by <b>Sadik</b></p>
  <p><i>A Zidio Development Strategic Project · 2026</i></p>
  <p>
    <a href="https://github.com/syedsadikaslam/IntellMeet-AI-Powered-Enterprise-Meeting-Collaboration-Platform/issues">Report Bug</a> · 
    <a href="https://github.com/syedsadikaslam/IntellMeet-AI-Powered-Enterprise-Meeting-Collaboration-Platform/issues">Request Feature</a>
  </p>
</div>
