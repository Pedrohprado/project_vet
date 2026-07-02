import type { FastifyReply, FastifyRequest } from 'fastify';
import { PlatformService } from '../../services/platform-service.js';
import { HttpError } from '../../services/erros/http-error.js';
import {
  listPlatformClinicsQuerySchema,
  listPlatformTutorsQuerySchema,
  updateClinicStatusSchema,
} from '../schemas/platform-schema.js';

const platformService = new PlatformService();

export async function getPlatformStats(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const stats = await platformService.getStats();
  return reply.status(200).send(stats);
}

export async function listPlatformClinics(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = listPlatformClinicsQuerySchema.safeParse(request.query);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Parâmetros inválidos';
    throw new HttpError(firstError, 400);
  }

  const result = await platformService.listClinics(parsed.data);
  return reply.status(200).send(result);
}

export async function updatePlatformClinicStatus(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as { id: string };
  const parsed = updateClinicStatusSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const clinic = await platformService.updateClinicStatus(id, parsed.data.isActive);
  return reply.status(200).send(clinic);
}

export async function listPlatformTutors(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = listPlatformTutorsQuerySchema.safeParse(request.query);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Parâmetros inválidos';
    throw new HttpError(firstError, 400);
  }

  const result = await platformService.listTutors(parsed.data);
  return reply.status(200).send(result);
}
