import { prisma } from '../../lib/prisma.js';

const tutorSelect = {
  id: true,
  clinicId: true,
  name: true,
  document: true,
  phone: true,
  whatsapp: true,
  email: true,
  zipCode: true,
  street: true,
  number: true,
  complement: true,
  neighborhood: true,
  city: true,
  state: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} as const;

const petSummarySelect = {
  id: true,
  name: true,
  species: true,
  breed: true,
  sex: true,
  birthDate: true,
  color: true,
  weightKg: true,
  isCastrated: true,
  createdAt: true,
} as const;

export class TutorPrismaRepository {
  async findMany(clinicId: string, query: string | undefined, page: number, limit: number) {
    const where = {
      clinicId,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' as const } },
              { phone: { contains: query } },
              { whatsapp: { contains: query } },
              { document: { contains: query } },
              { email: { contains: query, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.tutor.findMany({
        where,
        select: {
          ...tutorSelect,
          pets: { select: petSummarySelect },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tutor.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(clinicId: string, id: string) {
    return prisma.tutor.findFirst({
      where: { id, clinicId },
      select: {
        ...tutorSelect,
        pets: { select: petSummarySelect, orderBy: { name: 'asc' } },
      },
    });
  }

  async create(clinicId: string, data: {
    name: string;
    document?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    zipCode?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    notes?: string;
  }) {
    return prisma.tutor.create({
      data: { ...data, clinicId },
      select: tutorSelect,
    });
  }

  async update(clinicId: string, id: string, data: Partial<{
    name: string;
    document?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    zipCode?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    notes?: string;
  }>) {
    return prisma.tutor.update({
      where: { id, clinicId },
      data,
      select: tutorSelect,
    });
  }
}
