# 🚀 PermitPro - Permit Management System

A comprehensive permit management system built with Express.js, Prisma, and PostgreSQL.

## 🎯 **Deployment Options**

### **1. 🏠 Local Development (Recommended for now)**
- **Quick start**: Run `./deploy.sh` for local Docker setup
- **Perfect for**: Development, testing, learning
- **Cost**: Free (just your local machine)

### **2. 🌐 Linode VPS**
- **Cost**: Starting at $10/month
- **Perfect for**: Production, small to medium businesses
- **Guide**: See `LINODE_DEPLOYMENT.md`

### **3. ☁️ Google Cloud Platform**
- **Cost**: Pay-as-you-use (very affordable for small apps)
- **Perfect for**: Production, scalable applications
- **Guide**: See `GOOGLE_CLOUD_DEPLOYMENT.md`

## 🚀 **Quick Start (Local Development)**

### **Prerequisites**
- Docker and Docker Compose installed
- Git

### **One-Command Setup**
```bash
# Clone the repository
git clone https://github.com/yourusername/PMS_permitpro.git
cd PMS_permitpro

# Deploy locally with one command
./deploy.sh
```

### **Manual Setup**
```bash
# Build and start services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 **Access Points (Local)**

- **Backend API**: http://localhost:8000
- **Database**: localhost:5432
- **API Endpoints**:
  - `GET /api/permits` - List all permits
  - `POST /api/auth/login` - User authentication
  - `POST /api/permits` - Create new permit
  - `GET /api/permits/:id` - Get specific permit

## 🗄️ **Database (Local)**

- **Host**: localhost
- **Port**: 5432
- **Database**: permitpro
- **Username**: postgres
- **Password**: password123

## 🔧 **Configuration**

### **Local Development**
- Edit `local.env` for environment variables
- Edit `docker-compose.yml` for Docker settings
- Edit `Dockerfile` for container configuration

### **Production Deployment**
- Use `production.env.example` as template
- Use `docker-compose.production.yml` for production
- See deployment guides for specific platforms

## 📁 **Project Structure**

```
.
├── docker-compose.yml              # Local development
├── docker-compose.production.yml   # Production deployment
├── Dockerfile                      # Container definition
├── start.sh                        # Startup script
├── deploy.sh                       # Local deployment script
├── deploy-linode.sh                # Linode deployment script
├── local.env                       # Local environment variables
├── production.env.example          # Production environment template
├── package.json                    # Dependencies and scripts
├── server.js                       # Main application
├── prisma/                         # Database schema and migrations
├── uploads/                        # File upload directory
├── README.md                       # This file
├── DOCKER_README.md                # Local Docker setup guide
├── LINODE_DEPLOYMENT.md            # Linode deployment guide
└── GOOGLE_CLOUD_DEPLOYMENT.md     # Google Cloud deployment guide
```

## 🛠️ **Development Commands**

### **Local Development (without Docker)**
```bash
# Install dependencies
bun install

# Set up database
bun run db:migrate

# Start development server
bun run dev
```

### **Docker Development**
```bash
# Development mode with logs
docker-compose up --build

# Production mode (detached)
docker-compose up --build -d

# View logs
docker-compose logs -f backend
```

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Port already in use**
   ```bash
   # Check what's using port 8000
   lsof -i :8000
   
   # Kill the process or change port in docker-compose.yml
   ```

2. **Database connection failed**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # View database logs
   docker-compose logs postgres
   ```

3. **Permission denied on scripts**
   ```bash
   chmod +x *.sh
   ```

### **Reset Everything**
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
./deploy.sh
```

## 🚀 **Next Steps**

### **For Local Development**
1. ✅ **You're all set!** Run `./deploy.sh` to start
2. Test your API endpoints
3. Develop and iterate locally
4. Use `docker-compose logs -f` to monitor

### **For Production Deployment**
1. Choose your platform (Linode, Google Cloud, etc.)
2. Follow the specific deployment guide
3. Set up SSL/TLS and domain
4. Configure backups and monitoring

## 📚 **Documentation**

- **`DOCKER_README.md`** - Comprehensive local Docker setup
- **`LINODE_DEPLOYMENT.md`** - Deploy on Linode VPS
- **`GOOGLE_CLOUD_DEPLOYMENT.md`** - Deploy on Google Cloud

---

**🎉 Ready to get started?** Run `./deploy.sh` for local development, or check out the deployment guides when you're ready for production!
