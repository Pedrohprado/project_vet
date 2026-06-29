import type { FastifyInstance } from 'fastify';
import {
  createAppointment,
  getAppointment,
} from '../controllers/appointment-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { tenantMiddleware } from '../../middlewares/tenant-middleware.js';

const protectedHandlers = [authMiddleware, tenantMiddleware];

export async function appointmentRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: protectedHandlers }, createAppointment);
  app.get('/:id', { preHandler: protectedHandlers }, getAppointment);
}
