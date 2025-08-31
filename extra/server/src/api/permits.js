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
            filePath: req.file.filename,
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

// POST /api/permits/:id/documents - Upload a document to a permit package
router.post('/:id/documents', protect, upload.single('document'), async (req, res) => {
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
        documentType: 'Document',
        permitPackageId: packageId
      }
    });
    
    // Return updated package with documents
    const updatedPackage = await prisma.permitPackage.findUnique({
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
