# Installation Guide

This guide will help you install MapScraperHub on your local machine or production server.

## System Requirements

- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher
- **PostgreSQL**: 14.0 or higher
- **Docker**: (Optional) for local PostgreSQL setup

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mapscraperhub
```

### 2. Install Dependencies

```bash
npm install
```

If you encounter Prisma engine download issues, set the environment variable:

```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npm install
```

### 3. Configure Environment Variables

Copy the environment template:

```bash
cp .env.example .env
```

Edit `.env` and configure the following required variables:

#### Database
```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

#### NextAuth
Generate a secret:
```bash
openssl rand -base64 32
```

Then set:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<your-generated-secret>"
```

#### Stripe
Create a Stripe account and get your API keys:
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Create 3 products in Stripe Dashboard and set their price IDs:
```env
STRIPE_PRICE_ID_100_CREDITS="price_..."
STRIPE_PRICE_ID_500_CREDITS="price_..."
STRIPE_PRICE_ID_1000_CREDITS="price_..."
```

#### External Scraper
```env
SCRAPER_WEBHOOK_URL="https://your-scraper-service.com/api/scrape"
```

For development, you can use the mock scraper:
```env
SCRAPER_WEBHOOK_URL="http://localhost:3000/api/mock-scraper"
```

#### SendGrid (Optional)
```env
SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
```

Leave empty to skip email notifications in development.

### 4. Set Up Database

#### Option A: Using Docker (Recommended for Development)

```bash
docker-compose up -d
```

This will start PostgreSQL on `localhost:5432` with default credentials.

#### Option B: Use Existing PostgreSQL

Update `DATABASE_URL` in `.env` to point to your PostgreSQL instance.

### 5. Run Database Migrations

```bash
npm run migrate
```

This creates all necessary tables in your database.

### 6. Seed the Database (Optional)

```bash
npm run seed
```

This creates:
- Admin user: `admin@mapscraperhub.com` / `Admin123!`
- Test user: `test@example.com` / `Test123!`
- Sample searches and transactions

### 7. Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Production Deployment

### Vercel (Recommended for Frontend)

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Render (Recommended for Database)

1. Create PostgreSQL database on Render
2. Copy the database URL
3. Set as `DATABASE_URL` in Vercel environment variables

### Database Migrations in Production

```bash
npm run migrate:deploy
```

### Stripe Webhook Configuration

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
4. Copy webhook signing secret
5. Set as `STRIPE_WEBHOOK_SECRET` in environment variables

## Verification

### Check Application Health

1. Visit `http://localhost:3000` - Home page should load
2. Click "Sign Up" - Registration form should appear
3. Create an account
4. Visit `/dashboard` - Dashboard should show with 0 credits
5. Visit `/pricing` - Pricing page should display credit packages

### Check Database

```bash
npx prisma studio
```

This opens a visual database browser at `http://localhost:5555`

### Run Tests

```bash
npm test
```

All tests should pass.

### Check Logs

Development logs are in the console with pretty formatting (Pino).

## Troubleshooting

### Prisma Client Not Generated

```bash
npx prisma generate
```

### Database Connection Errors

1. Verify PostgreSQL is running
2. Check `DATABASE_URL` is correct
3. Test connection:
   ```bash
   psql $DATABASE_URL
   ```

### Port Already in Use

Change the port in `.env`:
```env
PORT=3001
```

### Build Errors

Clear Next.js cache:
```bash
rm -rf .next
npm run dev
```

### Stripe Webhook Not Working

1. Use Stripe CLI for local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
2. Copy the webhook signing secret
3. Update `STRIPE_WEBHOOK_SECRET` in `.env`

## Common Issues

### Issue: "Module not found" errors

**Solution**: Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Prisma migrations fail

**Solution**: Reset the database:
```bash
npx prisma migrate reset
```

**Warning**: This deletes all data!

### Issue: TypeScript errors

**Solution**: Regenerate TypeScript types:
```bash
npx prisma generate
npm run build
```

## Next Steps

- Configure Stripe products and prices
- Set up Google OAuth (optional)
- Configure SendGrid for emails
- Set up monitoring and logging
- Configure backup strategy
- Review security settings

## Support

For additional help:
- Check [README.md](README.md)
- Read [QUICKSTART.md](QUICKSTART.md)
- Open an issue on GitHub

---

**Important**: Never commit `.env` file to version control. Always use `.env.example` as a template.
