import { prisma } from '../../lib/prisma.js';
import type { PetWeightRecordSource } from '../../generated/prisma/client.js';

const petWeightRecordSelect = {
  id: true,
  clinicId: true,
  petId: true,
  weightKg: true,
  recordedAt: true,
  source: true,
  consultationId: true,
  veterinarianId: true,
  createdAt: true,
  veterinarian: { select: { id: true, name: true } },
} as const;

export class PetWeightPrismaRepository {
  async findManyByPet(clinicId: string, petId: string) {
    return prisma.petWeightRecord.findMany({
      where: { clinicId, petId },
      select: petWeightRecordSelect,
      orderBy: { recordedAt: 'desc' },
    });
  }

  async create(
    clinicId: string,
    data: {
      petId: string;
      weightKg: number;
      source: PetWeightRecordSource;
      consultationId?: string;
      veterinarianId?: string;
      recordedAt?: Date;
    },
  ) {
    return prisma.petWeightRecord.create({
      data: {
        clinicId,
        petId: data.petId,
        weightKg: data.weightKg,
        source: data.source,
        ...data.consultationId !== undefined && { consultationId: data.consultationId },
        ...data.veterinarianId !== undefined && { veterinarianId: data.veterinarianId },
        ...data.recordedAt !== undefined && { recordedAt: data.recordedAt },
      },
      select: petWeightRecordSelect,
    });
  }
}
