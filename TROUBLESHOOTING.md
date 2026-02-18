# Troubleshooting Guide

Comprehensive troubleshooting for eduResumePRO.

---

## Table of Contents

1. [Docker Issues](#docker-issues)
2. [Database Issues](#database-issues)
3. [Frontend Issues](#frontend-issues)
4. [Backend Issues](#backend-issues)
5. [Deployment Issues](#deployment-issues)
6. [Network/Connectivity Issues](#networkconnectivity-issues)

---

## Docker Issues

### Problem: "docker: command not found"

**Cause:** Docker not installed or not in PATH

**Solution:**
1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Restart computer after installation
3. Verify installation:
   ```bash
   docker --version
   docker-compose --version
   ```

---

### Problem: Containers fail to start with error

**Cause:** Port conflicts, missing images, or permission issues

**Solution:**

```bash
# Check what's running
docker ps -a

# Stop all containers
docker stop $(docker ps -a -q)

# Remove all stopped containers
docker container prune

# Check Docker daemon is running
docker ps

# Rebuild everything
docker-compose down -v
docker-compose up --build
```

---

### Problem: "Cannot connect to Docker daemon"

**Cause:** Docker Desktop not running

**Solution:**
1. Open Docker Desktop application
2. Wait for it to start (see icon in system tray)
3. Wait for "Docker Desktop is running" message
4. Try command again

---

### Problem: "Error response from daemon: client version X is too new"

**Cause:** Docker version mismatch

**Solution:**
```bash
# Update Docker Desktop to latest version
docker --version

# If still issues, restart Docker
# Windows: Look for Docker icon in system tray, right-click → Restart
```

---

### Problem: Containers running but can't access services

**Cause:** Port mapping issues

**Solution:**
```bash
# Check port mappings
docker ps

# Should show:
# 0.0.0.0:3000->3000/tcp    (frontend)
# 0.0.0.0:5000->5000/tcp    (backend)
# 0.0.0.0:27017->27017/tcp  (mongodb)

# If ports missing, rebuild
docker-compose down
docker-compose up --build
```

---

### Problem: "Port already allocated"

**Cause:** Another service using the port

**Solution:**

```bash
# Windows - Kill process on port
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# OR change port in .env
PORT=5001
```

---

### Problem: Services running but logs show errors

**Solution:**
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100
```

---

## Database Issues

### Problem: "MongoDB connection refused"

**Cause:** MongoDB not running or wrong URI

**Solution:**

```bash
# Using Docker Compose:
docker-compose logs mongodb

# If MongoDB not starting, clear data and restart
docker-compose down -v
docker-compose up --build

# Wait 10 seconds for MongoDB to initialize
sleep 10
curl http://localhost:27017
```

---

### Problem: "mongodb.net: Name or service not known"

**Cause:** Network issues with MongoDB Atlas

**Solution:**
1. Check internet connection
2. Verify MONGO_URI in backend/.env is correct
3. Check MongoDB Atlas IP whitelist:
   - Go to Deploy → Network Access
   - Add your IP or use 0.0.0.0/0
4. Check cluster is running (not paused)

---

### Problem: "Authentication failed" when connecting to MongoDB Atlas

**Cause:** Wrong username/password in connection string

**Solution:**
1. Go to MongoDB Atlas dashboard
2. Click "Database Access" in left sidebar
3. Find your user
4. Click "Edit" and reset password
5. Update MONGO_URI with new password in backend/.env
6. Restart backend: `docker-compose restart backend`

---

### Problem: "uri parameter to `openUri()` must be a string"

**Cause:** MONGO_URI environment variable not set

**Solution:**
1. Check backend/.env has `MONGO_URI=...` (not empty)
2. Check for typos: should be `MONGO_URI` not `MONGODB_URI`
3. Verify MongoDB connection string format:
   - Local: `mongodb://localhost:27017/eduresume`
   - Atlas: `mongodb+srv://user:password@cluster.net/eduresume`
4. Restart: `docker-compose restart backend`

---

### Problem: "Collection not found" or "Cannot read properties of undefined"

**Cause:** Database name mismatch

**Solution:**
- Verify MONGO_URI ends with `/eduresume`
- ❌ Wrong: `/eduresumepro`, `/eduResume`, `eduresume`
- ✅ Correct: `/eduresume`

---

### Problem: Data not persisting after container restart

**Cause:** Using ephemeral volume or no volume configured

**Solution:**
```bash
# Check volumes in docker-compose.yml
docker volume ls

# Verify mongodb_data volume exists
docker volume inspect mongodb_data

# Make sure docker-compose.yml has:
# volumes:
#   - mongodb_data:/data/db

# Restart without removing volumes
docker-compose restart
```

---

## Frontend Issues

### Problem: "Compiled with warnings" or "Failed to compile"

**Cause:** Syntax errors or missing imports

**Solution:**
```bash
# View detailed error
docker-compose logs frontend

# Or if running locally:
npm start

# Check the error message and fix the file
```

---

### Problem: Frontend loads but shows blank page

**Cause:** JavaScript error or build issue

**Solution:**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Common issue: CORS error (see Frontend API Connection below)

---

### Problem: "Cannot POST /api/auth/signup"

**Cause:** Backend not running or wrong API URL

**Solution:**
```bash
# Check backend is running
docker-compose logs backend

# Should see: "Server running on port 5000"

# Check frontend API URL
# Open browser console: console.log(process.env.REACT_APP_API_URL)
# Should show: http://localhost:5000/api

# If wrong, update frontend/.env and restart
REACT_APP_API_URL=http://localhost:5000/api
```

---

### Problem: CORS error: "Access to XMLHttpRequest blocked"

**Cause:** Frontend and backend on different origins without CORS headers

**Solution:**
1. Verify backend/.env is production (has CORS configured)
2. Check backend is running on correct port
3. Verify frontend/.env API URL is correct
4. Clear browser cache: Ctrl+Shift+Delete
5. Try in private/incognito window

- First verify both services are running:
  ```bash
  docker ps
  ```

- Backend should be on port 5000:
  ```bash
  curl http://localhost:5000/health
  ```

- Frontend should be on port 3000

---

### Problem: Dashboard shows blank after login

**Cause:** Protected route not rendering or permissions issue

**Solution:**
1. Check browser DevTools Console for errors
2. Verify JWT token was received:
   - DevTools → Application → Local Storage
   - Look for `token` key
3. Check token is valid:
   - Copy token value (remove "Bearer " prefix)
   - Go to jwt.io and paste to decode
   - Check expiration date

---

### Problem: "Cannot read properties of undefined" in AuthContext

**Cause:** Trying to use auth context outside of provider

**Solution:**
- Ensure all components are wrapped in `<AuthProvider>`
- Check src/App.jsx has `<AuthProvider>` wrapper
- Check provider is in correct place (wraps everything)

---

## Backend Issues

### Problem: "Server running on port 5000" but API not responding

**Cause:** Server started but endpoints not registered

**Solution:**
```bash
# Check logs for startup errors
docker-compose logs backend -n 50

# Verify health endpoint works
curl http://localhost:5000/health

# If health check fails, check:
# - Node.js version (should be 18+)
# - All imports in src/index.js are correct
# - No syntax errors in src files
```

---

### Problem: "Cannot find module 'express'" or "Cannot find module" error

**Cause:** Dependencies not installed or wrong directory

**Solution:**
```bash
# Using Docker:
docker-compose down
docker-compose build --no-cache
docker-compose up

# Using npm locally:
cd backend
npm install
npm run dev
```

---

### Problem: "Port 5000 already in use"

**Cause:** Another process using port 5000

**Solution:**

```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
# Shows: TCP  0.0.0.0:5000  0.0.0.0:0  LISTENING  12345
taskkill /PID 12345 /F

# Or change port in backend/.env
PORT=5001
```

---

### Problem: JWT token not working (401 Unauthorized)

**Cause:** Token expired, invalid, or not being sent

**Solution:**

1. **Check token exists:**
   ```javascript
   // In browser console
   localStorage.getItem('token')
   // Should return something like: "eyJhbGc..."
   ```

2. **Verify token format:**
   - Should start with "Bearer "
   - Check Authorization header in Network tab

3. **Check JWT_SECRET:**
   - Verify backend/.env has JWT_SECRET set
   - If changed, all previous tokens become invalid
   - Restart backend: `docker-compose restart backend`

4. **Check token expiration:**
   - JWT tokens expire (default: 7 days)
   - User must log in again
   - Increase with JWT_EXPIRE=30d

---

### Problem: Password hashing not working

**Cause:** bcryptjs not installed or encryption failed

**Solution:**
```bash
# Verify bcryptjs installed
npm list bcryptjs

# If missing:
npm install bcryptjs

# Check backend starting without error
docker-compose logs backend
```

---

### Problem: API returns 500 Internal Server Error

**Cause:** Unhandled error in backend code

**Solution:**
1. Check backend logs:
   ```bash
   docker-compose logs backend -n 100
   ```
2. Look for error stack trace
3. Common issues:
   - Missing .env variables
   - Database connection failed
   - Invalid MongoDB query
4. Fix the error and restart:
   ```bash
   docker-compose restart backend
   ```

---

## Network/Connectivity Issues

### Problem: "Unable to reach backend from frontend"

**Cause:** Network configuration issue

**Solution:**

**Using Docker Compose:**
```bash
# Services should use container names:
# REACT_APP_API_URL=http://backend:5000/api

# But it's easier to use localhost:
# REACT_APP_API_URL=http://localhost:5000/api

# Verify all services on same network
docker network ls
docker network inspect eduresume-network
```

**Using local npm (not Docker):**
```bash
# Frontend can reach backend on:
REACT_APP_API_URL=http://localhost:5000/api

# Or using machine IP:
REACT_APP_API_URL=http://192.168.x.x:5000/api
```

---

### Problem: "Cannot reach MongoDB"

**Cause:** Connection string incorrect

**Solution:**

**Using Docker Compose:**
```env
MONGO_URI=mongodb://mongodb:27017/eduresume
```
- `mongodb` is container name
- `27017` is MongoDB port
- `/eduresume` is database name

**Using local MongoDB:**
```env
MONGO_URI=mongodb://localhost:27017/eduresume
```

**Using MongoDB Atlas:**
```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/eduresume
```

---

## Deployment Issues

### Problem: Render deployment fails

**Cause:** Missing environment variables or incorrect build

**Solution:**
1. Check Render dashboard for error logs
2. Verify all environment variables are set:
   - PORT
   - NODE_ENV
   - MONGO_URI
   - JWT_SECRET
3. Check build command is correct:
   - Backend: `npm install`
   - Frontend: `npm install && npm run build`
4. Check start command:
   - Backend: `npm start` or `node src/index.js`
   - Frontend: `npm start` (or use serve package)

---

### Problem: GitHub webhook not triggering Render deployment

**Cause:** Webhook not configured or secrets missing

**Solution:**
1. Get webhook URL from Render (Service Settings → Deploy Hook)
2. Add to GitHub Secrets:
   - Repo → Settings → Secrets and variables → Actions
   - Add `RENDER_DEPLOY_HOOK_BACKEND`
   - Add `RENDER_DEPLOY_HOOK_FRONTEND`
3. Verify CI/CD workflow:
   - Check .github/workflows/cd.yml has webhook calls
   - Ensure secrets match exactly

---

### Problem: Frontend shows old UI after deployment

**Cause:** Browser cache not cleared

**Solution:**
1. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)
2. Clear cache: Ctrl+Shift+Delete
3. Try incognito/private window
4. Check deployed frontend URL is correct

---

## Getting Help

### Information to Collect Before Asking for Help:

1. **Error message:**
   ```bash
   # Copy the exact error text
   ```

2. **Logs:**
   ```bash
   docker-compose logs -n 100 > logs.txt
   ```

3. **Environment info:**
   - OS (Windows/Mac/Linux)
   - Docker version: `docker --version`
   - Node version: `node --version`
   - npm version: `npm --version`

4. **What you did:**
   - What command ran?
   - What did you expect?
   - What actually happened?

5. **What changed:**
   - Did it work before?
   - What did you change?
   - When did it stop working?

---

## Debugging Commands

```bash
# View system info
docker --version
node --version
npm --version

# Check Docker
docker ps                     # Running containers
docker ps -a                 # All containers
docker images                # Downloaded images
docker logs <container>      # Container logs

# Check Network
netstat -ano | findstr :PORT  # Check port
ipconfig                     # Network config (Windows)
ifconfig                     # Network config (Mac/Linux)

# MongoDB
mongosh mongodb://localhost:27017/eduresume   # Connect to local DB

# API Testing
curl http://localhost:5000/health    # Test backend
curl http://localhost:3000           # Test frontend
```

---

## Quick Troubleshooting Checklist

- [ ] Docker Desktop running (Windows/Mac)
- [ ] All containers running: `docker ps`
- [ ] All environments configured (.env files exist)
- [ ] MongoDB connection string correct
- [ ] Backend startup logs show no errors
- [ ] Frontend compiled successfully
- [ ] Browser can access http://localhost:3000
- [ ] Backend accessible: http://localhost:5000/health
- [ ] Network tab shows API requests (F12 → Network)
- [ ] No CORS errors in console
- [ ] Token exists in localStorage
- [ ] Database has user data (use MongoDB Compass)

---

**Still stuck? Check the documentation files:**
- QUICKSTART.md
- ENVIRONMENT_SETUP.md
- DOCKER_RENDER_SETUP.md
- README.md

**Need help?** Review the error message carefully - it usually tells you exactly what's wrong!
