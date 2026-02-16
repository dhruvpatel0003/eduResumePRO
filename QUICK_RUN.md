# 🚀 Quick Start Commands

Copy-paste these commands to get EduResume Pro running with authentication!

## Terminal 1: Start Backend

```bash
cd c:\Users\dhruv\Downloads\ViHTechnologies\eduResumePRO\backend
npm start
```

**Wait for this message:**
```
🚀 Server running on port 5000
MongoDB Connected: eduresumepro-cluster-0.ivrzzsc.mongodb.net
```

## Terminal 2: Start Frontend

```bash
cd c:\Users\dhruv\Downloads\ViHTechnologies\eduResumePRO\frontend
npm start
```

**Browser will open to:**
```
http://localhost:3000
```

---

## Test Sign Up

1. Click **"Get Started"**
2. Enter Test Data:
   - **Name**: John Doe
   - **Email**: john@example.com  
   - **Password**: Test123
   - **Confirm**: Test123
   - **Role**: Student
3. Click **Sign Up**
4. ✅ You'll be on Dashboard (logged in!)

---

## Test Login

1. Click **Logout**
2. Click **"Sign In"**
3. Enter:
   - **Email**: john@example.com
   - **Password**: Test123
4. Click **Login**
5. ✅ Back on Dashboard (logged in!)

---

## Verify in Database

Visit: https://www.mongodb.com/cloud/atlas/
- Cluster → Collections → eduresume → users
- ✅ You should see your user data!

---

## What's Configured

✅ `.env` files created with correct values  
✅ MongoDB Atlas connected  
✅ User signup implemented  
✅ User login implemented  
✅ Password hashing enabled  
✅ JWT tokens working  
✅ Protected routes working  

---

## Troubleshooting

**"Cannot connect to MongoDB"**
- Go to https://www.mongodb.com/cloud/atlas/
- Security > Network Access > Add 0.0.0.0/0
- Check cluster is not paused

**"Port 5000 already in use"**
```bash
# Kill process
taskkill /F /IM node.exe

# Then restart npm start
```

**"Module not found"**
```bash
npm install
```

---

**Everything is ready! Start the terminal commands above and test the app!** 🎉
