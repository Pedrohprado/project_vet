import { prisma } from '../../lib/prisma.js';
import {
  AppointmentStatus,
  ConsultationStatus,
} from '../../generated/prisma/client.js';

const prescriptionSelect = {
  id: true,
  medicineName: true,
  dosage: true,
  frequency: true,
  duration: true,
  instructions: true,
  routeOfAdministration: true,
  pharmacyType: true,
  quantity: true,
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
  prescriptionDocumentType: true,
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
    prescriptionDocumentType?: 'SIMPLE' | 'SPECIAL_CONTROL';
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
    routeOfAdministration?: string;
    pharmacyType?: 'HUMAN' | 'VETERINARY';
    quantity?: string;
  }) {
    return prisma.prescription.create({
      data: { ...data, consultationId },
      select: prescriptionSelect,
    });
  }

  async findPrescriptionPdfData(clinicId: string, id: string) {
    return prisma.consultation.findFirst({
      where: { id, clinicId },
      select: {
        id: true,
        status: true,
        startedAt: true,
        finishedAt: true,
        prescriptionDocumentType: true,
        prescriptions: { select: prescriptionSelect, orderBy: { createdAt: 'asc' } },
        veterinarian: { select: { name: true, crmv: true, phone: true } },
        tutor: {
          select: {
            name: true,
            document: true,
            street: true,
            number: true,
            complement: true,
            neighborhood: true,
            city: true,
            state: true,
            zipCode: true,
          },
        },
        pet: { select: { id: true, name: true, species: true, breed: true } },
        clinic: { select: { name: true, phone: true } },
      },
    });
  }

  async removePrescription(consultationId: string, prescriptionId: string) {
    return prisma.prescription.deleteMany({
      where: { id: prescriptionId, consultationId },
    });
  }

  async delete(
    clinicId: string,
    id: string,
    appointmentId?: string | null,
    petId?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.prescription.deleteMany({ where: { consultationId: id } });
      await tx.notification.updateMany({
        where: { consultationId: id },
        data: { consultationId: null },
      });

      const weightRecords = await tx.petWeightRecord.findMany({
        where: { consultationId: id, clinicId },
        select: { id: true },
      });

      if (weightRecords.length > 0 && petId) {
        await tx.petWeightRecord.deleteMany({
          where: { consultationId: id, clinicId },
        });

        const latestRecord = await tx.petWeightRecord.findFirst({
          where: { petId, clinicId },
          orderBy: { recordedAt: 'desc' },
          select: { weightKg: true },
        });

        await tx.pet.update({
          where: { id: petId, clinicId },
          data: { weightKg: latestRecord?.weightKg ?? null },
        });
      }

      if (appointmentId) {
        await tx.appointment.updateMany({
          where: { id: appointmentId, clinicId },
          data: { status: AppointmentStatus.SCHEDULED },
        });
      }

      const result = await tx.consultation.deleteMany({
        where: { id, clinicId },
      });

      return result.count;
    });
  }
}
