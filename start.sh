#!/bin/bash

echo "🚀 Starting PermitPro Backend..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please run: npm run setup"
    exit 1
fi

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Generate Prisma client first
echo "🔧 Generating Prisma client..."
if command -v bun &> /dev/null; then
    bun run prisma generate
elif command -v npx &> /dev/null; then
    npx prisma generate
else
    echo "❌ Neither bun nor npx found. Please install Node.js or Bun."
    exit 1
fi

# Run database migrations
echo "🗄️ Running database migrations..."
if command -v bun &> /dev/null; then
    bun run prisma migrate deploy || {
        echo "❌ Migration failed, trying to push schema..."
        bun run prisma db push
    }
elif command -v npx &> /dev/null; then
    npx prisma migrate deploy || {
        echo "❌ Migration failed, trying to push schema..."
        npx prisma db push
    }
fi

echo "✅ Database setup completed!"

# Start the application
echo "🚀 Starting backend server..."
if command -v bun &> /dev/null; then
    exec bun run start
elif command -v node &> /dev/null; then
    exec node server.js
else
    echo "❌ Neither bun nor node found. Please install Node.js or Bun."
    exit 1
fi
