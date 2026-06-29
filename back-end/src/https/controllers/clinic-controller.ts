import type { FastifyReply, FastifyRequest } from 'fastify';
import { setAuthCookies } from '../../lib/auth-cookies.js';
import { ClinicPrismaRepository } from '../../repositories/prisma/clinic-prisma-repository.js';
import { RegisterClinicService } from '../../services/register-clinic-service.js';
import { HttpError } from '../../services/erros/http-error.js';
import { registerClinicSchema } from '../schemas/register-clinic-schema.js';

const registerClinicService = new RegisterClinicService();
const clinicRepository = new ClinicPrismaRepository();

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

  await setAuthCookies(reply, user);

  return reply.status(201).send({ clinic, user });
}

export async function getClinicById(clinicId: string) {
  const clinic = await clinicRepository.findById(clinicId);

  if (!clinic) {
    throw new HttpError('Clínica não encontrada', 404);
  }

  return clinic;
}
