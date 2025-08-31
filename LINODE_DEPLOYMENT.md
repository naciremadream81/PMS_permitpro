# 🚀 Deploying PermitPro on Linode

This guide will walk you through deploying PermitPro on Linode (now Akamai Cloud Computing) for production use.

## 🎯 **Why Linode?**

- **Cost-effective**: Starting at $10/month for 2GB RAM
- **Reliable**: 99.9% uptime SLA
- **Simple**: Straightforward VPS management
- **Scalable**: Easy to upgrade as your needs grow
- **Global**: Data centers worldwide

## 📋 **Prerequisites**

1. **Linode account** (sign up at [linode.com](https://linode.com))
2. **Domain name** (optional but recommended)
3. **Basic Linux knowledge** (or willingness to learn)

## 🖥️ **Linode Plan Selection**

| Plan | RAM | CPU | Storage | Price | Use Case |
|------|-----|-----|---------|-------|----------|
| **2GB** | 2GB | 1 | 50GB | $10/month | Development/Testing |
| **4GB** | 4GB | 2 | 80GB | $20/month | **Production (Recommended)** |
| **8GB** | 8GB | 4 | 160GB | $40/month | High traffic production |

**Recommendation**: Start with **4GB plan** ($20/month) for production.

## 🚀 **Step-by-Step Deployment**

### **Step 1: Create Linode Instance**

1. **Login to Linode** and click "Create Linode"
2. **Choose Distribution**: Ubuntu 22.04 LTS
3. **Choose Region**: Closest to your users
4. **Choose Plan**: 4GB (recommended)
5. **Label**: `permitpro-backend`
6. **Root Password**: Generate a strong password
7. **Click "Create Linode"**

### **Step 2: Initial Server Setup**

Once your Linode is running, connect via SSH:

```bash
ssh root@YOUR_LINODE_IP
```

**Update the system:**
```bash
apt update && apt upgrade -y
```

**Install Docker and Docker Compose:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Add user to docker group
usermod -aG docker $USER

# Start Docker service
systemctl enable docker
systemctl start docker
```

**Install essential tools:**
```bash
apt install curl git nano htop -y
```

### **Step 3: Deploy PermitPro**

**Clone your repository:**
```bash
git clone https://github.com/yourusername/PMS_permitpro.git
cd PMS_permitpro
```

**Set up environment variables:**
```bash
# Copy the production environment template
cp production.env.example .env

# Edit the file with your values
nano .env
```

**Configure your .env file:**
```bash
# Database Configuration
POSTGRES_DB=permitpro
POSTGRES_USER=permitpro_user
POSTGRES_PASSWORD=your-super-strong-password-here

# Application Configuration
JWT_SECRET=your-very-long-random-secret-key-here
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
PORT=8000
```

**Make deployment script executable:**
```bash
chmod +x deploy-linode.sh
```

**Deploy the application:**
```bash
./deploy-linode.sh
```

### **Step 4: Configure Firewall**

**Set up UFW firewall:**
```bash
# Allow SSH
ufw allow ssh

# Allow HTTP (if not using reverse proxy)
ufw allow 8000

# Allow HTTPS (recommended)
ufw allow 443

# Enable firewall
ufw enable

# Check status
ufw status
```

### **Step 5: Set Up Domain and SSL (Optional)**

**If you have a domain:**

1. **Point DNS** to your Linode IP
2. **Install Nginx** as reverse proxy:
```bash
apt install nginx -y
```

3. **Create Nginx configuration:**
```bash
nano /etc/nginx/sites-available/permitpro
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **Enable the site:**
```bash
ln -s /etc/nginx/sites-available/permitpro /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

5. **Install SSL with Let's Encrypt:**
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com
```

## 🔒 **Security Best Practices**

### **1. Strong Passwords**
- Use password managers to generate strong passwords
- Change default passwords immediately
- Use different passwords for each service

### **2. SSH Security**
```bash
# Disable root login
nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

# Use SSH keys instead of passwords
# Restart SSH
systemctl restart sshd
```

### **3. Regular Updates**
```bash
# Set up automatic security updates
apt install unattended-upgrades -y
dpkg-reconfigure unattended-upgrades
```

### **4. Database Security**
- Use strong database passwords
- Limit database access to localhost only
- Regular database backups

## 💾 **Data Storage and Backups**

### **Local Storage (Current Setup)**
- **Pros**: Simple, fast, included in plan
- **Cons**: Limited by VPS storage, no redundancy

### **Linode Object Storage (Recommended)**
- **Cost**: $5/month for 1TB
- **Pros**: Scalable, redundant, accessible from anywhere
- **Setup**: Use for file uploads instead of local storage

### **Database Backups**
```bash
# Create backup script
nano /root/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec permitpro_postgres_1 pg_dump -U permitpro_user permitpro > /root/backup_$DATE.sql
# Keep only last 7 backups
ls -t /root/backup_*.sql | tail -n +8 | xargs rm -f
```

```bash
chmod +x /root/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /root/backup-db.sh
```

## 📊 **Monitoring and Maintenance**

### **Basic Monitoring**
```bash
# Check system resources
htop

# Check Docker containers
docker ps
docker stats

# Check application logs
docker-compose -f docker-compose.production.yml logs -f
```

### **Log Rotation**
```bash
# Install logrotate
apt install logrotate -y

# Configure Docker log rotation
nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

## 🚀 **Scaling Options**

### **Vertical Scaling (Upgrade Plan)**
- Easy to upgrade Linode plan
- More RAM, CPU, storage
- No code changes needed

### **Horizontal Scaling (Multiple Instances)**
- Load balancer with multiple backend instances
- Shared database (consider managed PostgreSQL)
- More complex but more scalable

## 💰 **Cost Breakdown**

| Component | Cost | Notes |
|-----------|------|-------|
| **Linode 4GB** | $20/month | Main server |
| **Object Storage** | $5/month | File storage (optional) |
| **Domain** | $10-15/year | Your domain name |
| **Total** | **$25-26/month** | Production-ready setup |

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Application won't start**
   ```bash
   # Check logs
   docker-compose -f docker-compose.production.yml logs
   
   # Check environment variables
   cat .env
   ```

2. **Database connection failed**
   ```bash
   # Check if PostgreSQL is running
   docker ps | grep postgres
   
   # Check database logs
   docker-compose -f docker-compose.production.yml logs postgres
   ```

3. **Port already in use**
   ```bash
   # Check what's using port 8000
   netstat -tlnp | grep :8000
   
   # Kill the process or change port
   ```

### **Getting Help**
- **Linode Support**: Excellent documentation and support
- **Community**: Active Linode community forums
- **Documentation**: Comprehensive guides and tutorials

## 🎉 **You're All Set!**

Your PermitPro application is now running on Linode with:
- ✅ **Production-ready backend**
- ✅ **PostgreSQL database**
- ✅ **Automatic restarts**
- ✅ **Health checks**
- ✅ **Security best practices**

**Next steps:**
1. Test your API endpoints
2. Set up monitoring
3. Configure backups
4. Set up SSL if using a domain
5. Monitor performance and scale as needed

---

**Need help?** Linode has excellent support and documentation. You can also reach out to the community forums for assistance!
