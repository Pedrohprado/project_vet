import type { FastifyInstance } from 'fastify';
import {
  createVaccination,
  deleteVaccination,
  finishVaccination,
  getOpenVaccinationByPet,
  getVaccination,
  listVaccinations,
  listVaccinationsByPet,
  listVaccineCatalog,
  updateVaccination,
} from '../controllers/vaccination-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { tenantMiddleware } from '../../middlewares/tenant-middleware.js';

const protectedHandlers = [authMiddleware, tenantMiddleware];

export async function vaccinationRoutes(app: FastifyInstance) {
  app.get('/catalog', { preHandler: protectedHandlers }, listVaccineCatalog);
  app.get('/', { preHandler: protectedHandlers }, listVaccinations);
  app.post('/', { preHandler: protectedHandlers }, createVaccination);
  app.get(
    '/pets/:petId/open',
    { preHandler: protectedHandlers },
    getOpenVaccinationByPet,
  );
  app.get(
    '/pets/:petId',
    { preHandler: protectedHandlers },
    listVaccinationsByPet,
  );
  app.get('/:id', { preHandler: protectedHandlers }, getVaccination);
  app.patch('/:id', { preHandler: protectedHandlers }, updateVaccination);
  app.post('/:id/finish', { preHandler: protectedHandlers }, finishVaccination);
  app.delete('/:id', { preHandler: protectedHandlers }, deleteVaccination);
}
