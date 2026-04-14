<div align="center">

<img src="https://img.shields.io/badge/version-1.0--Industry_Edition-blueviolet?style=flat-square" />
<img src="https://img.shields.io/badge/stack-MERN-61DAFB?style=flat-square&logo=react" />
<img src="https://img.shields.io/badge/real--time-WebRTC_%2B_Socket.io-010101?style=flat-square" />
<img src="https://img.shields.io/badge/AI-OpenAI_Whisper_%2B_GPT-412991?style=flat-square&logo=openai" />
<img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" />

<br /><br />

# 🤖 IntellMeet

### AI-Powered Enterprise Meeting & Collaboration Platform

**Real-Time Video · AI Summaries · Smart Action Items · Team Collaboration**

*A production-grade MERN full-stack system that transforms every meeting into an actionable, trackable event — reducing follow-up time by 40–60%.*

<br />

[**Live Demo**](#-deployment) · [**Quick Start**](#-quick-start) · [**Architecture**](#-architecture) · [**Roadmap**](#-roadmap)

<br />

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Security](#-security)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)

---

## 🧠 Overview

Enterprises waste thousands of hours every year in unproductive meetings. **IntellMeet** solves this by turning every meeting into an actionable, trackable event using a modern AI-first architecture.

| Metric | Target |
|--------|--------|
| Meeting follow-up time reduction | **40–60%** via AI summaries & auto action items |
| Team productivity improvement | **25–40%** with real-time collaboration |
| Concurrent meeting participants | **500–5,000** |
| Uptime SLA | **99.95%** |
| Real-time feature latency | **< 200ms** |
| Peak concurrent meetings | **10,000+** |

> **Week 1 Status** ✅ — Core backend, authentication, real-time infrastructure, and meeting scaffolding are fully operational. AI video intelligence and deployment pipeline are in active development (Weeks 2–4).

---

## ✨ Features

### ✅ Completed (Week 1)

| ID | Feature | Description |
|----|---------|-------------|
| F01 | **User Auth & Profiles** | JWT signup/login with refresh tokens, bcrypt hashing, avatar upload via Cloudinary |
| F02 | **Meeting Management** | Create & join meetings with unique shareable codes, CRUD operations |
| F03 | **Real-Time Chat** | In-meeting chat with live notifications via Socket.io |
| F04 | **Peer Signaling** | WebRTC peer connection scaffolding for video/audio expansion |
| F05 | **Participant Tracking** | Redis-backed real-time participant sync across sessions |
| F06 | **Security Hardening** | Helmet, CORS, rate limiting, gzip, morgan logging |

### 🔜 In Progress (Weeks 2–4)

| ID | Feature | Description |
|----|---------|-------------|
| F07 | **Live Video Meetings** | Full WebRTC video conferencing — 50+ participants, screen share, recording |
| F08 | **AI Meeting Intelligence** | OpenAI Whisper transcription + GPT summary + action item extraction |
| F09 | **Post-Meeting Dashboard** | Searchable history, recordings, summaries, exportable action items |
| F10 | **Team Workspaces** | Kanban-style project boards with real-time task updates |
| F11 | **Analytics & Insights** | Meeting frequency, productivity metrics, engagement reports |
| F12 | **CI/CD + Monitoring** | Docker, Kubernetes, GitHub Actions, Prometheus + Grafana + Sentry |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 + TypeScript + Vite | UI framework — fast HMR, code splitting |
| shadcn/ui + Tailwind CSS v4 | Modern, accessible component library |
| TanStack Query | Server-state management, caching, synchronisation |
| Zustand | Lightweight client-state management |
| Socket.io-client | Real-time event handling |
| WebRTC | Peer-to-peer video conferencing |
| Axios | HTTP client with interceptors |
| Lucide Icons | Consistent iconography |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | Lightweight, scalable REST API |
| MongoDB + Mongoose | Flexible document storage for meetings & tasks |
| Socket.io | Bidirectional real-time communication server |
| Redis (ioredis) | Session management, meeting caching, feed caching |
| JWT + bcrypt | Secure stateless authentication + password hashing |
| Cloudinary | Scalable media storage — avatars & recordings |
| express-rate-limit | Brute-force & DDoS protection |
| Helmet | Granular HTTP security headers |
| Morgan | Standardised request logging |
| compression | Gzip payload optimisation |

### AI Layer *(Week 3)*
| Technology | Purpose |
|-----------|---------|
| OpenAI Whisper | Real-time meeting transcription |
| GPT-4 | Meeting summary + action item extraction with assignees |
| Hugging Face | Open-source model alternative |

### Infrastructure *(Week 4)*
| Technology | Purpose |
|-----------|---------|
| Docker multi-stage | Consistent, lightweight container builds |
| Kubernetes + Helm | Auto-scaling, high availability orchestration |
| GitHub Actions | Automated testing + zero-downtime deployment |
| Prometheus + Grafana | Performance monitoring & dashboards |
| Sentry | Real-time error tracking |
| AWS / Vercel + Render | Cloud deployment |
| OWASP ZAP + JMeter | Security review + load testing |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│         React 19 · TypeScript · TanStack Query · Zustand    │
│              WebRTC (video)   Socket.io (events)            │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP / WS
┌────────────────────────▼────────────────────────────────────┐
│                   API + REAL-TIME LAYER                      │
│          Node.js + Express   ·   Socket.io Server           │
│                  JWT + bcrypt Auth Middleware                │
└──────────┬──────────────────┬──────────────────┬───────────┘
           │                  │                  │
     ┌─────▼──────┐   ┌───────▼──────┐   ┌──────▼──────┐
     │    Auth    │   │   Meeting    │   │    Team     │
     │  Service  │   │   Service   │   │   Service  │
     │ signup/   │   │ CRUD, video  │   │ workspaces  │
     │  JWT/bcr  │   │ chat, share  │   │  Kanban     │
     └─────┬──────┘   └───────┬──────┘   └──────┬──────┘
           └──────────────────┴──────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                      AI INTELLIGENCE                         │
│      OpenAI Whisper (transcription)  ·  GPT (summary)       │
│            Action item extraction with assignees            │
└─────────────────────────────┬───────────────────────────────┘
                              │
          ┌───────────────────┴──────────────────┐
     ┌────▼─────────┐                   ┌────────▼────────┐
     │   MongoDB    │                   │      Redis      │
     │  (Mongoose)  │                   │    (ioredis)    │
     │ users, meets │                   │ sessions, cache │
     │ tasks, chat  │                   │  meeting state  │
     └──────────────┘                   └─────────────────┘
          ┌───────────────────┬──────────────────┐
     ┌────▼──────────┐   ┌────▼──────────┐   ┌───▼──────────┐
     │  Cloudinary   │   │  Prometheus   │   │    Sentry    │
     │  AWS S3       │   │  + Grafana    │   │  (errors)    │
     │  recordings   │   │  monitoring   │   │              │
     └───────────────┘   └───────────────┘   └──────────────┘
```

---

## 📁 Project Structure

```
IntellMeet/
├── client/                         # React 19 frontend
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── auth/               # Login, Signup forms
│   │   │   ├── meeting/            # VideoRoom, ChatPanel, ParticipantList
│   │   │   └── shared/             # Navbar, Avatar, Loader
│   │   ├── pages/                  # Route-level views
│   │   │   ├── Hero.tsx            # Landing page
│   │   │   ├── Dashboard.tsx       # Post-login hub
│   │   │   └── MeetingRoom.tsx     # Live meeting view
│   │   ├── utils/
│   │   │   ├── api.ts              # Axios instance + interceptors
│   │   │   └── socket.ts           # Socket.io client setup
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── server/                         # Node.js + Express backend
│   ├── controllers/                # Route handler logic
│   │   ├── authController.js       # Signup, login, refresh token
│   │   ├── meetingController.js    # CRUD, join, end meeting
│   │   └── profileController.js   # Avatar upload, profile update
│   ├── models/                     # Mongoose schemas
│   │   ├── User.js                 # Users, auth fields
│   │   ├── Meeting.js              # Meeting metadata, participants
│   │   └── Message.js             # Chat messages
│   ├── routes/                     # Express route definitions
│   │   ├── auth.js
│   │   ├── meetings.js
│   │   └── profile.js
│   ├── services/
│   │   └── socketService.js        # Socket.io events, rooms, presence
│   ├── utils/
│   │   ├── redis.js                # ioredis client + helpers
│   │   └── auth.js                 # JWT sign/verify, middleware
│   ├── index.js                    # Express app entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

<<<<<<< HEAD
## 📅 Complete Roadmap Progress

### Phase 1: Foundation (Completed)
- [x] Day 1-7: Core MERN & Real-time setup.
- [x] Day 8-14: Advanced Workspace & AI Summarization.
- [x] Day 15-21: Recording & Interactive Features.

### Phase 2: Production Readiness (Completed)
- [x] **Day 22**: Docker multi-stage builds & Orchestration.
- [x] **Day 23**: Kubernetes manifests & Helm charts for scalability.
- [x] **Day 24**: GitHub Actions CI/CD (Lint, Build, Deploy).
- [x] **Day 25**: Cloud Deployment (Vercel + Render + AWS).
- [x] **Day 26**: Prometheus + Grafana monitoring & Sentry error tracking.
- [x] **Day 27**: Load testing (JMeter) & Security review (OWASP ZAP).
- [x] **Day 28**: Final QA, edge case testing, and PDF Export optimization.

---

## 🏗️ Production Architecture

### Containerization
- **Backend**: Optimized Node environment with `node` user security.
- **Frontend**: Multi-stage Nginx build for high-performance static serving.
- **Orchestration**: Docker Compose for local dev-parity and Kubernetes for production.

### Monitoring & Reliability
- **Sentry**: Real-time error tracking and session replays.
- **Health Checks**: Specialized `/health` endpoint for K8s liveness/readiness probes.
- **CI/CD**: Fully automated pipeline from linting to containerized builds.

---

## 🚀 Advanced Deployment

Refer to [DEPLOYMENT.md](./DEPLOYMENT.md) for environment variables and cloud provider instructions.

### Monitoring Setup
- **Sentry**: Add `SENTRY_DSN` and `VITE_SENTRY_DSN` to your env variables.
- **Prometheus**: Scrape the `/health` endpoint for basic uptime metrics.
=======
## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18.x
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- Redis (local or [Upstash](https://upstash.com))
- Cloudinary account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/syedsadikaslam/IntellMeet-AI-Powered-Enterprise-Meeting-Collaboration-Platform.git
cd IntellMeet-AI-Powered-Enterprise-Meeting-Collaboration-Platform
```

### 2. Start the backend

```bash
cd server
npm install
cp .env.example .env   # fill in your values (see below)
npm run dev
```

Server starts on `http://localhost:5000`

### 3. Start the frontend

```bash
cd client
npm install
npm run dev
```

Frontend starts on `http://localhost:5173`

---

## 🔐 Environment Variables

### Server (`server/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/intellmeet

# Authentication
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
>>>>>>> 0db7fefed2d3a8326b544b5eac1a41e464039d34

# Redis
REDIS_URL=redis://localhost:6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
FRONTEND_URL=http://localhost:5173

# AI (Week 3)
OPENAI_API_KEY=sk-...
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```


---

## 📡 API Reference

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/signup` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login, returns JWT + refresh token | ❌ |
| `POST` | `/api/auth/refresh` | Refresh access token | ❌ |
| `POST` | `/api/auth/logout` | Invalidate refresh token | ✅ |

### Profile

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/profile/me` | Get current user profile | ✅ |
| `PUT` | `/api/profile/me` | Update profile details | ✅ |
| `POST` | `/api/profile/avatar` | Upload avatar (Cloudinary) | ✅ |

### Meetings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/meetings` | Create a new meeting | ✅ |
| `GET` | `/api/meetings` | List user's meetings | ✅ |
| `GET` | `/api/meetings/:id` | Get meeting details | ✅ |
| `POST` | `/api/meetings/join` | Join meeting by code | ✅ |
| `DELETE` | `/api/meetings/:id` | End/delete a meeting | ✅ |

### Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-meeting` | Client → Server | Join a meeting room |
| `leave-meeting` | Client → Server | Leave a meeting room |
| `send-message` | Client → Server | Send a chat message |
| `receive-message` | Server → Client | Broadcast new chat message |
| `participant-joined` | Server → Client | Notify room of new participant |
| `participant-left` | Server → Client | Notify room of departure |
| `webrtc-offer` | Client → Server | WebRTC offer for peer connection |
| `webrtc-answer` | Client → Server | WebRTC answer |
| `ice-candidate` | Client ↔ Server | ICE candidate exchange |

---

## 🚢 Deployment

### Backend (Railway / Render)

```bash
# Environment variables to set in your cloud dashboard:
NODE_ENV=production
MONGO_URI=<your atlas connection string>
JWT_SECRET=<strong random string>
FRONTEND_URL=https://your-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
REDIS_URL=<upstash or railway redis url>
```

Build command: `npm install`
Start command: `node index.js`

### Frontend (Vercel)

```bash
# Environment variables in Vercel dashboard:
VITE_API_URL=https://your-api.railway.app/api
VITE_SOCKET_URL=https://your-api.railway.app
```

Build command: `npm run build`
Output directory: `dist`

### Production Hardening Already Applied ✅

| Feature | Status |
|---------|--------|
| Gzip compression | ✅ |
| Security headers (Helmet) | ✅ |
| CORS origin restriction | ✅ |
| Rate limiting (auth routes) | ✅ |
| Request logging (morgan) | ✅ |
| Startup secret validation | ✅ |
| JWT + refresh token rotation | ✅ |

---

## 🛡 Security

IntellMeet implements defence-in-depth with multiple security layers:

**Authentication & Authorisation**
- Stateless JWT access tokens (15-min expiry) with refresh token rotation
- Passwords hashed with bcrypt (salt rounds: 12)
- Role-based access control (Admin, Member)
- OAuth2 support (planned)

**Transport & API Security**
- HTTPS enforced in production
- Granular HTTP security headers via Helmet
- CORS locked to trusted origin domains
- Rate limiting on all auth routes (`express-rate-limit`)
- Input sanitisation on all user-supplied data

**Infrastructure Security**
- Secrets managed via environment variables only — never committed
- OWASP Top 10 mitigations applied
- End-to-end encryption for meeting sessions (planned)
- OWASP ZAP security scan (Week 4)

---

## 📅 28-Day Execution Plan

### ✅ Week 1 — Core Backend & Auth Foundation (Done)

| Day | Deliverable |
|-----|-------------|
| 1 | MERN boilerplate, MongoDB, folder structure, initial commit |
| 2 | User model, JWT auth routes (signup/login), refresh tokens, bcrypt |
| 3 | Profile + avatar upload (Cloudinary), protected routes, rate limiting |
| 4 | Meeting model + CRUD, WebRTC peer connection scaffolding |
| 5 | Redis session cache, Socket.io server config |
| 6 | Real-time chat, Socket.io notification events |
| 7 | ✅ Checkpoint: Backend API running, auth + meetings tested via Postman |

### 🔄 Week 2 — Frontend & Real-Time Meeting Core

| Day | Deliverable |
|-----|-------------|
| 8 | React 19 setup: TypeScript, shadcn/ui, Tailwind, TanStack Query, Zustand |
| 9 | Auth pages + protected routes |
| 10 | Meeting lobby + video room UI with WebRTC integration |
| 11 | Real-time in-meeting chat with typing indicators |
| 12 | Screen sharing + recording controls |
| 13 | Live participant list, presence indicators, mute controls |
| 14 | ✅ Checkpoint: Full video meeting + chat end-to-end |

### 🔄 Week 3 — AI Intelligence & Collaboration

| Day | Deliverable |
|-----|-------------|
| 15 | OpenAI Whisper transcription integration |
| 16 | GPT meeting summary + action item extraction |
| 17 | Post-meeting dashboard with summaries & action items |
| 18 | Team workspace + Kanban project board |
| 19 | Task creation from action items with assignee selection |
| 20 | Notification system for mentions and task assignments |
| 21 | ✅ Checkpoint: AI features live, accuracy tested on sample meetings |

### 🔄 Week 4 — Deployment, Monitoring & Polish

| Day | Deliverable |
|-----|-------------|
| 22 | Docker multi-stage builds (frontend + backend) |
| 23 | Kubernetes manifests + Helm chart |
| 24 | GitHub Actions CI/CD pipeline (test → build → deploy) |
| 25 | Cloud deployment with env var configuration |
| 26 | Prometheus + Grafana monitoring, Sentry error tracking |
| 27 | JMeter load testing + OWASP ZAP security review |
| 28 | ✅ Final QA, edge-case testing, demo video, README polish |

---

## 🗺 Roadmap

- [ ] WebRTC full video with 50+ participant support
- [ ] OpenAI Whisper live transcription
- [ ] AI meeting summaries with >85% accuracy
- [ ] Smart action item extraction with assignee detection
- [ ] Post-meeting searchable dashboard
- [ ] Kanban task boards with real-time updates
- [ ] Meeting analytics and productivity insights
- [ ] Docker + Kubernetes production deployment
- [ ] GitHub Actions CI/CD pipeline
- [ ] Prometheus + Grafana observability
- [ ] OWASP ZAP security audit
- [ ] OAuth2 (Google, GitHub)
- [ ] End-to-end encrypted meeting sessions
- [ ] Mobile-responsive PWA

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feat/your-feature-name

# 3. Commit using semantic messages
git commit -m "feat: add real-time cursor presence"
git commit -m "fix: JWT refresh token expiry bug"

# 4. Push and open a Pull Request
git push origin feat/your-feature-name
```

Please follow the existing code style (ESLint + Prettier configured) and write tests for new features where applicable.

---

## 👤 Author

**Sadik**

Prepared for: **Zidio Development — Web Development (MERN) Domain**
Project version: **1.0 — Industry Edition**
Date: **March 2026**

---

<div align="center">

*Crafted with precision and modern engineering principles · Zidio Development · March 2026*

⭐ Star this repo if you find it useful!

</div>
