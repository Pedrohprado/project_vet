import { PaymentMethod, PaymentStatus } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';

const clinicBillingSelect = {
  id: true,
  name: true,
  document: true,
  phone: true,
  whatsapp: true,
  email: true,
  plan: true,
  isActive: true,
  paymentMethod: true,
  paymentStatus: true,
  createdAt: true,
} as const;

export class BillingPrismaRepository {
  async selectPix(clinicId: string) {
    return prisma.clinic.update({
      where: { id: clinicId },
      data: {
        paymentMethod: PaymentMethod.PIX,
        paymentStatus: PaymentStatus.PAID,
      },
      select: clinicBillingSelect,
    });
  }
}
