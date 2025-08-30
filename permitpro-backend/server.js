const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const path = require('path'); // Added for path.extname

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Configure multer for file uploads with better file naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Preserve file extension and add timestamp for uniqueness
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Auth
app.post('/api/auth/login', async (req, res) => {
  try {
    // In a real app, you'd validate credentials here
    const { email, password } = req.body;
    
    // For demo purposes, accept any login
    let user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      // Create user if doesn't exist (for demo)
      user = await prisma.user.create({
        data: {
          email,
          name: 'Admin User',
          role: 'Administrator'
        }
      });
    }
    
    res.json({ name: user.name, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Packages
app.get('/api/permits', async (req, res) => {
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(packages);
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

app.post('/api/permits', async (req, res) => {
  try {
    const { customerName, propertyAddress, county, permitType, contractorId } = req.body;
    
    const newPackage = await prisma.package.create({
      data: {
        customerName,
        propertyAddress,
        county,
        permitType,
        status: 'Draft',
        contractorId: contractorId ? parseInt(contractorId) : null
      },
      include: {
        documents: true,
        contractor: true
      }
    });
    
    res.json(newPackage);
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ error: 'Failed to create package' });
  }
});

app.put('/api/permits/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    const updatedPackage = await prisma.package.update({
      where: { id },
      data: updateData,
      include: {
        documents: true
      }
    });
    
    res.json(updatedPackage);
  } catch (error) {
    console.error('Update package error:', error);
    res.status(404).json({ error: 'Package not found' });
  }
});

app.post('/api/permits/:id/documents', upload.single('document'), async (req, res) => {
  try {
    const packageId = parseInt(req.params.id);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Create document record
    await prisma.document.create({
      data: {
        fileName: req.file.originalname,
        filePath: req.file.filename,
        uploaderName: 'Admin User',
        version: '1.0',
        packageId
      }
    });
    
    // Return updated package with documents
    const updatedPackage = await prisma.package.findUnique({
      where: { id: packageId },
      include: {
        documents: true
      }
    });
    
    res.json(updatedPackage);
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Contractor Management Endpoints
app.get('/api/contractors', async (req, res) => {
  try {
    const contractors = await prisma.contractor.findMany({
      include: {
        subcontractors: true,
        packages: {
          select: {
            id: true,
            customerName: true,
            status: true
          }
        }
      }
    });
    res.json(contractors);
  } catch (error) {
    console.error('Get contractors error:', error);
    res.status(500).json({ error: 'Failed to fetch contractors' });
  }
});

app.post('/api/contractors', async (req, res) => {
  try {
    const { companyName, licenseNumber, address, phoneNumber, email, contactPerson } = req.body;
    
    const newContractor = await prisma.contractor.create({
      data: {
        companyName,
        licenseNumber,
        address,
        phoneNumber,
        email,
        contactPerson
      }
    });
    
    res.json(newContractor);
  } catch (error) {
    console.error('Create contractor error:', error);
    res.status(500).json({ error: 'Failed to create contractor' });
  }
});

app.put('/api/contractors/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    const updatedContractor = await prisma.contractor.update({
      where: { id },
      data: updateData
    });
    
    res.json(updatedContractor);
  } catch (error) {
    console.error('Update contractor error:', error);
    res.status(500).json({ error: 'Failed to update contractor' });
  }
});

// Subcontractor Management Endpoints
app.get('/api/contractors/:id/subcontractors', async (req, res) => {
  try {
    const contractorId = parseInt(req.params.id);
    
    const subcontractors = await prisma.subcontractor.findMany({
      where: { contractorId }
    });
    
    res.json(subcontractors);
  } catch (error) {
    console.error('Get subcontractors error:', error);
    res.status(500).json({ error: 'Failed to fetch subcontractors' });
  }
});

app.post('/api/contractors/:id/subcontractors', async (req, res) => {
  try {
    const contractorId = parseInt(req.params.id);
    const { companyName, licenseNumber, address, phoneNumber, email, contactPerson, tradeType } = req.body;
    
    const newSubcontractor = await prisma.subcontractor.create({
      data: {
        companyName,
        licenseNumber,
        address,
        phoneNumber,
        email,
        contactPerson,
        tradeType,
        contractorId
      }
    });
    
    res.json(newSubcontractor);
  } catch (error) {
    console.error('Create subcontractor error:', error);
    res.status(500).json({ error: 'Failed to create subcontractor' });
  }
});

app.put('/api/subcontractors/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    const updatedSubcontractor = await prisma.subcontractor.update({
      where: { id },
      data: updateData
    });
    
    res.json(updatedSubcontractor);
  } catch (error) {
    console.error('Update subcontractor error:', error);
    res.status(500).json({ error: 'Failed to update subcontractor' });
  }
});

// Package Subcontractor Assignment
app.post('/api/permits/:id/subcontractors', async (req, res) => {
  try {
    const packageId = parseInt(req.params.id);
    const { subcontractorId, tradeType } = req.body;
    
    const packageSubcontractor = await prisma.packageSubcontractor.create({
      data: {
        packageId,
        subcontractorId,
        tradeType
      }
    });
    
    res.json(packageSubcontractor);
  } catch (error) {
    console.error('Assign subcontractor error:', error);
    res.status(500).json({ error: 'Failed to assign subcontractor' });
  }
});

app.delete('/api/permits/:id/subcontractors/:subcontractorId', async (req, res) => {
  try {
    const packageId = parseInt(req.params.id);
    const subcontractorId = parseInt(req.params.subcontractorId);
    
    await prisma.packageSubcontractor.delete({
      where: {
        packageId_subcontractorId: {
          packageId,
          subcontractorId
        }
      }
    });
    
    res.json({ message: 'Subcontractor removed from package' });
  } catch (error) {
    console.error('Remove subcontractor error:', error);
    res.status(500).json({ error: 'Failed to remove subcontractor' });
  }
});

// Delete contractor endpoint
app.delete('/api/contractors/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    await prisma.contractor.delete({
      where: { id }
    });
    
    res.json({ message: 'Contractor deleted successfully' });
  } catch (error) {
    console.error('Delete contractor error:', error);
    res.status(500).json({ error: 'Failed to delete contractor' });
  }
});

// Delete subcontractor endpoint
app.delete('/api/subcontractors/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    await prisma.subcontractor.delete({
      where: { id }
    });
    
    res.json({ message: 'Subcontractor deleted successfully' });
  } catch (error) {
    console.error('Delete subcontractor error:', error);
    res.status(500).json({ error: 'Failed to delete subcontractor' });
  }
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

app.listen(8000, () => {
  console.log('Backend running on http://localhost:8000');
  console.log('Database connected via Prisma');
});
