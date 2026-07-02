import type { FastifyReply, FastifyRequest } from 'fastify';
import { StatsService } from '../../services/stats-service.js';

const statsService = new StatsService();

export async function getClinicSummary(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const summary = await statsService.getClinicSummary(request.tenantId);

  return reply.status(200).send(summary);
}
