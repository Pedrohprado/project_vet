import type { FastifyReply, FastifyRequest } from 'fastify';
import { WaitlistService } from '../../services/waitlist-service.js';
import { HttpError } from '../../services/erros/http-error.js';
import { joinWaitlistSchema } from '../schemas/waitlist-schema.js';

const waitlistService = new WaitlistService();

export async function joinWaitlist(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = joinWaitlistSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const result = await waitlistService.join(parsed.data);
  return reply.status(200).send(result);
}

export async function listWaitlistSignups(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const items = await waitlistService.listSignups();
  return reply.status(200).send({ items });
}
