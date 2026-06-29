import type { FastifyInstance } from 'fastify';
import { login, me } from '../controllers/auth-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', login);
  app.get('/me', { preHandler: authMiddleware }, me);
}
