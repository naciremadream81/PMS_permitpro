const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create default user
  const user = await prisma.user.upsert({
    where: { email: 'admin@permitpro.com' },
    update: {},
    create: {
      email: 'admin@permitpro.com',
      name: 'Admin User',
      role: 'Administrator'
    }
  });

  // Create default contractor
  const defaultContractor = await prisma.contractor.upsert({
    where: { licenseNumber: 'DEFAULT-001' },
    update: {},
    create: {
      companyName: 'Default Contractor',
      licenseNumber: 'DEFAULT-001',
      address: 'Address Not Specified',
      phoneNumber: 'Phone Not Specified',
      email: 'default@example.com',
      contactPerson: 'System Default'
    }
  });

  // Create sample packages
  const package1 = await prisma.package.create({
    data: {
      customerName: 'John Doe',
      propertyAddress: '123 Main St, Miami, FL',
      county: 'Miami-Dade',
      permitType: 'Mobile Home Permit',
      status: 'Draft',
      contractorId: defaultContractor.id
    }
  });

  const package2 = await prisma.package.create({
    data: {
      customerName: 'Jane Smith',
      propertyAddress: '456 Oak Ave, Orlando, FL',
      county: 'Orange',
      permitType: 'Modular Home Permit',
      status: 'Submitted',
      contractorId: defaultContractor.id
    }
  });

  const package3 = await prisma.package.create({
    data: {
      customerName: 'Bob Johnson',
      propertyAddress: '789 Pine St, Tampa, FL',
      county: 'Hillsborough',
      permitType: 'Shed Permit',
      status: 'Completed',
      contractorId: defaultContractor.id
    }
  });

  console.log('Database seeded successfully!');
  console.log('Created user:', user);
  console.log('Created packages:', package1, package2, package3);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
