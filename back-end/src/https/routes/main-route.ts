import type { FastifyInstance } from 'fastify';
import { healthRoutes } from './health-route.js';
import { clinicRoutes } from './clinic-route.js';
import { authRoutes } from './auth-route.js';

export async function mainRoutes(app: FastifyInstance) {
  app.register(healthRoutes, { prefix: '/health' });
  app.register(clinicRoutes, { prefix: '/clinics' });
  app.register(authRoutes, { prefix: '/auth' });
}
