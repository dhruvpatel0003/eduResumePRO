# Docker & Render Deployment Guide

## 🐳 Docker Setup

### Local Development with Docker Compose

Run all services locally with Docker Compose:

```bash
# Build and start all services
docker-compose up --build

# The app will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: localhost:27017
```

### Individual Docker Commands

**Build Backend Image:**
```bash
docker build -t eduresume-backend:latest ./backend
docker run -p 5000:5000 --env-file ./backend/.env eduresume-backend:latest
```

**Build Frontend Image:**
```bash
docker build -t eduresume-frontend:latest ./frontend
docker run -p 3000:3000 --env-file ./frontend/.env eduresume-frontend:latest
```

---

## 🚀 Render Deployment Setup

### Step 1: Create Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `eduresume-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Plan**: Free (or Paid)

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/eduresume
   JWT_SECRET=your_production_secret_key_here
   JWT_EXPIRE=7d
   ```

6. Deploy and grab the **Deployment Hook URL**
   - Go to Settings → Deploy Hook
   - Copy the webhook URL (looks like: `https://api.render.com/deploy/srv-xxxxx?key=xxxxx`)

### Step 2: Create Frontend on Render

1. Click **"New +"** → **"Static Site"** or **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `eduresume-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://eduresume-backend.onrender.com/api
   REACT_APP_ENV=production
   ```

5. Deploy and grab the **Deployment Hook URL**
   - Similar to backend, copy the webhook URL

### Step 3: Add GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and Variables → Actions
3. Add these secrets:
   - `RENDER_DEPLOY_HOOK_BACKEND`: (paste backend webhook URL)
   - `RENDER_DEPLOY_HOOK_FRONTEND`: (paste frontend webhook URL)

---

## 📝 GitHub Actions Workflow

The CI/CD pipeline will:

1. **On Push to `main` branch:**
   - Run tests (backend & frontend)
   - Build Docker images
   - Push to GitHub Container Registry
   - Trigger Render deployment via webhooks

2. **Files involved:**
   - `.github/workflows/ci.yml` - Tests and security scans
   - `.github/workflows/cd.yml` - Docker build and Render deployment

### Verify Deployment

Check deployment status in:
- GitHub Actions: Actions tab
- Render Dashboard: Services section
- Health checks:
  - Backend: `https://eduresume-backend.onrender.com/health`
  - Frontend: `https://eduresume-frontend.onrender.com`

---

## 🔐 Environment Variables Reference

### Backend Production (.env)
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/eduresume
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
```

### Frontend Production (.env)
```env
REACT_APP_API_URL=https://your-backend-domain.onrender.com/api
REACT_APP_ENV=production
```

---

## 🔍 Troubleshooting

### Deployment Hook Not Working
- Ensure webhook URL is correctly added to GitHub Secrets
- Check Render dashboard for service status
- View GitHub Actions logs for error details

### Environment Variables Not Loading
- Verify all variables are set in Render dashboard
- Restart services after updating variables
- Check that variable names match exactly

### MongoDB Connection Issues
- Verify connection string is correct
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 or Render's IP)
- Test connection string locally first

### Build Fails
- Check build logs in Render dashboard
- Verify all dependencies are in package.json
- Ensure Node version compatibility

---

## 📊 File Structure for Docker

```
eduResumePRO/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
├── docker-compose.yml
└── .github/workflows/
    ├── ci.yml
    └── cd.yml
```

---

## ✅ Deployment Checklist

- [ ] Docker Compose works locally: `docker-compose up --build`
- [ ] Backend Dockerfile builds: `docker build -t eduresume-backend ./backend`
- [ ] Frontend Dockerfile builds: `docker build -t eduresume-frontend ./frontend`
- [ ] GitHub repository connected to Render
- [ ] Backend service created on Render
- [ ] Frontend service created on Render
- [ ] Render webhook URLs obtained
- [ ] GitHub Secrets configured
- [ ] Environment variables set in Render
- [ ] Push to main triggers CI/CD pipeline
- [ ] Deployment completes successfully
- [ ] Health checks pass
- [ ] Frontend loads and connects to backend API

---

## 📱 Access Your Deployment

Once deployed on Render:
- **Frontend**: `https://eduresume-frontend.onrender.com` (or custom domain)
- **Backend API**: `https://eduresume-backend.onrender.com/api` (or custom domain)

---

## 🔄 Redeploying

To manually redeploy without pushing code:
1. Go to Render Dashboard
2. Select service
3. Click "Manual Deploy" → "Deploy latest commit"

Or trigger via webhook:
```bash
curl -X POST "https://api.render.com/deploy/srv-xxxxx?key=xxxxx"
```

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Guide](https://docs.github.com/en/actions)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
