# eduResumePRO - Quick Start Guide

Get eduResumePRO running in 5 minutes! Choose your preferred setup method below.

---

## 🚀 FASTEST METHOD: Docker Compose (Recommended)

**Prerequisites:**
- Docker Desktop (includes Docker & Docker Compose) - [Download here](https://www.docker.com/products/docker-desktop/)

**Setup (1 command):**
```bash
docker-compose up --build
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

**That's it! Skip ahead to [Testing](#-test-it-out) ✅**

To stop: Press `Ctrl+C` or run `docker-compose down`

---

## 📝 MANUAL SETUP: Local Development

### Prerequisites Check
- ✅ Node.js 18+ installed? Run `node --version`
- ✅ npm installed? Run `npm --version`
- ✅ MongoDB Atlas account created? [Sign up here](https://www.mongodb.com/cloud/atlas/register)

---

### Step 1: Set Up Backend (2 minutes)

**Open Terminal and run:**
```bash
# Navigate to backend
cd backend

# Install packages
npm install
```

**Create `.env` file from template:**
Copy [backend/.env.example](backend/.env.example) to `backend/.env` and update with your MongoDB credentials:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/eduresume
JWT_SECRET=eduresume_super_secret_jwt_key_change_in_production_2024
JWT_EXPIRE=7d
```

**Start Backend Server:**
```bash
npm run dev
```

✅ Backend running on `http://localhost:5000` with auto-reload

---

### Step 2: Set Up Frontend (2 minutes)

**Open NEW Terminal and run:**
```bash
# Navigate to frontend
cd frontend

# Install packages
npm install
```

**Create `.env` file from template:**
Copy [frontend/.env.example](frontend/.env.example) to `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

**Start Frontend Server:**
```bash
npm start
```

✅ Frontend running on `http://localhost:3000`

---

## ✅ Test It Out!

**Open Browser:** http://localhost:3000

You should see the eduResume Pro homepage with:
- Logo/Title
- "Sign Up" and "Login" buttons
- Welcome message

### Create Your First Account

1. Click **"Sign Up"** button
2. Fill in the form:
   ```
   Name: John Doe
   Email: test@example.com
   Password: TestPassword123
   ```
3. Click **"Sign Up"**
4. You'll be redirected to **Dashboard** (logged in!) ✅

**🎉 Congratulations! Your app is working!**

---

## 🐳 Docker Commands Reference

```bash
# Start all services
docker-compose up --build

# Stop without removing volumes (data persists)
docker-compose stop

# Stop and remove containers (data in volumes persists)
docker-compose down

# Stop and DELETE database (clean slate)
docker-compose down -v

# View logs
docker-compose logs -f

# View only backend logs
docker-compose logs -f backend

# Rebuild images (after dependency changes)
docker-compose build --no-cache

# Start in background
docker-compose up -d

# Stop background services
docker-compose stop
```

---

## 🛠️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Stop server | `Ctrl + C` |
| Clear console | `Ctrl + L` or `clear` |
| Open DevTools | `F12` |
| Inspect element | `Ctrl + Shift + C` |
| Browser cache clear | `Ctrl + Shift + Delete` |

---

## 🐛 Common Issues & Fixes

### Docker Issues

**Container fails to start**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild everything
docker-compose down -v
docker-compose up --build
```

**Port already in use**
```bash
# Change port in .env or stop conflicting service
docker container ls
docker stop <container_id>
```

**Can't connect to MongoDB**
```bash
# Make sure MongoDB container started
docker-compose logs mongodb

# Wait 10 seconds for MongoDB to initialize
# Then restart containers
docker-compose restart backend
```

---

### Local Setup Issues

**❌ "Cannot find module" error**
```bash
npm install
```

**❌ "Port 5000 already in use"**
```bash
# Windows: Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID {PID} /F

# Or change PORT=5001 in backend/.env
```

**❌ "MongoDB connection error"**
```
✓ Verify MONGO_URI in .env is correct format
✓ Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)
✓ Ensure cluster is running (not paused)
✓ Try connecting with MongoDB Compass
```

**❌ "CORS error in browser console"**
```
✓ Ensure backend is running (http://localhost:5000)
✓ Frontend .env has correct REACT_APP_API_URL
✓ Clear browser cache: Ctrl + Shift + Delete
✓ Try incognito/private window
```

**❌ "Frontend can't connect to backend"**
```
1. Check if backend is running
2. Open browser DevTools (F12)
3. Go to Network tab
4. Try to sign up
5. Look for failed /api/auth/signup request
6. Check the error message
```

---

## 🚀 Deploying to Production

**Ready to deploy to Render?** Follow these detailed guides:

1. **[RENDER_DEPLOYMENT_QUICK_GUIDE.md](RENDER_DEPLOYMENT_QUICK_GUIDE.md)** - Step-by-step instructions
2. **[DOCKER_RENDER_SETUP.md](DOCKER_RENDER_SETUP.md)** - Complete setup details

**Quick Summary:**
1. Deploy backend to Render (Web Service)
2. Deploy frontend to Render (Static Site or Web Service)
3. Add GitHub Secrets for deployment webhooks
4. Push to main branch → Auto-deploys! 🎉

---

## 📦 What's Included?

### Backend
✅ User authentication (signup/login)
✅ JWT token security
✅ Password hashing (bcryptjs)
✅ MongoDB integration
✅ CORS enabled
✅ Health check endpoint
✅ Docker containerization

### Frontend
✅ Authentication pages (Login/Signup)
✅ Dashboard
✅ Protected routes
✅ Auth context state management
✅ Axios HTTP client
✅ Responsive design
✅ Docker multi-stage build

### Infrastructure
✅ Docker Compose for local development
✅ GitHub Actions CI/CD workflows
✅ Render deployment integration
✅ Environment variable management
✅ Health checks and monitoring ready  

---

## 🎯 Next Steps

### Immediate (After Setup Works)
1. ✅ Verify signup/login works
2. ✅ Create a test user account
3. ✅ Check user appears in MongoDB Atlas

### Short Term (Next 1-2 Sessions)
- [ ] Review RENDER_DEPLOYMENT_QUICK_GUIDE.md
- [ ] Create services on Render
- [ ] Configure GitHub Secrets
- [ ] Deploy and test in production

### Medium Term (Additional Features)
- [ ] Resume editor/builder
- [ ] Job application system
- [ ] User profile management
- [ ] Email notifications
- [ ] PDF export

### Long Term
- [ ] Admin dashboard
- [ ] Resume search/filtering
- [ ] Job recommendations
- [ ] Advanced analytics
- [ ] Mobile app

---

## 📁 Project Structure

```
eduResumePRO/
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Service modules
│   │   ├── middleware/     # Auth, validation
│   │   └── index.js        # Server entry point
│   ├── Dockerfile          # Container config
│   ├── .env               # Local environment
│   ├── .env.example       # Template (copy this)
│   └── package.json       # Dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Auth context
│   │   ├── services/      # API client
│   │   └── App.jsx        # Main app
│   ├── Dockerfile         # Container config
│   ├── .env              # Local environment
│   ├── .env.example      # Template (copy this)
│   └── package.json      # Dependencies
│
├── docker-compose.yml            # Docker setup
├── QUICKSTART.md                # This file
├── DOCKER_RENDER_SETUP.md       # Docker details
├── RENDER_DEPLOYMENT_QUICK_GUIDE.md  # Deployment
└── README.md                    # Project overview
```

---

## 💻 Terminal Commands

### Using Docker (Easiest)
```bash
# Start everything
docker-compose up --build

# View logs
docker-compose logs -f

# Stop
Ctrl + C
# or
docker-compose down
```

### Manual Setup (Windows PowerShell)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend (new window):**
```bash
cd frontend
npm install
npm start
```

---

## ✨ How to Know It's Working

| Component | Docker Shows | Manual Setup Shows |
|-----------|---------|---------|
| Backend | `backend-1  \| Server running on port 5000` | `Server running on port 5000` |
| Frontend | `frontend-1 \| Compiled successfully` | `Compiled successfully!` |
| Database | MongoDB container running | Connected to Atlas |
| Browser | http://localhost:3000 loads | http://localhost:3000 loads |
| Signup | Can create account successfully | New user in MongoDB |
| Login | Can log in with credentials | JWT token received |

---

## 🆘 Emergency Help

| Problem | Solution |
|---------|----------|
| Docker won't start | `docker-compose down -v` then `docker-compose up --build` |
| Port in use | `docker ps` then `docker stop <id>` |
| Backend won't start | Check logs: `docker-compose logs backend` |
| Frontend won't load | Check backend is running: `docker-compose logs frontend` |
| DB connection error | Wait 10 sec for MongoDB, then restart: `docker-compose restart` |
| Can't signup | Check browser console (F12) for errors |
| Wrong .env values | Edit `.env` file, rebuild: `docker-compose down && docker-compose up --build` |

---

## 🔍 Browser Developer Tools

Use these to debug issues:

- **F12** - Open DevTools
- **Console tab** - See error messages
- **Network tab** - See API requests
- **Application tab** - Check localStorage (JWT token)
- **Ctrl + Shift + J** - Open Console directly
- **Ctrl + Shift + K** - Open Console in Firefox

**To debug login issues:**
1. Open DevTools (F12)
2. Go to Network tab
3. Try to sign up
4. Look for `/api/auth/signup` request
5. Click it to see response
6. Look for error messages

---

## 🧪 Testing Credentials

Throughout development, you can test with any email/password you want:

```
Email: test@example.com
Password: Test123456

Email: dev@test.com
Password: Dev123456

Email: yourname@example.com
Password: YourPass123
```

All passwords are hashed with bcryptjs in the database (encrypted).

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| QUICKSTART.md (this) | Get started quickly |
| RENDER_DEPLOYMENT_QUICK_GUIDE.md | Deploy to Render |
| DOCKER_RENDER_SETUP.md | Detailed Docker & deployment info |
| README.md | Project overview |
| SETUP_GUIDE.md | Additional setup notes |
| ARCHITECTURE.md | Project architecture |

---

## 💡 Tips & Tricks

✅ **Tip 1:** Use Docker for easiest setup  
✅ **Tip 2:** Check logs first when something breaks  
✅ **Tip 3:** Clear browser cache if frontend looks wrong (Ctrl+Shift+Delete)  
✅ **Tip 4:** Copy .env.example to .env and fill in values  
✅ **Tip 5:** Always rebuild after changing dependencies: `docker-compose down -v && docker-compose up --build`  

---

## 🎉 Ready to Go!

**Choose your path:**

**→ Docker (Recommended):** `docker-compose up --build`  
**→ Manual Setup:** See "Manual Setup" section above  
**→ Production Deployment:** See [RENDER_DEPLOYMENT_QUICK_GUIDE.md](RENDER_DEPLOYMENT_QUICK_GUIDE.md)  

Visit **http://localhost:3000** and start building! 🚀
