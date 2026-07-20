import type { FastifyInstance } from 'fastify';
import {
  createCommunityCase,
  createCommunityCaseComment,
  deleteCommunityCase,
  deleteCommunityCaseComment,
  getCommunityCase,
  likeCommunityCase,
  listCommunityCaseComments,
  listCommunityCases,
  unlikeCommunityCase,
  updateCommunityCase,
} from '../controllers/community-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';

const protectedHandlers = [authMiddleware];

export async function communityRoutes(app: FastifyInstance) {
  app.get('/cases', { preHandler: protectedHandlers }, listCommunityCases);
  app.post('/cases', { preHandler: protectedHandlers }, createCommunityCase);
  app.get('/cases/:id', { preHandler: protectedHandlers }, getCommunityCase);
  app.patch('/cases/:id', { preHandler: protectedHandlers }, updateCommunityCase);
  app.delete('/cases/:id', { preHandler: protectedHandlers }, deleteCommunityCase);

  app.post('/cases/:id/likes', { preHandler: protectedHandlers }, likeCommunityCase);
  app.delete('/cases/:id/likes', { preHandler: protectedHandlers }, unlikeCommunityCase);

  app.get('/cases/:id/comments', { preHandler: protectedHandlers }, listCommunityCaseComments);
  app.post('/cases/:id/comments', { preHandler: protectedHandlers }, createCommunityCaseComment);
  app.delete(
    '/cases/:id/comments/:commentId',
    { preHandler: protectedHandlers },
    deleteCommunityCaseComment,
  );
}
