# Render Quick Start (5 minutes)

Switch from Railway to Render - takes just 5 minutes!

## Why Render?
- **750 free hours/month** - enough for hobby projects
- **No credit card needed** for free tier
- **Same setup difficulty** as Railway
- **PostgreSQL database included**
- **Auto-deploy on git push**

---

## 3 Simple Steps

### Step 1: Backend on Render (5 min)

```
1. Go to render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Select your ProjectPath repo
5. Fill in:
   - Name: projectpath-backend
   - Build: pip install -r requirements.txt
   - Start: python main.py
   - Plan: Free
6. Add env vars:
   - JWT_SECRET=your-secret
   - DATABASE_URL=<Render-generated>
7. Click "Create Web Service"
8. Wait for ✅ Deploy successful
9. Copy the URL: https://xxx.onrender.com
```

### Step 2: Frontend on Vercel (3 min)

```
1. Go to vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Select ProjectPath repo
5. Set:
   - Framework: Vite
   - Root: ./frontend
   - Build: npm run build
   - Output: dist
6. Add env var:
   - VITE_API_URL=<your-render-url>
7. Click "Deploy"
8. Wait for ✅ Done
9. Click "Visit"
```

### Step 3: Test (2 min)

```
1. Create project (no login needed)
2. Add activities
3. Analyze
4. Sign up and login
5. Test PDF export
```

**Done!** ✅

---

## Key Differences from Railway

| Railway | Render |
|---------|--------|
| 500 hrs free | 750 hrs free |
| Sleeps after 15 min | Sleeps after 15 min |
| Auto-deploy ✅ | Auto-deploy ✅ |
| $5+ for paid | $7+ for paid |

---

## Cost Breakdown

| Service | Cost |
|---------|------|
| Render Backend | FREE (750 hrs/month) |
| Vercel Frontend | FREE (unlimited) |
| PostgreSQL | FREE (included) |
| **Total** | **$0/month** |

---

## Watch Out For

⚠️ **750 hours = 24-25 days continuous**

Your actual usage will be much less:
- Light hobby use: ~100 hrs/month
- Medium use: ~200 hrs/month
- Heavy use: ~400 hrs/month

You're safe! ✅

---

## Full Details

See: **RENDER_DEPLOYMENT.md** for complete step-by-step

---

**Ready? Let's deploy!** 🚀
