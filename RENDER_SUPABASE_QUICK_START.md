# Render + Supabase Quick Start

Deploy in 15 minutes with Render + Supabase + Vercel!

**All FREE - $0/month** ✅

---

## Your Stack

```
Frontend:  Vercel (FREE - Unlimited)
Backend:   Render (FREE - 750 hrs/month)
Database:  Supabase (FREE - 500MB PostgreSQL)
────────────────────────────────────
Cost:      $0/month ✅
```

---

## 4 Quick Steps

### Step 1: Supabase (3 min)

```
1. Go to supabase.com
2. Sign up with GitHub
3. Click "New Project"
   - Name: projectpath
   - Generate password (SAVE IT!)
   - Region: Pick closest
   - Plan: Free
4. Click "Create new project"
5. Wait 2-3 minutes
6. Go to Settings → Database
7. Copy "Connection string" (URI format)
8. Replace [YOUR-PASSWORD] with your password
9. SAVE this connection string!
```

### Step 2: Render (5 min)

```
1. Go to render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Select ProjectPath repo
5. Fill in:
   - Name: projectpath-backend
   - Root Directory: backend
   - Build: pip install -r requirements.txt
   - Start: python main.py
   - Plan: Free
6. Add environment variables:
   DATABASE_URL=<your-supabase-connection-string>
   JWT_SECRET=<random-string>
   JWT_ALGORITHM=HS256
   JWT_EXPIRATION_HOURS=168
   PORT=10000
7. Click "Create Web Service"
8. Wait for ✅ Deploy successful
9. Copy URL: https://xxx.onrender.com
```

### Step 3: Vercel (5 min)

```
1. Go to vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Select ProjectPath repo
5. Configure:
   - Framework: Vite
   - Root: ./frontend
   - Build: npm run build
   - Output: dist
6. Add environment variable:
   VITE_API_URL=<your-render-url>
7. Click "Deploy"
8. Wait for ✅ Done
9. Click "Visit"
```

### Step 4: Test (2 min)

```
1. Create project (no login)
2. Add 3 activities
3. Click "Analyze"
4. Sign up with email/password
5. Check Supabase Table Editor → users table
6. Create authenticated project
7. Export PDF
```

**Done!** ✅

---

## Connection String Example

Your Supabase connection string looks like:

```
postgresql://postgres:YourPassword123@db.abcdefghijk.supabase.co:5432/postgres
```

Use this EXACTLY in Render's `DATABASE_URL` environment variable.

---

## What You Get FREE

| Service | What | Free Limit |
|---------|------|------------|
| **Supabase** | PostgreSQL database | 500MB storage |
| **Render** | FastAPI backend | 750 hrs/month |
| **Vercel** | React frontend | Unlimited |
| **Total Cost** | Everything | **$0/month** |

---

## Typical Usage (Won't Exceed Free Tier)

| Your Usage | Hours/Month | Safe? |
|------------|-------------|-------|
| Light hobby | ~100 hrs | ✅ Very safe |
| Medium use | ~200 hrs | ✅ Safe |
| Daily active | ~400 hrs | ✅ Safe |
| 24/7 continuous | ~730 hrs | ⚠️ Just fits |

**You're safe!** Most hobby projects use 100-200 hrs/month.

---

## Auto-Sleep Behavior

**Render:**
- Sleeps after 15 min inactivity
- First request wakes it (2-3 sec)
- Then instant responses

**Supabase:**
- Never sleeps (always active)
- Pauses only if inactive 1 week
- Easy to restore

**Vercel:**
- Never sleeps (CDN-based)
- Always instant

---

## Monitoring

**Supabase Dashboard:**
- Table Editor → See all data
- Database → Connection stats
- Logs → Query history

**Render Dashboard:**
- Logs → Backend errors
- Metrics → CPU/Memory
- Deployments → History

**Vercel Dashboard:**
- Deployments → Build history
- Analytics → Performance
- Logs → Frontend errors

---

## Quick Troubleshooting

**Backend won't start?**
→ Check Render logs for errors
→ Verify DATABASE_URL is correct

**Can't connect to database?**
→ Check Supabase connection string
→ Make sure password is correct
→ Restart Render service

**Tables not showing in Supabase?**
→ Make first request to backend
→ Tables auto-create on first use

**Login not working?**
→ Check JWT_SECRET is set in Render
→ Verify backend/health works

---

## Files You Need

All configuration already done:
- ✅ `render.yaml` - Render config
- ✅ `backend/main.py` - Reads DATABASE_URL
- ✅ `frontend/src/services/api.ts` - Uses VITE_API_URL
- ✅ Everything ready!

---

## Full Details

See: **RENDER_SUPABASE_DEPLOYMENT.md** for complete guide

---

## Your URLs After Deployment

```
Frontend:  https://projectpath.vercel.app
Backend:   https://projectpath-backend.onrender.com
Database:  https://app.supabase.com (dashboard)
API Docs:  https://projectpath-backend.onrender.com/docs
```

---

## Total Time

```
3 min:  Setup Supabase
5 min:  Deploy to Render
5 min:  Deploy to Vercel
2 min:  Test everything
────────
15 min: LIVE! 🎉
```

---

**Ready to deploy? Start with Step 1!** 🚀
