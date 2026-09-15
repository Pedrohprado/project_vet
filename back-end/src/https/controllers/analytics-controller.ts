import type { FastifyReply, FastifyRequest } from 'fastify';
import { AnalyticsService } from '../../services/analytics-service.js';
import { HttpError } from '../../services/erros/http-error.js';
import { trackFunnelEventSchema } from '../schemas/analytics-schema.js';

const analyticsService = new AnalyticsService();

export async function trackFunnelEvent(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = trackFunnelEventSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const result = await analyticsService.trackEvent(parsed.data);
  return reply.status(201).send(result);
}

export async function getPublicStats(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const stats = await analyticsService.getPublicStats();
  return reply.status(200).send(stats);
}
