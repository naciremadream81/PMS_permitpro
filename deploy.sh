#!/bin/bash

echo "🐳 Deploying PermitPro with Docker Compose..."

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images to ensure fresh build
echo "🧹 Cleaning up old images..."
docker-compose rm -f

# Build and start services
echo "🚀 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Service status:"
docker-compose ps

echo "✅ Deployment complete!"
echo "🌐 Backend API: http://localhost:8000"
echo "🗄️  Database: localhost:5432"
echo ""
echo "📝 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
