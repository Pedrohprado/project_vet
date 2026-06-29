import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../../env/index.js';
import { ClinicPrismaRepository } from '../../repositories/prisma/clinic-prisma-repository.js';
import { RegisterClinicService } from '../../services/register-clinic-service.js';
import { HttpError } from '../../services/erros/http-error.js';
import { registerClinicSchema } from '../schemas/register-clinic-schema.js';
import type { JwtPayload } from '../../types/jwt-payload.js';

const registerClinicService = new RegisterClinicService();
const clinicRepository = new ClinicPrismaRepository();

function setAuthCookie(reply: FastifyReply, token: string) {
  reply.setCookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function registerClinic(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = registerClinicSchema.safeParse(request.body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    throw new HttpError(firstError, 400);
  }

  const { clinic, user } = await registerClinicService.execute(parsed.data);

  const token = await reply.jwtSign({
    sub: user.id,
    role: user.role,
    clinicId: user.clinicId,
  } satisfies JwtPayload);

  setAuthCookie(reply, token);

  return reply.status(201).send({ clinic, user });
}

export async function getClinicById(clinicId: string) {
  const clinic = await clinicRepository.findById(clinicId);

  if (!clinic) {
    throw new HttpError('Clínica não encontrada', 404);
  }

  return clinic;
}
