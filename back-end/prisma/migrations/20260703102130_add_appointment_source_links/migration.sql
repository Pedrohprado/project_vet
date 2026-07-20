-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "sourceConsultationId" TEXT,
ADD COLUMN     "sourceVaccinationId" TEXT;

-- CreateIndex
CREATE INDEX "Appointment_sourceConsultationId_idx" ON "Appointment"("sourceConsultationId");

-- CreateIndex
CREATE INDEX "Appointment_sourceVaccinationId_idx" ON "Appointment"("sourceVaccinationId");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_sourceConsultationId_fkey" FOREIGN KEY ("sourceConsultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_sourceVaccinationId_fkey" FOREIGN KEY ("sourceVaccinationId") REFERENCES "Vaccination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
