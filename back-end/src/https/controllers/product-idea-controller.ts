import type { FastifyReply, FastifyRequest } from 'fastify';
import { HttpError } from '../../services/erros/http-error.js';
import { ProductIdeaService } from '../../services/product-idea-service.js';
import {
  createProductIdeaSchema,
  moveProductIdeaSchema,
} from '../schemas/product-idea-schema.js';

const productIdeaService = new ProductIdeaService();

export async function listProductIdeas(_request: FastifyRequest, reply: FastifyReply) {
  const ideas = await productIdeaService.list();
  return reply.status(200).send({ items: ideas });
}

export async function createProductIdea(request: FastifyRequest, reply: FastifyReply) {
  const parsed = createProductIdeaSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const idea = await productIdeaService.create(request.authUser.id, parsed.data);
  return reply.status(201).send(idea);
}

export async function moveProductIdea(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const parsed = moveProductIdeaSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const idea = await productIdeaService.move(request.authUser.role, id, parsed.data);
  return reply.status(200).send(idea);
}
