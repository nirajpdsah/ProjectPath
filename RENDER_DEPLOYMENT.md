# Render Deployment Guide

Complete step-by-step guide to deploy ProjectPath on **Render** (backend) + **Vercel** (frontend).

**750 free hours/month is perfect for hobby projects!**

---

## Prerequisites

- GitHub account
- Code pushed to GitHub repository
- Render account (free at render.com)
- Vercel account (free at vercel.com)

---

## PART 1: Deploy Backend on Render

### Step 1: Create Render Account

1. Go to **render.com**
2. Click **"Sign Up"**
3. Choose **"GitHub"** (easiest)
4. Authorize Render to access GitHub

### Step 2: Create New Web Service

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Click **"Build and deploy from a Git repository"**
4. Click **"Connect GitHub account"** (if not already)
5. Find and select your **ProjectPath** repository
6. Click **"Connect"**

### Step 3: Configure Web Service

Fill in these settings:

**Basic Settings:**
- **Name**: `projectpath-backend`
- **Environment**: `Python 3`
- **Region**: Pick closest to you (e.g., `Oregon`)
- **Branch**: `main`

**Build Settings:**
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python main.py`

**Instance Type:**
- Select: **Free** (This gives you 750 hours/month)

### Step 4: Add Environment Variables

Click **"Environment"** tab and add these:

```
DATABASE_URL=postgresql://...   (Render will generate this)
JWT_SECRET=your-random-secret-key-12345
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=168
PORT=10000
```

**For DATABASE_URL:**
1. In Render dashboard, create a new **PostgreSQL** database
2. Copy the connection string
3. Paste it in DATABASE_URL field

For `JWT_SECRET`, generate a random string:
```
Example: "abc123xyz789def456ghi123jkl456mno789"
```

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will start building (watch the logs)
3. Wait for: ✅ "Deploy successful"
4. Once live, you'll see the URL: `https://projectpath-backend.onrender.com`

**Save this URL** - you need it for frontend!

### Step 6: Test Backend

1. Open: `https://your-render-url/health`
2. Should see: `{"status":"healthy"}`
3. Open: `https://your-render-url/docs`
4. Should see API documentation

✅ Backend is live!

---

## PART 2: Deploy Frontend on Vercel

### Step 1: Sign Up to Vercel

1. Go to **vercel.com**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel

### Step 2: Import Project

1. In Vercel dashboard, click **"New Project"**
2. Click **"Import Git Repository"**
3. Find and select **ProjectPath**
4. Click **"Import"**

### Step 3: Configure Build Settings

1. Set **Framework**: `Vite`
2. Set **Root Directory**: `./frontend`
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add:

```
Name: VITE_API_URL
Value: https://your-render-url.onrender.com
```

Replace `your-render-url` with your actual Render URL from Part 1.

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (green checkmark)
3. Click **"Visit"**
4. Your app is now live!

✅ Frontend is live!

---

## PART 3: Test Everything

### Guest Mode Test
- [ ] Open your Vercel URL
- [ ] Create a project without login
- [ ] Add 3-4 activities
- [ ] Click "Analyze"
- [ ] See network diagram
- [ ] Test PDF export

### Authentication Test
- [ ] Click "Sign Up"
- [ ] Create account
- [ ] Log in with credentials
- [ ] Create new project
- [ ] Test all features

### API Test
- [ ] Open your Render URL + `/health`
- [ ] See: `{"status":"healthy"}`
- [ ] Open: `https://your-render-url/docs`
- [ ] See API docs

✅ Everything working!

---

## PART 4: Important Notes

### Free Tier Limitations

**750 hours/month means:**
- ~24-25 days of continuous 24/7 usage
- BUT: Most projects only use 100-200 hours/month
- You're safe!

**Auto-sleep:**
- If inactive for 15 minutes, service sleeps
- First request after sleep takes 2-3 seconds
- Subsequent requests are instant
- Keep app active by visiting every 15 minutes

### Cost

- **Render Web Service**: $0 (750 hours)
- **Vercel Frontend**: $0 (unlimited)
- **PostgreSQL Database**: $0 (included on Render)
- **Total**: **$0/month** ✅

### Monitoring Usage

1. Go to Render dashboard
2. Click your web service
3. Go to **"Logs"** to see activity
4. Go to **"Metrics"** to see CPU/Memory usage

---

## PART 5: If You Exceed 750 Hours

**What happens:**
- Service stops working
- You get email notification
- You can upgrade to paid tier

**Upgrade cost:**
- $7/month for pay-as-you-go
- Continuous 24/7 uptime

**How to prevent:**
- Monitor usage monthly
- Render shows hours used in dashboard
- Set calendar reminder to check

---

## Troubleshooting

### Frontend won't load
- Check Vercel dashboard for deployment status
- Verify `VITE_API_URL` is set correctly
- Redeploy Vercel if URL was wrong

### Can't connect to API
- Visit Render URL + `/health` in browser
- Check Render logs for errors
- Verify PostgreSQL database is connected
- Check environment variables in Render

### Login not working
- Check Render logs for errors
- Verify `JWT_SECRET` is set
- Try signing up again

### Render auto-sleeps
- This is normal on free tier
- First request wakes it up (2-3 sec)
- Keep app active to prevent sleep
- Or upgrade to paid tier

### Database connection error
- In Render, create PostgreSQL database
- Copy connection string
- Paste in `DATABASE_URL` environment variable
- Restart web service

---

## Auto-Redeploy on Git Push

When you push changes to GitHub:
1. Vercel automatically redeploys frontend
2. Render automatically redeploys backend
3. No manual deployment needed!

```bash
git add .
git commit -m "New feature"
git push origin main
# Both will auto-redeploy in 1-2 minutes
```

---

## Quick Reference

| Item | Value |
|------|-------|
| **Backend URL** | https://your-render-url.onrender.com |
| **Frontend URL** | https://projectpath.vercel.app |
| **API Docs** | https://your-render-url/docs |
| **Free Hours** | 750/month |
| **Monthly Cost** | $0 |

---

## Success Criteria

✅ Frontend loads at Vercel URL
✅ Backend responds at Render URL/health
✅ Can create project without login
✅ Can add/delete activities
✅ Can analyze and export
✅ Can sign up and login
✅ Projects persist after refresh

**If all checked: You're done!** 🎉

---

## Next Steps

1. Monitor usage monthly
2. Share your app URL
3. When ready, upgrade to paid

**Total deployment time: 15-20 minutes**

Good luck! 🚀
