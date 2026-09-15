import { BillingPrismaRepository } from '../repositories/prisma/billing-prisma-repository.js';
import { HttpError } from './erros/http-error.js';

const billingRepository = new BillingPrismaRepository();

export class BillingService {
  async selectPix(clinicId: string | null | undefined) {
    if (!clinicId) {
      throw new HttpError('Clínica não identificada', 403);
    }

    try {
      const clinic = await billingRepository.selectPix(clinicId);
      return { clinic };
    } catch {
      throw new HttpError('Clínica não encontrada', 404);
    }
  }
}
