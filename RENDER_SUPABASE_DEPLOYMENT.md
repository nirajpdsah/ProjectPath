# Render + Supabase Deployment Guide

Complete guide to deploy ProjectPath using:
- **Render** (Backend - 750 hrs free)
- **Supabase** (Database - PostgreSQL free)
- **Vercel** (Frontend - unlimited free)

**Total cost: $0/month** ✅

---

## PART 1: Setup Supabase Database (3 minutes)

### Step 1: Create Supabase Account

1. Go to **supabase.com**
2. Click **"Start your project"**
3. Sign up with **GitHub**
4. Authorize Supabase

### Step 2: Create New Project

1. In Supabase dashboard, click **"New Project"**
2. Fill in:
   - **Name**: `projectpath`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Pick closest to you
   - **Pricing Plan**: **Free**
3. Click **"Create new project"**
4. Wait 2-3 minutes for database to provision

### Step 3: Get Connection String

1. Once project is ready, click **"Project Settings"** (gear icon)
2. Go to **"Database"** in left sidebar
3. Scroll to **"Connection string"** section
4. Select **"URI"** tab
5. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. **Replace `[YOUR-PASSWORD]` with your actual database password**
7. **Save this connection string** - you'll need it for Render!

✅ Database ready!

---

## PART 2: Deploy Backend on Render (5 minutes)

### Step 1: Create Render Account

1. Go to **render.com**
2. Click **"Sign Up"**
3. Choose **"GitHub"**
4. Authorize Render

### Step 2: Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Click **"Build and deploy from a Git repository"**
3. Connect GitHub and select **ProjectPath** repository
4. Click **"Connect"**

### Step 3: Configure Web Service

**Basic Settings:**
- **Name**: `projectpath-backend`
- **Environment**: `Python 3`
- **Region**: Pick closest to you
- **Branch**: `main`

**Build Settings:**
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python main.py`

**Instance Type:**
- Select: **Free**

### Step 4: Add Environment Variables

Click **"Environment"** section and add:

```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
JWT_SECRET=your-random-secret-key-12345
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=168
PORT=10000
```

**Important:**
- Use your Supabase connection string for `DATABASE_URL`
- Generate random string for `JWT_SECRET`

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Watch build logs (takes 2-3 minutes)
3. Wait for: ✅ "Deploy successful"
4. Your backend URL: `https://projectpath-backend.onrender.com`

**Save this URL!**

### Step 6: Test Backend

1. Open: `https://your-render-url/health`
2. Should see: `{"status":"healthy"}`
3. Open: `https://your-render-url/docs`
4. Should see: API documentation

✅ Backend live!

---

## PART 3: Deploy Frontend on Vercel (5 minutes)

### Step 1: Create Vercel Account

1. Go to **vercel.com**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel

### Step 2: Import Project

1. Click **"New Project"**
2. Click **"Import Git Repository"**
3. Find and select **ProjectPath**
4. Click **"Import"**

### Step 3: Configure Build Settings

1. **Framework**: `Vite`
2. **Root Directory**: `./frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

### Step 4: Add Environment Variable

Click **"Environment Variables"**:

```
Name: VITE_API_URL
Value: https://your-render-url.onrender.com
```

Replace with your actual Render URL from Part 2.

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build (2-3 minutes)
3. Click **"Visit"**
4. Your app is live!

✅ Frontend live!

---

## PART 4: Test Everything

### Database Test
1. Go to Supabase dashboard
2. Click **"Table Editor"**
3. After creating projects, you should see `users`, `projects`, `activities` tables

### Guest Mode Test
- [ ] Open Vercel URL
- [ ] Create project without login
- [ ] Add activities
- [ ] Analyze
- [ ] Export PDF

### Authentication Test
- [ ] Click "Sign Up"
- [ ] Create account
- [ ] Check Supabase → Table Editor → `users` table
- [ ] Log in
- [ ] Create project
- [ ] Check Supabase → `projects` table

✅ Everything working!

---

## Your Complete Stack

```
┌─────────────────────────────────────┐
│  Users (Your Friends/Customers)      │
└──────────────┬──────────────────────┘
               │
               ▼
     ┌────────────────────┐
     │  Vercel Frontend    │
     │  (React + Vite)    │
     │  FREE - Unlimited  │
     └─────────┬──────────┘
               │ API calls
               ▼
     ┌────────────────────┐
     │  Render Backend     │
     │  (FastAPI)         │
     │  FREE - 750 hrs    │
     └─────────┬──────────┘
               │ SQL queries
               ▼
     ┌────────────────────┐
     │  Supabase DB        │
     │  (PostgreSQL)      │
     │  FREE - 500MB      │
     └────────────────────┘
```

---

## Cost Breakdown

| Service | Free Tier | Cost |
|---------|-----------|------|
| **Render** | 750 hrs/month | $0 |
| **Supabase** | 500MB database | $0 |
| **Vercel** | Unlimited | $0 |
| **Total** | — | **$0/month** ✅

---

## Supabase Features You Get (Bonus!)

### Database Dashboard
- Visual table editor
- Run SQL queries directly
- See all data in real-time

### Real-time Monitoring
- See active connections
- Monitor database size
- View query logs

### Auto-Backups
- Daily automatic backups
- Point-in-time recovery
- Download backups anytime

### SQL Editor
- Write custom queries
- Test database operations
- Export data as CSV

---

## Limitations & Notes

### Render (Backend)
- 750 hours/month (~24 days continuous)
- Auto-sleep after 15 min inactivity
- First request after sleep: 2-3 seconds

### Supabase (Database)
- 500MB database storage
- 1GB file storage
- 2GB bandwidth/month
- Auto-pause if inactive 1 week

### Vercel (Frontend)
- Unlimited deployments
- 100GB bandwidth/month
- Fast global CDN

**Your hobby project will never hit these limits!** ✅

---

## Auto-Redeploy

When you push to GitHub:
```bash
git add .
git commit -m "New feature"
git push origin main
```

✅ Render redeploys backend automatically
✅ Vercel redeploys frontend automatically
✅ Supabase stays online (no redeploy needed)

---

## Monitoring Your App

### Check Render
- Go to render.com dashboard
- View logs for errors
- See CPU/Memory usage
- Monitor deployment status

### Check Supabase
- Go to supabase.com dashboard
- Click **"Table Editor"** → See all data
- Click **"Database"** → See connection stats
- Click **"Logs"** → See queries

### Check Vercel
- Go to vercel.com dashboard
- View deployment history
- Check analytics
- See error logs

---

## Troubleshooting

### Backend can't connect to database
**Issue:** Connection string wrong

**Fix:**
1. Go to Supabase → Settings → Database
2. Copy connection string again
3. Update `DATABASE_URL` in Render
4. Restart Render service

### Database tables not created
**Issue:** First request creates tables

**Fix:**
1. Make a request to backend (visit any endpoint)
2. Check Supabase Table Editor
3. Tables should appear automatically

### Login not working
**Issue:** JWT_SECRET not set

**Fix:**
1. Check Render environment variables
2. Make sure `JWT_SECRET` is set
3. Restart Render service

### Supabase project paused
**Issue:** Inactive for 1 week

**Fix:**
1. Go to Supabase dashboard
2. Click "Restore project"
3. Wait 2 minutes
4. Update connection string if changed

---

## Upgrading (If Needed)

### When You Exceed Free Tier

**Render:**
- Upgrade to $7/month for unlimited hours
- No sleep, always-on

**Supabase:**
- Upgrade to $25/month for Pro
- 8GB database, no pause

**Vercel:**
- Stay free! (Rarely need to upgrade)

---

## Quick Reference

| What | URL/Value |
|------|-----------|
| **Backend** | https://projectpath-backend.onrender.com |
| **Frontend** | https://projectpath.vercel.app |
| **Database** | Supabase dashboard |
| **API Docs** | https://your-render-url/docs |
| **Free Tier** | 750 hrs + 500MB + unlimited |
| **Cost** | $0/month |

---

## Success Checklist

- [ ] Supabase project created
- [ ] Connection string copied
- [ ] Render backend deployed
- [ ] Vercel frontend deployed
- [ ] Can visit frontend URL
- [ ] Can visit backend/health
- [ ] Can create project (guest mode)
- [ ] Can sign up
- [ ] Can see users table in Supabase
- [ ] Can create project (authenticated)
- [ ] Can analyze project
- [ ] Can export PDF

**All checked?** 🎉 **You're live!**

---

## Next Steps

1. **Share your app** - Send Vercel URL to friends
2. **Monitor usage** - Check Supabase/Render dashboards weekly
3. **Custom domain** - Add your domain (optional)
4. **Backup data** - Download from Supabase monthly

---

**Total deployment time: 15 minutes**

**Total cost: $0/month**

**Your app is production-ready!** 🚀
