import type { FastifyInstance } from 'fastify';
import { login, logout, me, refresh, completeWelcome } from '../controllers/auth-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', login);
  app.post('/refresh', refresh);
  app.post('/logout', logout);
  app.get('/me', { preHandler: authMiddleware }, me);
  app.post('/complete-welcome', { preHandler: authMiddleware }, completeWelcome);
}
