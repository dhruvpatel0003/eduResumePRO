# 🚀 Quick Render Deployment Guide

## Prerequisites
- GitHub account with the project repository
- Render account (free at render.com)
- MongoDB Atlas connection string

---

## Step 1: Deploy Backend to Render

### 1.1 Create Backend Service
1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect a repository"** (select your eduResumePRO repo)
4. Fill in:
   - **Name**: `eduresume-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`

### 1.2 Add Environment Variables
In Render, go to **Environment** and add:
```
NODE_ENV = production
PORT = 5000
MONGO_URI = mongodb+srv://your_user:your_pass@cluster.mongodb.net/eduresume
JWT_SECRET = your_secret_key_here
JWT_EXPIRE = 7d
```

### 1.3 Get Deployment Hook
1. After backend is deployed, go to **Settings**
2. Find **"Deploy Hook"** section
3. Copy the webhook URL - looks like:
   ```
   https://api.render.com/deploy/srv-xxxxx?key=xxxxx
   ```
4. **Save this URL** (you'll need it for GitHub Secrets)

### 1.4 Wait for Deployment
- Render will start deploying automatically
- Check logs to confirm it's running
- Note your backend URL (usually `https://eduresume-backend.onrender.com`)

---

## Step 2: Deploy Frontend to Render

### 2.1 Create Frontend Service
1. Click **"New +"** → **"Static Site"** (or Web Service)
2. Click **"Connect a repository"**
3. Fill in:
   - **Name**: `eduresume-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

### 2.2 Add Environment Variables
In Render, go to **Environment** and add:
```
REACT_APP_API_URL = https://eduresume-backend.onrender.com/api
REACT_APP_ENV = production
```
(Replace `eduresume-backend` with your actual backend service name)

### 2.3 Get Deployment Hook
1. After frontend is deployed, go to **Settings**
2. Find **"Deploy Hook"** section
3. Copy the webhook URL
4. **Save this URL** (for GitHub Secrets)

### 2.4 Wait for Deployment
- Render will build and deploy automatically
- Note your frontend URL (usually `https://eduresume-frontend.onrender.com`)

---

## Step 3: Set Up GitHub Secrets

### 3.1 Add Secrets
1. Go to GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

### 3.2 Create Two Secrets

**Secret 1:**
- **Name**: `RENDER_DEPLOY_HOOK_BACKEND`
- **Value**: (paste backend webhook URL from Step 1.3)

**Secret 2:**
- **Name**: `RENDER_DEPLOY_HOOK_FRONTEND`
- **Value**: (paste frontend webhook URL from Step 2.3)

---

## Step 4: Update Frontend API URL

If your backend service name is different, update:
- Go to Render → Frontend Service → Settings → Environment
- Update `REACT_APP_API_URL` to your actual backend URL

---

## Step 5: Test Deployment

### 5.1 Push Code to Main
```bash
git add .
git commit -m "Deploy to Render"
git push origin main
```

### 5.2 Check GitHub Actions
- Go to **Actions** tab in GitHub
- Watch the `CD - Build & Deploy` workflow run
- It should:
  1. Run tests ✅
  2. Build Docker images ✅
  3. Trigger Render deployment ✅

### 5.3 Verify on Render
- Check Render Dashboard → Services
- Both services should show "Deployed"
- View frontend URL to verify it's working

### 5.4 Test the App
1. Open `https://eduresume-frontend.onrender.com`
2. Click "Get Started"
3. Try signing up
4. Verify user is saved to MongoDB

---

## 🔗 Important URLs

After deployment, you'll have:
- **Frontend**: `https://eduresume-frontend.onrender.com`
- **Backend API**: `https://eduresume-backend.onrender.com/api`
- **Health Check**: `https://eduresume-backend.onrender.com/health`

---

## 🆘 Troubleshooting

### Deployment Hook Not Triggering
- Verify webhook URL format is correct
- Check that secret names match exactly: `RENDER_DEPLOY_HOOK_BACKEND` and `RENDER_DEPLOY_HOOK_FRONTEND`
- Redeploy from Render dashboard manually

### Backend Can't Connect to MongoDB
- Verify MongoDB Atlas allows 0.0.0.0/0 in Network Access
- Check `MONGO_URI` in Render environment variables
- Test connection string locally first

### Frontend Can't Connect to Backend
- Verify `REACT_APP_API_URL` includes `/api` at the end
- Check network tab in browser for API errors
- Ensure backend service is actually running

### Services Keep Failing
- Check Render dashboard logs
- Look at GitHub Actions logs for build errors
- Verify all environment variables are set

---

## 📋 Complete Checklist

- [ ] Backend service created on Render
- [ ] Backend environment variables set
- [ ] Backend deployed successfully
- [ ] Backend webhook URL copied
- [ ] Frontend service created on Render
- [ ] Frontend environment variables set
- [ ] Frontend deployed successfully
- [ ] Frontend webhook URL copied
- [ ] GitHub secrets created (`RENDER_DEPLOY_HOOK_BACKEND` and `RENDER_DEPLOY_HOOK_FRONTEND`)
- [ ] Code pushed to main branch
- [ ] GitHub Actions workflow ran successfully
- [ ] Both services show "Deployed" status
- [ ] Frontend loads without errors
- [ ] Sign up creates user in MongoDB
- [ ] Login works with created user

---

## ✅ Success Indicators

You'll know it's working when:
1. ✅ Frontend loads at `https://eduresume-frontend.onrender.com`
2. ✅ Clicking "Get Started" opens sign up form
3. ✅ Sign up completes without errors
4. ✅ User appears in MongoDB Atlas
5. ✅ Can login with created credentials
6. ✅ Dashboard shows user info

---

## 🔄 Redeploying

To redeploy without changing code:
1. Go to Render Dashboard
2. Select Backend → Click "Manual Deploy" or "Redeploy"
3. Select Frontend → Click "Manual Deploy" or "Redeploy"

Or just push code to main branch - GitHub Actions will handle it!

---

**Need help? Check DOCKER_RENDER_SETUP.md for more detailed information.**
