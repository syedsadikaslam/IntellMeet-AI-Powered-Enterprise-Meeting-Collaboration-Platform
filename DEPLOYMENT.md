# Deployment Guide: Render & Vercel Orchestration

This guide provides the exact steps to deploy the IntellMeet Backend on **Render** and the Frontend on **Vercel**.

---

## 🏗️ Backend Deployment (Render)

### Step 1: Connect to GitHub
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** > **Blueprints**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file.
5. Click **Apply**.

### Step 2: Configure Environment Variables
In the Render dashboard for your new service, go to **Environment** and add:
- `MONGO_URI`: Your MongoDB Atlas string.
- `JWT_SECRET`: A long random string.
- `REDIS_HOST`/`PORT`/`PASSWORD`: Redis Cloud credentials.
- `FRONTEND_URL`: Your Vercel URL (e.g., `https://intellmeet.vercel.app`).
- `CLOUDINARY_*`: Your Cloudinary keys.
- `OPENAI_API_KEY`: Your OpenAI key.

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Initialize Project
1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import your GitHub repository.

### Step 2: Project Settings
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 3: Environment Variables
Add these in the Vercel project settings:
- `VITE_API_URL`: `https://your-render-url.onrender.com/api`
- `VITE_SOCKET_URL`: `https://your-render-url.onrender.com`
- `VITE_SENTRY_DSN`: (Optional) Your Sentry DSN.

---

## 🔗 Connection Checklist
1. [ ] **Slash in URL**: Ensure `VITE_API_URL` ends with `/api` but `VITE_SOCKET_URL` does **not**.
2. [ ] **CORS**: Ensure `FRONTEND_URL` in Render matches your Vercel URL exactly (no trailing slash).
3. [ ] **SPA Routing**: The `client/vercel.json` file is already added to handle page refreshes.

## 🛠️ Troubleshooting
- **403 Forbidden**: Check if the `FRONTEND_URL` in the Backend matches the actual Vercel URL.
- **Socket Disconnect**: Ensure you are using `https://` for the `VITE_SOCKET_URL`.
