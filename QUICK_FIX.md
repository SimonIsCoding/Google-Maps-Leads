# 🚨 Quick Fix for Current Issues

## Problem 1: "Registration failed. Please try again."

**Root cause:** Database tables don't exist yet.

### ✅ Solution (Run these commands):

```bash
# 1. Create all database tables
npm run db:push

# 2. (Optional) Create sample admin/test users
npm run seed

# 3. Verify tables were created
npx prisma studio
```

That's it! Registration should now work.

---

## Problem 2: Google OAuth "Error 400: redirect_uri_mismatch"

**Root cause:** Google OAuth redirect URI not configured correctly.

### ✅ Solution:

#### Step 1: Get your exact app URL

For Vercel, it looks like: `https://mapsscrapper-something.vercel.app`

Check your Vercel dashboard or run:
```bash
vercel ls
```

#### Step 2: Add to Google Cloud Console

1. Go to: https://console.cloud.google.com
2. Click: **APIs & Services** → **Credentials**
3. Click on your **OAuth 2.0 Client ID**
4. Under **Authorized redirect URIs**, click **+ ADD URI**
5. Add this **EXACT** URL (replace with your actual domain):
   ```
   https://your-actual-app.vercel.app/api/auth/callback/google
   ```
6. Click **SAVE**

#### Step 3: Update Vercel Environment Variables

1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Update or add:
   ```
   NEXTAUTH_URL=https://your-actual-app.vercel.app
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
4. Redeploy your app

---

## Alternative: Test without Google OAuth

If you want to test the app quickly without Google OAuth:

1. **Just don't set the Google environment variables**
2. Users can still register/login with email and password
3. The Google button won't appear

---

## Verify Everything Works

### Test Registration:
1. Go to: `https://your-app.vercel.app/auth/signup`
2. Enter: Name, Email, Password
3. Click "Sign Up"
4. Should redirect to Dashboard ✅

### Test Login:
1. Go to: `https://your-app.vercel.app/auth/signin`
2. Enter your email and password
3. Should see Dashboard ✅

---

## Still Not Working?

### Check Database Connection

Run this to verify your database is accessible:
```bash
npx prisma db pull
```

If this works, your database connection is good.

### Check Environment Variables

Make sure these are set in Vercel:
```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<random-string>
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### View Logs

```bash
# Vercel logs
vercel logs --follow

# Or check Vercel dashboard → Your Project → Logs
```

---

## Summary of Commands

```bash
# Fix database issue
npm run db:push

# Optional: Create sample users
npm run seed

# Check if it worked
npx prisma studio
```

**That's it!** These two commands should fix your registration issue.

For Google OAuth, just add the correct redirect URI to Google Cloud Console.
