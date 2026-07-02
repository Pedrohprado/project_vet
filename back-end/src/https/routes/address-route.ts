import type { FastifyInstance } from 'fastify';
import { getAddressByCep } from '../controllers/address-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';

export async function addressRoutes(app: FastifyInstance) {
  app.get('/cep/:cep', { preHandler: [authMiddleware] }, getAddressByCep);
}
