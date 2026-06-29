import type { FastifyReply, FastifyRequest } from 'fastify';
import { ConsultationService } from '../../services/consultation-service.js';
import { HttpError } from '../../services/erros/http-error.js';
import {
  createConsultationSchema,
  createPrescriptionSchema,
  finishConsultationSchema,
  updateConsultationSchema,
} from '../schemas/consultation-schema.js';

const consultationService = new ConsultationService();

export async function getOpenConsultationByPet(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { petId } = request.params as { petId: string };
  const consultation = await consultationService.getOpenByPet(
    request.tenantId,
    petId,
  );

  if (!consultation) {
    throw new HttpError('Nenhuma consulta em andamento', 404);
  }

  return reply.status(200).send(consultation);
}

export async function getConsultation(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const consultation = await consultationService.getById(request.tenantId, id);

  return reply.status(200).send(consultation);
}

export async function createConsultation(request: FastifyRequest, reply: FastifyReply) {
  const parsed = createConsultationSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const consultation = await consultationService.create(
    request.tenantId,
    request.authUser.id,
    parsed.data,
  );

  return reply.status(201).send(consultation);
}

export async function updateConsultation(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const parsed = updateConsultationSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const consultation = await consultationService.update(
    request.tenantId,
    id,
    parsed.data,
  );

  return reply.status(200).send(consultation);
}

export async function addPrescription(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const parsed = createPrescriptionSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const prescription = await consultationService.addPrescription(
    request.tenantId,
    id,
    parsed.data,
  );

  return reply.status(201).send(prescription);
}

export async function removePrescription(request: FastifyRequest, reply: FastifyReply) {
  const { id, prescriptionId } = request.params as {
    id: string;
    prescriptionId: string;
  };

  await consultationService.removePrescription(
    request.tenantId,
    id,
    prescriptionId,
  );

  return reply.status(204).send();
}

export async function finishConsultation(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const parsed = finishConsultationSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const consultation = await consultationService.finish(
    request.tenantId,
    request.authUser.id,
    id,
    parsed.data,
  );

  return reply.status(200).send(consultation);
}
