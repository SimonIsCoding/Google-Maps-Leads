# Database Setup Guide

## Problem: Tables don't exist (relation "public.User" does not exist)

Your database hasn't been initialized yet. Follow these steps to set it up.

## Step 1: Verify your DATABASE_URL

Make sure your `.env` or Vercel environment variables contain the correct database URL:

```bash
DATABASE_URL="postgresql://mapscraperhub_db_user:password@host/mapscraperhub_db?schema=public"
```

## Step 2: Generate Prisma Client

```bash
npx prisma generate
```

## Step 3: Create the database schema

Run migrations to create all tables:

```bash
npx prisma migrate deploy
```

If you're in development and want to create a new migration:

```bash
npx prisma migrate dev --name init
```

## Step 4: (Optional) Seed the database

This creates admin and test users:

```bash
npm run seed
```

This will create:
- Admin user: `admin@mapscraperhub.com` / `Admin123!`
- Test user: `test@example.com` / `Test123!`

## Step 5: Verify tables were created

You can check with Prisma Studio:

```bash
npx prisma studio
```

Or connect to your database and check:

```bash
psql $DATABASE_URL
\dt
```

You should see tables like: User, Account, Session, Search, Transaction

## Troubleshooting

### Error: "Environment variable not found"

Make sure your `.env` file exists and contains DATABASE_URL.

### Error: "Can't reach database server"

Check that your database is running and accessible.

### Error: "Authentication failed"

Verify your database credentials in DATABASE_URL.

---

## For Render PostgreSQL

If you're using Render for your database:

1. Go to your Render Dashboard
2. Click on your PostgreSQL service
3. Copy the "External Database URL"
4. Use this URL in your environment variables

### Running migrations on Render

If your app is deployed on Vercel:

1. Install Vercel CLI: `npm i -g vercel`
2. Link project: `vercel link`
3. Pull env: `vercel env pull .env.production`
4. Run migration: `npx prisma migrate deploy`

Or add a build command in your deployment:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

**WARNING**: Don't use `prisma migrate dev` in production!
