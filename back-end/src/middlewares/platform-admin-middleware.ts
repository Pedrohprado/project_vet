import type { FastifyReply, FastifyRequest } from 'fastify';
import { UserRole } from '../generated/prisma/client.js';
import { HttpError } from '../services/erros/http-error.js';

export async function platformAdminMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
) {
  if (request.authUser.role !== UserRole.SUPER_ADMIN) {
    throw new HttpError('Acesso restrito a administradores da plataforma', 403);
  }
}
