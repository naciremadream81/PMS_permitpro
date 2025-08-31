# Prisma PostgreSQL Migration Guide

## Prerequisites

1. **Install PostgreSQL** (if not already installed):
   - macOS: `brew install postgresql`
   - Ubuntu: `sudo apt install postgresql postgresql-contrib`
   - Windows: Download from postgresql.org

2. **Start PostgreSQL service**:
   - macOS: `brew services start postgresql`
   - Ubuntu: `sudo systemctl start postgresql`

## Setup Steps

### 1. Create Database
```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE permitpro;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE permitpro TO your_username;
\q
```

### 2. Update Environment Variables
Edit `.env` file with your actual database credentials:
```bash
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/permitpro?schema=public"
```

### 3. Install Dependencies and Setup Prisma
```bash
cd permitpro-backend

# Install new dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migration
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 4. Start the Application
```bash
# Start backend
npm start

# In another terminal, start frontend
cd ../permitpro-frontend
npm start
```

## What Changed

- **Database**: Migrated from in-memory arrays to PostgreSQL
- **ORM**: Added Prisma for type-safe database operations
- **Data Persistence**: All data now persists between server restarts
- **Relationships**: Proper foreign key relationships between packages and documents
- **Auto-increment IDs**: Database handles ID generation
- **Timestamps**: Automatic created/updated timestamps

## Database Schema

- **User**: id, email, name, role
- **Package**: id, customerName, propertyAddress, county, status, createdAt, updatedAt
- **Document**: id, fileName, filePath, uploadedAt, uploaderName, version, packageId

## Troubleshooting

- **Connection Error**: Check PostgreSQL is running and credentials are correct
- **Migration Error**: Ensure database exists and user has proper permissions
- **Port Conflict**: Make sure PostgreSQL is running on port 5432
