import type { FastifyInstance } from 'fastify';
import {
  addPrescription,
  createConsultation,
  finishConsultation,
  getConsultation,
  getOpenConsultationByPet,
  removePrescription,
  updateConsultation,
} from '../controllers/consultation-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { tenantMiddleware } from '../../middlewares/tenant-middleware.js';

const protectedHandlers = [authMiddleware, tenantMiddleware];

export async function consultationRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: protectedHandlers }, createConsultation);
  app.get(
    '/pets/:petId/open',
    { preHandler: protectedHandlers },
    getOpenConsultationByPet,
  );
  app.get('/:id', { preHandler: protectedHandlers }, getConsultation);
  app.patch('/:id', { preHandler: protectedHandlers }, updateConsultation);
  app.post('/:id/prescriptions', { preHandler: protectedHandlers }, addPrescription);
  app.delete(
    '/:id/prescriptions/:prescriptionId',
    { preHandler: protectedHandlers },
    removePrescription,
  );
  app.post('/:id/finish', { preHandler: protectedHandlers }, finishConsultation);
}
