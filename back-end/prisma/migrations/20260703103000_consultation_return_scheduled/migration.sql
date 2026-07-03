-- AlterEnum
ALTER TYPE "ConsultationStatus" ADD VALUE 'RETURN_SCHEDULED' AFTER 'OPEN';

-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN "parentConsultationId" TEXT;

-- CreateIndex
CREATE INDEX "Consultation_parentConsultationId_idx" ON "Consultation"("parentConsultationId");

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_parentConsultationId_fkey" FOREIGN KEY ("parentConsultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate existing open consultations with scheduled return
UPDATE "Consultation"
SET
  "status" = 'RETURN_SCHEDULED',
  "finishedAt" = COALESCE("finishedAt", NOW())
WHERE
  "status" = 'OPEN'
  AND "needsReturn" = true
  AND "returnDate" IS NOT NULL
  AND "parentConsultationId" IS NULL;
