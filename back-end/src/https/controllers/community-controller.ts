import type { FastifyReply, FastifyRequest } from 'fastify';
import { CommunityService } from '../../services/community-service.js';
import { HttpError } from '../../services/erros/http-error.js';
import {
  createCommunityCaseSchema,
  createCommunityCommentSchema,
  listCommunityCasesQuerySchema,
  updateCommunityCaseSchema,
} from '../schemas/community-schema.js';

const communityService = new CommunityService();

export async function listCommunityCases(request: FastifyRequest, reply: FastifyReply) {
  const parsed = listCommunityCasesQuerySchema.safeParse(request.query);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Parâmetros inválidos';
    throw new HttpError(firstError, 400);
  }

  const result = await communityService.list(request.authUser.id, parsed.data);
  return reply.status(200).send(result);
}

export async function getCommunityCase(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const communityCase = await communityService.getById(request.authUser.id, id);
  return reply.status(200).send(communityCase);
}

export async function createCommunityCase(request: FastifyRequest, reply: FastifyReply) {
  const parsed = createCommunityCaseSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const communityCase = await communityService.create(
    request.authUser.id,
    request.authUser.clinicId,
    parsed.data,
  );

  return reply.status(201).send(communityCase);
}

export async function updateCommunityCase(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const parsed = updateCommunityCaseSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const communityCase = await communityService.update(
    request.authUser.id,
    id,
    parsed.data,
  );

  return reply.status(200).send(communityCase);
}

export async function deleteCommunityCase(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  await communityService.delete(request.authUser.id, id);
  return reply.status(204).send();
}

export async function likeCommunityCase(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const communityCase = await communityService.like(request.authUser.id, id);
  return reply.status(200).send(communityCase);
}

export async function unlikeCommunityCase(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const communityCase = await communityService.unlike(request.authUser.id, id);
  return reply.status(200).send(communityCase);
}

export async function listCommunityCaseComments(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const comments = await communityService.listComments(request.authUser.id, id);
  return reply.status(200).send(comments);
}

export async function createCommunityCaseComment(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const parsed = createCommunityCommentSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const comment = await communityService.createComment(
    request.authUser.id,
    id,
    parsed.data,
  );

  return reply.status(201).send(comment);
}

export async function deleteCommunityCaseComment(request: FastifyRequest, reply: FastifyReply) {
  const { id, commentId } = request.params as { id: string; commentId: string };
  await communityService.deleteComment(request.authUser.id, id, commentId);
  return reply.status(204).send();
}
