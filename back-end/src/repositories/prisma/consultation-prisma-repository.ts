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

const consultationListSelect = {
  id: true,
  status: true,
  startedAt: true,
  finishedAt: true,
  tutor: { select: { id: true, name: true } },
  pet: { select: { id: true, name: true, species: true } },
  veterinarian: { select: { id: true, name: true } },
} as const;

export class ConsultationPrismaRepository {
  async findMany(
    clinicId: string,
    page: number,
    limit: number,
    range?: { start: Date; end: Date },
  ) {
    const where = {
      clinicId,
      ...(range
        ? { startedAt: { gte: range.start, lte: range.end } }
        : {}),
    };

    const orderBy = range
      ? ({ startedAt: 'asc' } as const)
      : ({ startedAt: 'desc' } as const);

    if (range) {
      const items = await prisma.consultation.findMany({
        where,
        select: consultationListSelect,
        orderBy,
      });

      return { items, total: items.length, page: 1, limit: items.length };
    }

    const [items, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        select: consultationListSelect,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.consultation.count({ where }),
    ]);

    return { items, total, page, limit };
  }

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
        pet: { select: { id: true, name: true, species: true, breed: true, photoUrl: true, birthDate: true, weightKg: true } },
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
        pet: { select: { id: true, name: true, species: true, breed: true, photoUrl: true, birthDate: true, weightKg: true } },
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

  async delete(clinicId: string, id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.prescription.deleteMany({ where: { consultationId: id } });
      await tx.notification.updateMany({
        where: { consultationId: id },
        data: { consultationId: null },
      });
      return tx.consultation.delete({ where: { id, clinicId } });
    });
  }
}
