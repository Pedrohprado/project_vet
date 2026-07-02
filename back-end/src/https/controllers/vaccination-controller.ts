import type { FastifyReply, FastifyRequest } from 'fastify';
import { VaccinationService } from '../../services/vaccination-service.js';
import { HttpError } from '../../services/erros/http-error.js';
import {
  createVaccinationSchema,
  dueVaccinationsQuerySchema,
  finishVaccinationSchema,
  listVaccinationsQuerySchema,
  updateVaccinationSchema,
} from '../schemas/vaccination-schema.js';

const vaccinationService = new VaccinationService();

export async function listVaccinations(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = listVaccinationsQuerySchema.safeParse(request.query);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Parâmetros inválidos';
    throw new HttpError(firstError, 400);
  }

  const result = await vaccinationService.list(request.tenantId, parsed.data);

  return reply.status(200).send(result);
}

export async function listDueVaccinations(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = dueVaccinationsQuerySchema.safeParse(request.query);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Parâmetros inválidos';
    throw new HttpError(firstError, 400);
  }

  const items = await vaccinationService.listDue(request.tenantId, parsed.data);

  return reply.status(200).send(items);
}

export async function listVaccineCatalog(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const catalog = await vaccinationService.listCatalog(request.tenantId);
  return reply.status(200).send(catalog);
}

export async function getOpenVaccinationByPet(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { petId } = request.params as { petId: string };
  const vaccination = await vaccinationService.getOpenByPet(
    request.tenantId,
    petId,
  );

  if (!vaccination) {
    throw new HttpError('Nenhuma vacinação em andamento', 404);
  }

  return reply.status(200).send(vaccination);
}

export async function listVaccinationsByPet(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { petId } = request.params as { petId: string };
  const vaccinations = await vaccinationService.listByPet(
    request.tenantId,
    petId,
  );

  return reply.status(200).send(vaccinations);
}

export async function getVaccination(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const vaccination = await vaccinationService.getById(request.tenantId, id);

  return reply.status(200).send(vaccination);
}

export async function createVaccination(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = createVaccinationSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const vaccination = await vaccinationService.create(
    request.tenantId,
    request.authUser.id,
    parsed.data,
  );

  return reply.status(201).send(vaccination);
}

export async function updateVaccination(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as { id: string };
  const parsed = updateVaccinationSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const vaccination = await vaccinationService.update(
    request.tenantId,
    id,
    parsed.data,
  );

  return reply.status(200).send(vaccination);
}

export async function finishVaccination(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as { id: string };
  const parsed = finishVaccinationSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const vaccination = await vaccinationService.finish(
    request.tenantId,
    id,
    parsed.data,
  );

  return reply.status(200).send(vaccination);
}

export async function deleteVaccination(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as { id: string };
  await vaccinationService.delete(request.tenantId, id);

  return reply.status(204).send();
}
