/*
  Warnings:

  - A unique constraint covering the columns `[companyName,licenseNumber]` on the table `Subcontractor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Subcontractor_companyName_licenseNumber_key" ON "Subcontractor"("companyName", "licenseNumber");
