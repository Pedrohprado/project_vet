import { prisma } from '../../lib/prisma.js';
import type {
  ListPlatformClinicsQuery,
  ListPlatformTutorsQuery,
} from '../../https/schemas/platform-schema.js';

export class PlatformPrismaRepository {
  async getStats() {
    const [clinicsActive, clinicsInactive, tutors, pets] = await Promise.all([
      prisma.clinic.count({ where: { isActive: true } }),
      prisma.clinic.count({ where: { isActive: false } }),
      prisma.tutor.count(),
      prisma.pet.count(),
    ]);

    return {
      clinicsActive,
      clinicsInactive,
      clinicsTotal: clinicsActive + clinicsInactive,
      tutors,
      pets,
    };
  }

  async findClinics(query: ListPlatformClinicsQuery) {
    const where = {
      ...(query.status === 'active'
        ? { isActive: true }
        : query.status === 'inactive'
          ? { isActive: false }
          : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' as const } },
              { email: { contains: query.q, mode: 'insensitive' as const } },
              { document: { contains: query.q } },
              { phone: { contains: query.q } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.clinic.findMany({
        where,
        select: {
          id: true,
          name: true,
          document: true,
          phone: true,
          email: true,
          plan: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              tutors: true,
              pets: true,
              users: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.clinic.count({ where }),
    ]);

    return {
      items: items.map((clinic) => ({
        id: clinic.id,
        name: clinic.name,
        document: clinic.document,
        phone: clinic.phone,
        email: clinic.email,
        plan: clinic.plan,
        isActive: clinic.isActive,
        createdAt: clinic.createdAt,
        tutorsCount: clinic._count.tutors,
        petsCount: clinic._count.pets,
        usersCount: clinic._count.users,
      })),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async updateClinicStatus(id: string, isActive: boolean) {
    return prisma.clinic.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });
  }

  async findTutors(query: ListPlatformTutorsQuery) {
    const where = query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: 'insensitive' as const } },
            { email: { contains: query.q, mode: 'insensitive' as const } },
            { phone: { contains: query.q } },
            { whatsapp: { contains: query.q } },
            { document: { contains: query.q } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.tutor.findMany({
        where,
        select: {
          id: true,
          name: true,
          phone: true,
          whatsapp: true,
          email: true,
          createdAt: true,
          clinic: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: { pets: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.tutor.count({ where }),
    ]);

    return {
      items: items.map((tutor) => ({
        id: tutor.id,
        name: tutor.name,
        phone: tutor.phone,
        whatsapp: tutor.whatsapp,
        email: tutor.email,
        createdAt: tutor.createdAt,
        clinicId: tutor.clinic.id,
        clinicName: tutor.clinic.name,
        petsCount: tutor._count.pets,
      })),
      total,
      page: query.page,
      limit: query.limit,
    };
  }
}
