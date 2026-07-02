/*
  Warnings:

  - Added the required column `veterinarianId` to the `Vaccination` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vaccination" ADD COLUMN     "vaccineCatalogItemId" TEXT,
ADD COLUMN     "veterinarianId" TEXT NOT NULL,
ALTER COLUMN "vaccineName" SET DEFAULT '';

-- CreateTable
CREATE TABLE "VaccineCatalogItem" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT,
    "defaultIntervalDays" INTEGER,
    "species" "PetSpecies",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaccineCatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VaccineCatalogItem_clinicId_idx" ON "VaccineCatalogItem"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "VaccineCatalogItem_clinicId_name_key" ON "VaccineCatalogItem"("clinicId", "name");

-- AddForeignKey
ALTER TABLE "VaccineCatalogItem" ADD CONSTRAINT "VaccineCatalogItem_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccination" ADD CONSTRAINT "Vaccination_veterinarianId_fkey" FOREIGN KEY ("veterinarianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccination" ADD CONSTRAINT "Vaccination_vaccineCatalogItemId_fkey" FOREIGN KEY ("vaccineCatalogItemId") REFERENCES "VaccineCatalogItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
