#!/bin/bash

echo "🔧 Setting up PermitPro environment..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Backend Environment Variables
# Database
DATABASE_URL=postgresql://postgres:password123@localhost:5432/permitpro

# Security
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production

# Server
PORT=8000
NODE_ENV=development

# CORS (for local development)
CORS_ORIGIN=http://localhost:3000
EOF
    echo "✅ .env file created successfully!"
else
    echo "ℹ️  .env file already exists, skipping creation."
fi

# Make scripts executable
chmod +x start.sh
chmod +x setup-env.sh

echo "🚀 Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Install Node.js: sudo apt install nodejs npm"
echo "2. Install Bun: curl -fsSL https://bun.sh/install | bash"
echo "3. Run: bun install"
echo "4. Run: bun run db:generate"
echo "5. Start database: docker compose up postgres -d"
echo "6. Run migrations: bun run db:migrate"
echo "7. Start application: bun run start"
