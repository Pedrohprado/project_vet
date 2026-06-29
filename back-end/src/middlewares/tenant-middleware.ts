import type { FastifyReply, FastifyRequest } from 'fastify';
import { ClinicPrismaRepository } from '../repositories/prisma/clinic-prisma-repository.js';
import { HttpError } from '../services/erros/http-error.js';

const clinicRepository = new ClinicPrismaRepository();

export async function tenantMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
) {
  const clinicId = request.authUser?.clinicId;

  if (!clinicId) {
    throw new HttpError('Tenant não identificado', 403);
  }

  const clinic = await clinicRepository.findById(clinicId);

  if (!clinic?.isActive) {
    throw new HttpError('Clínica inativa ou não encontrada', 403);
  }

  request.tenantId = clinicId;
}
