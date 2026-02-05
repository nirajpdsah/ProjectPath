# 📊 Deployment Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR USERS (Internet)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
        ┌────────────────────────────────┐
        │   Vercel CDN (Your Frontend)    │
        │  ✅ FREE - Unlimited            │
        │  - React App                    │
        │  - 50+ global servers          │
        │  - Auto SSL/TLS                │
        │                                │
        │  URL: vercel.app/xxxx          │
        └────────────┬───────────────────┘
                     │
              API calls (HTTPS)
                     │
                     ▼
        ┌────────────────────────────────┐
        │  Railway (Your Backend)         │
        │  ✅ FREE - 500 hrs/month        │
        │  - FastAPI Server              │
        │  - Python Application          │
        │  - Auto-scaling                │
        │                                │
        │  URL: railway.app/xxxx         │
        └────────────┬───────────────────┘
                     │
              Database Queries
                     │
                     ▼
        ┌────────────────────────────────┐
        │  PostgreSQL Database            │
        │  ✅ FREE - 5GB on Railway       │
        │  - User accounts                │
        │  - Projects                    │
        │  - Activities                  │
        │  - Analysis results            │
        └────────────────────────────────┘
```

## Deployment Flow

```
Your GitHub Repo
      │
      │ (You push code)
      │
      ├─────────────────────────┬──────────────────────────┐
      │                         │                          │
      ▼                         ▼                          ▼
  Railway Webhook          Vercel Webhook          (GitHub Integration)
      │                         │
      │ Auto-redeploy           │ Auto-redeploy
      │ Backend                 │ Frontend
      │                         │
      ▼                         ▼
  production.up.          projectpath.
  railway.app/xxxx        vercel.app
```

## Data Flow: Creating a Project

```
User opens your Vercel URL
        │
        ▼
Browser loads React app from Vercel CDN
        │
        ▼
React app loads from VITE_API_URL (your Railway backend)
        │
        ▼
User clicks "Create Project"
        │
        ▼
Frontend makes POST to https://railway-url/projects
        │
        ▼
Backend receives request & validates JWT token
        │
        ▼
Backend writes to PostgreSQL database
        │
        ▼
Backend returns project data to frontend
        │
        ▼
React renders project in UI
        │
        ▼
Done! ✅
```

## Login & Auth Flow

```
User enters email/password
        │
        ▼
Frontend POSTs to /auth/signup
        │
        ▼
Backend hashes password with bcrypt
        │
        ▼
Backend stores in PostgreSQL
        │
        ▼
Backend creates JWT token
        │
        ▼
Frontend stores token in localStorage
        │
        ▼
Future requests include JWT token
        │
        ▼
Backend validates token
        │
        ▼
Request allowed ✅
```

## Scaling Path (When You Need to Pay)

```
FREE TIER                    PAID TIER (If needed)
─────────────────            ────────────────────

Railway: $0                   Railway: $7+/month
- 500 hrs/month              - Unlimited hours
- Shared CPU                 - Dedicated resources
- May sleep                  - Always-on

Vercel: $0                    Vercel: $20+/month
- 100 GB bandwidth           - 1 TB bandwidth
- Up to 12 concurrent        - Priority support
- Limited CI/CD              - Advanced features

TOTAL: $0/month              TOTAL: $27+/month
```

## Monitoring

```
Railway Dashboard (railway.app)
├── Logs (see errors/requests)
├── Metrics (CPU, Memory)
├── Deployments (history)
└── Health checks

Vercel Dashboard (vercel.com)
├── Deployments (history)
├── Analytics (performance)
├── Environment variables
└── Logs
```

## High Availability Strategy (Free!)

```
Your App Architecture
├── Frontend: Vercel (97.99% uptime SLA)
├── Backend: Railway (99% uptime on free tier)
└── Database: PostgreSQL (auto-backups daily)

If Railway goes down:
- Vercel stays up (users can see UI)
- API calls fail gracefully
- Data is safe in PostgreSQL

If Vercel goes down:
- Railway stays up (API works)
- Users can't access UI
- Data is safe

This is acceptable for hobby projects!
```

## Files in This Deployment Setup

```
ProjectPath/
├── backend/
│   ├── Dockerfile              ← Containerization
│   ├── requirements.txt        ← Dependencies
│   ├── .env.local             ← Local env vars
│   └── main.py                ← Entry point
│
├── frontend/
│   ├── package.json           ← Dependencies
│   ├── .env.local            ← Local env vars
│   ├── vite.config.ts        ← Build config
│   └── src/services/api.ts   ← API client (uses VITE_API_URL)
│
├── railway.json              ← Railway config (auto-deployed)
├── vercel.json              ← Vercel config (auto-deployed)
├── DEPLOYMENT.md            ← Full step-by-step guide
├── DEPLOYMENT_QUICK_START.md ← Quick reference
└── setup-github.bat         ← GitHub setup helper
```

## Timeline to Live

```
15 min total deployment time:

0-1 min:  Run setup-github.bat
1-2 min:  Create GitHub repo & push
2-7 min:  Deploy to Railway
7-12 min: Deploy to Vercel
12-15 min: Test everything
15 min:   🎉 LIVE!
```

---

**Your app will be live worldwide on 50+ Vercel servers!** 🌍
