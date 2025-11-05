# 🚨 URGENT FIX: Vercel + Database Setup

## Your Error: "Registration failed" / "relation public.User does not exist"

This means **database tables haven't been created yet**.

---

## ✅ SOLUTION 1: Let Vercel create tables automatically (RECOMMENDED)

### Step 1: Update Build Command in Vercel

1. Go to your **Vercel Project**
2. Click **Settings** → **General**
3. Scroll to **Build & Development Settings**
4. Change **Build Command** to:
   ```
   npm run build:vercel
   ```

   Or if you prefer the full command:
   ```
   prisma generate && prisma db push --accept-data-loss --skip-generate && next build
   ```

5. Click **Save**

### Step 2: Redeploy

1. Go to **Deployments** tab
2. Click the **three dots** on the latest deployment
3. Click **Redeploy**

**That's it!** Tables will be created automatically during build.

---

## ✅ SOLUTION 2: Create tables manually from your computer

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login and link project

```bash
vercel login
vercel link
```

### Step 3: Pull environment variables

```bash
vercel env pull .env.production
```

This downloads your `DATABASE_URL` and other env vars.

### Step 4: Create database tables

```bash
# Load the production env vars
source .env.production

# Or on Windows:
# set /p DATABASE_URL=<.env.production

# Create tables
npx prisma db push
```

### Step 5: (Optional) Add sample data

```bash
npm run seed
```

This creates:
- Admin: `admin@mapscraperhub.com` / `Admin123!`
- Test User: `test@example.com` / `Test123!`

---

## ✅ SOLUTION 3: Use automatic setup script

### Make script executable

```bash
chmod +x scripts/setup-database.sh
```

### Run the script

```bash
# Pull Vercel env vars first
vercel env pull .env.production

# Run setup
./scripts/setup-database.sh
```

The script will:
1. ✅ Check database connection
2. ✅ Create tables if they don't exist
3. ✅ Optionally seed with sample data
4. ✅ Open Prisma Studio to verify

---

## 🔍 Diagnostic Tool

If you're not sure what's wrong, run:

```bash
chmod +x scripts/diagnose.sh
./scripts/diagnose.sh
```

This will check:
- ✅ DATABASE_URL is set
- ✅ Database connection works
- ✅ Tables exist
- ✅ Environment variables

---

## ❓ Which solution should I use?

### Use Solution 1 if:
- ✅ You want automatic setup
- ✅ You're deploying on Vercel
- ✅ You want tables created on every deploy

### Use Solution 2 if:
- ✅ You want manual control
- ✅ You need to verify before deploying
- ✅ You want to seed data

### Use Solution 3 if:
- ✅ You're on Mac/Linux
- ✅ You want an interactive setup
- ✅ You need diagnostics

---

## 📝 Verify It Worked

### Check 1: Database has tables

```bash
npx prisma studio
```

You should see:
- ✅ User
- ✅ Account
- ✅ Session
- ✅ Search
- ✅ Transaction
- ✅ VerificationToken

### Check 2: Registration works

1. Go to: `https://your-app.vercel.app/auth/signup`
2. Enter: Name, Email, Password
3. Click "Sign Up"
4. Should redirect to Dashboard ✅

---

## 🚨 Still Not Working?

### Check these:

1. **DATABASE_URL is set in Vercel**
   - Go to: Settings → Environment Variables
   - Verify `DATABASE_URL` exists
   - Should start with `postgresql://`

2. **Database is accessible**
   ```bash
   psql $DATABASE_URL
   ```
   Should connect without errors

3. **Run diagnostic**
   ```bash
   ./scripts/diagnose.sh
   ```

4. **Check Vercel logs**
   ```bash
   vercel logs --follow
   ```
   Or check in Vercel Dashboard → Logs

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Create tables | `npm run db:push` |
| Create tables + seed | `npm run db:setup` |
| View database | `npm run studio` |
| Run diagnostics | `./scripts/diagnose.sh` |
| Setup database | `./scripts/setup-database.sh` |

---

## 📞 Need More Help?

Check these files in your project:
- `TROUBLESHOOTING.md` - Complete troubleshooting guide
- `DATABASE_SETUP.md` - Detailed database setup
- `QUICK_FIX.md` - Fast solutions

---

**TL;DR:** Change Vercel build command to `npm run build:vercel` and redeploy. That's it! 🚀
