# Deployment Guide

This guide walks you through deploying MapScraperHub to production.

## Overview

**Recommended Stack:**
- **Frontend & API**: Vercel (Next.js hosting)
- **Database**: Render PostgreSQL (or any PostgreSQL provider)
- **Payments**: Stripe
- **Email**: SendGrid
- **Monitoring**: Vercel Analytics + Sentry (optional)

## Prerequisites

- GitHub account
- Vercel account
- Render account (or alternative PostgreSQL provider)
- Stripe account
- SendGrid account (optional)
- Domain name (optional)

## Step 1: Database Setup (Render)

### 1.1 Create PostgreSQL Instance

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `mapscraperhub-db`
   - **Database**: `mapscraperhub`
   - **User**: `mapscraperhub`
   - **Region**: Choose closest to your users
   - **Plan**: Starter ($7/month) or Free
4. Click "Create Database"

### 1.2 Get Database URL

1. Wait for database to be created
2. Copy the "External Database URL"
3. Save it securely - you'll need it for Vercel

Format: `postgresql://user:password@host:port/database`

### 1.3 Test Connection (Optional)

```bash
psql "postgresql://user:password@host:port/database"
```

## Step 2: Stripe Configuration

### 2.1 Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Complete account verification
3. Switch to Test Mode for initial testing

### 2.2 Create Products

1. Go to **Products** in Stripe Dashboard
2. Create three products:

**Product 1: 100 Credits**
- Name: "100 Credits"
- Price: €10.00 (or $10.00)
- Type: One-time payment
- Copy the Price ID (starts with `price_`)

**Product 2: 500 Credits**
- Name: "500 Credits"
- Price: €40.00
- Type: One-time payment
- Copy the Price ID

**Product 3: 1000 Credits**
- Name: "1000 Credits"
- Price: €70.00
- Type: One-time payment
- Copy the Price ID

### 2.3 Get API Keys

1. Go to **Developers** → **API keys**
2. Copy:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)
3. Save them securely

### 2.4 Configure Webhook (Later)

We'll set this up after deploying to Vercel.

## Step 3: SendGrid Configuration (Optional)

### 3.1 Create SendGrid Account

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Complete verification
3. Verify sender email address

### 3.2 Create API Key

1. Go to **Settings** → **API Keys**
2. Click "Create API Key"
3. Name: "MapScraperHub Production"
4. Permissions: "Full Access"
5. Copy the API key
6. Save it securely (shown only once)

### 3.3 Verify Sender

1. Go to **Settings** → **Sender Authentication**
2. Verify your domain or single email
3. Use this email in `SENDGRID_FROM_EMAIL`

## Step 4: Google OAuth (Optional)

### 4.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "MapScraperHub"
3. Enable Google+ API

### 4.2 Configure OAuth Consent

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose "External"
3. Fill in app information
4. Add scopes: email, profile
5. Add test users (for testing)

### 4.3 Create OAuth Credentials

1. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
2. Application type: "Web application"
3. Name: "MapScraperHub Production"
4. Authorized redirect URIs:
   - `https://your-domain.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for testing)
5. Copy:
   - **Client ID**
   - **Client Secret**
6. Save them securely

## Step 5: Deploy to Vercel

### 5.1 Push to GitHub

Your code should already be on GitHub. If not:

```bash
git add .
git commit -m "feat: production deployment"
git push origin main
```

### 5.2 Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 5.3 Configure Environment Variables

Add the following environment variables in Vercel:

```env
# Database
DATABASE_URL=<your-render-database-url>

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=<will be set later>
STRIPE_PRICE_ID_100_CREDITS=price_...
STRIPE_PRICE_ID_500_CREDITS=price_...
STRIPE_PRICE_ID_1000_CREDITS=price_...

# External Scraper
SCRAPER_WEBHOOK_URL=https://your-scraper-service.com/api/scrape

# Application
APP_BASE_URL=https://your-domain.vercel.app

# SendGrid (optional)
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Google OAuth (optional)
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...

# Admin
ADMIN_EMAIL=admin@yourdomain.com

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000
```

**Important**: Use **live** Stripe keys (`sk_live_` and `pk_live_`) for production!

### 5.4 Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Note your deployment URL: `https://your-project.vercel.app`

## Step 6: Run Database Migrations

### 6.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 6.2 Login to Vercel

```bash
vercel login
```

### 6.3 Link Project

```bash
vercel link
```

### 6.4 Pull Environment Variables

```bash
vercel env pull .env.production
```

### 6.5 Run Migrations

```bash
npx prisma migrate deploy
```

### 6.6 Seed Database (Optional)

```bash
npm run seed
```

This creates admin user: `admin@mapscraperhub.com` / `Admin123!`

**Important**: Change the admin password immediately after first login!

## Step 7: Configure Stripe Webhook

### 7.1 Add Webhook Endpoint

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.vercel.app/api/stripe/webhook`
4. Description: "MapScraperHub Production"
5. Events to send:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
6. Click "Add endpoint"

### 7.2 Get Webhook Secret

1. Click on your new webhook
2. Copy "Signing secret" (starts with `whsec_`)
3. Go to Vercel → Settings → Environment Variables
4. Update `STRIPE_WEBHOOK_SECRET` with this value
5. Redeploy the application

## Step 8: Custom Domain (Optional)

### 8.1 Add Domain in Vercel

1. Go to your project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

### 8.2 Update Environment Variables

Update these in Vercel:
```env
NEXTAUTH_URL=https://yourdomain.com
APP_BASE_URL=https://yourdomain.com
```

### 8.3 Update OAuth Redirect URIs

1. Update Google OAuth redirect URI
2. Update any other OAuth providers

### 8.4 Update Stripe Webhook URL

1. Go to Stripe webhooks
2. Update endpoint URL to your custom domain

## Step 9: Post-Deployment Checklist

### ✅ Verify Deployment

1. **Home Page**: Visit your domain
2. **Sign Up**: Create a test account
3. **Sign In**: Login with test account
4. **Dashboard**: Check dashboard loads
5. **Search**: Create a test search
6. **Pricing**: View pricing page
7. **Admin**: Login as admin (if seeded)

### ✅ Test Stripe Integration

1. Go to pricing page
2. Click "Purchase" on any package
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify credits are added
6. Check Stripe Dashboard for payment

### ✅ Test Webhooks

1. Create a search
2. Verify webhook is sent to scraper
3. Simulate callback from scraper
4. Verify search status updates
5. Check email notification (if configured)

### ✅ Test Email (if configured)

1. Sign up with real email
2. Create and complete a search
3. Verify email is received

### ✅ Test Admin Panel

1. Login as admin
2. View statistics
3. View users
4. Add credits manually
5. Verify changes reflect

## Step 10: Monitoring & Maintenance

### 10.1 Set Up Monitoring

**Vercel Analytics**
1. Go to project → **Analytics**
2. Enable Web Analytics
3. Monitor page views and performance

**Error Tracking (Optional)**
- Set up Sentry for error tracking
- Configure error boundaries
- Monitor error rates

### 10.2 Database Backups

**Render**
1. Go to database → **Backups**
2. Enable automatic backups
3. Configure backup retention

### 10.3 Monitor Logs

**Vercel Logs**
```bash
vercel logs --follow
```

**Database Logs**
- Check Render dashboard for DB logs

### 10.4 Set Up Alerts

1. Stripe: Enable payment alerts
2. Vercel: Enable deployment alerts
3. Render: Enable database alerts

## Step 11: Security

### 11.1 Change Default Credentials

If you seeded the database, change:
- Admin password
- Test user credentials

### 11.2 Review Environment Variables

Ensure no secrets are exposed in:
- Git repository
- Client-side code
- Public logs

### 11.3 Enable HTTPS

- Vercel automatically provides SSL
- Ensure all external services use HTTPS

### 11.4 Configure CORS

Update Next.js config if needed:
```js
// next.config.js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'your-domain.com' },
      ],
    },
  ]
}
```

### 11.5 Rate Limiting

Consider using Vercel's Edge Middleware for better rate limiting in production.

## Step 12: Go Live!

### 12.1 Switch Stripe to Live Mode

1. Go to Stripe Dashboard
2. Toggle to "Live mode"
3. Update Vercel environment variables with live keys
4. Update webhook to live mode
5. Redeploy

### 12.2 Announce Launch

1. Share with users
2. Monitor initial traffic
3. Be ready for support requests

## Troubleshooting

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check database is running on Render
3. Test connection from Vercel:
   ```bash
   vercel env pull
   psql $DATABASE_URL
   ```

### Stripe Webhook Not Working

1. Check webhook URL is correct
2. Verify `STRIPE_WEBHOOK_SECRET` is set
3. Check webhook logs in Stripe Dashboard
4. Test with Stripe CLI:
   ```bash
   stripe listen --forward-to https://your-domain.com/api/stripe/webhook
   ```

### Emails Not Sending

1. Verify SendGrid API key is valid
2. Check sender email is verified
3. Review SendGrid activity logs
4. Check application logs for errors

### Build Failures

1. Check Vercel build logs
2. Verify all dependencies are in `package.json`
3. Ensure environment variables are set
4. Try building locally:
   ```bash
   npm run build
   ```

### Prisma Issues

1. Regenerate Prisma client:
   ```bash
   npx prisma generate
   ```
2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Cost Estimate

**Monthly Costs (estimated)**

- Vercel: Free (Hobby) or $20/month (Pro)
- Render PostgreSQL: $7/month (Starter) or Free
- Stripe: 2.9% + €0.30 per transaction
- SendGrid: Free (up to 100 emails/day)
- Google OAuth: Free
- Domain: ~$10/year

**Total**: ~$7-27/month + transaction fees

## Support

For deployment issues:
- Check Vercel documentation
- Check Render documentation
- Review application logs
- Create GitHub issue

---

**🎉 Congratulations!** Your MapScraperHub is now live in production!
