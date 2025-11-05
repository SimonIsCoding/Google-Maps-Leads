# MapScraperHub

Transform Google Maps searches into organized Google Sheets data. Simple, fast, and affordable.

## Features

- 🔍 **Simple Search Interface**: Enter a query and get organized data
- 💳 **Credit System**: Pay only for what you use (10 free rows per search)
- 🔐 **Authentication**: Email/password + Google OAuth
- 💰 **Stripe Integration**: Secure payment processing
- 📧 **Email Notifications**: Get notified when searches complete
- 📊 **Dashboard**: Track search history and credits
- 👨‍💼 **Admin Panel**: Manage users and credits
- 🚀 **Production Ready**: SEO optimized, secure, and scalable

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Email**: SendGrid
- **Logging**: Pino

## Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database
- Stripe account
- SendGrid account (optional for emails)
- Google OAuth credentials (optional)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd mapscraperhub
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mapscraperhub"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_100_CREDITS="price_..."
STRIPE_PRICE_ID_500_CREDITS="price_..."
STRIPE_PRICE_ID_1000_CREDITS="price_..."

# External Scraper Webhook
SCRAPER_WEBHOOK_URL="https://your-scraper-service.com/api/scrape"

# Application Base URL
APP_BASE_URL="http://localhost:3000"

# SendGrid (optional)
SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="noreply@mapscraperhub.com"
```

### 4. Set up Stripe Products

Create products in your Stripe dashboard:

1. Go to Stripe Dashboard → Products
2. Create three products:
   - 100 Credits - €10.00
   - 500 Credits - €40.00
   - 1000 Credits - €70.00
3. Copy the Price IDs to your `.env` file

### 5. Run database migrations

```bash
npm run migrate
```

### 6. Seed the database

```bash
npm run seed
```

This creates:
- Admin user: `admin@mapscraperhub.com` / `Admin123!`
- Test user: `test@example.com` / `Test123!`
- Sample searches and transactions

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

### Public Routes

- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Protected Routes (Authenticated)

- `POST /api/search` - Create new search
- `GET /api/search` - Get user's search history
- `POST /api/stripe/create-checkout` - Create Stripe checkout session

### Webhook Routes

- `POST /api/webhook-return` - Receive scraper results
- `POST /api/stripe/webhook` - Stripe webhook events

### Admin Routes

- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List all users
- `POST /api/admin/add-credits` - Manually add credits to user

## Webhook Integration

### Scraper Webhook (Outgoing)

When a search is created, the app sends a POST request to `SCRAPER_WEBHOOK_URL`:

```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "query": "bakery Paris 11",
  "maxRows": 50,
  "callbackUrl": "https://your-app.com/api/webhook-return"
}
```

### Callback Webhook (Incoming)

The scraper should send results to `/api/webhook-return`:

```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success",
  "rowsReturned": 47,
  "sheetUrl": "https://docs.google.com/spreadsheets/d/abc123"
}
```

Or on failure:

```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "failed",
  "errorMessage": "Rate limit exceeded"
}
```

## Credit System

- **Free tier**: First 10 rows per search are free
- **Paid rows**: 1 credit = 1 additional row
- **Example**: A 50-row search uses 40 credits (50 - 10 free)
- **Credits never expire**

## Testing

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Database (Render)

1. Create PostgreSQL database on Render
2. Copy `DATABASE_URL` to environment variables
3. Run migrations: `npm run migrate:deploy`

### Stripe Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### Email Configuration

1. Create SendGrid account
2. Verify sender email
3. Create API key
4. Add to environment variables

## Project Structure

```
mapscraperhub/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── auth/              # Auth pages
│   │   ├── dashboard/         # Dashboard page
│   │   ├── pricing/           # Pricing page
│   │   ├── features/          # Features page
│   │   ├── admin/             # Admin panel
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── globals.css        # Global styles
│   │   ├── sitemap.ts         # Sitemap
│   │   └── robots.ts          # Robots.txt
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   │   ├── auth.ts            # NextAuth config
│   │   ├── prisma.ts          # Prisma client
│   │   ├── stripe.ts          # Stripe utilities
│   │   ├── credits.ts         # Credit management
│   │   ├── scraper.ts         # Scraper webhook
│   │   ├── email.ts           # Email service
│   │   ├── logger.ts          # Pino logger
│   │   ├── validators.ts      # Zod schemas
│   │   └── rate-limit.ts      # Rate limiting
│   ├── types/                 # TypeScript types
│   └── __tests__/             # Unit tests
├── public/                    # Static files
├── .env.example               # Environment template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind config
└── README.md                  # This file
```

## Security Features

- ✅ Input validation with Zod
- ✅ Webhook signature verification
- ✅ Database transactions for credits
- ✅ Rate limiting per user/IP
- ✅ CSRF protection (NextAuth)
- ✅ SQL injection prevention (Prisma)
- ✅ Secure headers (next.config.js)
- ✅ Password hashing with bcrypt

## SEO Features

- ✅ Server-side rendering for public pages
- ✅ Dynamic meta tags
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ OpenGraph tags
- ✅ Semantic HTML

## Troubleshooting

### Database connection issues

Make sure PostgreSQL is running and `DATABASE_URL` is correct:

```bash
psql $DATABASE_URL
```

### Stripe webhook not working

1. Check webhook URL is correct
2. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
3. Check logs for signature verification errors

### Emails not sending

1. Verify `SENDGRID_API_KEY` is valid
2. Check sender email is verified in SendGrid
3. Look for errors in application logs

### Tests failing

Make sure all mocks are properly configured and dependencies are installed:

```bash
npm install --save-dev
npm test
```

## Support

For issues and questions:

1. Check the [documentation](https://docs.mapscraperhub.com)
2. Search [existing issues](https://github.com/your-org/mapscraperhub/issues)
3. Create a new issue with detailed information

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please read CONTRIBUTING.md for guidelines.

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
