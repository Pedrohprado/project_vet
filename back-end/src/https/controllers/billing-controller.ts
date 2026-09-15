import type { FastifyReply, FastifyRequest } from 'fastify';
import { BillingService } from '../../services/billing-service.js';

const billingService = new BillingService();

export async function selectPixBilling(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const result = await billingService.selectPix(request.authUser.clinicId);
  return reply.status(200).send(result);
}
