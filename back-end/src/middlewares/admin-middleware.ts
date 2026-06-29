import type { FastifyReply, FastifyRequest } from 'fastify';
import { UserRole } from '../generated/prisma/client.js';
import { HttpError } from '../services/erros/http-error.js';

export async function adminMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
) {
  if (request.authUser.role !== UserRole.ADMIN) {
    throw new HttpError('Acesso restrito a administradores', 403);
  }
}
