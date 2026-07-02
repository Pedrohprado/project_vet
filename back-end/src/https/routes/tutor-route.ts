import type { FastifyInstance } from 'fastify';
import {
  createTutor,
  createPetForTutor,
  deleteTutor,
  getTutor,
  listTutors,
  updateTutor,
} from '../controllers/tutor-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { tenantMiddleware } from '../../middlewares/tenant-middleware.js';

const protectedHandlers = [authMiddleware, tenantMiddleware];

export async function tutorRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: protectedHandlers }, listTutors);
  app.post('/', { preHandler: protectedHandlers }, createTutor);
  app.get('/:id', { preHandler: protectedHandlers }, getTutor);
  app.put('/:id', { preHandler: protectedHandlers }, updateTutor);
  app.delete('/:id', { preHandler: protectedHandlers }, deleteTutor);
  app.post('/:tutorId/pets', { preHandler: protectedHandlers }, createPetForTutor);
}
