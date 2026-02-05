# 🔄 Switching from Railway to Render.com (Free)

Railway's free trial ended? No problem! Switch to **Render.com** - it's free and almost identical.

## Why Render.com?

✅ **Completely FREE** - No credit card required  
✅ **PostgreSQL included** - Like Railway  
✅ **Same deployment process** - Just connect GitHub  
✅ **Auto-deploy** - Push code, it deploys  
✅ **Only limitation** - Sleeps after 15 min inactivity (but that's fine for hobby)  

## Step-by-Step: Migrate to Render.com

### Step 1: Create Render Account
1. Go to **render.com**
2. Click **"Get Started"**
3. Sign up with **GitHub** (easiest)
4. Authorize Render to access your GitHub

### Step 2: Create New Web Service
1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your **ProjectPath** repository from GitHub
4. Select **root directory**: `backend` (or `/`)
5. Click **"Create Web Service"**

### Step 3: Configure Build Settings
Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | projectpath-backend (or any name) |
| **Environment** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `python main.py` |
| **Instance Type** | Free |

### Step 4: Add Environment Variables
1. Scroll to **"Environment"** section
2. Click **"Add Environment Variable"**
3. Add these variables:

```
JWT_SECRET=your-random-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=168
PORT=8001
PYTHONUNBUFFERED=1
```

For `JWT_SECRET`, use any random string (example: `abc123xyz789def456ghi`)

4. Click **"Create Web Service"**

### Step 5: Wait for Deployment
- Watch the logs scroll by
- Wait for **"Your service is live"** message
- Render will give you a URL like:
  ```
  https://projectpath-backend.onrender.com
  ```

### Step 6: Update Vercel Frontend
1. Go to **vercel.com** → Your ProjectPath project
2. Go to **Settings** → **Environment Variables**
3. Update `VITE_API_URL`:
   - Old: `https://your-railway-url.up.railway.app`
   - New: `https://projectpath-backend.onrender.com`
4. Click **"Save"**
5. Go to **Deployments** → Click the latest one → Click **"Redeploy"**

### Step 7: Test It Works
1. Open your Vercel URL
2. Try creating a project
3. Try signup/login
4. Try analysis and export
5. Everything should work! ✅

---

## Cost Comparison

| Service | Cost | Notes |
|---------|------|-------|
| **Railway** | ~$5/month after trial | Generous free hours |
| **Render** | **FREE** | Sleeps after 15 min |
| **Vercel** | **FREE** | Your frontend |
| **Total** | **$0/month** | Perfect! |

---

## Render Free Tier Limitations

### What's Included:
✅ 750 hours/month free (plenty!)  
✅ Automatic deployments  
✅ Free PostgreSQL database (5GB)  
✅ Auto SSL certificates  
✅ Unlimited bandwidth  

### What's Limited:
- Auto-sleeps after 15 minutes of inactivity
- First request after sleep is slow (5-10 seconds)
- Shared resources (fine for hobby projects)

### No Limitations:
- No credit card required
- No hard time limit
- Can stay free forever

---

## Performance Expectations

**First Request (after sleep)**: 5-10 seconds (building up)  
**Subsequent Requests**: <200ms (normal speed)  

**Pro Tip**: If users complain about slowness on first visit, tell them to refresh!

---

## If You Want Better Uptime (No Sleep)

### Switch to Fly.io Instead:

1. Go to **fly.io**
2. Sign up with GitHub
3. Install `flyctl` CLI
4. Run:
```bash
cd backend
flyctl launch
flyctl deploy
```

**Fly.io Advantages:**
✅ No auto-sleep  
✅ Better performance  
✅ 3 free shared CPUs  
✅ Global deployment  

**Fly.io Disadvantage:**
❌ Slightly more complex setup  

---

## Migration Checklist

- [ ] Create Render account
- [ ] Add ProjectPath repository to Render
- [ ] Set up environment variables
- [ ] Wait for deployment to complete
- [ ] Copy Render URL
- [ ] Update Vercel environment variable with Render URL
- [ ] Redeploy Vercel frontend
- [ ] Test: Create project without login
- [ ] Test: Add activities
- [ ] Test: Run analysis
- [ ] Test: Sign up and login
- [ ] Test: Export PDF

---

## Troubleshooting Render

### "Build Failed"
- Check build logs
- Ensure `requirements.txt` is in backend folder
- Verify Python version is compatible

### "Service Crashed"
- Check Runtime logs
- Make sure `main.py` exists in backend
- Verify PORT environment variable is set

### "Can't connect from frontend"
- Verify VITE_API_URL in Vercel is correct
- Redeploy Vercel after changing URL
- Check Render service URL is correct

### "Database error"
- Database is auto-created
- Try accessing `/health` endpoint to trigger creation
- Check Render PostgreSQL service is running

---

## Keep Your Free Stack

```
Frontend:  Vercel ................. FREE ✓
Backend:   Render ................. FREE ✓
Database:  Render PostgreSQL ...... FREE ✓
Total Cost: $0/month 🎉
```

---

## Next: Update Documentation

Once you switch to Render, update:
1. `DEPLOYMENT_QUICK_START.md` - Change Railway to Render
2. `DEPLOYMENT_CHECKLIST.md` - Update Render steps
3. Share new guide with others!

---

## Complete! 🎉

Your app is still free and still live!

**Questions?** See troubleshooting above or check Render docs at render.com/docs
