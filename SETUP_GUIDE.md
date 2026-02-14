# EduResume Pro - Setup Guide

Complete setup guide for EduResume Pro with MongoDB Atlas and JWT authentication.

## Quick Start

### Requirements

- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **MongoDB Atlas**: Cloud database account (free tier available)

### Install Dependencies

```bash
# Install all dependencies
npm install
```

## Backend Setup

### 1. Environment Variables

Create `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/eduresume

# Security
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRE=7d
```

### 2. MongoDB Atlas Setup

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Go to "Database Access" and create a database user
5. Go to "Network Access" and add your IP address
6. Get your connection string and update `MONGO_URI` in `.env`

### 3. Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

Health check: `GET http://localhost:5000/health`

## Frontend Setup

### 1. Environment Variables

Create `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 2. Start Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

## API Endpoints

### Authentication Routes

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/reset-password-verify/:token` - Verify reset token
- `POST /api/auth/reset-password/:token` - Reset password

## Project Structure

```
eduresume-pro/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection
│   │   ├── models/
│   │   │   └── User.js              # User schema
│   │   ├── controllers/
│   │   │   └── authController.js    # Auth logic
│   │   ├── routes/
│   │   │   └── authRoutes.js        # Auth routes
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT verification
│   │   ├── services/                # Business logic
│   │   ├── utils/
│   │   │   └── generateToken.js     # Token generation
│   │   └── index.js                 # Server entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── .env.example
└── package.json
```

## Running Both Services

```bash
# From root directory
npm run dev
```

This will run both backend and frontend concurrently.

## Adding New Features

- **Models**: Add new schemas in `backend/src/models/`
- **Controllers**: Add business logic in `backend/src/controllers/`
- **Routes**: Define endpoints in `backend/src/routes/`
- **Middleware**: Add custom middleware in `backend/src/middleware/`
- **Services**: Add reusable services in `backend/src/services/`

## Troubleshooting

**MongoDB Connection Error**: Ensure your IP is whitelisted in MongoDB Atlas Network Access

**JWT Token Invalid**: Make sure `JWT_SECRET` in `.env` is consistent

**Port Already in Use**: Change `PORT` in `backend/.env` to an available port
npm start
```

Frontend runs on `http://localhost:3000`

## Database Setup

### MongoDB Collections

The backend automatically creates these collections:

1. **users** - User accounts (students/professors)
2. **resumes** - Student resumes
3. **templates** - Resume templates
4. **jobopenings** - Job listings

### Sample Data

```javascript
// User (Student)
{
  "_id": ObjectId,
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "role": "student",
  "profile": {
    "university": "MIT",
    "major": "Computer Science"
  }
}

// Resume
{
  "_id": ObjectId,
  "studentId": ObjectId,
  "templateId": ObjectId,
  "title": "My Resume",
  "sections": {
    "experience": [...],
    "education": [...]
  },
  "atsScore": { "score": 85 }
}
```

## Running the Application

### Option 1: Docker Compose (Recommended)

```bash
docker-compose up
```

This starts:
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379
- **Backend**: localhost:5000
- **Frontend**: localhost:3000

### Option 2: Individual Commands

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

### Option 3: Npm Workspace

```bash
npm run dev
```

This runs both backend and frontend concurrently.

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Coverage report
npm test -- --coverage -- --watchAll=false
```

### Full Project Tests

```bash
npm test
```

## API Testing

### Using cURL

```bash
# Health check
curl http://localhost:5000/health

# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "confirmPassword": "Password123",
    "role": "student"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Using Postman

1. Import API collection (create or use exported)
2. Set base URL: `http://localhost:5000/api`
3. Create requests for each endpoint
4. Use token for authenticated requests

## Code Quality

### Linting

```bash
# Check for issues
npm run lint

# Fix issues automatically
npm run lint:fix
```

### Code Formatting

Install Prettier extension in VS Code for auto-formatting.

## Development Workflow

1. **Create a branch**: `git checkout -b feature/your-feature`
2. **Make changes**: Edit files in `src/` folders
3. **Test changes**: `npm test`
4. **Commit**: `git commit -m "Add feature"`
5. **Push**: `git push origin feature/your-feature`
6. **PR**: Open Pull Request on GitHub

CI/CD will run automatically:
- ✅ Tests pass
- ✅ Code quality checks
- ✅ Security scans
- ✅ Build succeeds

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check connection string
# Ensure credentials are correct in .env
# Allow IP in MongoDB Atlas network access
```

### Port Already in Use

```bash
# Find process using port
lsof -i :5000  # Backend
lsof -i :3000  # Frontend

# Kill process
kill -9 <PID>
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

### Docker Issues

```bash
# Remove all containers
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Start fresh
docker-compose up
```

## Deployment

### To Render

1. **Push to main**:
```bash
git push origin main
```

2. **GitHub Actions** automatically:
   - Runs tests
   - Scans security
   - Builds Docker images
   - Deploys to Render

3. **Access live app**:
   - Frontend: https://eduresume.onrender.com
   - API: https://eduresume-api.onrender.com

### Environment Secrets

Add to GitHub repository secrets:
- `MONGO_URI` - MongoDB connection
- `JWT_SECRET` - JWT signing key
- `RENDER_DEPLOY_HOOK_BACKEND` - Backend deploy webhook
- `RENDER_DEPLOY_HOOK_FRONTEND` - Frontend deploy webhook

## Additional Resources

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Deployment Flow](./DEPLOYMENT.md)
- [API Documentation](./backend/README.md#rest-api)

## Support

For issues:
1. Check existing GitHub issues
2. Review error logs
3. Open new issue with details

---

**Happy coding! 🚀**
