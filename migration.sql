-- Manual migration for PermitPro database schema update
-- This migration adds the checklist system and fixes contractor schema

BEGIN;

-- Step 1: Create new checklist tables
CREATE TABLE "ChecklistTemplate" (
    "id" SERIAL NOT NULL,
    "county" TEXT NOT NULL,
    "permitType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChecklistItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "checklistTemplateId" INTEGER NOT NULL,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PackageChecklist" (
    "id" SERIAL NOT NULL,
    "packageId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageChecklist_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PackageChecklistItem" (
    "id" SERIAL NOT NULL,
    "packageChecklistId" INTEGER NOT NULL,
    "checklistItemId" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "notes" TEXT,

    CONSTRAINT "PackageChecklistItem_pkey" PRIMARY KEY ("id")
);

-- Step 2: Update Contractor table to use licenseNumber as primary key
-- First, we need to handle existing data

-- Add the new contractorLicense column to Package table
ALTER TABLE "Package" ADD COLUMN "contractorLicense" TEXT;

-- Update existing packages to use license numbers instead of IDs
UPDATE "Package" SET "contractorLicense" = (
    SELECT "licenseNumber" FROM "Contractor" WHERE "Contractor"."id" = "Package"."contractorId"
) WHERE "contractorId" IS NOT NULL;

-- Drop the old foreign key constraint
ALTER TABLE "Package" DROP CONSTRAINT "Package_contractorId_fkey";

-- Drop the contractorId column
ALTER TABLE "Package" DROP COLUMN "contractorId";

-- Now update the Contractor table structure
-- Create a new contractor table with license as primary key
CREATE TABLE "Contractor_new" (
    "licenseNumber" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT,
    "contactPerson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contractor_new_pkey" PRIMARY KEY ("licenseNumber")
);

-- Copy data from old contractor table
INSERT INTO "Contractor_new" ("licenseNumber", "companyName", "address", "phoneNumber", "email", "contactPerson", "createdAt", "updatedAt")
SELECT "licenseNumber", "companyName", "address", "phoneNumber", "email", "contactPerson", "createdAt", "updatedAt"
FROM "Contractor";

-- Drop the old contractor table
DROP TABLE "Contractor";

-- Rename the new table
ALTER TABLE "Contractor_new" RENAME TO "Contractor";

-- Step 3: Add foreign key constraints and indexes
ALTER TABLE "Package" ADD CONSTRAINT "Package_contractorLicense_fkey" FOREIGN KEY ("contractorLicense") REFERENCES "Contractor"("licenseNumber") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_checklistTemplateId_fkey" FOREIGN KEY ("checklistTemplateId") REFERENCES "ChecklistTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PackageChecklist" ADD CONSTRAINT "PackageChecklist_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PackageChecklistItem" ADD CONSTRAINT "PackageChecklistItem_packageChecklistId_fkey" FOREIGN KEY ("packageChecklistId") REFERENCES "PackageChecklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PackageChecklistItem" ADD CONSTRAINT "PackageChecklistItem_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "ChecklistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 4: Create unique constraints and indexes
CREATE UNIQUE INDEX "ChecklistTemplate_county_permitType_key" ON "ChecklistTemplate"("county", "permitType");
CREATE UNIQUE INDEX "PackageChecklist_packageId_key" ON "PackageChecklist"("packageId");
CREATE UNIQUE INDEX "PackageChecklistItem_packageChecklistId_checklistItemId_key" ON "PackageChecklistItem"("packageChecklistId", "checklistItemId");
CREATE UNIQUE INDEX "Contractor_licenseNumber_key" ON "Contractor"("licenseNumber");

COMMIT;
