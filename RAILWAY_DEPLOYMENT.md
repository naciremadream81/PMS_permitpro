# Railway Deployment Guide for PermitPro

This guide will walk you through deploying PermitPro to Railway step by step.

## Prerequisites

1. **GitHub Account**: Your code must be in a GitHub repository
2. **Railway Account**: Sign up at [railway.app](https://railway.app)
3. **Git Installed**: On your local machine

## Important Notes

### Environment Variables in Frontend
The frontend has been updated to use environment variables for the API URL. This fixes the `process.env` error that commonly occurs in webpack builds.

**Key Changes Made:**
- Updated `webpack.config.js` to include `DefinePlugin` for environment variables
- Modified frontend API calls to use `REACT_APP_API_URL` environment variable
- Installed proper Tailwind CSS instead of using CDN
- Added PostCSS configuration for production builds

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub

```bash
# If you haven't already, initialize git and push to GitHub
git init
git add .
git commit -m "Initial commit for Railway deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/permitpro.git
git push -u origin main
```

### 1.2 Verify Repository Structure

Your repository should look like this:
```
permitpro/
├── permitpro-backend/
│   ├── railway.json
│   ├── nixpacks.toml
│   ├── Procfile
│   ├── server.js
│   ├── package.json
│   ├── bun.lock
│   └── prisma/
├── permitpro-frontend/
│   ├── railway.json
│   ├── nixpacks.toml
│   ├── package.json
│   └── src/
└── README.md
```

## Step 2: Deploy Backend to Railway

### 2.1 Create Backend Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the `permitpro-backend` directory
6. Click "Deploy Now"

### 2.2 Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Click "Add"
4. Note down the connection details

### 2.3 Configure Environment Variables

In your Railway backend project, go to "Variables" and add:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Security
JWT_SECRET=your-super-secret-jwt-key-here

# Server
PORT=8000
NODE_ENV=production

# CORS (replace with your frontend URL)
CORS_ORIGIN=https://your-frontend-url.railway.app
```

**Important**: The `DATABASE_URL` will be automatically provided by Railway when you add the PostgreSQL service.

### 2.4 Deploy Backend

1. Railway will automatically detect the configuration
2. Click "Deploy" to start the build process
3. Wait for the build to complete
4. Note the generated URL (e.g., `https://permitpro-backend-production.up.railway.app`)

## Step 3: Deploy Frontend to Railway

### 3.1 Create Frontend Project

1. Go back to Railway dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository again
5. Select the `permitpro-frontend` directory
6. Click "Deploy Now"

### 3.2 Configure Frontend Environment

In your Railway frontend project, go to "Variables" and add:

```bash
# Backend API URL (use the URL from step 2.4)
REACT_APP_API_URL=https://your-backend-url.railway.app

# Environment
NODE_ENV=production
```

### 3.3 Update Frontend API Configuration

Before deploying, update your frontend to use the environment variable:

```javascript
// In permitpro-frontend/src/index.js, update the API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Update all API calls to use this base URL
const api = {
  get: async (url) => {
    const response = await fetch(`${API_BASE_URL}${url}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  // ... other methods
};
```

### 3.4 Deploy Frontend

1. Commit and push your changes
2. Railway will automatically redeploy
3. Wait for the build to complete
4. Note the generated URL (e.g., `https://permitpro-frontend-production.up.railway.app`)

## Step 4: Configure Database

### 4.1 Run Migrations

1. Go to your backend Railway project
2. Click on the "Deployments" tab
3. Find your latest deployment
4. Click "View Logs"
5. Look for any database migration errors

If you need to run migrations manually:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Connect to your backend project
railway link

# Run database commands
railway run bun run db:migrate
railway run bun run db:seed
```

### 4.2 Verify Database Connection

Check your backend logs to ensure the database connection is successful.

## Step 5: Test Your Deployment

### 5.1 Test Backend API

Visit your backend URL + `/api/permits`:
```
https://your-backend-url.railway.app/api/permits
```

You should see an empty array `[]` or your seeded data.

### 5.2 Test Frontend

Visit your frontend URL:
```
https://your-frontend-url.railway.app
```

The application should load and be able to communicate with your backend.

### 5.3 Test File Uploads

1. Create a new permit package
2. Try uploading a document
3. Verify the file is stored and accessible

## Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain

1. In your Railway project, go to "Settings"
2. Click "Domains"
3. Add your custom domain
4. Update your DNS records as instructed

### 6.2 Update Environment Variables

Update your CORS and API URLs to use your custom domain.

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Problem**: Build fails during deployment
**Solution**: Check the build logs for specific errors. Common issues:
- Missing dependencies in `package.json`
- Incorrect start command
- Environment variable issues

#### 2. Database Connection Errors

**Problem**: "Connection refused" or "Authentication failed"
**Solution**: 
- Verify `DATABASE_URL` is correct
- Check if PostgreSQL service is running
- Ensure database exists

#### 3. CORS Errors

**Problem**: Frontend can't communicate with backend
**Solution**:
- Update `CORS_ORIGIN` in backend environment variables
- Ensure frontend URL is correct
- Check browser console for specific CORS errors

#### 4. File Upload Issues

**Problem**: Files not uploading or not accessible
**Solution**:
- Check file permissions in Railway
- Verify upload directory exists
- Check file size limits

### Debug Commands

```bash
# View backend logs
railway logs

# View frontend logs
railway logs

# Run commands in Railway environment
railway run bun run db:migrate:status

# Check environment variables
railway variables
```

## Monitoring and Maintenance

### 1. View Logs

Railway provides real-time logs for both your frontend and backend services.

### 2. Monitor Performance

- Check deployment status
- Monitor resource usage
- View error rates

### 3. Automatic Deployments

Railway automatically deploys when you push to your main branch.

### 4. Rollback

If something goes wrong, you can rollback to a previous deployment.

## Cost Management

### Free Tier Limits

- **Applications**: Unlimited
- **Databases**: 1 PostgreSQL (1GB)
- **Storage**: 1GB
- **Bandwidth**: 100GB/month

### Upgrading

When you exceed free tier limits, Railway will notify you and you can upgrade to a paid plan.

## Next Steps

After successful deployment:

1. **Set up monitoring**: Configure alerts for errors and performance
2. **Implement CI/CD**: Set up automated testing before deployment
3. **Add security**: Implement proper authentication and authorization
4. **Scale up**: Monitor usage and scale as needed

## Support

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **GitHub Issues**: Report bugs in your repository

---

**Congratulations!** You've successfully deployed PermitPro to Railway. Your application is now accessible from anywhere in the world with automatic scaling and database management.
