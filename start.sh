#!/bin/bash

echo "🚀 Starting PermitPro Backend..."

# Check if .env file exists or if we're running in Docker (environment variables are set)
if [ ! -f .env ] && [ -z "$DATABASE_URL" ]; then
    echo "❌ .env file not found! Please run: npm run setup"
    exit 1
fi

# If running in Docker, create a .env file from environment variables
if [ -n "$DATABASE_URL" ]; then
    echo "🐳 Running in Docker mode, using environment variables"
    cat > .env << EOF
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
CORS_ORIGIN=$CORS_ORIGIN
NODE_ENV=$NODE_ENV
PORT=$PORT
EOF
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
