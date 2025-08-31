#!/bin/bash

echo "🚀 Starting PermitPro Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Running database migrations..."
bun run prisma migrate deploy || {
    echo "❌ Migration failed, trying to generate client first..."
    bun run prisma generate
    bun run prisma migrate deploy
}

echo "✅ Database migrations completed!"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
bun run prisma generate

# Start the application
echo "🚀 Starting backend server..."
exec bun run start
