# PermitPro Installation & Setup Guide

## 🚨 Critical Issues Fixed

This guide addresses the critical issues found in the PermitPro application:

1. **Database Schema Inconsistency** - Fixed `contractorId` vs `contractorLicense` field mismatch
2. **Missing Environment Configuration** - Added proper `.env` setup
3. **Runtime Environment Issues** - Added fallback support for both Node.js and Bun
4. **Input Validation** - Added comprehensive validation for API endpoints
5. **Error Handling** - Improved error handling and user feedback

## 📋 Prerequisites

### Option 1: Install Node.js (Recommended)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# Verify installation
node --version
npm --version
```

### Option 2: Install Bun
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Verify installation
bun --version
```

## 🚀 Quick Setup

### 1. Environment Setup
```bash
# Run the setup script
npm run setup
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd permitpro-frontend
npm install
cd ..
```

### 3. Database Setup
```bash
# Start PostgreSQL database
docker compose up postgres -d

# Wait for database to be ready (about 10 seconds)
sleep 10

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate
```

### 4. Start the Application
```bash
# Start backend server
npm start

# In another terminal, start frontend
npm run frontend:dev
```

## 🔧 Manual Setup (Alternative)

If the automated setup doesn't work:

### 1. Create Environment File
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 2. Database Configuration
Update `.env` file:
```env
DATABASE_URL=postgresql://postgres:password123@localhost:5432/permitpro
JWT_SECRET=your-super-secret-jwt-key-here
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Migrations
```bash
npx prisma migrate deploy
```

## 🐳 Docker Setup (Alternative)

If you prefer Docker:

```bash
# Build and start all services
docker compose up --build

# Or start only database
docker compose up postgres -d
```

## 🧪 Testing the Application

### Backend API
```bash
# Test health endpoint
curl http://localhost:8000/api/permits

# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Frontend
Open browser to: `http://localhost:3000`

## 🔍 Troubleshooting

### Common Issues

1. **"command not found" errors**
   - Install Node.js: `sudo apt install nodejs npm`
   - Or install Bun: `curl -fsSL https://bun.sh/install | bash`

2. **Database connection errors**
   - Ensure PostgreSQL is running: `docker compose up postgres -d`
   - Check DATABASE_URL in `.env` file

3. **Prisma client errors**
   - Run: `npm run db:generate`
   - Or: `npx prisma generate`

4. **Migration errors**
   - Run: `npm run db:migrate`
   - Or: `npx prisma migrate deploy`

5. **Permission errors**
   - Make scripts executable: `chmod +x *.sh`

## 📊 Application Structure

```
PMS_permitpro/
├── server.js              # Main backend server
├── package.json           # Backend dependencies
├── prisma/
│   └── schema.prisma      # Database schema
├── permitpro-frontend/    # React frontend
├── uploads/               # File uploads directory
├── .env                   # Environment variables
└── docker-compose.yml     # Docker configuration
```

## 🎯 Key Features

- **Permit Management**: Create and manage building permits
- **Contractor System**: Assign contractors to permits
- **Document Upload**: Upload and manage permit documents
- **Checklist System**: County-specific permit checklists
- **Subcontractor Management**: Assign subcontractors by trade type

## 🔒 Security Notes

- Change JWT_SECRET in production
- Use environment-specific database URLs
- Implement proper authentication in production
- Add rate limiting and input sanitization

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check application logs for specific error messages
4. Ensure database is running and accessible
