# IntellMeet - AI-Powered Enterprise Meeting & Collaboration Platform

IntellMeet is a modern, high-performance MERN stack application designed for seamless enterprise communication. It leverages WebRTC for video conferencing, Socket.io for real-time interaction, and Redis for high-speed session management.

## 🚀 Features (Week 1 Snapshot)

- **Authentication**: Secure JWT-based auth with refresh token logic and Bcrypt hashing.
- **Meeting Management**: Create and join meetings with unique shareable codes.
- **Real-time Collaboration**: Integrated chat system and live notifications.
- **Meeting Infrastructure**: Peer-to-peer signaling for future video/audio expansion.
- **High Performance**: Redis-backed participant tracking for instant sync across sessions.

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Socket.io-client, Lucide Icons, Axios.
- **Backend**: Node.js, Express, MongoDB, Mongoose, Redis (ioredis), Socket.io.
- **Security**: Helmet, CORS, Express-Rate-Limit.
- **Storage**: Cloudinary (for avatars).

## 📦 Project Structure

```text
/client
  /src
    /components  # Reusable UI components
    /pages       # Main view pages (Hero, Dashboard, MeetingRoom)
    /utils       # Helper functions (API, Socket)
/server
  /controllers  # Request handlers
  /models       # Database schemas
  /routes       # API endpoints
  /services     # Core logic (Socket.io)
  /utils        # General utilities (Redis, Authentication)
```

## ⚙️ Setup Instructions

### 1. Backend
1. `cd server`
2. `npm install`
3. Create `.env` with:
   - `PORT=5000`
   - `MONGO_URI=your_mongodb_uri`
   - `JWT_SECRET=your_secret`
   - `REDIS_URL=your_redis_url`
   - `CLOUDINARY_CLOUD_NAME=name`
   - `CLOUDINARY_API_KEY=key`
   - `CLOUDINARY_API_SECRET=secret`
4. `npm start` (or `npm run dev`)

### 2. Frontend
1. `cd client`
2. `npm install`
3. `npm run dev`

---

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

