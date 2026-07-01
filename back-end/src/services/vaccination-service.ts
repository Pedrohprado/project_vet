import { AppointmentType } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { buildVaccineCatalogCreateMany } from '../lib/seed-vaccine-catalog.js';
import { pickDefined } from '../lib/pick-defined.js';
import { VaccinationPrismaRepository } from '../repositories/prisma/vaccination-prisma-repository.js';
import { VaccineCatalogPrismaRepository } from '../repositories/prisma/vaccine-catalog-prisma-repository.js';
import { AppointmentService } from './appointment-service.js';
import { NotificationService } from './notification-service.js';
import { PetService } from './pet-service.js';
import { HttpError } from './erros/http-error.js';
import type {
  CreateVaccinationInput,
  FinishVaccinationInput,
  UpdateVaccinationInput,
} from '../https/schemas/vaccination-schema.js';

const vaccinationRepository = new VaccinationPrismaRepository();
const vaccineCatalogRepository = new VaccineCatalogPrismaRepository();
const petService = new PetService();
const appointmentService = new AppointmentService();
const notificationService = new NotificationService();

export class VaccinationService {
  async listCatalog(tenantId: string) {
    let catalog = await vaccineCatalogRepository.findActiveByClinic(tenantId);

    if (catalog.length === 0) {
      await prisma.vaccineCatalogItem.createMany({
        data: buildVaccineCatalogCreateMany(tenantId),
        skipDuplicates: true,
      });
      catalog = await vaccineCatalogRepository.findActiveByClinic(tenantId);
    }

    return catalog;
  }

  async getById(tenantId: string, id: string) {
    const vaccination = await vaccinationRepository.findById(tenantId, id);

    if (!vaccination) {
      throw new HttpError('Vacinação não encontrada', 404);
    }

    return vaccination;
  }

  async getOpenByPet(tenantId: string, petId: string) {
    await petService.getById(tenantId, petId);
    return vaccinationRepository.findOpenByPet(tenantId, petId);
  }

  async listByPet(tenantId: string, petId: string) {
    await petService.getById(tenantId, petId);
    return vaccinationRepository.findManyByPet(tenantId, petId);
  }

  async list(tenantId: string, query: { page: number; limit: number }) {
    return vaccinationRepository.findMany(tenantId, query.page, query.limit);
  }

  async delete(tenantId: string, id: string) {
    const vaccination = await this.getById(tenantId, id);

    if (vaccination.appliedAt) {
      throw new HttpError('Não é possível excluir vacinação já aplicada', 400);
    }

    await notificationService.cancelPendingVaccineReminders(id);
    await vaccinationRepository.delete(tenantId, id);
  }

  async create(
    tenantId: string,
    userId: string,
    input: CreateVaccinationInput,
  ) {
    await petService.validateOwnership(tenantId, input.petId, input.tutorId);

    const openVaccination = await vaccinationRepository.findOpenByPet(
      tenantId,
      input.petId,
    );

    if (openVaccination) {
      throw new HttpError(
        'Já existe uma vacinação em andamento para este pet',
        409,
      );
    }

    if (input.appointmentId) {
      const appointment = await appointmentService.getById(
        tenantId,
        input.appointmentId,
      );

      if (appointment.type !== AppointmentType.VACCINATION) {
        throw new HttpError('Agendamento não é do tipo vacinação', 400);
      }

      if (
        appointment.tutorId !== input.tutorId ||
        appointment.petId !== input.petId
      ) {
        throw new HttpError(
          'Agendamento não corresponde ao tutor/pet informados',
          400,
        );
      }

      await appointmentService.confirm(tenantId, input.appointmentId);
    }

    return vaccinationRepository.create(tenantId, {
      petId: input.petId,
      veterinarianId: userId,
      ...pickDefined({ appointmentId: input.appointmentId }),
    });
  }

  async update(tenantId: string, id: string, input: UpdateVaccinationInput) {
    const vaccination = await this.getById(tenantId, id);

    if (vaccination.appliedAt) {
      throw new HttpError('Vacinação já foi finalizada', 400);
    }

    if (input.vaccineCatalogItemId) {
      const catalogItem = await vaccineCatalogRepository.findById(
        tenantId,
        input.vaccineCatalogItemId,
      );

      if (!catalogItem) {
        throw new HttpError('Vacina do catálogo não encontrada', 404);
      }
    }

    const nextDoseAt =
      input.nextDoseAt === null
        ? null
        : input.nextDoseAt ?? undefined;

    return vaccinationRepository.update(tenantId, id, pickDefined({
      vaccineCatalogItemId:
        input.vaccineCatalogItemId === null
          ? null
          : input.vaccineCatalogItemId,
      vaccineName: input.vaccineName,
      dose: input.dose,
      batch: input.batch,
      manufacturer: input.manufacturer,
      nextDoseAt,
      notes: input.notes,
    }));
  }

  async finish(
    tenantId: string,
    id: string,
    input: FinishVaccinationInput,
  ) {
    const vaccination = await this.getById(tenantId, id);

    if (vaccination.appliedAt) {
      throw new HttpError('Vacinação já foi finalizada', 400);
    }

    let vaccineName = input.vaccineName ?? vaccination.vaccineName;

    if (input.vaccineCatalogItemId) {
      const catalogItem = await vaccineCatalogRepository.findById(
        tenantId,
        input.vaccineCatalogItemId,
      );

      if (!catalogItem) {
        throw new HttpError('Vacina do catálogo não encontrada', 404);
      }

      vaccineName = catalogItem.name;
    } else if (vaccination.vaccineCatalogItemId && !vaccineName?.trim()) {
      const catalogItem = await vaccineCatalogRepository.findById(
        tenantId,
        vaccination.vaccineCatalogItemId,
      );
      if (catalogItem) {
        vaccineName = catalogItem.name;
      }
    }

    if (!vaccineName?.trim()) {
      throw new HttpError('Nome da vacina é obrigatório', 400);
    }

    const appliedAt = input.appliedAt ?? new Date();
    const nextDoseAt =
      input.nextDoseAt === null
        ? null
        : input.nextDoseAt ?? vaccination.nextDoseAt ?? undefined;

    const result = await prisma.$transaction(async () => {
      const updated = await vaccinationRepository.update(tenantId, id, {
        ...pickDefined({
          vaccineCatalogItemId:
            input.vaccineCatalogItemId === null
              ? null
              : input.vaccineCatalogItemId ?? vaccination.vaccineCatalogItemId ?? undefined,
          dose: input.dose ?? vaccination.dose ?? undefined,
          batch: input.batch ?? vaccination.batch ?? undefined,
          manufacturer:
            input.manufacturer ?? vaccination.manufacturer ?? undefined,
          notes: input.notes ?? vaccination.notes ?? undefined,
          nextDoseAt,
        }),
        vaccineName: vaccineName.trim(),
        appliedAt,
      });

      if (vaccination.appointmentId) {
        await appointmentService.complete(tenantId, vaccination.appointmentId);
      }

      await notificationService.cancelPendingVaccineReminders(id);

      if (nextDoseAt) {
        const tutor = updated.pet.tutor;
        await notificationService.createVaccineReminder({
          clinicId: tenantId,
          tutorId: tutor.id,
          petId: updated.petId,
          vaccinationId: id,
          tutorName: tutor.name,
          recipientPhone: tutor.whatsapp ?? tutor.phone,
          petName: updated.pet.name,
          vaccineName: vaccineName.trim(),
          nextDoseAt,
        });
      }

      return updated;
    });

    return result;
  }
}
