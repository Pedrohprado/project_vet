import type { AccessJwtPayload } from './jwt-payload.js';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AccessJwtPayload;
    user: AccessJwtPayload;
  }
}
