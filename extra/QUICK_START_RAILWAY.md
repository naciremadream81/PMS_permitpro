# 🚂 Quick Start: Deploy PermitPro to Railway

Get your PermitPro application running on Railway in under 10 minutes!

## ⚡ Quick Steps

### 1. Prepare Your Repository
```bash
# Make sure your code is committed and pushed to GitHub
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Run the Deployment Script
```bash
# Make the script executable (if not already done)
chmod +x deploy-to-railway.sh

# Run the deployment helper
./deploy-to-railway.sh
```

### 3. Deploy Backend
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository and `permitpro-backend` directory
4. Click "Deploy Now"
5. Add PostgreSQL database: "New" → "Database" → "PostgreSQL"
6. Add environment variables:
   ```
   JWT_SECRET=your-secret-key-here
   PORT=8000
   NODE_ENV=production
   ```

### 4. Deploy Frontend
1. Back to Railway dashboard
2. "New Project" → "Deploy from GitHub repo"
3. Select your repository and `permitpro-frontend` directory
4. Click "Deploy Now"
5. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```

### 5. Setup Database
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link to backend project
railway login
railway link

# Run migrations
railway run bun run db:migrate
railway run bun run db:seed
```

## 🎯 What You'll Get

- **Backend API**: `https://your-backend.railway.app`
- **Frontend App**: `https://your-frontend.railway.app`
- **PostgreSQL Database**: Automatically managed by Railway
- **File Storage**: Built-in file hosting
- **SSL/HTTPS**: Automatic SSL certificates
- **Auto-deploy**: Updates on every git push

## 🆘 Need Help?

- **Detailed Guide**: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)

## 💰 Cost

- **Free Tier**: 1GB database, 1GB storage, 100GB bandwidth/month
- **Perfect for**: Development, testing, small production apps
- **Upgrade when**: You exceed free limits

---

**Ready to deploy?** Run `./deploy-to-railway.sh` and follow the prompts! 🚀
