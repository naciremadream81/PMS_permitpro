/*
  Warnings:

  - You are about to drop the column `contractorId` on the `Subcontractor` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Subcontractor" DROP CONSTRAINT "Subcontractor_contractorId_fkey";

-- AlterTable
ALTER TABLE "Subcontractor" DROP COLUMN "contractorId";
