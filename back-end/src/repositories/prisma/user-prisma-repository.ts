import type { UserRole } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  clinicId: true,
  phone: true,
  crmv: true,
  isActive: true,
  createdAt: true,
} as const;

export class UserPrismaRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email },
      select: {
        ...userSelect,
        password: true,
      },
    });
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    clinicId: string;
    phone?: string;
    crmv?: string;
    role?: UserRole;
  }) {
    return prisma.user.create({
      data,
      select: userSelect,
    });
  }
}
