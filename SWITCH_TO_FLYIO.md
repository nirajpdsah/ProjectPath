# 🚀 Switching to Fly.io (Better Than Render - No Sleep)

If you want **NO auto-sleep** and better performance, use **Fly.io** instead of Render.

## Why Fly.io?

✅ **Completely FREE** - 3 shared CPUs  
✅ **No auto-sleep** - Always running  
✅ **Better performance** - Distributed globally  
✅ **Better uptime** - 99% SLA  
✅ **PostgreSQL included** - Like Railway  

Only downside: Slightly more setup (but worth it!)

---

## Step 1: Install Flyctl CLI

### On Windows:
```powershell
# Install with chocolatey
choco install flyctl

# Or download manually from flyctl.io

# Verify installation
flyctl version
```

### On Mac/Linux:
```bash
curl -L https://fly.io/install.sh | sh
```

---

## Step 2: Create Fly.io Account

```bash
flyctl auth signup
# Or if you have account:
flyctl auth login
```

Sign up with GitHub (easiest)

---

## Step 3: Deploy Backend to Fly.io

### Navigate to backend:
```bash
cd D:\ProjectPath - Copy\backend
```

### Launch the app:
```bash
flyctl launch
```

You'll be asked:
```
? Choose an app name (or leave blank): projectpath-backend
? Choose a region: choose closest to you (or just press Enter)
? Would you like to set up a Postgresql database? YES
? Scale postgres down to zero after 24h? NO (keep it always on)
```

### Deploy:
```bash
flyctl deploy
```

Wait for it to finish. You'll get a URL like:
```
https://projectpath-backend.fly.dev
```

---

## Step 4: Set Environment Variables

```bash
flyctl secrets set \
  JWT_SECRET="your-random-secret-key-here" \
  JWT_ALGORITHM="HS256" \
  JWT_EXPIRATION_HOURS="168" \
  PYTHONUNBUFFERED="1"
```

---

## Step 5: Verify Deployment

```bash
# Check logs
flyctl logs

# Check app status
flyctl status

# Visit your app
flyctl open /health
```

You should see: `{"status":"healthy"}`

---

## Step 6: Update Vercel Frontend

1. Go to **vercel.com**
2. Find your ProjectPath project
3. Go to **Settings** → **Environment Variables**
4. Update `VITE_API_URL`:
   ```
   https://projectpath-backend.fly.dev
   ```
5. Save and **Redeploy**

---

## Fly.io Free Tier Limits

✅ **3 shared-cpu VMs** (enough for hobby)  
✅ **PostgreSQL 3 shared-cpu** (database included)  
✅ **Volumes** (disk space)  
✅ **Unlimited bandwidth**  
✅ **No auto-sleep** (always on!)  

---

## Fly.io Advantages vs Render

| Feature | Fly.io | Render |
|---------|--------|--------|
| **Cost** | FREE | FREE |
| **Auto-sleep** | No ✅ | 15 min ❌ |
| **Performance** | Excellent | Good |
| **Setup** | Moderate | Easy |
| **No CC needed** | Yes ✅ | Yes ✅ |

---

## Fly.io vs Railway Pricing

```
Railway:  $0 for trial, then ~$5/month
Render:   $0 forever (with 15 min sleep)
Fly.io:   $0 forever (no sleep!)
```

---

## Useful Fly.io Commands

```bash
# View your app
flyctl apps list

# Update code (after git push)
flyctl deploy

# View logs
flyctl logs

# SSH into the app
flyctl ssh console

# View environment variables
flyctl secrets list

# Update a variable
flyctl secrets set JWT_SECRET="new-value"

# Remove a variable
flyctl secrets unset JWT_SECRET

# View app status
flyctl status

# Check metrics
flyctl status -v
```

---

## Cost After Free Tier Exceeded

If you somehow exceed the free tier (unlikely for hobby):
- **Extra compute**: $0.15 per shared-cpu per month
- **Extra database**: $0.27 per shared-cpu per month
- **Bandwidth**: Never charged

Most users stay in free tier forever!

---

## Comparison: Railway vs Render vs Fly.io

| | Railway | Render | Fly.io |
|---|---------|---------|---------|
| **Free Trial** | 7 days | Forever | Forever |
| **Cost After** | $5+/month | $0 (sleep) | $0 |
| **Auto-sleep** | No | Yes (15min) | No |
| **Setup** | Super easy | Easy | Moderate |
| **PostgreSQL** | Yes | Yes | Yes |
| **Auto-deploy** | Yes | Yes | Yes |
| **Performance** | Good | Good | Excellent |

---

## My Recommendation

**For you:** Use **Fly.io**
- No auto-sleep
- Better performance
- Stays free forever
- Still super easy

---

## Migration Steps (Summary)

1. Install flyctl
2. `flyctl auth login`
3. `cd backend && flyctl launch`
4. `flyctl deploy`
5. Get the URL
6. Update Vercel environment variable
7. Redeploy Vercel
8. Done! ✅

---

## Troubleshooting Fly.io

### "Build failed"
- Check logs: `flyctl logs`
- Ensure requirements.txt exists
- Verify Python files are there

### "Health check failing"
- Check logs: `flyctl logs`
- SSH in: `flyctl ssh console`
- Check if /health endpoint exists

### "Can't connect frontend"
- Verify URL is correct
- Check VITE_API_URL is set
- Redeploy Vercel

### "PostgreSQL connection error"
- Database created during `flyctl launch`
- Check it exists: `flyctl postgres-attach`
- DATABASE_URL set automatically

---

## Support

- **Fly.io Docs**: fly.io/docs
- **Discord**: community.fly.io
- **GitHub Issues**: github.com/superfly/flyctl

---

## Next: Choose Your Backend

| If You Want | Use |
|-----------|-----|
| **Easiest setup** | Render.com |
| **Best performance** | Fly.io |
| **No decisions** | Fly.io (my pick!) |

---

**Pick one and deploy!** Your backend will be free and fast! 🚀
