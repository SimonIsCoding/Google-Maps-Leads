# Troubleshooting Guide

## 🔴 Error: "Registration failed. Please try again."

### Cause
Your database tables haven't been created yet.

### Quick Fix

Run this command to create all database tables:

```bash
npm run db:push
```

Or if you want to also create sample data:

```bash
npm run db:setup
```

This will:
1. Create all database tables (User, Search, Transaction, etc.)
2. Create admin and test users

### Detailed Steps

1. **Make sure your DATABASE_URL is set correctly:**
   ```bash
   # Check if DATABASE_URL exists
   echo $DATABASE_URL
   ```

2. **Push the schema to your database:**
   ```bash
   npx prisma db push
   ```

3. **(Optional) Seed the database:**
   ```bash
   npm run seed
   ```

4. **Verify tables were created:**
   ```bash
   npx prisma studio
   ```
   This opens a visual database browser at http://localhost:5555

### For Production (Vercel + Render)

If you're deploying on Vercel with Render PostgreSQL:

1. **Get your database URL from Render:**
   - Go to Render Dashboard
   - Click on your PostgreSQL service
   - Copy "External Database URL"

2. **Add to Vercel environment variables:**
   - Go to Vercel → Project → Settings → Environment Variables
   - Add `DATABASE_URL` with the value from Render

3. **Run migration from local:**
   ```bash
   # Pull Vercel env vars
   vercel env pull .env.production

   # Run migration
   npx prisma db push
   ```

4. **Or let Vercel do it automatically:**
   Add this to your build command in Vercel:
   ```
   prisma generate && prisma db push --accept-data-loss && next build
   ```

---

## 🔴 Error: "Error 400: redirect_uri_mismatch" (Google OAuth)

### Cause
The Google OAuth redirect URI doesn't match your configuration.

### Quick Fix

1. **Get your app URL:**
   - Vercel: `https://your-project.vercel.app`
   - Custom domain: `https://your-domain.com`

2. **Go to [Google Cloud Console](https://console.cloud.google.com)**

3. **Navigate to:**
   - APIs & Services → Credentials → OAuth 2.0 Client IDs

4. **Add this EXACT URI to "Authorized redirect URIs":**
   ```
   https://your-actual-domain.vercel.app/api/auth/callback/google
   ```

   **Important:**
   - Use `https://` (not `http://`) for production
   - The path must be exactly `/api/auth/callback/google`
   - No trailing slash

5. **Update your environment variables:**
   ```env
   NEXTAUTH_URL=https://your-actual-domain.vercel.app
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-secret
   ```

6. **Redeploy your application**

### Alternative: Disable Google OAuth temporarily

If you just want to test email/password authentication:

1. **Don't set Google environment variables**
2. Users can still register with email/password
3. The Google button simply won't appear

---

## 🔴 Error: "Can't reach database server"

### Causes & Solutions

1. **Database not running:**
   ```bash
   # If using docker-compose locally
   docker-compose up -d
   ```

2. **Wrong DATABASE_URL:**
   ```bash
   # Check your .env file
   cat .env | grep DATABASE_URL
   ```

3. **Firewall blocking connection:**
   - Make sure your database allows connections from your IP
   - For Render: Check "Access Control" settings

4. **Database credentials wrong:**
   - Verify username, password, host, and database name
   - Regenerate credentials if needed

---

## 🔴 Build Error: "Environment variable not found: DATABASE_URL"

### For Vercel

1. Go to: Project → Settings → Environment Variables
2. Add `DATABASE_URL` for all environments (Production, Preview, Development)
3. Redeploy

### For Local

1. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your database URL:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/mapscraperhub"
   ```

---

## 🔴 Error: "NextAuth configuration error"

### Check these environment variables are set:

```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-here
```

### Generate NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

---

## 🔴 Error: "Stripe webhook signature verification failed"

### Cause
`STRIPE_WEBHOOK_SECRET` is missing or incorrect.

### Solution

1. **Get your webhook signing secret:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click on your webhook endpoint
   - Copy "Signing secret"

2. **Add to environment variables:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **Redeploy**

### Testing webhooks locally:

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret shown
# Add to your .env file
```

---

## 🔴 Email notifications not working

### Quick Fix

Emails are **optional**. The app works without them.

### To enable emails:

1. **Create SendGrid account**
2. **Verify sender email**
3. **Get API key**
4. **Add to environment variables:**
   ```env
   SENDGRID_API_KEY=SG.xxx
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   ```

### Skip emails in development:

Just leave `SENDGRID_API_KEY` empty. Emails will be logged to console instead.

---

## 🟢 Verify Everything Works

### 1. Check Database Connection

```bash
npx prisma studio
```
Should open http://localhost:5555 and show your tables.

### 2. Check Tables Exist

```bash
npx prisma db pull
```
Should not show any errors.

### 3. Test Registration

1. Go to `/auth/signup`
2. Create account with email/password
3. Should redirect to `/dashboard`

### 4. Test Login

1. Go to `/auth/signin`
2. Login with your account
3. Should see dashboard

### 5. Test Search (needs database initialized)

1. Go to home page
2. Enter a search query
3. Select number of rows
4. Submit search
5. Should see in dashboard

---

## 📞 Still Having Issues?

### Check Logs

**Vercel:**
```bash
vercel logs --follow
```

**Local:**
Check terminal output where you ran `npm run dev`

**Database:**
Check your database provider's logs (Render dashboard)

### Common Issues Summary

| Error | Cause | Solution |
|-------|-------|----------|
| "Registration failed" | No database tables | Run `npm run db:push` |
| "redirect_uri_mismatch" | Google OAuth not configured | Add correct URI to Google Console |
| "Can't reach database" | Wrong DATABASE_URL | Check connection string |
| "Environment variable not found" | Missing env vars | Add to Vercel/local .env |
| Email not sending | SendGrid not configured | Optional - leave empty |

### Get Help

1. Check all environment variables are set
2. Check database is running and accessible
3. Check logs for specific error messages
4. Try in incognito window (clears cache/sessions)
5. Check GitHub issues for similar problems

---

## 🎯 Quick Setup Checklist

For a fresh installation:

- [ ] Database created (PostgreSQL)
- [ ] DATABASE_URL added to environment
- [ ] Run `npm run db:push` to create tables
- [ ] Run `npm run seed` to create sample users (optional)
- [ ] NEXTAUTH_URL set to your domain
- [ ] NEXTAUTH_SECRET generated and set
- [ ] Google OAuth configured (optional)
- [ ] Stripe keys added (for payments)
- [ ] Application deployed and accessible
- [ ] Test registration with email/password
- [ ] Test login
- [ ] Test creating a search

---

**Most common fix:** Run `npm run db:push` to create database tables!
