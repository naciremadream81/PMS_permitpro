#!/bin/bash

echo "🚀 Deploying PermitPro on Linode..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please copy production.env.example to .env and configure your values"
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" = "your-strong-password-here" ]; then
    echo "❌ Error: Please set a strong POSTGRES_PASSWORD in .env"
    exit 1
fi

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-key-here-make-it-long-and-random" ]; then
    echo "❌ Error: Please set a strong JWT_SECRET in .env"
    exit 1
fi

echo "✅ Environment variables validated"

# Check if frontend directory exists
if [ ! -d "permitpro-frontend" ]; then
    echo "❌ Error: permitpro-frontend directory not found!"
    echo "📝 Please ensure the frontend code is in the permitpro-frontend directory"
    exit 1
fi

echo "✅ Frontend directory found"

# Stop existing services
echo "🛑 Stopping existing services..."
docker-compose -f docker-compose.production.yml down

# Remove old containers and images
echo "🧹 Cleaning up old containers and images..."
docker-compose -f docker-compose.production.yml rm -f
docker system prune -f

# Build and start services
echo "🚀 Building and starting services..."
docker-compose -f docker-compose.production.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 15

# Check service status
echo "📊 Service status:"
docker-compose -f docker-compose.production.yml ps

# Test the API
echo "🧪 Testing API endpoint..."
if curl -s http://localhost:8000/api/permits > /dev/null; then
    echo "✅ Backend API is responding successfully!"
else
    echo "⚠️  Backend API might still be starting up..."
fi

# Test the Frontend
echo "🧪 Testing Frontend..."
if curl -s http://localhost:3000/ > /dev/null; then
    echo "✅ Frontend is responding successfully!"
else
    echo "⚠️  Frontend might still be starting up..."
fi

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Backend API: http://localhost:8000"
echo "🎨 Frontend: http://localhost:3000"
echo "🗄️  Database: Running in container"
echo ""
echo "📝 To view logs: docker-compose -f docker-compose.production.yml logs -f"
echo "🛑 To stop: docker-compose -f docker-compose.production.yml down"
echo ""
echo "🔧 Next steps:"
echo "   1. Set up Nginx reverse proxy for your domain (seanswonger.com)"
echo "   2. Configure SSL/TLS with Let's Encrypt"
echo "   3. Set up firewall rules"
echo "   4. Configure regular backups"
echo ""
echo "🔒 Security notes:"
echo "   - Change default passwords"
echo "   - Set up firewall rules"
echo "   - Configure SSL/TLS"
echo "   - Set up regular backups"
