# PermitPro - Comprehensive Permit Management System Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Local Development Setup](#local-development-setup)
5. [Cloud Deployment](#cloud-deployment)
6. [Database Setup](#database-setup)
7. [API Documentation](#api-documentation)
8. [Frontend Components](#frontend-components)
9. [Backend Services](#backend-services)
10. [Configuration](#configuration)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)
13. [Best Practices](#best-practices)
14. [Security Considerations](#security-considerations)

## System Overview

PermitPro is a comprehensive permit management system designed specifically for Florida construction projects. The system manages the entire lifecycle of permit applications, from initial submission through approval and completion. It's built with modern web technologies and provides a robust, scalable solution for construction companies, contractors, and permit management professionals.

### Key Features

- **Permit Package Management**: Create, track, and manage permit packages with full document support
- **Contractor & Subcontractor Management**: Complete contractor and subcontractor database with assignment capabilities
- **Document Management**: Secure file upload, version control, and document organization
- **County-Specific Checklists**: Dynamic checklists tailored to Florida county requirements
- **Status Tracking**: Real-time status updates and progress monitoring
- **Multi-User Support**: Role-based access control and user management
- **Export Capabilities**: Generate comprehensive permit packages for submission

### Technology Stack

- **Frontend**: React 18, Tailwind CSS, Webpack
- **Backend**: Express.js, Prisma ORM, PostgreSQL
- **Runtime**: Bun (recommended) or Node.js
- **Database**: PostgreSQL
- **File Storage**: Local file system with cloud-ready architecture

## Architecture

The system follows a modern client-server architecture with clear separation of concerns:

```
PermitPro/
├── permitpro-frontend/     # React frontend application
│   ├── src/
│   │   ├── index.js        # Main application component
│   │   ├── checklist-system.js
│   │   ├── contractor-management.js
│   │   ├── subcontractor-assignment-modal.js
│   │   └── styles.css
│   └── dist/               # Built application
├── permitpro-backend/      # Express.js API server
│   ├── server.js           # Main server file
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── uploads/            # File storage
└── shared/                 # Shared utilities and types
```

### Data Flow

1. **Frontend** → **Backend API** → **Database**
2. **File Uploads** → **Local Storage** → **Database Reference**
3. **User Authentication** → **Session Management** → **Role-Based Access**

## Prerequisites

### System Requirements

- **Operating System**: macOS, Linux, or Windows
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: 10GB free space
- **Network**: Internet connection for package installation

### Software Dependencies

#### Option 1: Using Bun (Recommended)
- **Bun**: Version 1.0.0 or higher
- **PostgreSQL**: Version 12 or higher

#### Option 2: Using Node.js
- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **PostgreSQL**: Version 12 or higher

### Database Requirements

- **PostgreSQL**: 12+ (for production)
- **SQLite**: 3.35+ (for development/testing)
- **Connection Pool**: Minimum 5 connections

## Local Development Setup

### Step 1: Clone and Initialize Project

```bash
# Clone the repository
git clone <repository-url>
cd permitpro

# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd permitpro-backend

# Install dependencies using Bun
bun install

# Create environment file
cat > .env << EOF
DATABASE_URL="postgresql://username:password@localhost:5432/permitpro"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=8000
NODE_ENV=development
EOF

# Generate Prisma client
bun run db:generate

# Run database migrations
bun run db:migrate

# Seed the database with initial data
bun run db:seed

# Start the development server
bun run dev
```

### Step 3: Frontend Setup

```bash
# Open new terminal and navigate to frontend
cd permitpro-frontend

# Install dependencies
bun install

# Start development server
bun run start
```

### Step 4: Database Setup

#### PostgreSQL Installation

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

#### Database Creation

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE permitpro;
CREATE USER permitpro_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE permitpro TO permitpro_user;
\q
```

### Step 5: Verify Installation

1. **Backend**: Visit `http://localhost:8000/api/permits`
2. **Frontend**: Visit `http://localhost:3000`
3. **Database**: Verify connection with `bun run db:migrate:status`

## Cloud Deployment

### Option 1: Google Cloud Platform (Free Tier)

#### Prerequisites
- Google Cloud Account
- Google Cloud CLI installed
- Docker installed

#### Setup Instructions

1. **Create Google Cloud Project**
```bash
# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize and create project
gcloud init
gcloud projects create permitpro-[YOUR-ID]
gcloud config set project permitpro-[YOUR-ID]
```

2. **Enable Required APIs**
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
```

3. **Create Cloud SQL Instance**
```bash
# Create PostgreSQL instance
gcloud sql instances create permitpro-db \
    --database-version=POSTGRES_13 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --storage-type=HDD \
    --storage-size=10GB

# Create database
gcloud sql databases create permitpro --instance=permitpro-db

# Create user
gcloud sql users create permitpro-user \
    --instance=permitpro-db \
    --password=your-secure-password
```

4. **Deploy Backend**
```bash
# Create Dockerfile for backend
cat > permitpro-backend/Dockerfile << EOF
FROM oven/bun:1

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run db:generate

EXPOSE 8000
CMD ["bun", "run", "start"]
EOF

# Build and deploy
cd permitpro-backend
gcloud builds submit --tag gcr.io/permitpro-[YOUR-ID]/backend
gcloud run deploy permitpro-backend \
    --image gcr.io/permitpro-[YOUR-ID]/backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
```

5. **Deploy Frontend**
```bash
# Build frontend
cd permitpro-frontend
bun run build

# Create Dockerfile for frontend
cat > Dockerfile << EOF
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
EOF

# Create nginx configuration
cat > nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server {
        listen 80;
        server_name localhost;
        
        location / {
            root /usr/share/nginx/html;
            try_files \$uri \$uri/ /index.html;
        }
        
        location /api {
            proxy_pass http://permitpro-backend-url;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
    }
}
EOF

# Deploy to Cloud Run
gcloud builds submit --tag gcr.io/permitpro-[YOUR-ID]/frontend
gcloud run deploy permitpro-frontend \
    --image gcr.io/permitpro-[YOUR-ID]/frontend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
```

### Option 2: AWS Free Tier

#### Prerequisites
- AWS Account
- AWS CLI installed
- Docker installed

#### Setup Instructions

1. **Create RDS Database**
```bash
# Create RDS instance
aws rds create-db-instance \
    --db-instance-identifier permitpro-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username permitpro \
    --master-user-password your-password \
    --allocated-storage 20 \
    --storage-type gp2
```

2. **Create ECR Repositories**
```bash
# Create repositories
aws ecr create-repository --repository-name permitpro-backend
aws ecr create-repository --repository-name permitpro-frontend

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [ACCOUNT-ID].dkr.ecr.us-east-1.amazonaws.com
```

3. **Deploy to ECS**
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name permitpro-cluster

# Create task definitions and services
# (Detailed ECS setup would require additional configuration files)
```

### Option 3: Railway (Simplest)

1. **Connect GitHub Repository**
2. **Add Environment Variables**
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PORT`

3. **Deploy**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## Database Setup

### Schema Overview

The database schema consists of six main entities:

1. **User**: Authentication and user management
2. **Contractor**: Primary contractors for projects
3. **Subcontractor**: Specialized contractors for specific trades
4. **Package**: Main permit packages
5. **Document**: File attachments for packages
6. **PackageSubcontractor**: Many-to-many relationship between packages and subcontractors

### Migration Commands

```bash
# Generate new migration
bun run db:migrate:dev --name add_new_feature

# Apply migrations
bun run db:migrate:deploy

# Reset database (development only)
bun run db:migrate:reset

# View migration status
bun run db:migrate:status
```

### Seeding Data

```bash
# Run seed script
bun run db:seed

# Custom seed data
node seed.js --data=contractors
```

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Authenticate user and return session information.

**Request:**
```json
{
  "email": "admin@permitpro.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "name": "Admin User",
  "role": "Administrator"
}
```

### Permit Management Endpoints

#### GET /api/permits
Retrieve all permit packages with related data.

**Response:**
```json
[
  {
    "id": 1,
    "customerName": "John Doe",
    "propertyAddress": "123 Main St",
    "county": "Miami-Dade",
    "status": "Draft",
    "permitType": "Mobile Home Permit",
    "createdAt": "2024-01-01T00:00:00Z",
    "contractor": {
      "id": 1,
      "companyName": "ABC Construction"
    },
    "documents": [],
    "subcontractors": []
  }
]
```

#### POST /api/permits
Create a new permit package.

**Request:**
```json
{
  "customerName": "John Doe",
  "propertyAddress": "123 Main St",
  "county": "Miami-Dade",
  "permitType": "Mobile Home Permit",
  "contractorId": 1
}
```

#### PUT /api/permits/:id
Update permit package status or details.

**Request:**
```json
{
  "status": "Submitted",
  "customerName": "John Doe Updated"
}
```

### Document Management

#### POST /api/permits/:id/documents
Upload document to permit package.

**Request:** `multipart/form-data`
- `document`: File to upload

**Response:**
```json
{
  "id": 1,
  "customerName": "John Doe",
  "documents": [
    {
      "id": 1,
      "fileName": "site-plan.pdf",
      "filePath": "uploads/1234567890.pdf",
      "uploadedAt": "2024-01-01T00:00:00Z",
      "uploaderName": "Admin User",
      "version": "1.0"
    }
  ]
}
```

### Contractor Management

#### GET /api/contractors
Retrieve all contractors with package counts.

#### POST /api/contractors
Create new contractor.

**Request:**
```json
{
  "companyName": "ABC Construction",
  "licenseNumber": "CGC123456",
  "address": "456 Business Ave",
  "phoneNumber": "555-123-4567",
  "email": "info@abcconstruction.com",
  "contactPerson": "John Smith"
}
```

### Subcontractor Management

#### GET /api/subcontractors
Retrieve all subcontractors.

#### POST /api/subcontractors
Create new subcontractor.

**Request:**
```json
{
  "companyName": "XYZ Electrical",
  "licenseNumber": "EC123456",
  "tradeType": "Electrical",
  "address": "789 Trade St",
  "phoneNumber": "555-987-6543",
  "email": "info@xyzelectrical.com",
  "contactPerson": "Mike Johnson"
}
```

## Frontend Components

### Main Application (`index.js`)

The main React application orchestrates all components and manages global state.

**Key Features:**
- User authentication and session management
- Permit package creation and management
- Document upload and management
- Contractor and subcontractor assignment
- Status tracking and updates

**State Management:**
```javascript
const [packages, setPackages] = useState([]);
const [contractors, setContractors] = useState([]);
const [subcontractors, setSubcontractors] = useState([]);
const [user, setUser] = useState(null);
```

### Checklist System (`checklist-system.js`)

Manages county-specific permit requirements and checklists.

**Features:**
- Dynamic checklist generation based on county and permit type
- Custom checklist item management
- Checklist persistence in localStorage
- Export functionality for completed checklists

**Usage:**
```javascript
import ChecklistManagementModal from './checklist-system';

// In component
<ChecklistManagementModal 
  isOpen={showChecklist}
  onClose={() => setShowChecklist(false)}
  county={selectedCounty}
  permitType={selectedPermitType}
/>
```

### Contractor Management (`contractor-management.js`)

Comprehensive contractor and subcontractor management system.

**Features:**
- Contractor creation, editing, and deletion
- Subcontractor management with trade types
- Package assignment and reassignment
- Bulk operations for contractor management

**Components:**
- `ContractorManagementModal`: Main contractor management interface
- `SubcontractorManagementModal`: Subcontractor-specific management
- `ContractorForm`: Contractor creation/editing form
- `SubcontractorForm`: Subcontractor creation/editing form

### Subcontractor Assignment (`subcontractor-assignment-modal.js`)

Manages the assignment of subcontractors to specific permit packages.

**Features:**
- Trade-specific subcontractor assignment
- Assignment validation and conflict detection
- Assignment history tracking
- Bulk assignment operations

## Backend Services

### Express Server (`server.js`)

The main backend server providing RESTful API endpoints.

**Key Middleware:**
- CORS configuration for cross-origin requests
- JSON body parsing
- File upload handling with Multer
- Static file serving for uploads

**Error Handling:**
```javascript
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});
```

### Database Layer (Prisma)

Prisma ORM provides type-safe database access and migrations.

**Key Features:**
- Type-safe database queries
- Automatic migration generation
- Relationship management
- Connection pooling

**Example Query:**
```javascript
const packages = await prisma.package.findMany({
  include: {
    documents: true,
    contractor: true,
    subcontractors: {
      include: {
        subcontractor: true
      }
    }
  }
});
```

### File Management

Handles document uploads and file storage.

**Storage Configuration:**
```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});
```

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/permitpro"

# Security
JWT_SECRET="your-super-secret-jwt-key-here"

# Server Configuration
PORT=8000
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Webpack Configuration

Frontend build configuration in `webpack.config.js`:

```javascript
module.exports = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  devServer: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
};
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Symptoms:** "Connection refused" or "Authentication failed"

**Solutions:**
```bash
# Check PostgreSQL service status
sudo systemctl status postgresql

# Verify connection string
psql -h localhost -U permitpro_user -d permitpro

# Reset database connection
bun run db:migrate:reset
```

#### 2. File Upload Failures

**Symptoms:** "No file uploaded" or "File too large"

**Solutions:**
```bash
# Check upload directory permissions
chmod 755 uploads/

# Verify file size limits in multer config
# Check disk space
df -h
```

#### 3. CORS Errors

**Symptoms:** "Access to fetch at 'http://localhost:8000/api/permits' from origin 'http://localhost:3000' has been blocked"

**Solutions:**
```javascript
// Update CORS configuration in server.js
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

#### 4. Build Errors

**Symptoms:** "Module not found" or "Syntax error"

**Solutions:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
bun install

# Clear webpack cache
rm -rf dist/
bun run build
```

### Performance Issues

#### Database Performance

**Optimization Strategies:**
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_packages_county ON packages(county);
CREATE INDEX idx_packages_status ON packages(status);
CREATE INDEX idx_packages_contractor ON packages(contractor_id);

-- Optimize queries with proper includes
const packages = await prisma.package.findMany({
  include: {
    documents: {
      select: {
        id: true,
        fileName: true,
        uploadedAt: true
      }
    }
  }
});
```

#### File Upload Performance

**Optimization Strategies:**
```javascript
// Implement file compression
const sharp = require('sharp');

// Add file size validation
const maxSize = 10 * 1024 * 1024; // 10MB
if (file.size > maxSize) {
  return res.status(400).json({ error: 'File too large' });
}
```

## FAQ

### General Questions

**Q: Can I use a different database than PostgreSQL?**
A: Yes, Prisma supports multiple databases. Update the `datasource` in `schema.prisma`:
```prisma
datasource db {
  provider = "mysql" // or "sqlite", "sqlserver"
  url      = env("DATABASE_URL")
}
```

**Q: How do I add new permit types?**
A: Update the `PERMIT_TYPES` array in both frontend and backend:
```javascript
const PERMIT_TYPES = [
  "Mobile Home Permit",
  "Modular Home Permit", 
  "Shed Permit",
  "New Permit Type"
];
```

**Q: Can I customize the checklist system?**
A: Yes, the checklist system is fully customizable. Edit `florida-county-checklists.json` or use the UI to modify checklists per county and permit type.

### Deployment Questions

**Q: How do I set up SSL/HTTPS?**
A: For production deployment, use a reverse proxy like Nginx:
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
    }
}
```

**Q: How do I backup the database?**
A: Use PostgreSQL backup tools:
```bash
# Create backup
pg_dump permitpro > backup.sql

# Restore backup
psql permitpro < backup.sql
```

### Development Questions

**Q: How do I add new API endpoints?**
A: Add new routes in `server.js`:
```javascript
app.get('/api/new-endpoint', async (req, res) => {
  try {
    // Your logic here
    res.json({ data: 'response' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Q: How do I debug the application?**
A: Use browser developer tools for frontend and console logging for backend:
```javascript
// Backend debugging
console.log('Debug info:', data);

// Frontend debugging
console.log('Component state:', state);
```

## Best Practices

### Code Organization

1. **Separation of Concerns**: Keep frontend and backend logic separate
2. **Component Reusability**: Create reusable React components
3. **Error Handling**: Implement comprehensive error handling
4. **Type Safety**: Use TypeScript for better type safety (recommended)

### Security

1. **Input Validation**: Validate all user inputs
2. **File Upload Security**: Implement file type and size validation
3. **Authentication**: Use secure authentication methods
4. **Environment Variables**: Never commit sensitive data to version control

### Performance

1. **Database Optimization**: Use proper indexes and query optimization
2. **File Management**: Implement efficient file storage and retrieval
3. **Caching**: Use appropriate caching strategies
4. **Code Splitting**: Implement lazy loading for large components

### Testing

1. **Unit Tests**: Write tests for individual components and functions
2. **Integration Tests**: Test API endpoints and database interactions
3. **End-to-End Tests**: Test complete user workflows
4. **Performance Tests**: Monitor application performance

## Security Considerations

### Authentication & Authorization

- Implement proper session management
- Use secure password hashing (bcrypt)
- Implement role-based access control
- Use HTTPS in production

### Data Protection

- Encrypt sensitive data at rest
- Implement proper backup strategies
- Use secure file upload validation
- Implement rate limiting

### API Security

- Validate all input data
- Implement proper CORS policies
- Use API rate limiting
- Log security events

### File Security

- Validate file types and sizes
- Scan uploaded files for malware
- Implement secure file storage
- Use signed URLs for file access

---

## Support and Maintenance

### Getting Help

1. **Documentation**: Refer to this comprehensive guide
2. **Issues**: Check existing GitHub issues
3. **Community**: Join the development community
4. **Professional Support**: Contact for enterprise support

### Updates and Maintenance

1. **Regular Updates**: Keep dependencies updated
2. **Security Patches**: Apply security updates promptly
3. **Backup Strategy**: Implement regular database backups
4. **Monitoring**: Set up application monitoring and alerting

### Contributing

1. **Code Standards**: Follow established coding standards
2. **Testing**: Write tests for new features
3. **Documentation**: Update documentation for changes
4. **Review Process**: Submit pull requests for review

---

*This documentation is maintained by the PermitPro development team. For the latest updates and additional resources, visit the project repository.*
