import type { FastifyReply, FastifyRequest } from 'fastify';
import { PetService } from '../../services/pet-service.js';
import { HttpError } from '../../services/erros/http-error.js';
import { updatePetSchema } from '../schemas/pet-schema.js';

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

  const pet = await petService.update(request.tenantId, request.authUser.id, id, parsed.data);

  return reply.status(200).send(pet);
}

export async function uploadPetPhoto(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };

  let fileBuffer: Buffer | null = null;
  let mimeType: string | undefined;

  const parts = request.parts();

  for await (const part of parts) {
    if (part.type === 'file' && part.fieldname === 'photo') {
      fileBuffer = await part.toBuffer();
      mimeType = part.mimetype;
    }
  }

  if (!fileBuffer) {
    throw new HttpError('Foto do pet é obrigatória', 400);
  }

  const pet = await petService.uploadPhoto(request.tenantId, id, {
    buffer: fileBuffer,
    ...(mimeType ? { mimeType } : {}),
  });

  return reply.status(200).send(pet);
}

export async function deletePetPhoto(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const pet = await petService.deletePhoto(request.tenantId, id);

  return reply.status(200).send(pet);
}
