import type { FastifyInstance } from 'fastify';
import { trackFunnelEvent } from '../controllers/analytics-controller.js';

export async function analyticsRoutes(app: FastifyInstance) {
  app.post('/events', trackFunnelEvent);
}
