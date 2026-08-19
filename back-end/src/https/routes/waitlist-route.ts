import type { FastifyInstance } from 'fastify';
import { joinWaitlist } from '../controllers/waitlist-controller.js';

export async function waitlistRoutes(app: FastifyInstance) {
  app.post('/', joinWaitlist);
}
