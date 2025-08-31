# ☁️ Deploying PermitPro on Google Cloud Platform

This guide will walk you through deploying PermitPro on Google Cloud Platform (GCP) for production use.

## 🎯 **Why Google Cloud Platform?**

- **Cost-effective**: Pay-as-you-use pricing, very affordable for small apps
- **Scalable**: Easy to scale from small to enterprise
- **Managed services**: PostgreSQL, load balancing, monitoring included
- **Global**: Data centers worldwide
- **Free tier**: Generous free tier for new users

## 📋 **Prerequisites**

1. **Google Cloud account** (sign up at [cloud.google.com](https://cloud.google.com))
2. **Google Cloud CLI** installed locally
3. **Domain name** (optional but recommended)
4. **Basic Linux knowledge**

## 🆓 **Free Tier Benefits**

- **Compute Engine**: 1 f1-micro instance per month
- **Cloud SQL**: 1GB PostgreSQL instance
- **Cloud Storage**: 5GB storage
- **Cloud Functions**: 2 million invocations per month

## 🚀 **Deployment Options**

### **Option 1: Compute Engine + Cloud SQL (Recommended)**
- **Cost**: ~$15-25/month for small apps
- **Pros**: Full control, cost-effective
- **Cons**: More manual setup

### **Option 2: Cloud Run + Cloud SQL**
- **Cost**: ~$10-20/month for small apps
- **Pros**: Serverless, auto-scaling
- **Cons**: Cold starts, more complex

### **Option 3: App Engine + Cloud SQL**
- **Cost**: ~$20-30/month for small apps
- **Pros**: Fully managed, easy deployment
- **Cons**: Less control, vendor lock-in

## 🖥️ **Recommended Setup: Compute Engine + Cloud SQL**

### **Cost Breakdown**
| Service | Plan | Cost |
|---------|------|------|
| **Compute Engine** | e2-micro (2 vCPU, 1GB RAM) | $6/month |
| **Cloud SQL** | PostgreSQL 1GB | $7/month |
| **Cloud Storage** | 5GB (free tier) | $0/month |
| **Load Balancer** | Standard | $18/month |
| **Total** | | **$31/month** |

**Note**: You can start with just Compute Engine + Cloud SQL for ~$13/month and add load balancer later.

## 🚀 **Step-by-Step Deployment**

### **Step 1: Set Up Google Cloud Project**

1. **Create a new project** in Google Cloud Console
2. **Enable required APIs**:
   - Compute Engine API
   - Cloud SQL Admin API
   - Cloud Storage API
   - Cloud Build API

```bash
# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable compute.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### **Step 2: Create Cloud SQL Instance**

```bash
# Create PostgreSQL instance
gcloud sql instances create permitpro-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --storage-type=HDD \
    --storage-size=10GB \
    --backup-start-time=02:00 \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=03:00

# Create database
gcloud sql databases create permitpro --instance=permitpro-db

# Create user
gcloud sql users create permitpro_user \
    --instance=permitpro-db \
    --password=your-strong-password-here

# Get connection info
gcloud sql instances describe permitpro-db --format="value(connectionName)"
```

### **Step 3: Create Compute Engine Instance**

```bash
# Create instance
gcloud compute instances create permitpro-backend \
    --zone=us-central1-a \
    --machine-type=e2-micro \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=20GB \
    --boot-disk-type=pd-standard \
    --tags=http-server,https-server \
    --metadata=startup-script='#! /bin/bash
    # Update system
    apt-get update
    apt-get install -y curl git
    
    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    
    # Install Docker Compose
    apt-get install -y docker-compose-plugin
    
    # Start Docker
    systemctl enable docker
    systemctl start docker'

# Create firewall rule for HTTP
gcloud compute firewall-rules create allow-http \
    --allow tcp:8000 \
    --target-tags=http-server \
    --source-ranges=0.0.0.0/0 \
    --description="Allow HTTP traffic"

# Create firewall rule for HTTPS
gcloud compute firewall-rules create allow-https \
    --allow tcp:443 \
    --target-tags=https-server \
    --source-ranges=0.0.0.0/0 \
    --description="Allow HTTPS traffic"
```

### **Step 4: Deploy PermitPro**

**Connect to your instance:**
```bash
gcloud compute ssh permitpro-backend --zone=us-central1-a
```

**Once connected, deploy the application:**
```bash
# Clone your repository
git clone https://github.com/yourusername/PMS_permitpro.git
cd PMS_permitpro

# Create production environment file
cat > .env << EOF
# Database Configuration
POSTGRES_DB=permitpro
POSTGRES_USER=permitpro_user
POSTGRES_PASSWORD=your-strong-password-here

# Application Configuration
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
PORT=8000

# External Database (Cloud SQL)
DATABASE_URL=postgresql://permitpro_user:your-strong-password-here@/permitpro?host=/cloudsql/YOUR_CONNECTION_NAME
EOF

# Make scripts executable
chmod +x *.sh

# Deploy
./deploy-linode.sh
```

### **Step 5: Set Up Cloud SQL Proxy**

**Install Cloud SQL Proxy:**
```bash
# Download Cloud SQL Proxy
wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O cloud_sql_proxy

# Make executable
chmod +x cloud_sql_proxy

# Start proxy in background
./cloud_sql_proxy -instances=YOUR_CONNECTION_NAME=tcp:5432 &

# Test connection
psql "host=localhost port=5432 dbname=permitpro user=permitpro_user password=your-password"
```

### **Step 6: Set Up Nginx and SSL**

**Install Nginx:**
```bash
apt-get install -y nginx certbot python3-certbot-nginx

# Create Nginx configuration
cat > /etc/nginx/sites-available/permitpro << 'EOF'
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
EOF

# Enable site
ln -s /etc/nginx/sites-available/permitpro /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com
```

## 🔒 **Security Best Practices**

### **1. IAM and Access Control**
```bash
# Create service account for the application
gcloud iam service-accounts create permitpro-sa \
    --display-name="PermitPro Service Account"

# Grant minimal permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:permitpro-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"
```

### **2. Network Security**
```bash
# Restrict database access to your instance only
gcloud sql instances patch permitpro-db \
    --authorized-networks=YOUR_INSTANCE_IP/32
```

### **3. Secrets Management**
```bash
# Store sensitive data in Secret Manager
echo -n "your-jwt-secret" | gcloud secrets create permitpro-jwt-secret --data-file=-
echo -n "your-db-password" | gcloud secrets create permitpro-db-password --data-file=-
```

## 💾 **Data Storage and Backups**

### **Cloud SQL Backups**
- **Automatic backups**: Daily backups with 7-day retention
- **Point-in-time recovery**: Available for all instances
- **Export/Import**: Easy data migration

### **File Storage**
```bash
# Use Cloud Storage for file uploads
gsutil mb gs://your-permitpro-uploads
gsutil iam ch allUsers:objectViewer gs://your-permitpro-uploads
```

### **Manual Backups**
```bash
# Create manual backup
gcloud sql backups create --instance=permitpro-db

# Export database
gcloud sql export sql permitpro-db gs://your-backup-bucket/backup.sql \
    --database=permitpro
```

## 📊 **Monitoring and Maintenance**

### **Cloud Monitoring**
```bash
# Enable monitoring
gcloud services enable monitoring.googleapis.com

# View metrics in Cloud Console
# - CPU usage
# - Memory usage
# - Disk I/O
# - Network traffic
```

### **Logging**
```bash
# View application logs
gcloud compute ssh permitpro-backend --zone=us-central1-a
docker-compose -f docker-compose.production.yml logs -f
```

### **Updates and Maintenance**
```bash
# Update system packages
apt-get update && apt-get upgrade -y

# Update Docker images
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

## 🚀 **Scaling Options**

### **Vertical Scaling**
```bash
# Upgrade instance size
gcloud compute instances set-machine-type permitpro-backend \
    --machine-type=e2-small --zone=us-central1-a

# Upgrade database
gcloud sql instances patch permitpro-db --tier=db-f1-small
```

### **Horizontal Scaling**
```bash
# Create instance template
gcloud compute instance-templates create permitpro-template \
    --machine-type=e2-micro \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud

# Create managed instance group
gcloud compute instance-groups managed create permitpro-group \
    --template=permitpro-template \
    --size=2 \
    --zone=us-central1-a

# Set up load balancer
gcloud compute backend-services create permitpro-backend \
    --load-balancing-scheme=EXTERNAL \
    --protocol=HTTP \
    --port-name=http

gcloud compute url-maps create permitpro-lb \
    --default-service=permitpro-backend
```

## 💰 **Cost Optimization**

### **Free Tier Usage**
- Use f1-micro instances for development
- Use Cloud SQL f1-micro for small databases
- Use Cloud Storage free tier for backups

### **Cost Monitoring**
```bash
# Set up billing alerts
gcloud billing accounts list
gcloud billing budgets create \
    --billing-account=YOUR_BILLING_ACCOUNT \
    --budget-amount=50USD \
    --budget-amount-specified \
    --display-name="PermitPro Budget"
```

### **Right-sizing**
- Monitor resource usage
- Scale down during low-traffic periods
- Use committed use discounts for predictable workloads

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Database connection failed**
   ```bash
   # Check Cloud SQL Proxy
   ps aux | grep cloud_sql_proxy
   
   # Check firewall rules
   gcloud compute firewall-rules list
   ```

2. **Instance won't start**
   ```bash
   # Check startup script logs
   gcloud compute instances get-serial-port-output permitpro-backend
   
   # Check instance status
   gcloud compute instances describe permitpro-backend
   ```

3. **SSL certificate issues**
   ```bash
   # Check certificate status
   certbot certificates
   
   # Renew certificate
   certbot renew
   ```

### **Getting Help**
- **Google Cloud Support**: Excellent documentation and support
- **Community**: Active Stack Overflow and Reddit communities
- **Documentation**: Comprehensive guides and tutorials

## 🎉 **You're All Set!**

Your PermitPro application is now running on Google Cloud Platform with:
- ✅ **Production-ready backend**
- ✅ **Managed PostgreSQL database**
- ✅ **Automatic backups**
- ✅ **SSL/TLS encryption**
- ✅ **Scalable infrastructure**

**Next steps:**
1. Test your API endpoints
2. Set up monitoring and alerts
3. Configure automated backups
4. Monitor costs and optimize
5. Scale as needed

---

**Need help?** Google Cloud has excellent support and documentation. You can also reach out to the community forums for assistance!
