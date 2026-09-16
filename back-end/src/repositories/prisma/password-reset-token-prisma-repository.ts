import { prisma } from '../../lib/prisma.js';

export class PasswordResetTokenPrismaRepository {
  async invalidateActiveForUser(userId: string) {
    await prisma.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { usedAt: new Date() },
    });
  }

  async create(data: {
    userId: string;
    codeHash: string;
    expiresAt: Date;
  }) {
    return prisma.passwordResetToken.create({
      data,
      select: {
        id: true,
        userId: true,
        codeHash: true,
        expiresAt: true,
        usedAt: true,
        createdAt: true,
      },
    });
  }

  async findActiveByUserId(userId: string) {
    return prisma.passwordResetToken.findMany({
      where: {
        userId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        codeHash: true,
        expiresAt: true,
        usedAt: true,
        createdAt: true,
      },
    });
  }

  async markUsed(id: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }
}
