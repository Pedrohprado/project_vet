import type { FastifyInstance } from 'fastify';
import {
  addConsultationAttachment,
  addPrescription,
  cancelScheduledReturn,
  createConsultation,
  createReturnConsultation,
  deleteConsultation,
  downloadPrescriptionPdf,
  finishConsultation,
  generatePostSummary,
  getConsultation,
  getOpenConsultationByPet,
  getOpenReturnConsultationByParent,
  getReturnScheduledConsultationByPet,
  listConsultationAttachments,
  listConsultations,
  removeConsultationAttachment,
  removePrescription,
  updateConsultation,
} from '../controllers/consultation-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { tenantMiddleware } from '../../middlewares/tenant-middleware.js';

const protectedHandlers = [authMiddleware, tenantMiddleware];

export async function consultationRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: protectedHandlers }, listConsultations);
  app.post('/', { preHandler: protectedHandlers }, createConsultation);
  app.post(
    '/:parentId/return',
    { preHandler: protectedHandlers },
    createReturnConsultation,
  );
  app.get(
    '/:parentId/open-return',
    { preHandler: protectedHandlers },
    getOpenReturnConsultationByParent,
  );
  app.delete(
    '/:parentId/return-scheduled',
    { preHandler: protectedHandlers },
    cancelScheduledReturn,
  );
  app.get(
    '/pets/:petId/open',
    { preHandler: protectedHandlers },
    getOpenConsultationByPet,
  );
  app.get(
    '/pets/:petId/return-scheduled',
    { preHandler: protectedHandlers },
    getReturnScheduledConsultationByPet,
  );
  app.get(
    '/:id/prescription.pdf',
    { preHandler: protectedHandlers },
    downloadPrescriptionPdf,
  );
  app.get(
    '/:id/attachments',
    { preHandler: protectedHandlers },
    listConsultationAttachments,
  );
  app.post(
    '/:id/attachments',
    { preHandler: protectedHandlers },
    addConsultationAttachment,
  );
  app.delete(
    '/:id/attachments/:attachmentId',
    { preHandler: protectedHandlers },
    removeConsultationAttachment,
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
  app.post(
    '/:id/post-summary',
    { preHandler: protectedHandlers },
    generatePostSummary,
  );
  app.delete('/:id', { preHandler: protectedHandlers }, deleteConsultation);
}
