import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { platformAdminMiddleware } from '../../middlewares/platform-admin-middleware.js';
import {
  getPlatformStats,
  listPlatformClinics,
  listPlatformTutors,
  updatePlatformClinicStatus,
} from '../controllers/platform-controller.js';

const protectedHandlers = [authMiddleware, platformAdminMiddleware];

export async function platformRoutes(app: FastifyInstance) {
  app.get('/stats', { preHandler: protectedHandlers }, getPlatformStats);
  app.get('/clinics', { preHandler: protectedHandlers }, listPlatformClinics);
  app.patch('/clinics/:id', { preHandler: protectedHandlers }, updatePlatformClinicStatus);
  app.get('/tutors', { preHandler: protectedHandlers }, listPlatformTutors);
}
