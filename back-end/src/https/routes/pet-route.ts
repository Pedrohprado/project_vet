import type { FastifyInstance } from 'fastify';
import { getPet, updatePet } from '../controllers/pet-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { tenantMiddleware } from '../../middlewares/tenant-middleware.js';

const protectedHandlers = [authMiddleware, tenantMiddleware];

export async function petRoutes(app: FastifyInstance) {
  app.get('/:id', { preHandler: protectedHandlers }, getPet);
  app.put('/:id', { preHandler: protectedHandlers }, updatePet);
}
