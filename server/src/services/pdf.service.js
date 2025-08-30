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
