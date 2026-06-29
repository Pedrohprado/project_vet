import type { FastifyReply, FastifyRequest } from 'fastify';
import { UserPrismaRepository } from '../repositories/prisma/user-prisma-repository.js';
import { HttpError } from '../services/erros/http-error.js';
import { isAccessJwtPayload } from '../types/jwt-payload.js';

const userRepository = new UserPrismaRepository();

export async function authMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
) {
  try {
    await request.jwtVerify();
  } catch {
    throw new HttpError('Token inválido ou ausente', 401);
  }

  if (!isAccessJwtPayload(request.user)) {
    throw new HttpError('Token inválido ou ausente', 401);
  }

  const { sub: userId } = request.user;

  const user = await userRepository.findById(userId);

  if (!user?.isActive) {
    throw new HttpError('Usuário não autorizado', 401);
  }

  request.authUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    clinicId: user.clinicId,
  };
}
