import type { FastifyReply, FastifyRequest } from 'fastify';
import { clearAuthCookies, setAuthCookies } from '../../lib/auth-cookies.js';
import { UserPrismaRepository } from '../../repositories/prisma/user-prisma-repository.js';
import { LoginService } from '../../services/login-service.js';
import { HttpError } from '../../services/erros/http-error.js';
import { loginSchema } from '../schemas/login-schema.js';
import type { RefreshJwtPayload } from '../../types/jwt-payload.js';
import { getClinicById } from './clinic-controller.js';

const loginService = new LoginService();
const userRepository = new UserPrismaRepository();

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const parsed = loginSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const { user, clinic } = await loginService.execute(parsed.data);

  await setAuthCookies(reply, user);

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

export async function refresh(request: FastifyRequest, reply: FastifyReply) {
  const refreshToken = request.cookies.refreshToken;

  if (!refreshToken) {
    throw new HttpError('Sessão expirada', 401);
  }

  let payload: RefreshJwtPayload;

  try {
    payload = await request.server.jwt.verify<RefreshJwtPayload>(refreshToken);
  } catch {
    clearAuthCookies(reply);
    throw new HttpError('Sessão expirada', 401);
  }

  if (payload.type !== 'refresh') {
    clearAuthCookies(reply);
    throw new HttpError('Token inválido', 401);
  }

  const user = await userRepository.findById(payload.sub);

  if (!user?.isActive) {
    clearAuthCookies(reply);
    throw new HttpError('Usuário não autorizado', 401);
  }

  await setAuthCookies(reply, user);

  return reply.status(200).send({ ok: true });
}

export async function logout(_request: FastifyRequest, reply: FastifyReply) {
  clearAuthCookies(reply);
  return reply.status(200).send({ ok: true });
}
