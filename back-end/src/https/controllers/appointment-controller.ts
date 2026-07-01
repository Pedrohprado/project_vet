import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppointmentService } from '../../services/appointment-service.js';
import { HttpError } from '../../services/erros/http-error.js';
import {
  createAppointmentSchema,
  listAppointmentsQuerySchema,
} from '../schemas/appointment-schema.js';

const appointmentService = new AppointmentService();

export async function listAppointments(request: FastifyRequest, reply: FastifyReply) {
  const parsed = listAppointmentsQuerySchema.safeParse(request.query);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Parâmetros inválidos';
    throw new HttpError(firstError, 400);
  }

  const appointments = await appointmentService.listInRange(
    request.tenantId,
    parsed.data,
  );

  return reply.status(200).send(appointments);
}

export async function getAppointment(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const appointment = await appointmentService.getById(request.tenantId, id);

  return reply.status(200).send(appointment);
}

export async function createAppointment(request: FastifyRequest, reply: FastifyReply) {
  const parsed = createAppointmentSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const appointment = await appointmentService.create(
    request.tenantId,
    request.authUser.id,
    parsed.data,
  );

  return reply.status(201).send(appointment);
}
