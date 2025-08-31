const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const path = require('path'); // Added for path.extname

const app = express();
const prisma = new PrismaClient();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Ensure uploads directory exists
const fs = require('fs');
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads with better file naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir + '/');
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
app.use('/uploads', express.static(path.join(__dirname, uploadsDir)));

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

app.get('/api/permits/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const package = await prisma.package.findUnique({
      where: { id },
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
    
    if (!package) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    res.json(package);
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({ error: 'Failed to fetch package' });
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

// Global Subcontractor Management Endpoints
app.get('/api/subcontractors', async (req, res) => {
  try {
    const subcontractors = await prisma.subcontractor.findMany({
      include: {
        packages: {
          include: {
            package: {
              select: {
                id: true,
                customerName: true,
                status: true,
                contractor: {
                  select: {
                    companyName: true
                  }
                }
              }
            }
          }
        }
      }
    });
    res.json(subcontractors);
  } catch (error) {
    console.error('Get subcontractors error:', error);
    res.status(500).json({ error: 'Failed to fetch subcontractors' });
  }
});

app.post('/api/subcontractors', async (req, res) => {
  try {
    const { companyName, licenseNumber, address, phoneNumber, email, contactPerson, tradeType } = req.body;
    
    const newSubcontractor = await prisma.subcontractor.create({
      data: {
        companyName,
        licenseNumber,
        address,
        phoneNumber,
        email,
        contactPerson,
        tradeType
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

// Package Contractor Assignment
app.put('/api/permits/:id/contractor', async (req, res) => {
  try {
    const packageId = parseInt(req.params.id);
    const { contractorId } = req.body;
    
    const updatedPackage = await prisma.package.update({
      where: { id: packageId },
      data: { contractorId: parseInt(contractorId) },
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
    
    res.json(updatedPackage);
  } catch (error) {
    console.error('Assign contractor error:', error);
    res.status(500).json({ error: 'Failed to assign contractor' });
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

// Bulk reassign packages to a different contractor
app.put('/api/contractors/:id/reassign-packages', async (req, res) => {
  try {
    const oldContractorId = parseInt(req.params.id);
    const { newContractorId } = req.body;
    
    if (!newContractorId) {
      return res.status(400).json({ error: 'New contractor ID is required' });
    }
    
    // Verify the new contractor exists
    const newContractor = await prisma.contractor.findUnique({
      where: { id: newContractorId }
    });
    
    if (!newContractor) {
      return res.status(404).json({ error: 'New contractor not found' });
    }
    
    // Reassign all packages from old contractor to new contractor
    const updatedPackages = await prisma.package.updateMany({
      where: { contractorId: oldContractorId },
      data: { contractorId: newContractorId }
    });
    
    res.json({ 
      message: `Successfully reassigned ${updatedPackages.count} package(s) to ${newContractor.companyName}`,
      reassignedCount: updatedPackages.count,
      newContractorName: newContractor.companyName
    });
  } catch (error) {
    console.error('Reassign packages error:', error);
    res.status(500).json({ error: 'Failed to reassign packages' });
  }
});

// Delete contractor endpoint
app.delete('/api/contractors/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if contractor has any packages assigned
    const packagesWithContractor = await prisma.package.findMany({
      where: { contractorId: id }
    });
    
    if (packagesWithContractor.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete contractor with assigned packages',
        message: `This contractor has ${packagesWithContractor.length} package(s) assigned. Please reassign or remove the packages first.`,
        packageCount: packagesWithContractor.length,
        packages: packagesWithContractor.map(p => ({ id: p.id, customerName: p.customerName }))
      });
    }
    
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

const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log('Database connected via Prisma');
});
