#!/bin/bash

# Database Setup Script for MapScraperHub
# This script helps you initialize your database

echo "🔍 MapScraperHub Database Setup"
echo "================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set your DATABASE_URL first:"
    echo "  export DATABASE_URL='postgresql://user:password@host:5432/database'"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Test database connection
echo "🔌 Testing database connection..."
npx prisma db pull --force 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
else
    echo "❌ Cannot connect to database"
    echo ""
    echo "Please check:"
    echo "  1. Your database is running"
    echo "  2. DATABASE_URL is correct"
    echo "  3. Database firewall allows your IP"
    echo ""
    exit 1
fi

echo ""

# Check if tables exist
echo "🔍 Checking if tables exist..."
TABLES=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User';" 2>/dev/null | grep -o '[0-9]*' | head -1)

if [ "$TABLES" = "1" ]; then
    echo "✅ Database tables already exist"
    echo ""
    echo "Your database is already set up!"
    echo ""

    read -p "Do you want to view the database? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx prisma studio
    fi
else
    echo "⚠️  Database tables do not exist"
    echo ""
    echo "Creating database tables..."

    npx prisma db push --accept-data-loss

    if [ $? -eq 0 ]; then
        echo "✅ Database tables created successfully!"
        echo ""

        read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🌱 Seeding database..."
            npm run seed

            if [ $? -eq 0 ]; then
                echo ""
                echo "✅ Database seeded successfully!"
                echo ""
                echo "Sample accounts created:"
                echo "  Admin: admin@mapscraperhub.com / Admin123!"
                echo "  Test:  test@example.com / Test123!"
            fi
        fi

        echo ""
        read -p "Do you want to view the database? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npx prisma studio
        fi
    else
        echo "❌ Failed to create database tables"
        exit 1
    fi
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "You can now:"
echo "  • Run the development server: npm run dev"
echo "  • View the database: npm run studio"
echo "  • Test registration at: http://localhost:3000/auth/signup"
