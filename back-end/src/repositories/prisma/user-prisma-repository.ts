import type { UserRole } from '../../generated/prisma/client.js';
import { onlyDigits } from '../../lib/normalize.js';
import { prisma } from '../../lib/prisma.js';

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  clinicId: true,
  phone: true,
  crmv: true,
  signatureUrl: true,
  isActive: true,
  lastLoginAt: true,
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

  async findByPhoneDigits(phone: string) {
    const digits = onlyDigits(phone);

    if (digits.length < 10) {
      return null;
    }

    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "User"
      WHERE regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g') = ${digits}
      LIMIT 1
    `;

    return rows[0] ?? null;
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

  async updateLastLoginAt(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
      select: userSelect,
    });
  }

  async updateProfile(
    id: string,
    data: { crmv?: string | null; phone?: string | null },
  ) {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.crmv !== undefined ? { crmv: data.crmv } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
      },
      select: userSelect,
    });
  }

  async updateSignatureUrl(id: string, signatureUrl: string | null) {
    return prisma.user.update({
      where: { id },
      data: { signatureUrl },
      select: userSelect,
    });
  }
}
