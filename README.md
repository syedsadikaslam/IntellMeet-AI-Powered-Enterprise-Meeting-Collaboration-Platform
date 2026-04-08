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

## 📅 Roadmap (Week 1 Completed)

- [x] Day 1: Project setup & MERN Foundation
- [x] Day 2: Authentication (Signup/Login/JWT)
- [x] Day 3: Profile Management & Rate Limiting
- [x] Day 4: Meeting CRUD & Signaling Setup
- [x] Day 5: Redis & Socket.io Infrastructure
- [x] Day 6: Real-time Chat & Notifications
- [x] Day 7: Central Dashboard & Checkpoint
