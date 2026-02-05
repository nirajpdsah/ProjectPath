# Deployment Guide: Railway + Vercel (Free)

Complete step-by-step guide to deploy ProjectPath for free using Railway (backend) and Vercel (frontend).

## Prerequisites
- GitHub account (free)
- Code pushed to GitHub repository
- Railway account (free, at railway.app)
- Vercel account (free, at vercel.com)

---

## PART 1: Deploy Backend on Railway

### Step 1: Create GitHub Repository
```bash
cd d:\ProjectPath - Copy
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ProjectPath.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 2: Sign Up to Railway
1. Go to **railway.app**
2. Click **"Start Your Project"**
3. Sign up with GitHub
4. Click **"Authorize railway-app"**
5. You'll be redirected to Railway dashboard

### Step 3: Create New Project
1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Select your ProjectPath repository
4. Click **"Deploy"**

Railway will automatically detect Python and start deploying.

### Step 4: Configure Environment Variables
1. In Railway, go to your project
2. Click the **"backend"** service
3. Go to **Variables** tab
4. Add these variables:

```
JWT_SECRET=your-random-secret-key-12345xyz
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=168
```

For `JWT_SECRET`, generate a random string:
```bash
# You can generate one like this (or just use any random string)
# Example: "abc123xyz789def456ghi123jkl456"
```

5. Click **"Save"**

### Step 5: Get Your Backend URL
1. In Railway, click **"Deployments"** tab
2. Wait for deployment to complete (green checkmark)
3. Once deployed, go to **"Settings"** tab
4. Under **"Domains"**, copy the URL that looks like:
   ```
   https://projectpath-production-xxxx.up.railway.app
   ```
5. **Save this URL** - you'll need it for frontend deployment

### Step 6: Test Backend
1. Open the Railway URL in your browser
2. Add `/health` to the URL:
   ```
   https://projectpath-production-xxxx.up.railway.app/health
   ```
3. You should see: `{"status":"healthy"}`

✅ Backend is now live!

---

## PART 2: Deploy Frontend on Vercel

### Step 1: Sign Up to Vercel
1. Go to **vercel.com**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

### Step 2: Import Project
1. In Vercel dashboard, click **"New Project"**
2. Click **"Import Git Repository"**
3. Find and click your **ProjectPath** repository
4. Click **"Import"**

### Step 3: Configure Build Settings
1. Set **Framework**: `Vite`
2. Set **Root Directory**: `./frontend`
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`

### Step 4: Add Environment Variables
1. Click **"Environment Variables"**
2. Add this variable:

```
Name: VITE_API_URL
Value: https://projectpath-production-xxxx.up.railway.app
```

Replace with your actual Railway backend URL from Step 5 of Part 1.

3. Click **"Add"**
4. Click **"Deploy"**

Vercel will now build and deploy your frontend.

### Step 5: Wait for Deployment
1. Wait for the build to complete (you'll see a checkmark)
2. Once done, click **"Visit"** button
3. Your app should now be live at the Vercel URL!

✅ Frontend is now live!

---

## PART 3: Verify Everything Works

### Test Guest Mode
1. Open your Vercel URL
2. Try creating a project without logging in
3. Add activities
4. Click "Analyze" - should see network diagram
5. Export as PDF

### Test Authentication
1. Click "Sign Up"
2. Create an account with email/password
3. You should redirect to dashboard
4. Create a new project
5. Everything should work

### Test Cross-Device Sync
1. Copy your Vercel URL
2. Open in a different browser/device
3. Log in with same credentials
4. You should see the same projects

---

## PART 4: Update Custom Domain (Optional)

### Add Custom Domain to Vercel
1. In Vercel project settings, go to **"Domains"**
2. Click **"Add"**
3. Enter your custom domain (e.g., `projectpath.com`)
4. Follow the DNS setup instructions

### Add Custom Domain to Railway
1. In Railway project, go to **"Settings"**
2. Under **"Custom Domain"**, add your domain
3. Update DNS records as instructed

---

## Troubleshooting

### Frontend gets "Cannot connect to API"
**Problem**: `VITE_API_URL` not set correctly
**Solution**:
1. In Vercel, check Environment Variables
2. Make sure `VITE_API_URL` has the complete Railway URL
3. Redeploy: Click **"Deployments"** → **"..."** → **"Redeploy"**

### Backend returns 500 errors
**Problem**: Database not initialized
**Solution**:
1. In Railway, check logs
2. Database is auto-created on first request
3. Try accessing `/health` endpoint

### Login not working
**Problem**: JWT_SECRET changed or not set
**Solution**:
1. Go to Railway Variables
2. Make sure `JWT_SECRET` is set to a non-empty value
3. Restart the deployment

### Slow first load
**Normal**: Railway free tier has 15-min sleep
**Solution**: Keep app active by visiting every 15 min, or upgrade to paid

---

## Cost Breakdown

| Service | Free Tier | Limit |
|---------|-----------|-------|
| **Railway** | Yes | 500 hours/month (~$5/month if exceeded) |
| **Vercel** | Yes | Unlimited |
| **PostgreSQL** | Included in Railway | 5GB free database |
| **Total Cost** | **$0/month** | Perfect for hobby projects |

---

## What's Deployed

```
Your Domain (Vercel)
    ↓
  React App (Served from Vercel CDN)
    ↓
Backend URL (Railway)
    ↓
  FastAPI Server
    ↓
PostgreSQL Database (Railway)
```

---

## Next Steps

1. **Monitor**: Check Railway/Vercel dashboards for logs
2. **Updates**: Push changes to GitHub - both will auto-redeploy
3. **Scaling**: If you exceed free limits, upgrade to paid
4. **Custom Domain**: Add your own domain in settings

---

## Quick Reference URLs

- **Vercel Dashboard**: vercel.com/dashboard
- **Railway Dashboard**: railway.app/dashboard
- **GitHub Repository**: github.com/YOUR_USERNAME/ProjectPath
- **Your App**: https://projectpath.vercel.app (or custom domain)
- **API Docs**: https://your-railway-url/docs

---

**Done!** Your app is now live and free! 🚀
