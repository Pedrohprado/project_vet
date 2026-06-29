import { prisma } from '../../lib/prisma.js';
import { ConsultationStatus } from '../../generated/prisma/client.js';

const prescriptionSelect = {
  id: true,
  medicineName: true,
  dosage: true,
  frequency: true,
  duration: true,
  instructions: true,
  createdAt: true,
} as const;

const consultationSelect = {
  id: true,
  clinicId: true,
  appointmentId: true,
  tutorId: true,
  petId: true,
  veterinarianId: true,
  status: true,
  startedAt: true,
  finishedAt: true,
  weightKg: true,
  temperature: true,
  mainComplaint: true,
  history: true,
  physicalExam: true,
  diagnosis: true,
  conduct: true,
  observations: true,
  needsReturn: true,
  returnDate: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class ConsultationPrismaRepository {
  async findOpenByPet(clinicId: string, petId: string) {
    return prisma.consultation.findFirst({
      where: {
        clinicId,
        petId,
        status: ConsultationStatus.OPEN,
      },
      select: {
        ...consultationSelect,
        prescriptions: { select: prescriptionSelect, orderBy: { createdAt: 'asc' } },
        tutor: { select: { id: true, name: true, phone: true, whatsapp: true } },
        pet: { select: { id: true, name: true, species: true, breed: true } },
        veterinarian: { select: { id: true, name: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findById(clinicId: string, id: string) {
    return prisma.consultation.findFirst({
      where: { id, clinicId },
      select: {
        ...consultationSelect,
        prescriptions: { select: prescriptionSelect, orderBy: { createdAt: 'asc' } },
        tutor: { select: { id: true, name: true, phone: true, whatsapp: true } },
        pet: { select: { id: true, name: true, species: true, breed: true } },
        veterinarian: { select: { id: true, name: true } },
      },
    });
  }

  async create(clinicId: string, data: {
    tutorId: string;
    petId: string;
    veterinarianId: string;
    appointmentId?: string;
  }) {
    return prisma.consultation.create({
      data: { ...data, clinicId },
      select: {
        ...consultationSelect,
        prescriptions: { select: prescriptionSelect },
      },
    });
  }

  async update(clinicId: string, id: string, data: Partial<{
    mainComplaint?: string;
    history?: string;
    physicalExam?: string;
    weightKg?: number;
    temperature?: number;
    diagnosis?: string;
    conduct?: string;
    observations?: string;
    needsReturn?: boolean;
    returnDate?: Date;
    status?: ConsultationStatus;
    finishedAt?: Date;
  }>) {
    return prisma.consultation.update({
      where: { id, clinicId },
      data,
      select: {
        ...consultationSelect,
        prescriptions: { select: prescriptionSelect, orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async addPrescription(consultationId: string, data: {
    medicineName: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }) {
    return prisma.prescription.create({
      data: { ...data, consultationId },
      select: prescriptionSelect,
    });
  }

  async removePrescription(consultationId: string, prescriptionId: string) {
    return prisma.prescription.deleteMany({
      where: { id: prescriptionId, consultationId },
    });
  }
}
