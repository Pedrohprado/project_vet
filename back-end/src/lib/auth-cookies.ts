import type { FastifyReply } from 'fastify';
import type { UserRole } from '../generated/prisma/client.js';
import { env } from '../env/index.js';
import type { AccessJwtPayload, RefreshJwtPayload } from '../types/jwt-payload.js';

export const ACCESS_TOKEN_MAX_AGE = 60 * 15;
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

function clearCookieOptions() {
  return {
    path: '/',
    sameSite: 'lax' as const,
    secure: env.NODE_ENV === 'production',
  };
}

type AuthUser = {
  id: string;
  role: UserRole;
  clinicId: string | null;
};

export async function setAuthCookies(reply: FastifyReply, user: AuthUser) {
  const accessToken = await reply.jwtSign(
    {
      sub: user.id,
      role: user.role,
      clinicId: user.clinicId,
    } satisfies AccessJwtPayload,
    { expiresIn: ACCESS_TOKEN_MAX_AGE },
  );

  const refreshToken = reply.server.jwt.sign(
    {
      sub: user.id,
      type: 'refresh',
    } as RefreshJwtPayload & AccessJwtPayload,
    { expiresIn: REFRESH_TOKEN_MAX_AGE },
  );

  reply.setCookie('token', accessToken, cookieOptions(ACCESS_TOKEN_MAX_AGE));
  reply.setCookie('refreshToken', refreshToken, cookieOptions(REFRESH_TOKEN_MAX_AGE));
}

export function clearAuthCookies(reply: FastifyReply) {
  const options = clearCookieOptions();
  reply.clearCookie('token', options);
  reply.clearCookie('refreshToken', options);
}
