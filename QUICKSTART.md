# EduResume Pro - Quick Start Guide

Get EduResume Pro running in 5 minutes ⚡

## Prerequisites Check
- ✅ Node.js installed? Run `node --version`
- ✅ npm installed? Run `npm --version`
- ✅ MongoDB Atlas account created? [Sign up here](https://www.mongodb.com/cloud/atlas/register)

---

## Step-by-Step Setup

### Step 1: Set Up Backend (2 minutes)

**Open Terminal and run:**
```bash
# Navigate to backend
cd c:\Users\dhruv\Downloads\ViHTechnologies\eduResumePRO\backend

# Install packages
npm install

# Create .env file
type nul > .env
```

**Add this content to `backend/.env`:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://dhruvpatel150203_db_user:Fi3x45oFddyus3sb@eduresumepro-cluster-0.ivrzzsc.mongodb.net/eduresume
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d
```

**Start Backend Server:**
```bash
npm start
```

✅ Backend should now be running on `http://localhost:5000`

---

### Step 2: Set Up Frontend (2 minutes)

**Open NEW Terminal and run:**
```bash
# Navigate to frontend
cd c:\Users\dhruv\Downloads\ViHTechnologies\eduResumePRO\frontend

# Install packages
npm install

# Create .env file
type nul > .env
```

**Add this content to `frontend/.env`:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

**Start Frontend Server:**
```bash
npm start
```

✅ Frontend should now be running on `http://localhost:3000`

---

### Step 3: Test It Out! (1 minute)

**Open Browser:** http://localhost:3000

You should see the EduResume Pro homepage with:
- Logo/Title
- "Sign Up" and "Login" buttons
- Welcome message

### Step 4: Create Your First Account

1. Click **"Sign Up"** button
2. Fill in the form:
   ```
   Name: John Doe
   Email: test@example.com
   Password: TestPassword123
   Role: Student
   ```
3. Click **"Sign Up"**
4. You'll be redirected to **Dashboard** (logged in!)

### Step 5: Explore Features

🎯 **Dashboard Page**
- Click "Create Resume" button (to be built)
- Click "View Templates" → Browse resume templates
- Click "Browse Jobs" → See available job postings
- Click "My Applications" → View your applications

---

## Keyboard Shortcuts

| Action | Command |
|--------|---------|
| Start both servers | Terminal 1: `npm start` in backend, Terminal 2: `npm start` in frontend |
| Stop server | `Ctrl + C` in terminal |
| Clear console | `Ctrl + L` or `clear` |
| Check server status | Visit `http://localhost:5000` and `http://localhost:3000` |

---

## Common Issues & Quick Fixes

### ❌ "Cannot find module" error
```bash
# Solution: Install dependencies again
npm install
```

### ❌ "Port 5000 already in use"
```bash
# Solution: Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID {PID} /F
# Or change PORT in .env to 5001
```

### ❌ "MongoDB connection error"
```
1. Verify .env MONGODB_URI is correct
2. Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)
3. Ensure cluster is not paused
```

### ❌ "CORS error in browser console"
```
1. Ensure backend is running on port 5000
2. Check frontend .env has REACT_APP_API_URL=http://localhost:5000/api
3. Clear browser cache: Ctrl + Shift + Del
```

---

## API Testing with Postman

### 1. Test Sign Up
```
POST http://localhost:5000/api/auth/signup
Headers: Content-Type: application/json
Body (JSON):
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "JanePass123",
  "role": "professor"
}
```

### 2. Test Login
```
POST http://localhost:5000/api/auth/login
Headers: Content-Type: application/json
Body (JSON):
{
  "email": "jane@example.com",
  "password": "JanePass123"
}
```

**Copy the `token` from response** → Use in Authorization header for protected endpoints

### 3. Test Protected Endpoint (Get Resumes)
```
GET http://localhost:5000/api/resumes
Headers: 
  Content-Type: application/json
  Authorization: Bearer {paste_token_here}
```

---

## What's Included? 📦

### Backend
✅ User authentication (signup/login/password reset)  
✅ Resume management (CRUD operations)  
✅ Resume templates  
✅ Job postings  
✅ Job applications tracking  
✅ Professor feedback system  
✅ MongoDB integration  
✅ JWT token security  

### Frontend
✅ Authentication pages (Login/Signup)  
✅ User dashboard  
✅ Resume listing page  
✅ Templates browsing page  
✅ Job listings page  
✅ Applications tracking page  
✅ Protected routes  
✅ Responsive design  

### Database (MongoDB Atlas)
✅ User collection  
✅ Resumes collection  
✅ Templates collection  
✅ Jobs collection  
✅ Applications collection  
✅ Feedback collection  

---

## Next Steps

### Immediate (After Setup Works)
1. Test all pages in the frontend
2. Test API endpoints with Postman
3. Create a few resume/job entries to populate database

### Short Term (Next 1-2 Hours)
- Build resume editor form
- Build job application form
- Build feedback submission form
- Add navigation header

### Medium Term (Next 1-2 Days)
- Email notifications for password reset
- PDF export for resumes
- Resume search/filter
- Job recommendations algorithm

### Long Term
- Admin dashboard
- Email notifications
- Real-time updates
- Mobile app
- Advanced analytics

---

## File Locations

```
eduResumePRO/
├── backend/
│   ├── .env (CREATE THIS)
│   ├── src/index.js (Main server file)
│   └── src/config/database.js (DB connection)
├── frontend/
│   ├── .env (CREATE THIS)
│   ├── src/App.jsx (Main app file)
│   └── src/index.js (Entry point)
├── DATABASE_SCHEMA.md (Database docs)
├── API_DOCUMENTATION.md (API reference)
└── DEVELOPMENT_GUIDE.md (Detailed guide)
```

---

## Terminal Commands (Copy-Paste Ready)

**Windows PowerShell:**

```bash
# Backend Setup
cd c:\Users\dhruv\Downloads\ViHTechnologies\eduResumePRO\backend
npm install
type nul > .env
npm start

# Frontend Setup (New Terminal)
cd c:\Users\dhruv\Downloads\ViHTechnologies\eduResumePRO\frontend
npm install
type nul > .env
npm start
```

---

## How to Know It's Working ✅

| Component | Should See |
|-----------|-----------|
| Backend | `Server running on port 5000` + `MongoDB connected successfully` |
| Frontend | `Compiled successfully!` + `http://localhost:3000` opens |
| Browser | EduResume Pro homepage with navigation |
| Login | Can sign up and log in with new account |
| Database | Collections created in MongoDB Atlas |

---

## Emergency Help 🆘

**Backend not starting?**
1. Check Node.js: `node --version`
2. Check npm: `npm --version`
3. Delete `node_modules` folder
4. Run `npm install` again
5. Ensure `.env` file exists with MONGODB_URI

**Frontend not loading?**
1. Check if backend is running
2. Open browser DevTools (F12)
3. Check Console for errors
4. Check Network tab for failed requests
5. Ensure `.env` has correct API URL

**Database not connecting?**
1. Verify connection string in `.env` is exact
2. Go to MongoDB Atlas > Security > Network Access
3. Add your IP or use 0.0.0.0/0
4. Check cluster status (not paused)
5. Try connection in MongoDB Compass

---

## Useful Browser DevTools Shortcuts

- **F12** - Open DevTools
- **Ctrl + Shift + C** - Inspect element
- **Ctrl + Shift + J** - Open Console
- **Ctrl + Shift + I** - Open Inspector
- **Ctrl + Shift + K** - Open Console
- **Ctrl + Shift + Delete** - Clear browsing data

---

## Default Credentials (for testing)

**Test Account 1:**
```
Email: test@example.com
Password: TestPassword123
Role: Student
```

**Test Account 2:**
```
Email: prof@example.com
Password: ProfPassword123
Role: Professor
```

---

**🎉 You're all set! Visit http://localhost:3000 and start exploring EduResume Pro!**

**Questions?** Check `DEVELOPMENT_GUIDE.md` for detailed documentation.
