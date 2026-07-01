import type { FastifyInstance } from 'fastify';
import { getClinicSummary } from '../controllers/stats-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { tenantMiddleware } from '../../middlewares/tenant-middleware.js';

const protectedHandlers = [authMiddleware, tenantMiddleware];

export async function statsRoutes(app: FastifyInstance) {
  app.get('/summary', { preHandler: protectedHandlers }, getClinicSummary);
}
