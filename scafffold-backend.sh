#!/bin/bash

# A script to scaffold the Permit Pro backend application.

# --- Configuration ---
PROJECT_DIR="server"

# --- Main Execution ---
echo "🚀 Starting backend scaffolding for Permit Pro..."

# 1. Create Project Directory
if [ -d "$PROJECT_DIR" ]; then
  echo "⚠️ Directory '$PROJECT_DIR' already exists. Please remove it or choose a different name."
  exit 1
fi
mkdir $PROJECT_DIR
cd $PROJECT_DIR
echo "✅ Created project directory: $PROJECT_DIR"

# 2. Initialize Node.js Project and Install Dependencies
echo "📦 Initializing Node.js project and installing dependencies..."
npm init -y > /dev/null
npm install express cors dotenv bcryptjs jsonwebtoken multer pdf-lib @prisma/client > /dev/null 2>&1
npm install -D nodemon prisma > /dev/null 2>&1
echo "✅ Dependencies installed."

# 3. Create Directory Structure
echo "📁 Creating application source directories..."
mkdir -p src/api src/config src/middleware src/services uploads/templates
echo "✅ Directory structure created."

# 4. Initialize Prisma
echo "🐬 Initializing Prisma..."
npx prisma init --datasource-provider postgresql > /dev/null
echo "✅ Prisma initialized."

# --- File Generation ---
echo "✍️  Writing source code files..."

# package.json (Overwrite the default)
cat << 'EOF' > package.json
{
  "name": "server",
  "version": "1.0.0",
  "description": "Backend for Permit Pro application",
  "main": "src/server.js",
  "type": "commonjs",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@prisma/client": "^5.17.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "pdf-lib": "^1.17.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.4",
    "prisma": "^5.17.0"
  }
}
EOF

# .env
cat << 'EOF' > .env
# Replace with your actual PostgreSQL connection string
# FORMAT: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/permitpro"

# A strong, secret key for signing JSON Web Tokens
JWT_SECRET="YOUR_ULTRA_SECRET_KEY_GOES_HERE"

# The port the server will run on
PORT=3001
EOF

# prisma/schema.prisma
cat << 'EOF' > prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String
  role         Role     @default(User)
  createdAt    DateTime @default(now())
}

enum Role {
  Admin
  User
}

model Customer {
  id             Int             @id @default(autoincrement())
  name           String
  email          String?
  phone          String?
  address        String?
  permitPackages PermitPackage[]
}

model Contractor {
  id             Int             @id @default(autoincrement())
  companyName    String
  licenseNumber  String          @unique
  contactPerson  String?
  email          String?
  phone          String?
  permitPackages PermitPackage[]
}

model PermitPackage {
  id           Int           @id @default(autoincrement())
  county       String
  status       String        @default("Draft")
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  customer     Customer      @relation(fields: [customerId], references: [id])
  customerId   Int
  contractor   Contractor    @relation(fields: [contractorId], references: [id])
  contractorId Int
  documents    Document[]
}

model Document {
  id              Int           @id @default(autoincrement())
  fileName        String
  filePath        String
  documentType    String // 'Template', 'FilledForm', 'Attachment'
  uploadedAt      DateTime      @default(now())
  permitPackage   PermitPackage @relation(fields: [permitPackageId], references: [id])
  permitPackageId Int
}
EOF

# src/config/prisma.js
cat << 'EOF' > src/config/prisma.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = prisma;
EOF

# src/middleware/auth.js
cat << 'EOF' > src/middleware/auth.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Adds user info (id, role) to the request object
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
};

module.exports = { protect, isAdmin };
EOF

# src/services/pdf.service.js
cat << 'EOF' > src/services/pdf.service.js
const { PDFDocument } = require('pdf-lib');
const fs = require('fs/promises');

// IMPORTANT: This mapping must match the field names in your PDF templates.
const fieldMapping = {
  customerName: 'customer_full_name',
  customerAddress: 'customer_address',
  contractorName: 'contractor_company_name',
  contractorLicense: 'contractor_license_number',
  // ... add all other mappings from your data to your PDF fields
};

async function fillPdfTemplate(templatePath, data) {
  try {
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();

    for (const [dataKey, pdfField] of Object.entries(fieldMapping)) {
      if (data[dataKey]) {
        try {
          const field = form.getField(pdfField);
          field.setText(String(data[dataKey]));
        } catch (err) {
            console.warn(`Could not find or fill field: ${pdfField}`);
        }
      }
    }

    form.flatten();
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Error filling PDF:', error);
    throw new Error('Could not fill PDF template.');
  }
}

module.exports = { fillPdfTemplate };
EOF

# src/api/auth.js
cat << 'EOF' > src/api/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const router = express.Router();

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const userExists = await prisma.user.findUnique({ where: { email } });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: role === 'Admin' ? 'Admin' : 'User', // Simple role assignment
    },
  });

  if (user) {
    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

module.exports = router;
EOF

# src/api/permits.js
cat << 'EOF' > src/api/permits.js
const express = require('express');
const multer = require('multer');
const prisma = require('../config/prisma');
const { protect } = require('../middleware/auth');
const { fillPdfTemplate } = require('../services/pdf.service');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/templates/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// POST /api/permits - Create a new permit package
router.post('/', protect, upload.single('template'), async (req, res) => {
  const { customerId, contractorId, county } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ message: 'PDF template file is required.' });
  }

  try {
    const newPackage = await prisma.permitPackage.create({
      data: {
        county,
        customerId: parseInt(customerId),
        contractorId: parseInt(contractorId),
        documents: {
          create: {
            fileName: req.file.originalname,
            filePath: req.file.path,
            documentType: 'Template',
          },
        },
      },
    });
    res.status(201).json(newPackage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create permit package.' });
  }
});

// GET /api/permits - Get all packages
router.get('/', protect, async (req, res) => {
    const packages = await prisma.permitPackage.findMany({
        include: { customer: true, contractor: true }
    });
    res.json(packages);
});


// GET /api/permits/:id/generate-pdf
router.get('/:id/generate-pdf', protect, async (req, res) => {
  try {
    const packageId = parseInt(req.params.id);
    const permitPackage = await prisma.permitPackage.findUnique({
      where: { id: packageId },
      include: {
        customer: true,
        contractor: true,
        documents: { where: { documentType: 'Template' } },
      },
    });

    if (!permitPackage || !permitPackage.documents.length) {
      return res.status(404).json({ error: 'Package or template not found.' });
    }

    const templatePath = permitPackage.documents[0].filePath;
    const formData = {
      customerName: permitPackage.customer.name,
      customerAddress: permitPackage.customer.address,
      contractorName: permitPackage.contractor.companyName,
      contractorLicense: permitPackage.contractor.licenseNumber,
    };

    const filledPdfBytes = await fillPdfTemplate(templatePath, formData);

    res.setHeader('Content-Disposition', `attachment; filename="filled_permit_${packageId}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(filledPdfBytes));
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PDF.' });
  }
});

module.exports = router;
EOF

# src/server.js
cat << 'EOF' > src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// --- Import Routes ---
const authRoutes = require('./api/auth');
const permitRoutes = require('./api/permits');

const app = express();

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/permits', permitRoutes);

// --- Serve Static React App (for production) ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
EOF

echo "✅ All files written successfully."
echo ""
echo "---"
echo "🎉 Scaffolding complete! 🎉"
echo ""
echo "Next Steps:"
echo "1. cd server"
echo "2. Edit the .env file with your database URL and a strong JWT_SECRET."
echo "3. Make sure your PostgreSQL database is running."
echo "4. Run 'npx prisma migrate dev --name init' to set up your database."
echo "5. Run 'npm run dev' to start the server."
echo "---"

