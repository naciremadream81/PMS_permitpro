const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const path = require('path'); // Added for path.extname

const app = express();
const prisma = new PrismaClient();

// Default checklist items for each permit type
const DEFAULT_CHECKLIST_ITEMS = {
  "Mobile Home Permit": [
    "Site Plan",
    "Foundation Design", 
    "Manufacturer's Installation Instructions",
    "Electrical Permit",
    "Plumbing Permit",
    "HVAC Permit",
    "Soil Test Report",
    "Flood Zone Determination",
    "Property Survey",
    "Building Code Compliance Certificate"
  ],
  "Modular Home Permit": [
    "Site Plan",
    "Foundation Design",
    "Modular Unit Specifications",
    "Electrical Permit", 
    "Plumbing Permit",
    "HVAC Permit",
    "Soil Test Report",
    "Flood Zone Determination",
    "Property Survey",
    "State Modular Program Approval",
    "Building Code Compliance Certificate"
  ],
  "Shed Permit": [
    "Site Plan",
    "Shed Design/Specifications",
    "Property Survey",
    "Flood Zone Determination",
    "Electrical Permit (if applicable)",
    "Plumbing Permit (if applicable)"
  ]
};

// Helper function to create package checklist
async function createPackageChecklist(packageId, county, permitType) {
  try {
    // Get or create checklist template
    let template = await prisma.checklistTemplate.findUnique({
      where: { county_permitType: { county, permitType } },
      include: { items: true }
    });

    if (!template) {
      // Create template with default items
      const defaultItems = DEFAULT_CHECKLIST_ITEMS[permitType] || [];
      template = await prisma.checklistTemplate.create({
        data: {
          county,
          permitType,
          items: {
            create: defaultItems.map((item, index) => ({
              name: item,
              isRequired: true,
              isCustom: false,
              order: index
            }))
          }
        },
        include: { items: true }
      });
    }

    // Create package checklist
    const packageChecklist = await prisma.packageChecklist.create({
      data: {
        packageId,
        items: {
          create: template.items.map(item => ({
            checklistItemId: item.id,
            isCompleted: false
          }))
        }
      }
    });

    return packageChecklist;
  } catch (error) {
    console.error('Error creating package checklist:', error);
    throw error;
  }
}

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
    // Validate input
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
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
        },
        checklists: {
          include: {
            items: {
              include: {
                checklistItem: true
              },
              orderBy: {
                checklistItem: {
                  order: 'asc'
                }
              }
            }
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
    const { customerName, propertyAddress, county, permitType, contractorLicense } = req.body;
    
    // Validate required fields
    if (!customerName || !propertyAddress || !county || !permitType) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['customerName', 'propertyAddress', 'county', 'permitType']
      });
    }
    
    // Validate permit type
    const validPermitTypes = ['Mobile Home Permit', 'Modular Home Permit', 'Shed Permit'];
    if (!validPermitTypes.includes(permitType)) {
      return res.status(400).json({ 
        error: 'Invalid permit type',
        validTypes: validPermitTypes
      });
    }
    
    const newPackage = await prisma.package.create({
      data: {
        customerName: customerName.trim(),
        propertyAddress: propertyAddress.trim(),
        county: county.trim(),
        permitType,
        status: 'Draft',
        contractorLicense: contractorLicense ? contractorLicense.trim() : null
      },
      include: {
        documents: true,
        contractor: true,
        checklists: {
          include: {
            items: {
              include: {
                checklistItem: true
              }
            }
          }
        }
      }
    });

    // Create checklist for the package
    if (newPackage.id) {
      await createPackageChecklist(newPackage.id, county, permitType);
    }
    
    // Fetch the complete package with checklist
    const completePackage = await prisma.package.findUnique({
      where: { id: newPackage.id },
      include: {
        documents: true,
        contractor: true,
        checklists: {
          include: {
            items: {
              include: {
                checklistItem: true
              },
              orderBy: {
                checklistItem: {
                  order: 'asc'
                }
              }
            }
          }
        }
      }
    });
    
    res.json(completePackage);
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
    const { contractorLicense } = req.body;
    
    const updatedPackage = await prisma.package.update({
      where: { id: packageId },
      data: { contractorLicense: contractorLicense },
      include: {
        documents: true,
        contractor: true,
        subcontractors: {
          include: {
            subcontractor: true
          }
        },
        checklists: {
          include: {
            items: {
              include: {
                checklistItem: true
              },
              orderBy: {
                checklistItem: {
                  order: 'asc'
                }
              }
            }
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
      where: { contractorLicense: oldContractorId },
      data: { contractorLicense: newContractorId }
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
      where: { contractorLicense: id }
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

// Checklist Management Endpoints
app.get('/api/checklist-templates', async (req, res) => {
  try {
    const { county, permitType } = req.query;
    
    if (county && permitType) {
      // Get specific template
      const template = await prisma.checklistTemplate.findUnique({
        where: { county_permitType: { county, permitType } },
        include: {
          items: {
            orderBy: { order: 'asc' }
          }
        }
      });
      res.json(template);
    } else {
      // Get all templates
      const templates = await prisma.checklistTemplate.findMany({
        include: {
          items: {
            orderBy: { order: 'asc' }
          }
        }
      });
      res.json(templates);
    }
  } catch (error) {
    console.error('Get checklist templates error:', error);
    res.status(500).json({ error: 'Failed to fetch checklist templates' });
  }
});

app.post('/api/checklist-templates', async (req, res) => {
  try {
    const { county, permitType, items } = req.body;
    
    const template = await prisma.checklistTemplate.upsert({
      where: { county_permitType: { county, permitType } },
      update: {
        items: {
          deleteMany: {},
          create: items.map((item, index) => ({
            name: item.name,
            isRequired: item.isRequired || true,
            isCustom: item.isCustom || false,
            order: index
          }))
        }
      },
      create: {
        county,
        permitType,
        items: {
          create: items.map((item, index) => ({
            name: item.name,
            isRequired: item.isRequired || true,
            isCustom: item.isCustom || false,
            order: index
          }))
        }
      },
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    res.json(template);
  } catch (error) {
    console.error('Create/update checklist template error:', error);
    res.status(500).json({ error: 'Failed to create/update checklist template' });
  }
});

app.put('/api/permits/:id/checklist', async (req, res) => {
  try {
    const packageId = parseInt(req.params.id);
    const { items } = req.body; // Array of { checklistItemId, isCompleted, notes, completedBy }
    
    // Update checklist items
    const updates = items.map(item => 
      prisma.packageChecklistItem.update({
        where: {
          packageChecklistId_checklistItemId: {
            packageChecklistId: item.packageChecklistId,
            checklistItemId: item.checklistItemId
          }
        },
        data: {
          isCompleted: item.isCompleted,
          completedAt: item.isCompleted ? new Date() : null,
          completedBy: item.completedBy || null,
          notes: item.notes || null
        }
      })
    );
    
    await Promise.all(updates);
    
    // Return updated package
    const updatedPackage = await prisma.package.findUnique({
      where: { id: packageId },
      include: {
        documents: true,
        contractor: true,
        checklists: {
          include: {
            items: {
              include: {
                checklistItem: true
              },
              orderBy: {
                checklistItem: {
                  order: 'asc'
                }
              }
            }
          }
        }
      }
    });
    
    res.json(updatedPackage);
  } catch (error) {
    console.error('Update package checklist error:', error);
    res.status(500).json({ error: 'Failed to update package checklist' });
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
