import type { FastifyInstance } from 'fastify';
import { healthRoutes } from './health-route.js';
import { clinicRoutes } from './clinic-route.js';
import { authRoutes } from './auth-route.js';
import { tutorRoutes } from './tutor-route.js';
import { petRoutes } from './pet-route.js';
import { appointmentRoutes } from './appointment-route.js';
import { consultationRoutes } from './consultation-route.js';
import { communityRoutes } from './community-route.js';
import { statsRoutes } from './stats-route.js';
import { vaccinationRoutes } from './vaccination-route.js';
import { addressRoutes } from './address-route.js';
import { platformRoutes } from './platform-route.js';

export async function mainRoutes(app: FastifyInstance) {
  app.register(healthRoutes, { prefix: '/health' });
  app.register(clinicRoutes, { prefix: '/clinics' });
  app.register(authRoutes, { prefix: '/auth' });
  app.register(tutorRoutes, { prefix: '/tutors' });
  app.register(petRoutes, { prefix: '/pets' });
  app.register(appointmentRoutes, { prefix: '/appointments' });
  app.register(consultationRoutes, { prefix: '/consultations' });
  app.register(communityRoutes, { prefix: '/community' });
  app.register(vaccinationRoutes, { prefix: '/vaccinations' });
  app.register(statsRoutes, { prefix: '/stats' });
  app.register(addressRoutes, { prefix: '/address' });
  app.register(platformRoutes, { prefix: '/platform' });
}
