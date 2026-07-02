import type { FastifyReply, FastifyRequest } from 'fastify';
import { clearAuthCookies, setAuthCookies } from '../../lib/auth-cookies.js';
import { UserRole } from '../../generated/prisma/client.js';
import { UserPrismaRepository } from '../../repositories/prisma/user-prisma-repository.js';
import { LoginService } from '../../services/login-service.js';
import { HttpError } from '../../services/erros/http-error.js';
import { loginSchema } from '../schemas/login-schema.js';
import type { RefreshJwtPayload } from '../../types/jwt-payload.js';
import { getClinicById } from './clinic-controller.js';
import { updateProfileSchema } from '../schemas/update-profile-schema.js';
import { updateSignatureSchema } from '../schemas/update-signature-schema.js';
import {
  deleteUserSignature,
  saveUserSignature,
} from '../../lib/save-user-signature.js';

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

  if (user.role === UserRole.SUPER_ADMIN) {
    return reply.status(200).send({ user, clinic: null });
  }

  if (!request.authUser.clinicId) {
    throw new HttpError('Clínica não encontrada', 404);
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

export async function completeWelcome(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const user = await userRepository.updateLastLoginAt(request.authUser.id);

  if (user.role === UserRole.SUPER_ADMIN) {
    return reply.status(200).send({ user, clinic: null });
  }

  if (!request.authUser.clinicId) {
    throw new HttpError('Clínica não encontrada', 404);
  }

  const clinic = await getClinicById(request.authUser.clinicId);

  return reply.status(200).send({ user, clinic });
}

export async function updateProfile(request: FastifyRequest, reply: FastifyReply) {
  const parsed = updateProfileSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const user = await userRepository.updateProfile(request.authUser.id, {
    ...(parsed.data.crmv !== undefined ? { crmv: parsed.data.crmv } : {}),
    ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone } : {}),
  });

  if (user.role === UserRole.SUPER_ADMIN) {
    return reply.status(200).send({ user, clinic: null });
  }

  if (!request.authUser.clinicId) {
    throw new HttpError('Clínica não encontrada', 404);
  }

  const clinic = await getClinicById(request.authUser.clinicId);

  return reply.status(200).send({ user, clinic });
}

async function buildAuthResponse(
  request: FastifyRequest,
  user: Awaited<ReturnType<UserPrismaRepository['findById']>>,
) {
  if (!user) {
    throw new HttpError('Usuário não encontrado', 404);
  }

  if (user.role === UserRole.SUPER_ADMIN) {
    return { user, clinic: null };
  }

  if (!request.authUser.clinicId) {
    throw new HttpError('Clínica não encontrada', 404);
  }

  const clinic = await getClinicById(request.authUser.clinicId);

  return { user, clinic };
}

export async function saveSignature(request: FastifyRequest, reply: FastifyReply) {
  const parsed = updateSignatureSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const signatureUrl = await saveUserSignature(
    request.authUser.id,
    parsed.data.signature,
  );

  const user = await userRepository.updateSignatureUrl(
    request.authUser.id,
    signatureUrl,
  );

  const response = await buildAuthResponse(request, user);

  return reply.status(200).send(response);
}

export async function removeSignature(request: FastifyRequest, reply: FastifyReply) {
  await deleteUserSignature(request.authUser.id);

  const user = await userRepository.updateSignatureUrl(request.authUser.id, null);
  const response = await buildAuthResponse(request, user);

  return reply.status(200).send(response);
}
