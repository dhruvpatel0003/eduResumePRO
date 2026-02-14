# EduResume Pro

A simple resume building platform built with React and Node.js.

## Quick Start

### Prerequisites
- Node.js v16 or higher
- npm v7 or higher

### Installation

```bash
# Install dependencies
npm install

# Backend setup
cd backend
npm install

# Frontend setup (new terminal)
cd frontend
npm install
```

### Running the Application

```bash
# Run both frontend and backend
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
npm run start-backend

# Terminal 2 - Frontend
npm run start-frontend
```

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

## Project Structure

```
eduresume-pro/
├── backend/          # Express.js API server
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
