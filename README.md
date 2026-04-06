# eduResumePRO

A full-stack resume builder and job application management platform.

**Get started in 5 minutes! → [QUICKSTART.md](QUICKSTART.md)**

---

## ✨ Features

- 🔐 User authentication (signup/login with JWT)
- 📄 Resume management (create, edit, delete)
- 🎨 Resume templates
- 💼 Job listings and applications
- 🔒 Protected routes and auth context
- 🐳 Docker containerization
- 🚀 Render deployment ready
- 📱 Responsive design

---

## 🏗️ Tech Stack

### Backend
- **Node.js 18** + **Express 4**
- **MongoDB** (Atlas cloud database)
- **Mongoose** (ODM)
- **JWT** (Authentication)
- **bcryptjs** (Password hashing)
- **Docker** (Containerization)

### Frontend
- **React 18**
- **React Router 6** (Navigation)
- **Axios** (API client)
- **Context API** (State management)
- **CSS3** (Styling)
- **Docker** (Containerization)

### DevOps
- **Docker** & **Docker Compose** (Local)
- **GitHub Actions** (CI/CD)
- **Render.com** (Deployment)

---

## 📚 Documentation

Choose what you need:

| Guide | Purpose |
|-------|---------|
| [QUICKSTART.md](QUICKSTART.md) | **Start here!** Get running in 5 minutes |
| [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) | Environment variables explained |
| [DOCKER_RENDER_SETUP.md](DOCKER_RENDER_SETUP.md) | Complete Docker & Render guide |
| [RENDER_DEPLOYMENT_QUICK_GUIDE.md](RENDER_DEPLOYMENT_QUICK_GUIDE.md) | Step-by-step Render deployment |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Fix common issues |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Project architecture |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Detailed deployment info |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Advanced setup options |

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

**Prerequisites:**
- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop/))

**Run:**
```bash
docker-compose up --build
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: mongodb://localhost:27017/eduresume

---

### Option 2: Local Development

**Prerequisites:**
- Node.js 18+ ([Download](https://nodejs.org/))
- npm 9+
- MongoDB Atlas account ([Create](https://www.mongodb.com/cloud/atlas))

**Backend:**
```bash
cd backend
npm install
npm run dev              # Auto-reload on file changes
```

**Frontend (new terminal):**
```bash
cd frontend
npm install
npm start
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 🔧 Setup Checklist

Essential first-time setup:

- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Fill in MongoDB connection string (MONGO_URI)
- [ ] Copy `frontend/.env.example` to `frontend/.env`
- [ ] Verify frontend API URL is correct
- [ ] Run `docker-compose up` or `npm install && npm run dev`
- [ ] Navigate to http://localhost:3000
- [ ] Create test account to verify it works

**Detailed setup:** See [QUICKSTART.md](QUICKSTART.md)

---

## 📁 Project Structure

```
eduResumePRO/
├── backend/
│   ├── src/
│   │   ├── config/         # DB configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth middleware
│   │   └── index.js        # Server entry point
│   ├── Dockerfile
│   ├── .env                # Local environment (don't commit)
│   ├── .env.example        # Template (commit this)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Auth context
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app
│   ├── Dockerfile
│   ├── .env                # Local environment (don't commit)
│   ├── .env.example        # Template (commit this)
│   └── package.json
│
├── docker-compose.yml      # Multi-container orchestration
└── [Documentation files]   # See table above
```

---

## 🔑 Environment Configuration

### Backend `.env.example` → `.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/eduresume
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

### Frontend `.env.example` → `.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

**Full details:** See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)

---

## 🧪 Test It

### 1. Verify Services Running
```bash
# Should return 200 OK
curl http://localhost:5000/health

# Should load the homepage
open http://localhost:3000
```

### 2. Create Account
1. Click "Sign Up"
2. Enter email and password
3. Click "Sign Up"
4. Should redirect to dashboard

### 3. Verify Database
- Use [MongoDB Compass](https://www.mongodb.com/products/compass)
- Should see user in `eduresume.users` collection

---

## 🐛 Troubleshooting

**Having issues?** Check these first:

1. **Services not starting?** →  See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. **Port conflicts?** → Change PORT in .env or kill process
3. **MongoDB errors?** → Verify MONGO_URI and check IP whitelist
4. **API errors?** → Check REACT_APP_API_URL in frontend/.env
5. **Environment issues?** → Review [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)

---

## 🚀 Deployment

### Deploy to Render.com

**Requirements:**
- GitHub account with repo pushed
- Render account ([Sign up](https://render.com/))
- MongoDB Atlas account

**Steps:**
1. Follow [RENDER_DEPLOYMENT_QUICK_GUIDE.md](RENDER_DEPLOYMENT_QUICK_GUIDE.md)
2. Create backend service on Render
3. Create frontend service on Render
4. Configure GitHub Secrets for webhooks
5. Push to main branch → Auto-deploys!

**Detailed guide:** See [DOCKER_RENDER_SETUP.md](DOCKER_RENDER_SETUP.md)

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Get JWT token
- `GET /api/auth/profile` - Get current user (protected)

### Users
- `GET /api/users/profile` - Get profile (protected)
- `PUT /api/users/profile` - Update profile (protected)

### Health Check
- `GET /health` - Server status

---

## 🔐 Security Features

✅ Password hashing with bcryptjs  
✅ JWT token authentication  
✅ Protected routes/endpoints  
✅ CORS enabled  
✅ Non-root Docker users  
✅ Environment variable management  

---

## 📝 Development Workflow
   
### Start Development
```bash
# All services in one command
docker-compose up --build

# Or manual setup
cd backend && npm run dev  # Terminal 1
cd frontend && npm start   # Terminal 2
```

### Make Changes
- Backend changes auto-reload with `nodemon`
- Frontend changes auto-reload with React
- Update database schemas in `src/models/`

### Test Changes
```bash
# Backend tests (automatically generates HTML coverage)
cd backend && npm test

# Frontend tests
cd frontend && npm test -- --watchAll=false
```

#### Viewing Test Coverage (HTML Format)
Since testing is executed via Jest with `collectCoverage` enabled:
1. Run the tests in the specific directory (e.g., `cd backend && npm test`).
2. Jest will automatically create a `coverage/lcov-report/index.html` file.
3. Open the HTML file in your browser to view a visually formatted, detailed breakdown of code coverage!
   - **Windows:** `start coverage/lcov-report/index.html`
   - **Mac:** `open coverage/lcov-report/index.html`
   - **Linux:** `xdg-open coverage/lcov-report/index.html`

### Commit Code
```bash
git add .
git commit -m "Feature: description"
git push origin main
```

→ GitHub Actions run tests → Render deploys automatically!

---

## 🎓 Learning Resources

### Frontend (React)
- [Create React App Docs](https://create-react-app.dev/)
- [React Router Docs](https://reactrouter.com/)
- [Axios Docs](https://axios-http.com/)

### Backend (Node/Express)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Mongoose Guide](https://mongoosejs.com/)

### Authentication
- [JWT Introduction](https://jwt.io/introduction)
- [bcryptjs Guide](https://github.com/dcodeIO/bcrypt.js)

### DevOps
- [Docker Documentation](https://docs.docker.com/)
- [Render Documentation](https://render.com/docs)
- [GitHub Actions](https://github.com/features/actions)

---

## 👥 Contributing

Found a bug or want to add a feature?

1. Create a branch: `git checkout -b feature/my-feature`
2. Make changes
3. Test thoroughly
4. Commit: `git commit -m "Feature: description"`
5. Push: `git push origin feature/my-feature`
6. Create Pull Request

---

## 📄 License

[Add your license here]

---

## 🆘 Getting Help

1. **Check documentation** → [See docs above](#-documentation)
2. **Search issues** → GitHub Issues tab
3. **Review logs** → `docker-compose logs`
4. **Check troubleshooting** → [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 🎉 Ready to Start?
├── frontend/         # React.js application
└── package.json      # Root configuration
```

## License

MIT

## 📚 API Documentation

**Base URL**: http://localhost:5000/api

### Authentication
- POST `/auth/signup` - Sign up
- POST `/auth/login` - Login
- GET `/auth/me` - Get current user

### Resumes
- POST `/resumes` - Create resume
- GET `/resumes` - Get all resumes
- PUT `/resumes/:id` - Update resume
- DELETE `/resumes/:id` - Delete resume

### Templates
- GET `/templates` - Get all templates
- POST `/templates` - Upload template (professor)

## 📊 CI/CD Pipeline

- ✅ Jest tests & coverage
- ✅ CodeQL security scanning
- ✅ Secret detection (Gitleaks)
- ✅ Docker vulnerability scanning (Trivy)
- ✅ Auto-deploy to Render

## 🔧 Tech Stack

**Backend**: Node.js, Express, MongoDB, JWT
**Frontend**: React, Tailwind CSS, Axios
**DevOps**: Docker, GitHub Actions, Render

## 📄 License

MIT
