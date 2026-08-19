import { prisma } from '../../lib/prisma.js';

export class WaitlistPrismaRepository {
  async findByEmail(email: string) {
    return prisma.waitlistSignup.findUnique({
      where: { email },
    });
  }

  async create(data: {
    email: string;
    clinicName?: string;
    planInterest?: string;
  }) {
    return prisma.waitlistSignup.create({ data });
  }

  async list() {
    return prisma.waitlistSignup.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
