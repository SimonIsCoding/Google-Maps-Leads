#!/bin/bash

# Diagnostic Script for MapScraperHub
# Run this to diagnose database issues

echo "🔍 MapScraperHub Diagnostic Tool"
echo "================================="
echo ""

# 1. Check DATABASE_URL
echo "1️⃣  Checking DATABASE_URL..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is NOT set"
    echo "   Solution: Set your DATABASE_URL environment variable"
    echo ""
else
    echo "✅ DATABASE_URL is set"
    # Mask password for security
    MASKED_URL=$(echo $DATABASE_URL | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/')
    echo "   Value: $MASKED_URL"
    echo ""
fi

# 2. Check Prisma Client
echo "2️⃣  Checking Prisma Client..."
if [ -d "node_modules/@prisma/client" ]; then
    echo "✅ Prisma Client is installed"
else
    echo "❌ Prisma Client is NOT installed"
    echo "   Solution: Run 'npm install'"
fi
echo ""

# 3. Test database connection
echo "3️⃣  Testing database connection..."
if [ -n "$DATABASE_URL" ]; then
    npx prisma db pull --force 2>&1 | head -n 5

    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        echo "✅ Database connection successful"
    else
        echo "❌ Cannot connect to database"
        echo "   Possible causes:"
        echo "   - Database is not running"
        echo "   - DATABASE_URL is incorrect"
        echo "   - Firewall blocking connection"
        echo "   - Wrong credentials"
    fi
else
    echo "⚠️  Skipped (DATABASE_URL not set)"
fi
echo ""

# 4. Check if tables exist
echo "4️⃣  Checking database tables..."
if [ -n "$DATABASE_URL" ]; then
    RESULT=$(npx prisma db execute --stdin <<< "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';" 2>&1)

    if echo "$RESULT" | grep -q "User"; then
        echo "✅ 'User' table exists"
    else
        echo "❌ 'User' table does NOT exist"
        echo "   Solution: Run 'npm run db:push' to create tables"
    fi

    if echo "$RESULT" | grep -q "Search"; then
        echo "✅ 'Search' table exists"
    else
        echo "❌ 'Search' table does NOT exist"
    fi

    if echo "$RESULT" | grep -q "Transaction"; then
        echo "✅ 'Transaction' table exists"
    else
        echo "❌ 'Transaction' table does NOT exist"
    fi
else
    echo "⚠️  Skipped (DATABASE_URL not set)"
fi
echo ""

# 5. Check environment variables
echo "5️⃣  Checking other environment variables..."

check_env() {
    if [ -n "${!1}" ]; then
        echo "✅ $1 is set"
    else
        echo "⚠️  $1 is NOT set"
    fi
}

check_env "NEXTAUTH_URL"
check_env "NEXTAUTH_SECRET"
check_env "APP_BASE_URL"
echo ""

# 6. Summary
echo "📋 Summary"
echo "=========="
echo ""

if [ -z "$DATABASE_URL" ]; then
    echo "❌ CRITICAL: DATABASE_URL is not set"
    echo ""
    echo "To fix:"
    echo "  1. Copy .env.example to .env"
    echo "  2. Edit .env and set DATABASE_URL"
    echo "  3. Run this diagnostic again"
    echo ""
elif ! npx prisma db pull --force &>/dev/null; then
    echo "❌ CRITICAL: Cannot connect to database"
    echo ""
    echo "To fix:"
    echo "  1. Verify your database is running"
    echo "  2. Check DATABASE_URL is correct"
    echo "  3. Test connection manually"
    echo ""
elif ! npx prisma db execute --stdin <<< "SELECT 1 FROM \"User\" LIMIT 1;" &>/dev/null; then
    echo "❌ CRITICAL: Database tables do not exist"
    echo ""
    echo "To fix:"
    echo "  1. Run: npm run db:push"
    echo "  2. Or run: npm run db:setup (includes seed data)"
    echo "  3. Verify with: npm run studio"
    echo ""
else
    echo "✅ Everything looks good!"
    echo ""
    echo "Your database is properly configured."
    echo "You can now run: npm run dev"
    echo ""
fi

echo "Need more help? Check these files:"
echo "  • TROUBLESHOOTING.md"
echo "  • DATABASE_SETUP.md"
echo "  • QUICK_FIX.md"
