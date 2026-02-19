# Environment Variables Setup Guide

This guide explains all environment variables used in eduResumePRO and how to configure them.

---

## Quick Reference

### Backend Environment Variables

```env
# Server
PORT=5000                              # Server port (default: 5000)
NODE_ENV=development                   # Node environment (development/production)

# Database
MONGO_URI=mongodb+srv://...            # MongoDB connection string

# Authentication
JWT_SECRET=your_super_secret_key       # JWT signing secret (change in production!)
JWT_EXPIRE=7d                          # JWT token expiration time
```

### Frontend Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000/api    # Backend API URL
REACT_APP_ENV=development                      # App environment
```

---

## Backend Environment Variables Explained

### `PORT` (Default: 5000)
- Controls which port the Express server listens on
- Used by backend only
- Change if port 5000 is already in use

```env
PORT=5000          # Local development
PORT=5000          # Production (same port, Render handles routing)
```

---

### `NODE_ENV`
- Controls application behavior
- Set to `development` for local, `production` for deployment

```env
NODE_ENV=development   # Enables logging, auto-reload, detailed errors
NODE_ENV=production    # Disables debug output, optimizes performance
```

**Effects:**
- `development`: Express logs requests, detailed error messages, watch mode
- `production`: Minimal logging, security headers, optimized

---

### `MONGO_URI`
- MongoDB connection string
- Format differs for local vs cloud databases

#### Local Development (Using Docker Compose)
```env
MONGO_URI=mongodb://mongodb:27017/eduresume
```
- `mongodb` is the Docker container hostname
- `27017` is MongoDB default port
- `/eduresume` is the database name

#### Cloud Database (MongoDB Atlas)
```env
MONGO_URI=mongodb+srv://username:password@cluster-name.mongodb.net/eduresume
```

**Getting your MongoDB Atlas connection string:**
1. Go to https://cloud.mongodb.com/
2. Log in to your account
3. Click "Databases" in left sidebar
4. Click "Connect" on your cluster
5. Choose "Drivers" tab
6. Copy the connection string
7. Replace `<username>`, `<password>` with your Atlas credentials
8. Replace `<database>` with `/eduresume`

**Example:**
```env
MONGO_URI=mongodb+srv://dhruvpatel150203_db_user:Fi3x45oFddyus3sb@eduresumepro-cluster-0.ivrzzsc.mongodb.net/eduresume
```

⚠️ **Important:** 
- Database name must be `/eduresume` (not `/eduresumepro`)
- Include username and password in the string
- Use the correct cluster name

---

### `JWT_SECRET`
- Secret key used to sign and verify JWT authentication tokens
- Used when user logs in (creates token) and when accessing protected routes (verifies token)

```env
JWT_SECRET=eduresume_super_secret_jwt_key_change_in_production_2024
```

**Security Notes:**
- 🔴 Never push real secret to GitHub (use .env which is gitignored)
- 🟡 Must be changed in production
- 🟢 Can be any random string (32+ characters recommended)
- 🔵 Changing it will invalidate all existing tokens

---

### `JWT_EXPIRE`
- Controls how long JWT tokens are valid for

```env
JWT_EXPIRE=7d       # Token valid for 7 days
JWT_EXPIRE=24h      # Token valid for 24 hours
JWT_EXPIRE=14d      # Token valid for 14 days
```

**Valid formats:**
- `7d` (days)
- `24h` (hours)
- `30m` (minutes)
- `60s` (seconds)

---

## Frontend Environment Variables Explained

### `REACT_APP_API_URL`
- The base URL for all API calls to the backend
- Frontend uses this to build complete API URLs

#### Local Development
```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### Production (Render)
```env
REACT_APP_API_URL=https://eduresume-backend.onrender.com/api
```

**Note:** Include `/api` at the end! The frontend will append to this:
- `REACT_APP_API_URL + /auth/signup` = `http://localhost:5000/api/auth/signup`

---

### `REACT_APP_ENV`
- Indicates the environment for logging and debugging

```env
REACT_APP_ENV=development   # Local development
REACT_APP_ENV=production    # Production
```

---

## Environment Files Reference

### `.env` Files
- Contains environment variables for development
- **NOT committed to Git** (.gitignore)
- Created locally by copying `.env.example`

### `.env.example` Files
- Template files showing what variables are needed
- **Committed to Git**
- Users copy this to `.env` and fill in their values

### `.env.production` Files
- Contains environment variables for production
- Used during deployment
- Usually committed to Git (contains no secrets)

---

## Setup Instructions

### Step 1: Copy Template Files

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### Step 2: Fill in Values

**backend/.env:**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/eduresume
JWT_SECRET=eduresume_super_secret_jwt_key_change_in_production_2024
JWT_EXPIRE=7d
```

**frontend/.env:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

### Step 3: Verify Connection

**Check backend:**
```bash
npm run dev
# Should see: "Server running on port 5000" + "MongoDB connected"
```

**Check frontend:**
```bash
npm start
# Should see: "Compiled successfully!"
```

---

## Docker & Environment Variables

### Using Docker Compose
Environment variables are set in `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - PORT=5000
      - NODE_ENV=development
      - MONGO_URI=mongodb://mongodb:27017/eduresume
      - JWT_SECRET=eduresume_super_secret_jwt_key_change_in_production_2024
      - JWT_EXPIRE=7d
```

### Overriding with .env Files
- Docker Compose reads .env file from project root
- Can override variables for docker-compose

### Production (Render)
- Set variables in Render dashboard
- Variables → Environment variables section
- No .env file needed

---

## Common Issues

### Problem: "Cannot connect to MongoDB"
**Solution:** Check MONGO_URI
```bash
# ✅ Correct format (Atlas):
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/eduresume

# ✅ Correct format (Local):
MONGO_URI=mongodb://localhost:27017/eduresume

# ❌ Incorrect (missing /eduresume):
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net

# ❌ Incorrect (wrong password):
MONGO_URI=mongodb+srv://user:wrongpassword@cluster.mongodb.net/eduresume
```

### Problem: "API response is 404"
**Solution:** Check REACT_APP_API_URL
```bash
# ✅ Correct:
REACT_APP_API_URL=http://localhost:5000/api

# ❌ Incorrect (missing /api):
REACT_APP_API_URL=http://localhost:5000

# ❌ Incorrect (extra /api):
REACT_APP_API_URL=http://localhost:5000/api/api
```

### Problem: "Frontend can't connect to backend"
**Solution 1:** Verify backend is running
```bash
curl http://localhost:5000/health   # Should return 200 OK
```

**Solution 2:** Check REACT_APP_API_URL in frontend/.env
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

**Solution 3:** Clear browser cache and try again

---

## Security Best Practices

✅ **DO:**
- Change `JWT_SECRET` in production
- Use strong, random JWT_SECRET (32+ characters)
- Keep `.env` files out of Git (.gitignore)
- Rotate secrets regularly
- Use different secrets for dev/prod

❌ **DON'T:**
- Commit `.env` files to GitHub
- Use same secret in dev and production
- Share environment variables over email
- Use weak secrets like "123456"
- Log sensitive variables

---

## Deployment Configuration

### Render Environment Variables

When deploying to Render, set these in the dashboard:

**Backend Service:**
```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/eduresume
JWT_SECRET=your-new-production-secret-key
JWT_EXPIRE=7d
```

**Frontend Service:**
```
REACT_APP_API_URL=https://eduresume-backend.onrender.com/api
REACT_APP_ENV=production
```

**Note:** Frontend service needs `REACT_APP_` prefix for environment variables to be available to React app.

---

## Monitoring Variables

To verify variables are set correctly:

**Backend:**
```bash
npm run dev
# Check console output for:
# - Server running on port 5000
# - MongoDB connected
```

**Frontend:**
```bash
npm start
# Check in browser console (F12):
# console.log(process.env.REACT_APP_API_URL)
```

---

## Further Reading

- [Node.js Environment Variables](https://nodejs.org/en/docs/)
- [MongoDB Connection String](https://docs.mongodb.com/)
- [Create React App - Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [JWT.io - Introduction](https://jwt.io/introduction)
- [Render - Environment Variables](https://render.com/docs/environment-variables)

---

## Quick Checklist

Before starting, ensure:

- [ ] `.env.example` files exist in backend/ and frontend/
- [ ] You copied `.env.example` to `.env` in both directories
- [ ] Backend `.env` has MONGO_URI set
- [ ] Backend `.env` has JWT_SECRET set
- [ ] Frontend `.env` has REACT_APP_API_URL set
- [ ] No `.env` files are committed to Git
- [ ] You can access MongoDB Atlas with your credentials
- [ ] Backend runs without errors (`npm run dev`)
- [ ] Frontend compiles without errors (`npm start`)

**Ready to go! 🚀**
