# EduResume Pro - Development Guide

Complete setup and development guide for running EduResume Pro locally.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Setup](#environment-setup)
4. [Running the Applications](#running-the-applications)
5. [Database Setup](#database-setup)
6. [Testing the API](#testing-the-api)
7. [Development Workflow](#development-workflow)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** - [Sign up here](https://www.mongodb.com/cloud/atlas)
- **Git** (optional, for version control)

### Recommended Tools
- **Postman** or **Insomnia** - For API testing
- **VS Code** - Code editor
- **MongoDB Compass** - GUI for MongoDB (optional)

### Verify Installation
```bash
node --version    # Should be v14+
npm --version     # Should be v6+
```

---

## Installation

### 1. Clone/Download the Project
```bash
# Navigate to your projects directory
cd c:\Users\dhruv\Downloads\ViHTechnologies\

# The project is already set up at:
# eduResumePRO/
```

### 2. Install Backend Dependencies
```bash
# Navigate to backend folder
cd eduResumePRO/backend

# Install all required packages
npm install
```

**What gets installed:**
- Express 4.18.2 - Web framework
- Mongoose 8.19.0 - MongoDB ODM
- jsonwebtoken 9.0.2 - JWT authentication
- bcryptjs 3.0.2 - Password hashing
- dotenv 17.2.3 - Environment variables
- cors 2.8.5 - Cross-origin requests
- body-parser 1.20.2 - Request parsing

### 3. Install Frontend Dependencies
```bash
# Navigate to frontend folder (from project root)
cd ../frontend

# Install all required packages
npm install
```

**What gets installed:**
- React 18.2.0 - UI library
- React Router 6.0 - Routing
- Axios 1.6.2 - HTTP client
- React DOM 18.2.0 - React rendering

---

## Environment Setup

### Backend Configuration

#### 1. Create `.env` file in `backend/` folder

```bash
cd eduResumePRO/backend

# Create .env file (Windows)
type nul > .env
```

#### 2. Add the following to `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb+srv://dhruvpatel150203_db_user:Fi3x45oFddyus3sb@eduresumepro-cluster-0.ivrzzsc.mongodb.net/eduresume

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d

# Email Configuration (Optional - for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SENDER_EMAIL=noreply@eduresume.com
```

### Frontend Configuration

#### 1. Create `.env` file in `frontend/` folder

```bash
cd ../frontend

# Create .env file (Windows)
type nul > .env
```

#### 2. Add the following to `frontend/.env`:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

### Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `PORT` | Backend server port | `5000` |
| `JWT_SECRET` | Secret key for JWT tokens | `any_random_secret_key` |
| `REACT_APP_API_URL` | Frontend API endpoint | `http://localhost:5000/api` |

---

## Running the Applications

### Option 1: Run Backend and Frontend Separately (Recommended for Development)

#### Terminal 1 - Start Backend Server
```bash
# Navigate to backend folder
cd eduResumePRO/backend

# Start the server
npm start

# Expected output:
# Server running on port 5000
# MongoDB connected successfully
```

#### Terminal 2 - Start Frontend Development Server
```bash
# Navigate to frontend folder (from project root)
cd eduResumePRO/frontend

# Start React app
npm start

# Expected output:
# Compiled successfully!
# You can now view eduResume in the browser.
# Local: http://localhost:3000
```

### Option 2: Run Both Simultaneously

```bash
# From project root (eduResumePRO)

# Terminal 1
cd backend && npm start

# Terminal 2 (new terminal)
cd frontend && npm start
```

---

## Database Setup

### Verify MongoDB Atlas Connection

#### 1. Test Connection from Backend

```bash
# In backend folder
cd eduResumePRO/backend

# Run this command to test the connection:
node -e "
const mongoose = require('mongoose');
const uri = 'mongodb+srv://dhruvpatel150203_db_user:Fi3x45oFddyus3sb@eduresumepro-cluster-0.ivrzzsc.mongodb.net/eduresume';
mongoose.connect(uri)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.log('❌ Connection Error:', err.message));
"
```

#### 2. Collections Created Automatically

When you run the backend, Mongoose will automatically create these collections:
- `users` - User accounts
- `resumes` - Resume data
- `templates` - Resume templates
- `jobopenings` - Job postings
- `applications` - Job applications
- `feedbacks` - Professor feedback

#### 3. Create Indexes (Recommended)

In **MongoDB Atlas**:

1. Go to your cluster > Collections
2. Select each collection below and create indexes:

```javascript
// users collection
{ email: 1 } - Unique

// resumes collection
{ userId: 1 }
{ templateId: 1 }

// applications collection
{ userId: 1 }
{ jobOpeningId: 1 }

// feedbacks collection
{ resumeId: 1 }
{ studentId: 1 }
{ professorId: 1 }
```

---

## Testing the API

### Using Postman (Recommended)

#### 1. Create a New Postman Collection

Open Postman and create a new collection called "EduResume Pro"

#### 2. Test Authentication

**Sign Up (POST)**
```
URL: http://localhost:5000/api/auth/signup
Method: POST
Body (JSON):
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123@",
  "role": "student"
}
```

Expected Response:
```json
{
  "message": "User registered successfully",
  "user": {...},
  "token": "eyJhbGc..."
}
```

**Login (POST)**
```
URL: http://localhost:5000/api/auth/login
Method: POST
Body (JSON):
{
  "email": "john@example.com",
  "password": "Password123@"
}
```

Save the returned `token` for authenticated requests.

#### 3. Test Protected Endpoints

**Get All Templates (GET - Public)**
```
URL: http://localhost:5000/api/templates
Method: GET
```

**Create Resume (POST - Protected)**
```
URL: http://localhost:5000/api/resumes
Method: POST
Headers:
  Authorization: Bearer {YOUR_JWT_TOKEN}
Body (JSON):
{
  "title": "My Resume",
  "personalInfo": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1-234-567-8900",
    "location": "San Francisco, CA"
  }
}
```

### Using cURL (Command Line)

```bash
# Sign Up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123@",
    "role": "student"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123@"
  }'

# Get Templates (Public endpoint)
curl -X GET http://localhost:5000/api/templates

# Get Resumes (Protected endpoint)
curl -X GET http://localhost:5000/api/resumes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Insomnia

Similar to Postman - create requests and store the JWT token in environment variables for reuse.

---

## Development Workflow

### Project Structure
```
eduResumePRO/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       # MongoDB connection
│   │   ├── controllers/          # Business logic
│   │   │   ├── authController.js
│   │   │   ├── resumeController.js
│   │   │   ├── templateController.js
│   │   │   ├── jobOpeningController.js
│   │   │   ├── applicationController.js
│   │   │   └── feedbackController.js
│   │   ├── models/              # MongoDB schemas
│   │   │   ├── User.js
│   │   │   ├── Resume.js
│   │   │   ├── Template.js
│   │   │   ├── JobOpening.js
│   │   │   ├── Application.js
│   │   │   └── Feedback.js
│   │   ├── routes/              # API endpoints
│   │   │   ├── authRoutes.js
│   │   │   ├── resumeRoutes.js
│   │   │   ├── templateRoutes.js
│   │   │   ├── jobOpeningRoutes.js
│   │   │   ├── applicationRoutes.js
│   │   │   └── feedbackRoutes.js
│   │   ├── middleware/          # Custom middleware
│   │   │   └── auth.js          # JWT verification
│   │   ├── utils/               # Helper functions
│   │   │   └── generateToken.js
│   │   └── index.js             # Entry point
│   ├── .env                      # Environment variables
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx # Route protection
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Resumes.jsx
│   │   │   ├── Templates.jsx
│   │   │   ├── Jobs.jsx
│   │   │   └── Applications.jsx
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── resumeService.js
│   │   │   ├── templateService.js
│   │   │   ├── jobService.js
│   │   │   ├── applicationService.js
│   │   │   └── feedbackService.js
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   ├── auth.css
│   │   │   ├── home.css
│   │   │   ├── resumes.css
│   │   │   ├── templates.css
│   │   │   ├── jobs.css
│   │   │   └── applications.css
│   │   ├── App.jsx
│   │   └── index.js
│   ├── .env
│   └── package.json
│
├── DATABASE_SCHEMA.md            # Database documentation
├── API_DOCUMENTATION.md          # API reference
└── DEVELOPMENT_GUIDE.md          # This file
```

### Common Development Tasks

#### Adding a New Feature

1. **Create Database Model** (if needed)
   ```bash
   # Create new model in backend/src/models/
   # Example: NewFeature.js
   ```

2. **Create Controller** (business logic)
   ```bash
   # Create in backend/src/controllers/newFeatureController.js
   ```

3. **Create Routes** (API endpoints)
   ```bash
   # Create in backend/src/routes/newFeatureRoutes.js
   # Add import and middleware in backend/src/index.js
   ```

4. **Create Service** (API client)
   ```bash
   # Create in frontend/src/services/newFeatureService.js
   ```

5. **Create Page Component** (UI)
   ```bash
   # Create in frontend/src/pages/NewFeature.jsx
   # Create stylesheet in frontend/src/styles/newFeature.css
   ```

6. **Add Route in App.jsx**
   ```javascript
   // Add new route in frontend/src/App.jsx
   <Route path="/new-feature" element={<ProtectedRoute><NewFeature /></ProtectedRoute>} />
   ```

#### Modifying a Model

1. Edit the schema file in `backend/src/models/`
2. Update the controller if needed
3. Restart the backend server with `npm start`

#### Testing Changes

1. Ensure both servers are running
2. Test in frontend at `http://localhost:3000`
3. Test API with Postman/cURL
4. Check browser console for errors (F12)
5. Check terminal for server errors

---

## Troubleshooting

### MongoDB Connection Issues

**Problem:** `MongoDB connection error` in terminal

**Solutions:**
1. Verify connection string in `.env` is correct
2. Check MongoDB Atlas IP whitelist:
   - Go to MongoDB Atlas > Security > Network Access
   - Click "Add IP Address"
   - Select "Allow access from anywhere" or add your IP
3. Ensure MongoDB cluster is active (not paused)
4. Test with MongoDB Compass to verify credentials

### Port Already in Use

**Problem:** `Port 5000 is already in use`

**Solution:**
```bash
# Windows - Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID {PID} /F

# Change port in backend/.env
PORT=5001  # Use different port
```

### CORS Errors

**Problem:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Ensure backend is running
2. Verify `REACT_APP_API_URL` in frontend/.env matches backend URL
3. Check backend has CORS middleware configured:
   ```javascript
   app.use(cors());
   ```

### Frontend Can't Connect to API

**Problem:** `Network Error` or `404` responses

**Solutions:**
1. Ensure both servers are running
2. Check API URL in frontend service files
3. Verify endpoint paths in frontend services match backend routes
4. Check network tab in browser DevTools

### Nodemon Not Working (Backend)

**Problem:** Changes to backend files don't auto-restart

**Support:**
```bash
# Install nodemon globally
npm install -g nodemon

# Or run directly from node_modules
npx nodemon src/index.js
```

### Package Installation Error

**Problem:** `npm ERR! code ERESOLVE`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try install with legacy peer deps flag
npm install --legacy-peer-deps
```

### Token Expiration Issues

**Problem:** Logged in but keep getting `401 Unauthorized`

**Solution:**
1. JWT token expires after 7 days by default
2. Login again to get a new token
3. Check local storage in browser DevTools

---

## Performance Tips

1. **Enable Response Caching**
   - Add caching headers for static assets
   - Use browser cache for API responses

2. **Database Optimization**
   - Create indexes as recommended
   - Use MongoDB Atlas monitoring

3. **Frontend Optimization**
   - Use React lazy loading for components
   - Optimize images before upload
   - Minify CSS/JavaScript

4. **Backend Optimization**
   - Use connection pooling (Mongoose handles this)
   - Implement pagination for large datasets
   - Add response compression

---

## Next Steps

1. ✅ Complete installation and setup
2. ✅ Test authentication (signup/login)
3. ✅ Test CRUD operations for each feature
4. 🔄 Build resume editor form
5. 🔄 Build job application form
6. 🔄 Build feedback submission form
7. 🔄 Add navigation component
8. 🔄 Implement email notifications
9. 🔄 Add PDF export feature
10. 🔄 Deploy to production

---

## Support & Resources

- **Documentation**: See `API_DOCUMENTATION.md` and `DATABASE_SCHEMA.md`
- **MongoDB Help**: https://docs.mongodb.com/
- **Express.js Help**: https://expressjs.com/
- **React Help**: https://react.dev/
- **Postman Help**: https://learning.postman.com/

---

## Quick Reference Commands

```bash
# Backend
cd backend
npm install          # Install dependencies
npm start            # Start server on port 5000

# Frontend
cd frontend
npm install          # Install dependencies
npm start            # Start React on port 3000

# Testing
# Use Postman or cURL to test API endpoints
```

---

**Last Updated:** January 2024
**Version:** 1.0
