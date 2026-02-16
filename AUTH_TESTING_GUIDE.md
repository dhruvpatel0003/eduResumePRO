# EduResume Pro - Authentication Testing Guide

Everything is now configured for login and signup with database storage. Here's how to test it:

## Step 1: Start the Backend Server

Open Terminal 1 and run:
```bash
cd c:\Users\dhruv\Downloads\ViHTechnologies\eduResumePRO\backend
npm start
```

You should see:
```
🚀 Server running on port 5000
Environment: development
MongoDB Connected: eduresumepro-cluster-0.ivrzzsc.mongodb.net
```

## Step 2: Start the Frontend

Open Terminal 2 and run:
```bash
cd c:\Users\dhruv\Downloads\ViHTechnologies\eduResumePRO\frontend
npm start
```

The app will open at http://localhost:3000

## Step 3: Test Sign Up

1. Click "Sign Up" button on homepage
2. Fill in the form:
   ```
   Name: John Doe
   Email: john@example.com
   Password: Password123
   Confirm Password: Password123
   Role: Student
   ```
3. Click "Sign Up"
4. You should be redirected to Dashboard (logged in!)
5. Check database: User should appear in MongoDB Atlas

## Step 4: Test Login

1. Click Logout (top right)
2. You'll be redirected to Login page
3. Enter credentials:
   ```
   Email: john@example.com
   Password: Password123
   ```
4. Click "Login"
5. You should be logged in and on Dashboard

## Step 5: Verify in Database

Go to MongoDB Atlas:
1. https://www.mongodb.com/cloud/atlas/
2. Login with your account
3. Go to Cluster > Collections > users
4. You should see your user data with hashed password

## What's Working

✅ User Registration (Signup)
✅ Password Hashing with bcryptjs
✅ User Storage in MongoDB
✅ Email Validation
✅ Duplicate Email Prevention
✅ Login with Email & Password
✅ JWT Token Generation
✅ Protected Routes (Dashboard, Resumes, etc.)
✅ Auto-Login on Token Recovery
✅ Logout Functionality

## Testing with Postman

### Test Signup
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "Password123",
  "role": "professor"
}
```

Expected Response:
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "professor"
  }
}
```

### Test Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "Password123"
}
```

Expected Response: Same as signup

## Troubleshooting

### "MongoDB connection error"
- Check .env file has MONGO_URI
- Verify MongoDB Atlas Network Access allows your IP (0.0.0.0/0)
- Ensure cluster is not paused

### "Cannot POST /api/auth/signup"
- Backend not running on port 5000
- Start backend with: npm start

### "Network error in browser"
- Frontend not running on port 3000
- Check .env has REACT_APP_API_URL=http://localhost:5000/api
- Restart frontend: npm start

### "User already exists"
- Email is already registered
- Use different email for signup

### "Invalid email or password" on login
- Check email is correct (case-insensitive)
- Password is case-sensitive
- Verify user exists in database

## Files Created/Updated

✅ backend/.env - Database and JWT configuration
✅ frontend/.env - API URL configuration
✅ All other files were already created in previous setup

## Next Steps

Once login/signup is working:

1. Build Resume Editor form
2. Build Job Application form
3. Build Feedback submission form
4. Add Navigation header
5. Implement email notifications

See ROADMAP.md for detailed task breakdown.
