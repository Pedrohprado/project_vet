import type { FastifyReply, FastifyRequest } from 'fastify';
import { TutorService } from '../../services/tutor-service.js';
import { PetService } from '../../services/pet-service.js';
import { HttpError } from '../../services/erros/http-error.js';
import { createPetSchema } from '../schemas/pet-schema.js';
import {
  createTutorSchema,
  listTutorsQuerySchema,
  updateTutorSchema,
} from '../schemas/tutor-schema.js';

const tutorService = new TutorService();
const petService = new PetService();

export async function listTutors(request: FastifyRequest, reply: FastifyReply) {
  const parsed = listTutorsQuerySchema.safeParse(request.query);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Parâmetros inválidos';
    throw new HttpError(firstError, 400);
  }

  const result = await tutorService.list(request.tenantId, parsed.data);

  return reply.status(200).send(result);
}

export async function getTutor(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const tutor = await tutorService.getById(request.tenantId, id);

  return reply.status(200).send(tutor);
}

export async function createTutor(request: FastifyRequest, reply: FastifyReply) {
  const parsed = createTutorSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const tutor = await tutorService.create(request.tenantId, parsed.data);

  return reply.status(201).send(tutor);
}

export async function updateTutor(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const parsed = updateTutorSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const tutor = await tutorService.update(request.tenantId, id, parsed.data);

  return reply.status(200).send(tutor);
}

export async function createPetForTutor(request: FastifyRequest, reply: FastifyReply) {
  const { tutorId } = request.params as { tutorId: string };
  const parsed = createPetSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const pet = await petService.create(request.tenantId, tutorId, parsed.data);

  return reply.status(201).send(pet);
}

export async function deleteTutor(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  await tutorService.delete(request.tenantId, id);

  return reply.status(204).send();
}
