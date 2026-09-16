import { randomInt } from 'node:crypto';
import { comparePassword, hashPassword } from '../lib/password.js';
import { prisma } from '../lib/prisma.js';
import { PasswordResetTokenPrismaRepository } from '../repositories/prisma/password-reset-token-prisma-repository.js';
import { UserPrismaRepository } from '../repositories/prisma/user-prisma-repository.js';
import { HttpError } from './erros/http-error.js';
import { MailService } from './mail-service.js';
import type {
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../https/schemas/password-reset-schema.js';

const CODE_TTL_MS = 15 * 60 * 1000;
const SUCCESS_FORGOT_MESSAGE =
  'Enviamos um código para o seu e-mail. Verifique também a caixa de spam.';

const userRepository = new UserPrismaRepository();
const tokenRepository = new PasswordResetTokenPrismaRepository();
const mailService = new MailService();

/** Rate limit in-memory: 1 pedido / 60s por e-mail (e por IP quando informado). */
const forgotAttempts = new Map<string, number>();
const FORGOT_COOLDOWN_MS = 60_000;

function assertForgotRateLimit(key: string) {
  const now = Date.now();
  const last = forgotAttempts.get(key);
  if (last !== undefined && now - last < FORGOT_COOLDOWN_MS) {
    throw new HttpError(
      'Aguarde um minuto antes de solicitar um novo código.',
      429,
    );
  }
  forgotAttempts.set(key, now);
}

function generateSixDigitCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export class PasswordResetService {
  async forgotPassword(input: ForgotPasswordInput, clientIp?: string) {
    const user = await userRepository.findByEmail(input.email);

    if (!user?.isActive) {
      throw new HttpError('E-mail não encontrado', 404);
    }

    const emailKey = user.email.trim().toLowerCase();
    assertForgotRateLimit(`email:${emailKey}`);
    if (clientIp) {
      assertForgotRateLimit(`ip:${clientIp}`);
    }

    const code = generateSixDigitCode();
    const codeHash = await hashPassword(code);
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);

    await tokenRepository.invalidateActiveForUser(user.id);
    await tokenRepository.create({
      userId: user.id,
      codeHash,
      expiresAt,
    });

    try {
      await mailService.sendPasswordResetCode({
        to: user.email,
        name: user.name,
        code,
      });
    } catch (err) {
      console.error('[password-reset] falha ao enviar e-mail', err);
      throw new HttpError(
        'Não foi possível enviar o e-mail. Tente novamente em instantes.',
        502,
      );
    }

    return { message: SUCCESS_FORGOT_MESSAGE };
  }

  async resetPassword(input: ResetPasswordInput) {
    const user = await userRepository.findByEmail(input.email);

    if (!user?.isActive) {
      throw new HttpError('Código inválido ou expirado', 400);
    }

    const tokens = await tokenRepository.findActiveByUserId(user.id);

    let matchedId: string | null = null;
    for (const token of tokens) {
      const ok = await comparePassword(input.code, token.codeHash);
      if (ok) {
        matchedId = token.id;
        break;
      }
    }

    if (!matchedId) {
      throw new HttpError('Código inválido ou expirado', 400);
    }

    const passwordHash = await hashPassword(input.newPassword);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { password: passwordHash },
      });
      await tx.passwordResetToken.update({
        where: { id: matchedId! },
        data: { usedAt: new Date() },
      });
      await tx.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
          id: { not: matchedId! },
        },
        data: { usedAt: new Date() },
      });
    });

    return { message: 'Senha redefinida com sucesso. Você já pode entrar.' };
  }
}
