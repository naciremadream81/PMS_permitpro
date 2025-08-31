#!/bin/bash

# PermitPro Railway Deployment Script
# This script helps you deploy PermitPro to Railway

echo "🚂 PermitPro Railway Deployment Script"
echo "======================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if remote origin is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Git remote origin not set. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/permitpro.git"
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
else
    echo "✅ Railway CLI already installed"
fi

# Check if user is logged into Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway:"
    echo "   railway login"
    echo ""
    echo "After logging in, run this script again."
    exit 1
fi

echo ""
echo "📋 Deployment Checklist:"
echo "1. ✅ Git repository initialized"
echo "2. ✅ Railway CLI installed"
echo "3. ✅ Logged into Railway"
echo ""
echo "🚀 Ready to deploy! Follow these steps:"
echo ""
echo "Step 1: Deploy Backend"
echo "======================="
echo "1. Go to https://railway.app"
echo "2. Click 'New Project'"
echo "3. Select 'Deploy from GitHub repo'"
echo "4. Choose your repository"
echo "5. Select 'permitpro-backend' directory"
echo "6. Click 'Deploy Now'"
echo ""
echo "Step 2: Add PostgreSQL Database"
echo "==============================="
echo "1. In your backend project, click 'New'"
echo "2. Select 'Database' → 'PostgreSQL'"
echo "3. Click 'Add'"
echo ""
echo "Step 3: Configure Environment Variables"
echo "======================================"
echo "Add these variables to your backend project:"
echo ""
echo "JWT_SECRET=your-super-secret-jwt-key-here"
echo "PORT=8000"
echo "NODE_ENV=production"
echo ""
echo "Note: DATABASE_URL will be automatically provided by Railway"
echo ""
echo "Step 4: Deploy Frontend"
echo "======================="
echo "1. Go back to Railway dashboard"
echo "2. Click 'New Project'"
echo "3. Select 'Deploy from GitHub repo'"
echo "4. Choose your repository again"
echo "5. Select 'permitpro-frontend' directory"
echo "6. Click 'Deploy Now'"
echo ""
echo "Step 5: Configure Frontend Environment"
echo "====================================="
echo "Add this variable to your frontend project:"
echo ""
echo "REACT_APP_API_URL=https://your-backend-url.railway.app"
echo ""
echo "Step 6: Run Database Migrations"
echo "==============================="
echo "After both services are deployed, run:"
echo ""
echo "railway link  # Link to your backend project"
echo "railway run bun run db:migrate"
echo "railway run bun run db:seed"
echo ""
echo "📚 For detailed instructions, see: RAILWAY_DEPLOYMENT.md"
echo ""
echo "🎉 Good luck with your deployment!"
