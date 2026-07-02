import type { FastifyInstance } from 'fastify';
import { login, logout, me, refresh, completeWelcome, updateProfile, saveSignature, removeSignature } from '../controllers/auth-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', login);
  app.post('/refresh', refresh);
  app.post('/logout', logout);
  app.get('/me', { preHandler: authMiddleware }, me);
  app.patch('/me', { preHandler: authMiddleware }, updateProfile);
  app.put('/me/signature', { preHandler: authMiddleware }, saveSignature);
  app.delete('/me/signature', { preHandler: authMiddleware }, removeSignature);
  app.post('/complete-welcome', { preHandler: authMiddleware }, completeWelcome);
}
