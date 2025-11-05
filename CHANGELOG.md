# Changelog

All notable changes to MapScraperHub will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-XX

### Added

- 🎉 Initial release of MapScraperHub
- 🔍 Search interface with query input and row selection (5-100 rows)
- 💳 Credit system with 10 free rows per search
- 🔐 Email/password authentication with NextAuth.js
- 🔑 Google OAuth integration
- 💰 Stripe payment integration for credit purchases
- 📊 User dashboard with search history
- 👨‍💼 Admin panel for user and credit management
- 📧 Email notifications via SendGrid
- 🔄 Webhook integration with external scraper service
- 🛡️ Security features:
  - Input validation with Zod
  - Rate limiting
  - CSRF protection
  - SQL injection prevention
  - Webhook signature verification
- 🎨 Responsive design with TailwindCSS
- 📱 Mobile-friendly interface
- 🚀 SEO optimization:
  - Server-side rendering
  - Dynamic meta tags
  - Sitemap.xml
  - Robots.txt
  - OpenGraph tags
- ✅ Unit tests for API routes
- 📝 Comprehensive documentation
- 🐳 Docker Compose for local development
- 🔍 Logging with Pino

### Technical Details

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: TailwindCSS
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Email**: SendGrid
- **Testing**: Jest

### Credit Packages

- 100 Credits - €10.00
- 500 Credits - €40.00 (20% discount)
- 1000 Credits - €70.00 (30% discount)

### Security

- All passwords hashed with bcrypt
- JWT session tokens
- Environment variable protection
- Secure HTTP headers
- Rate limiting per user/IP

## [Unreleased]

### Planned Features

- PDF export of search results
- Search filters and advanced queries
- API key access for developers
- Bulk search operations
- Export to CSV
- Search templates
- Scheduled searches
- Team accounts
- Usage analytics
- Referral program

---

For more details, see the [README](README.md).
