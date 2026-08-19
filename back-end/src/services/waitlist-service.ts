import { pickDefined } from '../lib/pick-defined.js';
import { WaitlistPrismaRepository } from '../repositories/prisma/waitlist-prisma-repository.js';

const waitlistRepository = new WaitlistPrismaRepository();

export class WaitlistService {
  async join(input: {
    email: string;
    clinicName?: string | undefined;
    planInterest?: string | undefined;
  }) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existing = await waitlistRepository.findByEmail(normalizedEmail);

    if (existing) {
      return {
        alreadyExists: true as const,
        message: 'Você já está na lista de espera. Entraremos em contato em breve.',
      };
    }

    await waitlistRepository.create({
      email: normalizedEmail,
      ...pickDefined({
        clinicName: input.clinicName?.trim() || undefined,
        planInterest: input.planInterest?.trim() || undefined,
      }),
    });

    return {
      alreadyExists: false as const,
      message: 'E-mail registrado! Você entrou na lista de espera.',
    };
  }

  async listSignups() {
    return waitlistRepository.list();
  }
}
