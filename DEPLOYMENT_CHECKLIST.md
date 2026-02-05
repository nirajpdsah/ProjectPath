# ✅ Deployment Checklist

## PRE-DEPLOYMENT CHECKLIST

### Code Ready
- [x] Backend code complete
- [x] Frontend code complete
- [x] Database models configured
- [x] Environment variables set up
- [x] API endpoints working locally
- [x] Frontend builds without errors

### Configuration Files Created
- [x] `railway.json` - Railway deployment config
- [x] `vercel.json` - Vercel deployment config
- [x] `DEPLOYMENT.md` - Step-by-step guide
- [x] `DEPLOYMENT_QUICK_START.md` - Quick reference
- [x] `ARCHITECTURE_DEPLOYMENT.md` - Architecture diagrams
- [x] `.env.local` files for local development

### Code Changes Made
- [x] Backend reads PORT from environment
- [x] Frontend uses VITE_API_URL from environment
- [x] Database uses DATABASE_URL from environment
- [x] API service configured for dynamic URL

---

## STEP-BY-STEP DEPLOYMENT

### Phase 1: GitHub Setup (5 minutes)

#### Option A: Using Batch Script (Easiest)
- [ ] Open PowerShell in project root
- [ ] Run: `.\setup-github.bat`
- [ ] Follow the prompts
- [ ] Copy the git commands shown

#### Option B: Manual Git Commands
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ProjectPath.git
git push -u origin main
```

**Checklist:**
- [ ] Created GitHub account (github.com)
- [ ] Created new repository named "ProjectPath"
- [ ] Repository is PUBLIC (not private)
- [ ] Code pushed to main branch
- [ ] Verify on GitHub: see all files online

---

### Phase 2: Deploy Backend to Railway (5 minutes)

**Checklist:**
- [ ] Created Railway account (railway.app)
- [ ] Signed in with GitHub
- [ ] Clicked "New Project" → "Deploy from GitHub repo"
- [ ] Selected ProjectPath repository
- [ ] Waited for deployment to complete (green checkmark)
- [ ] Copied Railway URL (looks like: `https://projectpath-production-xxxx.up.railway.app`)
- [ ] Set environment variables:
  - [ ] `JWT_SECRET=<random-string>`
  - [ ] `JWT_ALGORITHM=HS256`
  - [ ] `JWT_EXPIRATION_HOURS=168`
- [ ] Verified backend works:
  - [ ] Open: `https://your-railway-url/health`
  - [ ] See: `{"status":"healthy"}`
  - [ ] Open: `https://your-railway-url/docs`
  - [ ] See: API documentation page

**Your Railway URL:** `_______________________________`

---

### Phase 3: Deploy Frontend to Vercel (5 minutes)

**Checklist:**
- [ ] Created Vercel account (vercel.com)
- [ ] Signed in with GitHub
- [ ] Clicked "Add New..." → "Project" → "Import Git Repository"
- [ ] Selected ProjectPath repository
- [ ] Set Framework: "Vite"
- [ ] Set Root Directory: "./frontend"
- [ ] Set Build Command: "npm run build"
- [ ] Set Output Directory: "dist"
- [ ] Added Environment Variable:
  - [ ] Name: `VITE_API_URL`
  - [ ] Value: `https://your-railway-url` (from Phase 2)
- [ ] Clicked "Deploy"
- [ ] Waited for build to complete (green checkmark)
- [ ] Copied Vercel URL (looks like: `https://projectpath.vercel.app`)
- [ ] Visited your app URL in browser
- [ ] App loaded successfully

**Your Vercel URL:** `_______________________________`

---

## POST-DEPLOYMENT TESTING

### Guest Mode Testing
- [ ] Open your Vercel URL
- [ ] Click "Start Here" or "Create Project"
- [ ] Fill in project details
- [ ] Add 3-4 activities with dependencies
- [ ] Click "Analyze"
- [ ] See network diagram render
- [ ] Test PDF export
- [ ] Test JSON export
- [ ] Data persists after page refresh

### Authentication Testing
- [ ] Click "Sign Up"
- [ ] Create account with email/password
- [ ] Redirected to dashboard
- [ ] Create new project (logged in)
- [ ] See project in list
- [ ] Log out
- [ ] Click "Login"
- [ ] Log back in with same credentials
- [ ] See your projects still there

### Cross-Device Testing
- [ ] Get your Vercel URL
- [ ] Open on mobile/different browser
- [ ] Log in with same account
- [ ] See same projects on mobile
- [ ] Create new project on mobile
- [ ] See it appear on desktop (refresh if needed)

### API Testing
- [ ] Open: `https://your-railway-url/docs`
- [ ] Try `/health` endpoint
- [ ] Try `/auth/signup` endpoint
- [ ] Try `/projects` endpoints
- [ ] All should respond without errors

---

## TROUBLESHOOTING CHECKLIST

### Frontend Won't Load
- [ ] Check Vercel deployment status (green checkmark?)
- [ ] Wait 5 minutes for deployment to complete
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Check browser console for errors (F12)
- [ ] Verify VITE_API_URL in Vercel environment variables

### Can't Connect to Backend API
- [ ] Check Railway deployment status (green checkmark?)
- [ ] Visit Railway URL + `/health` in browser
- [ ] Verify VITE_API_URL is correct in Vercel
- [ ] Check that Railway URL doesn't have trailing slash
- [ ] Redeploy Vercel after fixing VITE_API_URL:
  - [ ] Go to Vercel project
  - [ ] Click "Deployments"
  - [ ] Click "..." on latest
  - [ ] Click "Redeploy"

### Signup/Login Not Working
- [ ] Check Railway logs for errors
- [ ] Verify JWT_SECRET is set in Railway variables
- [ ] Check browser console (F12) for errors
- [ ] Try creating account again

### Database Errors
- [ ] Check Railway logs
- [ ] Database is auto-created on first request
- [ ] Try refreshing the page
- [ ] If still broken, check Railway PostgreSQL service

### Slow Loading
- [ ] Normal: Railway free tier may sleep after 15 min
- [ ] First request after sleep will be slow
- [ ] Subsequent requests are fast
- [ ] Keep your app active by visiting every 15 min

---

## MONITORING & MAINTENANCE

### Daily
- [ ] Check app works
- [ ] Test creating a project
- [ ] Test login/signup

### Weekly
- [ ] Check Railway logs for errors
- [ ] Check Vercel deployment status
- [ ] Verify database size is reasonable

### Monthly
- [ ] Monitor Railway usage (hours)
- [ ] Monitor Vercel bandwidth usage
- [ ] Check for any errors in logs

### When Issues Occur
- [ ] Check Railway logs: `railway.app` → Project → Logs
- [ ] Check Vercel logs: `vercel.com` → Project → Deployments
- [ ] Check GitHub for any commit issues
- [ ] Ask for help with logs attached

---

## SUCCESS CRITERIA

Your deployment is successful when:

✅ Frontend loads at your Vercel URL  
✅ Backend responds at Railway URL/health  
✅ Can create project without login  
✅ Can add activities and analyze  
✅ Can export PDF/JSON  
✅ Can sign up for account  
✅ Can log in to account  
✅ Projects persist after refresh  
✅ Projects sync across devices (when logged in)  

---

## NEXT STEPS AFTER DEPLOYMENT

### Share Your App
- [ ] Send Vercel URL to friends/family
- [ ] Share on social media
- [ ] Add to your portfolio

### Optional: Custom Domain
- [ ] Buy domain (namecheap.com, godaddy.com)
- [ ] Add domain in Vercel settings
- [ ] Add domain in Railway settings
- [ ] Update DNS records

### Optional: Upgrade for Production
- [ ] Upgrade Railway to paid ($7+/month)
- [ ] Upgrade Vercel to paid (if needed)
- [ ] Set up monitoring/alerts
- [ ] Add analytics tracking

### Documentation
- [ ] Update GitHub README with deployed URL
- [ ] Add screenshots to README
- [ ] Write deployment experience post
- [ ] Share guide with others

---

## Keep This Checklist Nearby

Print this or bookmark for reference during deployment. Check off each item as you complete it!

**Estimated total time: 15-20 minutes** ⏱️

**Questions?** Refer to DEPLOYMENT.md for detailed help on each step.

Good luck! 🚀
