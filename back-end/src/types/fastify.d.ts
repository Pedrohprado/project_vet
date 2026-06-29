import type { AuthenticatedUser } from './authenticated-user.js';

declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: Buffer;
    authUser: AuthenticatedUser;
    tenantId: string;
  }
}
