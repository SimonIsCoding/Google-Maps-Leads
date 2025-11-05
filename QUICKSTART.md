# Quick Start Guide

Get MapScraperHub running locally in 5 minutes!

## Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose (for PostgreSQL)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start PostgreSQL with Docker

```bash
docker-compose up -d
```

This starts a PostgreSQL database on `localhost:5432`.

## Step 3: Set Up Environment Variables

```bash
cp .env.local.example .env
```

For local development, you can use the default values. You'll need to:

1. Generate a NextAuth secret:
   ```bash
   openssl rand -base64 32
   ```
   Add it to `NEXTAUTH_SECRET` in `.env`

2. (Optional) Add Stripe test keys if you want to test payments
3. (Optional) Add SendGrid API key if you want to test emails

## Step 4: Run Database Migrations

```bash
npm run migrate
```

## Step 5: Seed the Database

```bash
npm run seed
```

This creates:
- **Admin**: `admin@mapscraperhub.com` / `Admin123!`
- **Test User**: `test@example.com` / `Test123!`

## Step 6: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Default Credentials

- **Admin Panel**: Login with `admin@mapscraperhub.com` / `Admin123!`
- **User Account**: Login with `test@example.com` / `Test123!`

## Testing the Search Flow

Since we don't have a real scraper in development:

1. Login to the app
2. Create a search (it will be marked as PENDING)
3. Manually trigger the webhook callback:

```bash
curl -X POST http://localhost:3000/api/webhook-return \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "<get from database>",
    "status": "success",
    "rowsReturned": 25,
    "sheetUrl": "https://docs.google.com/spreadsheets/d/example"
  }'
```

## Running Tests

```bash
npm test
```

## Stopping PostgreSQL

```bash
docker-compose down
```

## Troubleshooting

### Port 5432 already in use

Stop your local PostgreSQL or change the port in `docker-compose.yml`

### Database connection error

Make sure Docker is running and PostgreSQL container is healthy:
```bash
docker-compose ps
```

### Next.js won't start

Clear the `.next` folder:
```bash
rm -rf .next
npm run dev
```

## Next Steps

- Configure Stripe for payment testing
- Set up Google OAuth
- Configure SendGrid for email notifications
- Read the full README.md for deployment instructions

Happy coding! 🚀
