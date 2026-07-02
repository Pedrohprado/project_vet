import { prisma } from '../../lib/prisma.js';

const catalogSelect = {
  id: true,
  name: true,
  manufacturer: true,
  defaultIntervalDays: true,
  species: true,
  isActive: true,
} as const;

export class VaccineCatalogPrismaRepository {
  async findActiveByClinic(clinicId: string) {
    return prisma.vaccineCatalogItem.findMany({
      where: { clinicId, isActive: true },
      select: catalogSelect,
      orderBy: { name: 'asc' },
    });
  }

  async findById(clinicId: string, id: string) {
    return prisma.vaccineCatalogItem.findFirst({
      where: { id, clinicId, isActive: true },
      select: catalogSelect,
    });
  }
}
