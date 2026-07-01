import type { FastifyReply, FastifyRequest } from 'fastify';
import { PetService } from '../../services/pet-service.js';
import { HttpError } from '../../services/erros/http-error.js';
import { createPetSchema, updatePetSchema } from '../schemas/pet-schema.js';

const petService = new PetService();

export async function getPetTimeline(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const timeline = await petService.getTimeline(request.tenantId, id);

  return reply.status(200).send(timeline);
}

export async function getPet(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const pet = await petService.getById(request.tenantId, id);

  return reply.status(200).send(pet);
}

export async function updatePet(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const parsed = updatePetSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const pet = await petService.update(request.tenantId, id, parsed.data);

  return reply.status(200).send(pet);
}
