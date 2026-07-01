import { onlyDigits } from '../../lib/normalize.js';
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

  async findByDocumentDigits(document: string) {
    const digits = onlyDigits(document);

    if (digits.length < 11) {
      return null;
    }

    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Clinic"
      WHERE regexp_replace(COALESCE(document, ''), '[^0-9]', '', 'g') = ${digits}
      LIMIT 1
    `;

    return rows[0] ?? null;
  }
}
