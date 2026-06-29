import type { UserRole } from '../generated/prisma/client.js';

export type AccessJwtPayload = {
  sub: string;
  role: UserRole;
  clinicId: string;
};

export type RefreshJwtPayload = {
  sub: string;
  type: 'refresh';
};

export type JwtPayload = AccessJwtPayload | RefreshJwtPayload;

export function isAccessJwtPayload(payload: JwtPayload): payload is AccessJwtPayload {
  return !('type' in payload);
}
