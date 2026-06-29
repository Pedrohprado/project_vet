import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../../env/index.js';
import { UserPrismaRepository } from '../../repositories/prisma/user-prisma-repository.js';
import { LoginService } from '../../services/login-service.js';
import { HttpError } from '../../services/erros/http-error.js';
import { loginSchema } from '../schemas/login-schema.js';
import type { JwtPayload } from '../../types/jwt-payload.js';
import { getClinicById } from './clinic-controller.js';

const loginService = new LoginService();
const userRepository = new UserPrismaRepository();

function setAuthCookie(reply: FastifyReply, token: string) {
  reply.setCookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const parsed = loginSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const { user, clinic } = await loginService.execute(parsed.data);

  const token = await reply.jwtSign({
    sub: user.id,
    role: user.role,
    clinicId: user.clinicId,
  } satisfies JwtPayload);

  setAuthCookie(reply, token);

  return reply.status(200).send({ user, clinic });
}

export async function me(request: FastifyRequest, reply: FastifyReply) {
  const user = await userRepository.findById(request.authUser.id);

  if (!user) {
    throw new HttpError('Usuário não encontrado', 404);
  }

  const clinic = await getClinicById(request.authUser.clinicId);

  return reply.status(200).send({ user, clinic });
}
