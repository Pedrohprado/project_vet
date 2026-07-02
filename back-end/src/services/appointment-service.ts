import {
  AppointmentStatus,
  AppointmentType,
} from '../generated/prisma/client.js';
import { AppointmentPrismaRepository } from '../repositories/prisma/appointment-prisma-repository.js';
import { pickDefined } from '../lib/pick-defined.js';
import { PetService } from './pet-service.js';
import { HttpError } from './erros/http-error.js';
import type {
  CreateAppointmentInput,
  ListAppointmentsQuery,
} from '../https/schemas/appointment-schema.js';

const appointmentRepository = new AppointmentPrismaRepository();
const petService = new PetService();

export class AppointmentService {
  async listInRange(tenantId: string, query: ListAppointmentsQuery) {
    if (query.start > query.end) {
      throw new HttpError('Data inicial deve ser anterior à data final', 400);
    }

    return appointmentRepository.findManyInRange(tenantId, query.start, query.end);
  }

  async getById(tenantId: string, id: string) {
    const appointment = await appointmentRepository.findById(tenantId, id);

    if (!appointment) {
      throw new HttpError('Agendamento não encontrado', 404);
    }

    return appointment;
  }

  async create(
    tenantId: string,
    userId: string,
    input: CreateAppointmentInput,
  ) {
    await petService.validateOwnership(tenantId, input.petId, input.tutorId);

    const allowedTypes: AppointmentType[] = [
      AppointmentType.CONSULTATION,
      AppointmentType.VACCINATION,
    ];

    if (!allowedTypes.includes(input.type)) {
      throw new HttpError('Tipo de agendamento inválido', 400);
    }

    return appointmentRepository.create(tenantId, {
      tutorId: input.tutorId,
      petId: input.petId,
      type: input.type,
      scheduledAt: input.scheduledAt,
      durationMinutes: input.durationMinutes,
      veterinarianId: input.veterinarianId ?? userId,
      status: AppointmentStatus.SCHEDULED,
      ...pickDefined({
        title: input.title,
        description: input.description,
      }),
    });
  }

  async createReturn(
    tenantId: string,
    userId: string,
    data: {
      tutorId: string;
      petId: string;
      scheduledAt: Date;
      description?: string;
    },
  ) {
    return appointmentRepository.create(tenantId, {
      tutorId: data.tutorId,
      petId: data.petId,
      veterinarianId: userId,
      type: AppointmentType.RETURN,
      status: AppointmentStatus.SCHEDULED,
      scheduledAt: data.scheduledAt,
      title: 'Retorno',
      ...pickDefined({ description: data.description }),
    });
  }

  async confirm(tenantId: string, id: string) {
    await this.getById(tenantId, id);
    return appointmentRepository.updateStatus(tenantId, id, AppointmentStatus.CONFIRMED);
  }

  async complete(tenantId: string, id: string) {
    await this.getById(tenantId, id);
    return appointmentRepository.updateStatus(tenantId, id, AppointmentStatus.COMPLETED);
  }
}
