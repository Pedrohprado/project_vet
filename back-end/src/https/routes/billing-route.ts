import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { tenantMiddleware } from '../../middlewares/tenant-middleware.js';
import { selectPixBilling } from '../controllers/billing-controller.js';

export async function billingRoutes(app: FastifyInstance) {
  app.post(
    '/select-pix',
    { preHandler: [authMiddleware, tenantMiddleware] },
    selectPixBilling,
  );
}
