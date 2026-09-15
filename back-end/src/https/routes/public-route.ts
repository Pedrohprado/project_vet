import type { FastifyInstance } from 'fastify';
import { getPublicStats } from '../controllers/analytics-controller.js';

export async function publicRoutes(app: FastifyInstance) {
  app.get('/stats', getPublicStats);
}
