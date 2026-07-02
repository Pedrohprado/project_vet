import type { FastifyReply, FastifyRequest } from 'fastify';
import { PetWeightService } from '../../services/pet-weight-service.js';
import { HttpError } from '../../services/erros/http-error.js';
import { createPetWeightRecordSchema } from '../schemas/pet-weight-schema.js';

const petWeightService = new PetWeightService();

export async function listPetWeightRecords(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as { id: string };
  const records = await petWeightService.listByPet(request.tenantId, id);

  return reply.status(200).send(records);
}

export async function createPetWeightRecord(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as { id: string };
  const parsed = createPetWeightRecordSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const record = await petWeightService.create(
    request.tenantId,
    request.authUser.id,
    id,
    parsed.data,
  );

  return reply.status(201).send(record);
}
