import { prisma } from '../../lib/prisma.js';

const vaccinationSelect = {
  id: true,
  clinicId: true,
  appointmentId: true,
  petId: true,
  veterinarianId: true,
  vaccineCatalogItemId: true,
  vaccineName: true,
  dose: true,
  batch: true,
  manufacturer: true,
  appliedAt: true,
  nextDoseAt: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} as const;

const vaccinationListSelect = {
  id: true,
  vaccineName: true,
  appliedAt: true,
  createdAt: true,
  pet: {
    select: {
      id: true,
      name: true,
      species: true,
      tutor: { select: { id: true, name: true } },
    },
  },
  veterinarian: { select: { id: true, name: true } },
} as const;

const vaccinationDetailInclude = {
  tutor: {
    select: {
      id: true,
      name: true,
      phone: true,
      whatsapp: true,
    },
  },
  pet: {
    select: {
      id: true,
      name: true,
      species: true,
      breed: true,
      photoUrl: true,
      birthDate: true,
      tutorId: true,
    },
  },
  veterinarian: { select: { id: true, name: true } },
  vaccineCatalogItem: {
    select: {
      id: true,
      name: true,
      defaultIntervalDays: true,
    },
  },
} as const;

export class VaccinationPrismaRepository {
  async findMany(clinicId: string, page: number, limit: number) {
    const where = { clinicId };

    const [items, total] = await Promise.all([
      prisma.vaccination.findMany({
        where,
        select: vaccinationListSelect,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vaccination.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(clinicId: string, id: string) {
    return prisma.vaccination.findFirst({
      where: { id, clinicId },
      select: {
        ...vaccinationSelect,
        pet: {
          select: {
            ...vaccinationDetailInclude.pet.select,
            tutor: vaccinationDetailInclude.tutor,
          },
        },
        veterinarian: vaccinationDetailInclude.veterinarian,
        vaccineCatalogItem: vaccinationDetailInclude.vaccineCatalogItem,
      },
    });
  }

  async findOpenByPet(clinicId: string, petId: string) {
    return prisma.vaccination.findFirst({
      where: {
        clinicId,
        petId,
        appliedAt: null,
      },
      select: {
        ...vaccinationSelect,
        pet: {
          select: {
            ...vaccinationDetailInclude.pet.select,
            tutor: vaccinationDetailInclude.tutor,
          },
        },
        veterinarian: vaccinationDetailInclude.veterinarian,
        vaccineCatalogItem: vaccinationDetailInclude.vaccineCatalogItem,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findManyByPet(clinicId: string, petId: string) {
    return prisma.vaccination.findMany({
      where: { clinicId, petId },
      select: {
        ...vaccinationSelect,
        veterinarian: vaccinationDetailInclude.veterinarian,
        vaccineCatalogItem: vaccinationDetailInclude.vaccineCatalogItem,
      },
      orderBy: [{ appliedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(
    clinicId: string,
    data: {
      petId: string;
      veterinarianId: string;
      appointmentId?: string;
    },
  ) {
    return prisma.vaccination.create({
      data: { ...data, clinicId },
      select: vaccinationSelect,
    });
  }

  async update(
    clinicId: string,
    id: string,
    data: Partial<{
      vaccineCatalogItemId: string | null;
      vaccineName: string;
      dose: string;
      batch: string;
      manufacturer: string;
      nextDoseAt: Date | null;
      notes: string;
      appliedAt: Date;
    }>,
  ) {
    return prisma.vaccination.update({
      where: { id, clinicId },
      data,
      select: {
        ...vaccinationSelect,
        pet: {
          select: {
            ...vaccinationDetailInclude.pet.select,
            tutor: vaccinationDetailInclude.tutor,
          },
        },
        veterinarian: vaccinationDetailInclude.veterinarian,
        vaccineCatalogItem: vaccinationDetailInclude.vaccineCatalogItem,
      },
    });
  }

  async delete(clinicId: string, id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.notification.updateMany({
        where: { vaccinationId: id },
        data: { status: 'CANCELLED' },
      });
      return tx.vaccination.delete({ where: { id, clinicId } });
    });
  }
}
