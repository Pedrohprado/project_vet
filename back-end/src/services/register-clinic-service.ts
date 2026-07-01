import { UserRole } from '../generated/prisma/client.js';
import { hashPassword } from '../lib/password.js';
import { prisma } from '../lib/prisma.js';
import { ClinicPrismaRepository } from '../repositories/prisma/clinic-prisma-repository.js';
import { UserPrismaRepository } from '../repositories/prisma/user-prisma-repository.js';
import { HttpError } from './erros/http-error.js';
import type { RegisterClinicInput } from '../https/schemas/register-clinic-schema.js';
import { buildVaccineCatalogCreateMany } from '../lib/seed-vaccine-catalog.js';

const userRepository = new UserPrismaRepository();
const clinicRepository = new ClinicPrismaRepository();

export class RegisterClinicService {
  async execute(input: RegisterClinicInput) {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new HttpError('E-mail já cadastrado', 409);
    }

    const existingDocument = await clinicRepository.findByDocumentDigits(
      input.document,
    );

    if (existingDocument) {
      throw new HttpError('CPF já cadastrado', 409);
    }

    const existingPhone = await userRepository.findByPhoneDigits(input.phone);

    if (existingPhone) {
      throw new HttpError('Celular já cadastrado', 409);
    }

    const hashedPassword = await hashPassword(input.password);

    const result = await prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: {
          name: input.clinicName,
          document: input.document,
          phone: input.phone,
          whatsapp: input.phone,
          email: input.email,
        },
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

      const user = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          phone: input.phone,
          role: UserRole.ADMIN,
          clinicId: clinic.id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          clinicId: true,
          phone: true,
          crmv: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });

      await tx.vaccineCatalogItem.createMany({
        data: buildVaccineCatalogCreateMany(clinic.id),
      });

      return { clinic, user };
    });

    return result;
  }
}
