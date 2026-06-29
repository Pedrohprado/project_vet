import type { FastifyInstance } from 'fastify';
import { registerClinic } from '../controllers/clinic-controller.js';

export async function clinicRoutes(app: FastifyInstance) {
  app.post('/', registerClinic);
}
