/*
  Migration: Add Contractor System
  This migration safely adds contractor functionality while preserving existing data
*/

-- Step 1: Create the Contractor table first
CREATE TABLE "Contractor" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT,
    "contactPerson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contractor_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create a default contractor for existing packages
INSERT INTO "Contractor" ("companyName", "licenseNumber", "address", "phoneNumber", "email", "contactPerson", "createdAt", "updatedAt")
VALUES ('Default Contractor', 'DEFAULT-001', 'Address Not Specified', 'Phone Not Specified', 'default@example.com', 'System Default', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Step 3: Add contractorId column with default value (this will assign all existing packages to the default contractor)
ALTER TABLE "Package" ADD COLUMN "contractorId" INTEGER NOT NULL DEFAULT 1;

-- Step 4: Create Subcontractor table
CREATE TABLE "Subcontractor" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "licenseNumber" TEXT,
    "address" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "contactPerson" TEXT,
    "tradeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contractorId" INTEGER NOT NULL,

    CONSTRAINT "Subcontractor_pkey" PRIMARY KEY ("id")
);

-- Step 5: Create PackageSubcontractor junction table
CREATE TABLE "PackageSubcontractor" (
    "id" SERIAL NOT NULL,
    "packageId" INTEGER NOT NULL,
    "subcontractorId" INTEGER NOT NULL,
    "tradeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackageSubcontractor_pkey" PRIMARY KEY ("id")
);

-- Step 6: Create indexes
CREATE UNIQUE INDEX "Contractor_licenseNumber_key" ON "Contractor"("licenseNumber");
CREATE UNIQUE INDEX "PackageSubcontractor_packageId_subcontractorId_key" ON "PackageSubcontractor"("packageId", "subcontractorId");

-- Step 7: Add foreign key constraints
ALTER TABLE "Subcontractor" ADD CONSTRAINT "Subcontractor_contractorId_fkey" 
    FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Package" ADD CONSTRAINT "Package_contractorId_fkey" 
    FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PackageSubcontractor" ADD CONSTRAINT "PackageSubcontractor_packageId_fkey" 
    FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PackageSubcontractor" ADD CONSTRAINT "PackageSubcontractor_subcontractorId_fkey" 
    FOREIGN KEY ("subcontractorId") REFERENCES "Subcontractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
