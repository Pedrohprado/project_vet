-- CreateEnum
CREATE TYPE "PrescriptionDocumentType" AS ENUM ('SIMPLE', 'SPECIAL_CONTROL');

-- CreateEnum
CREATE TYPE "PrescriptionPharmacyType" AS ENUM ('HUMAN', 'VETERINARY');

-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "prescriptionDocumentType" "PrescriptionDocumentType" NOT NULL DEFAULT 'SIMPLE';

-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN     "pharmacyType" "PrescriptionPharmacyType",
ADD COLUMN     "quantity" TEXT,
ADD COLUMN     "routeOfAdministration" TEXT;
