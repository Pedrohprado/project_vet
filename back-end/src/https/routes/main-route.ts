import type { FastifyInstance } from 'fastify';
import { healthRoutes } from './health-route.js';
import { clinicRoutes } from './clinic-route.js';
import { authRoutes } from './auth-route.js';
import { tutorRoutes } from './tutor-route.js';
import { petRoutes } from './pet-route.js';
import { appointmentRoutes } from './appointment-route.js';
import { consultationRoutes } from './consultation-route.js';

export async function mainRoutes(app: FastifyInstance) {
  app.register(healthRoutes, { prefix: '/health' });
  app.register(clinicRoutes, { prefix: '/clinics' });
  app.register(authRoutes, { prefix: '/auth' });
  app.register(tutorRoutes, { prefix: '/tutors' });
  app.register(petRoutes, { prefix: '/pets' });
  app.register(appointmentRoutes, { prefix: '/appointments' });
  app.register(consultationRoutes, { prefix: '/consultations' });
}
