import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import {
  createProductIdea,
  listProductIdeas,
  moveProductIdea,
} from '../controllers/product-idea-controller.js';

const protectedHandlers = [authMiddleware];

export async function productIdeaRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: protectedHandlers }, listProductIdeas);
  app.post('/', { preHandler: protectedHandlers }, createProductIdea);
  app.patch('/:id/move', { preHandler: protectedHandlers }, moveProductIdea);
}
