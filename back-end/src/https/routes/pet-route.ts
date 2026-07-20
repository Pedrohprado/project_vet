import type { FastifyInstance } from 'fastify';
import {
  deletePetPhoto,
  getPet,
  getPetTimeline,
  updatePet,
  uploadPetPhoto,
} from '../controllers/pet-controller.js';
import {
  createPetWeightRecord,
  listPetWeightRecords,
} from '../controllers/pet-weight-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { tenantMiddleware } from '../../middlewares/tenant-middleware.js';

const protectedHandlers = [authMiddleware, tenantMiddleware];

export async function petRoutes(app: FastifyInstance) {
  app.get('/:id/weight-records', { preHandler: protectedHandlers }, listPetWeightRecords);
  app.post('/:id/weight-records', { preHandler: protectedHandlers }, createPetWeightRecord);
  app.get('/:id/timeline', { preHandler: protectedHandlers }, getPetTimeline);
  app.put('/:id/photo', { preHandler: protectedHandlers }, uploadPetPhoto);
  app.delete('/:id/photo', { preHandler: protectedHandlers }, deletePetPhoto);
  app.get('/:id', { preHandler: protectedHandlers }, getPet);
  app.put('/:id', { preHandler: protectedHandlers }, updatePet);
}
