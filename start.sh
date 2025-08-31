#!/bin/bash

echo "🚀 Starting PermitPro Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until bun run db:migrate; do
    echo "Database not ready, retrying in 5 seconds..."
    sleep 5
done

echo "✅ Database migrations completed!"

# Start the application
echo "🚀 Starting backend server..."
exec bun run start
