import {
  ConsultationStatus,
  PetWeightRecordSource,
} from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { ConsultationPrismaRepository } from '../repositories/prisma/consultation-prisma-repository.js';
import { PetPrismaRepository } from '../repositories/prisma/pet-prisma-repository.js';
import { PetWeightPrismaRepository } from '../repositories/prisma/pet-weight-prisma-repository.js';
import { HttpError } from './erros/http-error.js';
import type { CreatePetWeightRecordInput } from '../https/schemas/pet-weight-schema.js';

const petRepository = new PetPrismaRepository();
const petWeightRepository = new PetWeightPrismaRepository();
const consultationRepository = new ConsultationPrismaRepository();

export class PetWeightService {
  async listByPet(tenantId: string, petId: string) {
    const pet = await petRepository.findById(tenantId, petId);

    if (!pet) {
      throw new HttpError('Pet não encontrado', 404);
    }

    return petWeightRepository.findManyByPet(tenantId, petId);
  }

  async create(
    tenantId: string,
    userId: string,
    petId: string,
    input: CreatePetWeightRecordInput,
  ) {
    const pet = await petRepository.findById(tenantId, petId);

    if (!pet) {
      throw new HttpError('Pet não encontrado', 404);
    }

    let consultationId: string | undefined;

    if (input.consultationId) {
      const consultation = await consultationRepository.findById(
        tenantId,
        input.consultationId,
      );

      if (!consultation) {
        throw new HttpError('Consulta não encontrada', 404);
      }

      if (consultation.petId !== petId) {
        throw new HttpError('Consulta não pertence a este pet', 400);
      }

      if (consultation.status !== ConsultationStatus.OPEN) {
        throw new HttpError('Consulta não está aberta para edição', 400);
      }

      consultationId = consultation.id;
    }

    const source = consultationId
      ? PetWeightRecordSource.CONSULTATION
      : PetWeightRecordSource.MANUAL;

    return prisma.$transaction(async () => {
      const record = await petWeightRepository.create(tenantId, {
        petId,
        weightKg: input.weightKg,
        source,
        ...(consultationId !== undefined && { consultationId }),
        veterinarianId: userId,
      });

      await petRepository.update(tenantId, petId, { weightKg: input.weightKg });

      if (consultationId) {
        await consultationRepository.update(tenantId, consultationId, {
          weightKg: input.weightKg,
        });
      }

      return record;
    });
  }

  async createRegistrationRecord(
    tenantId: string,
    petId: string,
    weightKg: number,
    recordedAt?: Date,
  ) {
    return petWeightRepository.create(tenantId, {
      petId,
      weightKg,
      source: PetWeightRecordSource.REGISTRATION,
      ...(recordedAt !== undefined && { recordedAt }),
    });
  }

  async createManualRecordIfChanged(
    tenantId: string,
    userId: string,
    petId: string,
    previousWeightKg: number | null | undefined,
    newWeightKg: number,
  ) {
    const previous = previousWeightKg != null ? Number(previousWeightKg) : null;

    if (previous !== null && previous === newWeightKg) {
      return null;
    }

    return prisma.$transaction(async () => {
      const record = await petWeightRepository.create(tenantId, {
        petId,
        weightKg: newWeightKg,
        source: PetWeightRecordSource.MANUAL,
        veterinarianId: userId,
      });

      await petRepository.update(tenantId, petId, { weightKg: newWeightKg });

      return record;
    });
  }
}
