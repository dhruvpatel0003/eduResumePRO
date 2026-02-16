# EduResume Pro

A modern full-stack web application for resume building, job postings, and professional feedback. Built with React, Express.js, MongoDB, and JWT authentication.

## 🚀 Quick Links

- **[QUICKSTART.md](QUICKSTART.md)** - Get running in 5 minutes ⚡
- **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** - Complete setup & development guide
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Database models & relationships
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Full API reference with examples

## Overview

EduResume Pro is a comprehensive platform designed for students and professors to collaborate on resume development. Students can create resumes using professional templates, apply for jobs, and receive feedback from professors. Professors can review resumes and provide structured feedback.

## ✨ Features

### For Students
- 📝 Create and manage multiple resumes
- 🎨 Choose from professional resume templates
- 📊 Track ATS (Applicant Tracking System) scores
- 💼 Browse and apply for job openings
- 📈 Track application status in real-time
- 📬 Receive constructive feedback from professors
- 🔐 Secure authentication with JWT tokens

### For Professors
- ✅ Review student resumes
- ⭐ Provide structured feedback with ratings
- 🎯 Suggest improvements and highlight strengths
- 📋 Manage resume templates
- 👥 Track student progress

### General Features
- 🔒 Secure user authentication (signup/login)
- 🔑 Password reset via email
- 📱 Responsive, mobile-friendly design
- 🗄️ Cloud-based MongoDB storage
- ⚡ RESTful API architecture
- 🛡️ CORS enabled for cross-origin requests

---

## 🏗️ Tech Stack

### Frontend
- **React 18.2.0** - Modern UI framework
- **React Router v6** - Client-side routing
- **Axios 1.6.2** - HTTP client with interceptors
- **CSS3** - Responsive styling with media queries
- **Context API** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express 4.18.2** - Web server framework
- **Mongoose 8.19.0** - MongoDB object modeling
- **JWT (jsonwebtoken 9.0.2)** - Token-based authentication
- **bcryptjs 3.0.2** - Password hashing

### Database
- **MongoDB Atlas** - Cloud-hosted NoSQL database
- **Cluster**: eduresumepro-cluster-0
- **Collections**: 6 models (User, Resume, Template, JobOpening, Application, Feedback)

### Tools & Services
- **dotenv 17.2.3** - Environment variable management
- **CORS 2.8.5** - Cross-origin request handling
- **body-parser 1.20.2** - Request parsing middleware

---

## 📋 Project Structure

```
eduResumePRO/
│
├── backend/                          # Express.js server
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection handler
│   │   │
│   │   ├── models/                   # MongoDB schemas
│   │   │   ├── User.js
│   │   │   ├── Resume.js
│   │   │   ├── Template.js
│   │   │   ├── JobOpening.js
│   │   │   ├── Application.js
│   │   │   └── Feedback.js
│   │   │
│   │   ├── controllers/              # Business logic handlers
│   │   │   ├── authController.js
│   │   │   ├── resumeController.js
│   │   │   ├── templateController.js
│   │   │   ├── jobOpeningController.js
│   │   │   ├── applicationController.js
│   │   │   └── feedbackController.js
│   │   │
│   │   ├── routes/                   # API endpoints
│   │   │   ├── authRoutes.js
│   │   │   ├── resumeRoutes.js
│   │   │   ├── templateRoutes.js
│   │   │   ├── jobOpeningRoutes.js
│   │   │   ├── applicationRoutes.js
│   │   │   └── feedbackRoutes.js
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT verification middleware
│   │   │
│   │   ├── utils/
│   │   │   └── generateToken.js     # JWT token generator
│   │   │
│   │   └── index.js                 # Express app entry point
│   │
│   ├── .env.example                 # Environment template
│   └── package.json
│
├── frontend/                         # React application
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx   # Route protection wrapper
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Resumes.jsx
│   │   │   ├── Templates.jsx
│   │   │   ├── Jobs.jsx
│   │   │   └── Applications.jsx
│   │   │
│   │   ├── services/                 # API integration clients
│   │   │   ├── authService.js
│   │   │   ├── resumeService.js
│   │   │   ├── templateService.js
│   │   │   ├── jobService.js
│   │   │   ├── applicationService.js
│   │   │   └── feedbackService.js
│   │   │
│   │   ├── styles/                   # CSS stylesheets
│   │   │   ├── index.css
│   │   │   ├── auth.css
│   │   │   ├── home.css
│   │   │   ├── resumes.css
│   │   │   ├── templates.css
│   │   │   ├── jobs.css
│   │   │   └── applications.css
│   │   │
│   │   ├── App.jsx                   # Main app component
│   │   └── index.js                 # React entry point
│   │
│   └── package.json
│
├── DATABASE_SCHEMA.md               # Complete database documentation
├── API_DOCUMENTATION.md             # Full API reference
├── DEVELOPMENT_GUIDE.md             # Detailed setup & development guide
├── QUICKSTART.md                    # 5-minute quick start
└── README.md                        # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v14+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **MongoDB Atlas** account ([Sign up free](https://www.mongodb.com/cloud/atlas/register))
- **Git** (optional)

### Installation (5 minutes)

#### 1. Backend Setup
```bash
# Navigate to backend
cd eduResumePRO/backend

# Install dependencies
npm install

# Create .env file with this content:
# PORT=5000
# NODE_ENV=development
# MONGO_URI=mongodb+srv://dhruvpatel150203_db_user:Fi3x45oFddyus3sb@eduresumepro-cluster-0.ivrzzsc.mongodb.net/eduresume
# JWT_SECRET=your_secret_key_here_change_in_production
# JWT_EXPIRE=7d

# Start server
npm start
```

#### 2. Frontend Setup (New Terminal)
```bash
# Navigate to frontend
cd eduResumePRO/frontend

# Install dependencies
npm install

# Create .env file with this content:
# REACT_APP_API_URL=http://localhost:5000/api

# Start React app
npm start
```

#### 3. Open Browser
Visit `http://localhost:3000` and start using EduResume Pro!

**For detailed setup instructions, see [QUICKSTART.md](QUICKSTART.md)**

---

## 📱 Usage

### Create Account
1. Click "Sign Up" on homepage
2. Enter name, email, password
3. Select role (Student or Professor)
4. Click "Sign Up"

### Student Workflow
1. **View Dashboard** - See your profile and stats
2. **Create Resume** - Build resume from scratch or use template
3. **Browse Templates** - Choose from professional designs
4. **Browse Jobs** - See all available job postings
5. **Apply for Jobs** - Submit application with selected resume
6. **Track Applications** - Monitor status of your applications
7. **View Feedback** - Read feedback from professors

### Professor Workflow
1. **View Dashboard** - Manage your activities
2. **Browse Templates** - Create and manage resume templates
3. **Review Resumes** - Provide feedback to students
4. **Post Jobs** - Create new job openings
5. **Manage Postings** - Edit or delete job listings

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/signup              - Register new user
POST   /api/auth/login               - Login user
POST   /api/auth/forgot-password     - Request password reset
GET    /api/auth/reset-password-verify/:token - Verify reset token
POST   /api/auth/reset-password/:token - Reset password
```

### Resumes (Protected)
```
POST   /api/resumes                  - Create resume
GET    /api/resumes                  - Get all user resumes
GET    /api/resumes/:id              - Get single resume
PUT    /api/resumes/:id              - Update resume
DELETE /api/resumes/:id              - Delete resume
POST   /api/resumes/:id/publish      - Publish resume
```

### Templates (Public/Protected)
```
GET    /api/templates                - Get all templates (public)
GET    /api/templates/:id            - Get single template (public)
POST   /api/templates                - Create template (protected)
PUT    /api/templates/:id            - Update template (protected)
DELETE /api/templates/:id            - Delete template (protected)
```

### Jobs (Public/Protected)
```
GET    /api/jobs                     - Get all jobs (public)
GET    /api/jobs/:id                 - Get single job (public)
POST   /api/jobs                     - Create job (protected)
PUT    /api/jobs/:id                 - Update job (protected)
DELETE /api/jobs/:id                 - Delete job (protected)
```

### Applications (Protected)
```
POST   /api/applications             - Create application
GET    /api/applications             - Get user applications
GET    /api/applications/:id         - Get single application
PUT    /api/applications/:id/status  - Update application status
DELETE /api/applications/:id         - Delete application
```

### Feedback (Protected)
```
POST   /api/feedback                 - Create feedback
GET    /api/feedback                 - Get feedback received
GET    /api/feedback/resume/:resumeId - Get feedback for resume
PUT    /api/feedback/:id             - Update feedback
DELETE /api/feedback/:id             - Delete feedback
```

**For complete API documentation with request/response examples, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

---

## 🗄️ Database Models

### User
- name, email, password (hashed)
- role (student/professor/admin)
- passwordReset fields for recovery

### Resume
- userId, templateId
- personalInfo, experience, education, skills
- certifications, projects
- atsScore, isPublished

### Template
- name, description
- sections configuration
- styling (fonts, colors, layout)
- category (modern/classic/creative/minimal)

### JobOpening
- title, company, description
- requirements, responsibilities
- jobType, location, salary range
- requiredSkills, applicationDeadline
- status (open/closed/filled)

### Application
- userId, resumeId, jobOpeningId
- status (applied/under-review/shortlisted/rejected/accepted)
- coverLetter, score, feedback
- interviewDate

### Feedback
- resumeId, studentId, professorId
- overallRating, comments
- suggestions, strengths, areasForImprovement
- sections with individual ratings

**For complete schema details, see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)**

---

## 🔐 Authentication

### How It Works
1. User signs up → Password hashed with bcryptjs
2. User logs in → Credentials verified, JWT token generated
3. Token stored in localStorage (frontend)
4. Token sent in Authorization header for protected requests
5. Backend verifies token using middleware

### JWT Details
- **Algorithm**: HS256
- **Expiration**: 7 days
- **Payload**: userId, email, role
- **Secret**: Configured in `.env` (JWT_SECRET)

### Protected Routes
Frontend routes protected with `<ProtectedRoute>` wrapper that checks authentication context. Backend routes protected with `verifyToken` middleware that validates JWT.

---

## 📊 Database Connection

### MongoDB Atlas Setup
- **Cluster**: eduresumepro-cluster-0
- **Username**: dhruvpatel150203_db_user
- **Database**: eduresume
- **Collections**: 6 (users, resumes, templates, jobopenings, applications, feedbacks)

### Connection String
```
mongodb+srv://dhruvpatel150203_db_user:Fi3x45oFddyus3sb@eduresumepro-cluster-0.ivrzzsc.mongodb.net/eduresume
```

### Configure Database Access
1. Go to MongoDB Atlas > Security > Network Access
2. Add IP: `0.0.0.0/0` (allow all) or your specific IP
3. Ensure cluster is not paused
4. Verify connection string in `.env`

---

## 🧪 Testing

### Using Postman
1. Create new Postman Collection
2. Test endpoints from [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
3. Use Bearer token authentication for protected endpoints

### Using cURL
```bash
# Sign Up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"Pass123","role":"student"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"Pass123"}'

# Get Resources (Protected)
curl -X GET http://localhost:5000/api/resumes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔧 Development

### Adding New Features
1. **Create MongoDB Model** - Define schema in `backend/src/models/`
2. **Create Controller** - Business logic in `backend/src/controllers/`
3. **Create Routes** - API endpoints in `backend/src/routes/`
4. **Create Service** - API client in `frontend/src/services/`
5. **Create Page** - UI component in `frontend/src/pages/`
6. **Add Routes** - Update `frontend/src/App.jsx`

### Code Style
- Use camelCase for variables/functions
- Use UPPER_SNAKE_CASE for constants
- Add JSDoc comments for complex functions
- Use async/await for promises
- Implement proper error handling

---

## 🚦 Running the Application

### Development Mode
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

### Production Mode
```bash
# Build frontend
cd frontend
npm run build

# Start backend with production env
cd backend
NODE_ENV=production npm start
```

---

## 📝 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute quick start guide
- **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** - Complete development guide with troubleshooting
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Complete database schema documentation
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Full API reference with examples

---

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID {PID} /F
```

#### MongoDB Connection Error
1. Verify connection string in `.env`
2. Check MongoDB Atlas Network Access whitelist
3. Ensure cluster is active (not paused)

#### CORS Errors
1. Ensure backend is running on correct port
2. Verify `REACT_APP_API_URL` in frontend `.env`
3. Restart both servers

#### Unable to Login
1. Clear browser cache
2. Check credentials in database
3. Verify JWT_SECRET is set in backend

### More Help
See [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) for detailed troubleshooting.

---

## 📚 Learning Resources

- **Express.js**: https://expressjs.com/
- **React**: https://react.dev/
- **MongoDB**: https://docs.mongodb.com/
- **Mongoose**: https://mongoosejs.com/
- **JWT Authentication**: https://jwt.io/

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push to branch
6. Submit pull request

---

## 📄 License

This project is proprietary and confidential.

---

## 👥 Team & Contact

**EduResume Pro** - Developed for ViH Technologies

---

## ✅ Checklist for First Run

- [ ] Node.js and npm installed
- [ ] MongoDB Atlas account created
- [ ] Backend dependencies installed
- [ ] Backend `.env` file created with MONGO_URI
- [ ] Frontend dependencies installed
- [ ] Frontend `.env` file created with API_URL
- [ ] Backend server running on port 5000
- [ ] Frontend running on port 3000
- [ ] Homepage loads in browser
- [ ] Can sign up and create account
- [ ] MongoDB collections created automatically

---

## 🎯 Next Steps

1. **Complete Setup** - Follow [QUICKSTART.md](QUICKSTART.md)
2. **Test Features** - Explore all pages and API endpoints
3. **Build Components** - Create resume editor form
4. **Add Features** - Implement job application form
5. **Deploy** - Push to production server

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: ✅ Ready for Development

