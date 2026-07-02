-- CreateEnum
CREATE TYPE "PetWeightRecordSource" AS ENUM ('REGISTRATION', 'CONSULTATION', 'MANUAL');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_clinicId_fkey";

-- CreateTable
CREATE TABLE "PetWeightRecord" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "weightKg" DECIMAL(6,2) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "PetWeightRecordSource" NOT NULL,
    "consultationId" TEXT,
    "veterinarianId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetWeightRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PetWeightRecord_clinicId_idx" ON "PetWeightRecord"("clinicId");

-- CreateIndex
CREATE INDEX "PetWeightRecord_petId_recordedAt_idx" ON "PetWeightRecord"("petId", "recordedAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetWeightRecord" ADD CONSTRAINT "PetWeightRecord_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetWeightRecord" ADD CONSTRAINT "PetWeightRecord_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetWeightRecord" ADD CONSTRAINT "PetWeightRecord_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetWeightRecord" ADD CONSTRAINT "PetWeightRecord_veterinarianId_fkey" FOREIGN KEY ("veterinarianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill weight history from existing pets
INSERT INTO "PetWeightRecord" ("id", "clinicId", "petId", "weightKg", "recordedAt", "source", "createdAt")
SELECT gen_random_uuid(), "clinicId", "id", "weightKg", "createdAt", 'REGISTRATION', "createdAt"
FROM "Pet"
WHERE "weightKg" IS NOT NULL;
