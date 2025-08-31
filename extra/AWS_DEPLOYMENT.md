# ☁️ AWS Free Tier Deployment Guide for PermitPro

This guide will walk you through deploying PermitPro to AWS Free Tier using modern AWS services.

## 🎯 **AWS Architecture Overview**

```
Internet → CloudFront → S3 (Frontend) → API Gateway → Lambda → RDS (PostgreSQL)
                                    ↓
                              CloudWatch (Logs)
```

## 📋 **Prerequisites**

1. **AWS Account**: Sign up at [aws.amazon.com](https://aws.amazon.com)
2. **AWS CLI**: Install and configure
3. **Docker**: For building and deploying
4. **Domain Name**: Optional but recommended

## 🚀 **Step-by-Step Deployment**

### **Step 1: AWS CLI Setup**

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Configure AWS CLI
aws configure
# Enter your Access Key ID, Secret Access Key, and region (e.g., us-east-1)
```

### **Step 2: Create Infrastructure with AWS CDK**

```bash
# Install AWS CDK
npm install -g aws-cdk

# Create CDK project
mkdir permitpro-aws
cd permitpro-aws
cdk init app --language typescript

# Install dependencies
npm install
```

### **Step 3: Infrastructure as Code**

Create `lib/permitpro-stack.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class PermitproStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC for RDS
    const vpc = new ec2.Vpc(this, 'PermitProVPC', {
      maxAzs: 2,
      natGateways: 0, // Free tier: no NAT gateways
    });

    // RDS PostgreSQL Instance (Free Tier)
    const db = new rds.DatabaseInstance(this, 'PermitProDB', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_13_7,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      databaseName: 'permitpro',
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      backupRetention: cdk.Duration.days(7),
      deleteAutomatedBackups: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development
    });

    // S3 Bucket for Frontend
    const frontendBucket = new s3.Bucket(this, 'PermitProFrontend', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'PermitProDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    // Lambda Layer for dependencies
    const nodeModulesLayer = new lambda.LayerVersion(this, 'NodeModulesLayer', {
      code: lambda.Code.fromAsset('lambda-layer'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'Node modules for PermitPro backend',
    });

    // Lambda Function for Backend
    const backendFunction = new lambda.Function(this, 'PermitProBackend', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../permitpro-backend'),
      layers: [nodeModulesLayer],
      environment: {
        DATABASE_URL: db.instanceEndpoint.hostname,
        DB_NAME: 'permitpro',
        DB_USER: 'postgres',
        DB_PASSWORD: db.secret?.secretValueFromJson('password') || '',
        DB_PORT: '5432',
        JWT_SECRET: 'your-jwt-secret-here',
        NODE_ENV: 'production',
      },
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    // Grant database access to Lambda
    db.grantConnect(backendFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, 'PermitProAPI', {
      restApiName: 'PermitPro API',
      description: 'PermitPro Backend API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

    // API Routes
    const permits = api.root.addResource('permits');
    permits.addMethod('GET', new apigateway.LambdaIntegration(backendFunction));
    permits.addMethod('POST', new apigateway.LambdaIntegration(backendFunction));

    const permit = permits.addResource('{id}');
    permit.addMethod('GET', new apigateway.LambdaIntegration(backendFunction));
    permit.addMethod('PUT', new apigateway.LambdaIntegration(backendFunction));

    const documents = permit.addResource('documents');
    documents.addMethod('POST', new apigateway.LambdaIntegration(backendFunction));

    // Outputs
    new cdk.CfnOutput(this, 'FrontendURL', {
      value: distribution.distributionDomainName,
      description: 'Frontend URL',
    });

    new cdk.CfnOutput(this, 'APIURL', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: db.instanceEndpoint.hostname,
      description: 'Database endpoint',
    });
  }
}
```

### **Step 4: Deploy Infrastructure**

```bash
# Build the project
npm run build

# Deploy to AWS
cdk deploy

# Note the outputs for the next steps
```

### **Step 5: Backend Lambda Function**

Create `permitpro-backend/lambda-index.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const express = require('express');
const serverless = require('serverless-http');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Your existing routes here
app.get('/permits', async (req, res) => {
  try {
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
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// Export for Lambda
module.exports.handler = serverless(app);
```

### **Step 6: Frontend Deployment**

```bash
# Build frontend
cd permitpro-frontend
bun run build

# Deploy to S3
aws s3 sync dist/ s3://your-frontend-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### **Step 7: Database Setup**

```bash
# Connect to RDS and run migrations
psql -h YOUR_RDS_ENDPOINT -U postgres -d permitpro -f migrations.sql

# Or use Prisma
DATABASE_URL="postgresql://postgres:password@YOUR_RDS_ENDPOINT:5432/permitpro" bun run db:migrate
```

## 🔧 **AWS Free Tier Limits**

### **EC2 (Lambda)**
- **Duration**: 1 million requests/month
- **Compute**: 400,000 GB-seconds/month
- **Memory**: 512MB per function

### **RDS (PostgreSQL)**
- **Duration**: 750 hours/month
- **Storage**: 20GB
- **Backup**: 20GB

### **S3**
- **Storage**: 5GB
- **Requests**: 20,000 GET, 2,000 PUT requests/month

### **CloudFront**
- **Data Transfer**: 15GB/month
- **Requests**: 1,000,000 requests/month

## 💰 **Cost After Free Tier**

- **Lambda**: $0.20 per 1M requests
- **RDS**: ~$15/month for t3.micro
- **S3**: $0.023 per GB/month
- **CloudFront**: $0.085 per GB
- **Total**: ~$20-30/month for small to medium usage

## 🚨 **Important Considerations**

### **Free Tier Limitations**
1. **RDS**: 750 hours/month (31 days) - will stop after 12 months
2. **Lambda**: Cold starts may affect performance
3. **No NAT Gateway**: Limited internet access from private subnets

### **Production Readiness**
- **Scaling**: Lambda auto-scales but has concurrency limits
- **Monitoring**: CloudWatch provides basic monitoring
- **Security**: IAM roles and security groups required

## 🔄 **Migration from Railway**

### **What Changes**
1. **Environment Variables**: Update frontend to use new API URL
2. **Database**: Migrate from Railway PostgreSQL to RDS
3. **File Storage**: Move from Railway storage to S3
4. **Deployment**: Manual deployment vs automatic Railway deployment

### **What Stays the Same**
1. **Frontend Code**: No changes needed
2. **Backend Logic**: Minimal changes for Lambda
3. **Database Schema**: Identical
4. **API Endpoints**: Same structure

## 📚 **Additional Resources**

- **AWS CDK Documentation**: [docs.aws.amazon.com/cdk](https://docs.aws.amazon.com/cdk)
- **Lambda Best Practices**: [docs.aws.amazon.com/lambda](https://docs.aws.amazon.com/lambda)
- **RDS Documentation**: [docs.aws.amazon.com/rds](https://docs.aws.amazon.com/rds)

## 🎯 **Recommendation**

**For Learning & Development**: AWS Free Tier is excellent
**For Production**: Consider Railway or managed services
**For Cost Control**: AWS Free Tier + careful monitoring

---

**Bottom Line**: AWS Free Tier gives you more control and generous limits, but requires significantly more setup and maintenance compared to Railway.
