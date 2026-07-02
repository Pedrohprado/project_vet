import type { FastifyReply, FastifyRequest } from 'fastify';
import { fetchAddressByCep } from '../../lib/viacep.js';

export async function getAddressByCep(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { cep } = request.params as { cep: string };
  const address = await fetchAddressByCep(cep);

  return reply.status(200).send(address);
}
