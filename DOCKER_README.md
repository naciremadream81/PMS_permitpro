# 🐳 PermitPro Docker Setup

This setup allows you to run PermitPro locally using Docker Compose with PostgreSQL.

## 🚀 Quick Start

### 1. Prerequisites
- Docker installed
- Docker Compose installed
- Git (to clone the repository)

### 2. Deploy with One Command
```bash
./deploy.sh
```

This script will:
- Stop any existing containers
- Build fresh Docker images
- Start PostgreSQL and the backend
- Wait for services to be ready
- Show service status

### 3. Manual Deployment
```bash
# Build and start services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 Access Points

- **Backend API**: http://localhost:8000
- **Database**: localhost:5432
- **API Endpoints**:
  - `GET /api/permits` - List all permits
  - `POST /api/auth/login` - User authentication
  - `POST /api/permits` - Create new permit
  - `GET /api/permits/:id` - Get specific permit

## 🗄️ Database

- **Host**: localhost
- **Port**: 5432
- **Database**: permitpro
- **Username**: postgres
- **Password**: password123

## 🔧 Configuration

### Environment Variables
The application uses these environment variables (set in docker-compose.yml):

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `CORS_ORIGIN`: Allowed CORS origin
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (8000)

### Custom Configuration
To modify the configuration:

1. Edit `docker-compose.yml` for Docker-specific settings
2. Edit `local.env` for local environment variables
3. Edit `Dockerfile` for container configuration

## 📁 File Structure

```
.
├── docker-compose.yml      # Docker services configuration
├── Dockerfile             # Backend container definition
├── start.sh               # Startup script
├── deploy.sh              # Deployment script
├── local.env              # Local environment variables
├── package.json           # Node.js dependencies
├── server.js              # Main application file
├── prisma/                # Database schema and migrations
└── uploads/               # File upload directory
```

## 🛠️ Development

### Running Locally (without Docker)
```bash
# Install dependencies
bun install

# Set up database
bun run db:migrate

# Start development server
bun run dev
```

### Running with Docker
```bash
# Development mode with logs
docker-compose up --build

# Production mode (detached)
docker-compose up --build -d

# View logs
docker-compose logs -f backend
```

## 🔍 Troubleshooting

### Common Issues

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

3. **Permission denied on start.sh**
   ```bash
   chmod +x start.sh
   ```

### Reset Everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
./deploy.sh
```

## 🚀 Production Deployment

For production deployment on a server:

1. **Update environment variables** in `docker-compose.yml`
2. **Set strong JWT_SECRET**
3. **Configure proper CORS_ORIGIN**
4. **Set NODE_ENV=production**
5. **Use external PostgreSQL** or managed database service

### Example Production docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
      NODE_ENV: production
      PORT: 8000
    restart: unless-stopped
```

## 📝 Logs and Monitoring

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f

# View container status
docker-compose ps
```

## 🧹 Cleanup

```bash
# Stop services
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Remove everything
docker system prune -a
```

---

**🎉 You're all set!** Run `./deploy.sh` to get started with PermitPro locally.
