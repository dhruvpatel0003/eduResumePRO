# EduResume Pro - Backend API

Backend server for EduResume Pro application built with Node.js, Express, and MongoDB.

## 📋 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js              # MongoDB connection setup
│   ├── controllers/
│   │   └── authController.js        # Authentication logic
│   ├── models/
│   │   └── User.js                  # User schema
│   ├── routes/
│   │   └── authRoutes.js            # Authentication routes
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication middleware
│   ├── services/                    # Business logic (to be added)
│   ├── utils/
│   │   └── generateToken.js         # JWT token generation
│   └── index.js                     # Server entry point
├── package.json
├── .env.example
└── .gitignore
```

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and update with your MongoDB Atlas credentials:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/eduresume
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRE=7d
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication Routes

- `POST /api/auth/signup` - Register a new user
  - Body: `{ name, email, password, role }`
  
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  
- `POST /api/auth/forgot-password` - Request password reset
  - Body: `{ email }`
  
- `GET /api/auth/reset-password-verify/:token` - Verify reset token
  
- `POST /api/auth/reset-password/:token` - Reset password
  - Body: `{ newPassword }`

## Adding New Features

### 1. Create a Model
```javascript
// models/Resume.js
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  content: String
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
```

### 2. Create a Controller
```javascript
// controllers/resumeController.js
const Resume = require('../models/Resume');

const create = async (req, res) => {
  try {
    const resume = new Resume({...req.body, userId: req.user.id});
    await resume.save();
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

module.exports = { create };
```

### 3. Create Routes
```javascript
// routes/resumeRoutes.js
const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, resumeController.create);

module.exports = router;
```

### 4. Add to index.js
```javascript
app.use('/api/resumes', require('./routes/resumeRoutes'));
```

## Database Models

### User Model
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required)
- `role` (String: 'student', 'professor', 'admin')
- `resetPasswordToken` (String)
- `resetPasswordExpires` (Date)
- `createdAt`, `updatedAt` (Timestamps)

## Middleware

### Authentication (auth.js)
Used to protect routes that require authentication:

```javascript
const authMiddleware = require('../middleware/auth');
router.post('/create', authMiddleware, controller.create);
```

The middleware verifies JWT token and attaches user data to `req.user`.

## Technologies Used

- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
└── Dockerfile
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.x
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 5000)

### Development

```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🔐 Authentication

### Endpoints

#### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "role": "student"
}
```

**Response:**
```json
{
  "message": "Signup successful",
  "user": { ... },
  "token": "jwt_token_here"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password/:token
Content-Type: application/json

{
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

## 📄 Resume Management

### Create Resume
```http
POST /api/resumes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My First Resume",
  "templateId": "template_id",
  "personalInfo": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "New York"
  }
}
```

### Get All Student Resumes
```http
GET /api/resumes
Authorization: Bearer <token>
```

### Get Resume by ID
```http
GET /api/resumes/:resumeId
Authorization: Bearer <token>
```

### Update Resume
```http
PUT /api/resumes/:resumeId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Resume Title",
  "sections": { ... }
}
```

### Delete Resume
```http
DELETE /api/resumes/:resumeId
Authorization: Bearer <token>
```

## 🎨 Template Management

### Get All Templates
```http
GET /api/templates
```

### Get Template by ID
```http
GET /api/templates/:templateId
```

### Upload Template (Professor Only)
```http
POST /api/templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Modern Template",
  "description": "A modern resume template",
  "category": "modern",
  "tags": ["modern", "simple"]
}
```

## 👥 User Management

### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Doe Updated",
  "profile": {
    "university": "MIT",
    "major": "Computer Science",
    "graduationYear": 2024
  }
}
```

### Get All Professors
```http
GET /api/users/professors
Authorization: Bearer <token>
```

## 🧪 Testing

Tests are written using Jest and Supertest.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm test -- --coverage
```

## 🐳 Docker

Build and run the application in Docker:

```bash
# Build image
docker build -t eduresume-backend .

# Run container
docker run -p 5000:3001 \
  -e MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db \
  -e JWT_SECRET=your_secret \
  eduresume-backend
```

## 📊 Environment Variables

See `.env.example` for complete list of required variables.

Key variables:
- `MONGO_URI`: MongoDB connection string
- `PORT`: Server port
- `NODE_ENV`: Environment (development/production/test)
- `JWT_SECRET`: Secret for JWT token signing
- `JWT_EXPIRE`: Token expiration time
- `FRONTEND_URL`: Frontend application URL

## 🔍 Health Check

```http
GET /health

Response:
{
  "status": "OK",
  "message": "EduResume Pro API is running",
  "timestamp": "2024-02-12T10:00:00.000Z"
}
```

## 📄 License

MIT

## 👨‍💻 Author

EduResume Pro Team
