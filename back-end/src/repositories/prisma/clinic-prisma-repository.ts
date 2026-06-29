import { prisma } from '../../lib/prisma.js';

export class ClinicPrismaRepository {
  async create(data: {
    name: string;
    document?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
  }) {
    return prisma.clinic.create({
      data,
      select: {
        id: true,
        name: true,
        document: true,
        phone: true,
        whatsapp: true,
        email: true,
        plan: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.clinic.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        document: true,
        phone: true,
        whatsapp: true,
        email: true,
        plan: true,
        isActive: true,
        createdAt: true,
      },
    });
  }
}
