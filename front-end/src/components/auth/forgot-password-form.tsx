import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { ApiError } from '@/api/http';
import * as authApi from '@/api/auth';
import { BrandImage } from '@/components/brand/brand-image';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useFormFieldErrors } from '@/hooks/useFormFieldErrors';
import { HEAD_CAT_SRC } from '@/lib/brand';
import { cn } from '@/lib/utils';

const emailSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
});

const codeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Informe o código de 6 dígitos'),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

const inputClassName =
  'h-11 rounded-xl border-border/80 bg-white px-3.5 text-sm';

const RESEND_COOLDOWN_SECONDS = 60;

export type ForgotPasswordStep = 'email' | 'code' | 'password';

type ForgotPasswordFormProps = React.ComponentProps<'div'> & {
  onStepChange?: (step: ForgotPasswordStep) => void;
};

export function ForgotPasswordForm({
  className,
  onStepChange,
  ...props
}: ForgotPasswordFormProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const { fieldErrors, formError, applyZodError, clearFieldError, clearErrors, setFormError } =
    useFormFieldErrors<'email' | 'code' | 'newPassword' | 'confirmPassword'>();

  useEffect(() => {
    onStepChange?.(step);
  }, [onStepChange, step]);

  useEffect(() => {
    if (resendSecondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setResendSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendSecondsLeft]);

  function goToStep(next: ForgotPasswordStep) {
    setStep(next);
  }

  function startResendCooldown() {
    setResendSecondsLeft(RESEND_COOLDOWN_SECONDS);
  }

  async function handleSendCode(event: React.FormEvent) {
    event.preventDefault();
    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) {
      applyZodError(parsed.error);
      return;
    }

    clearErrors();
    setIsSubmitting(true);

    try {
      await authApi.forgotPassword(parsed.data.email);
      setEmail(parsed.data.email);
      setCode('');
      startResendCooldown();
      goToStep('code');
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Erro ao enviar código',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    if (resendSecondsLeft > 0 || isResending || !email) return;

    clearErrors();
    setIsResending(true);

    try {
      await authApi.forgotPassword(email);
      setCode('');
      startResendCooldown();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Erro ao reenviar código',
      );
    } finally {
      setIsResending(false);
    }
  }

  function submitCode(nextCode: string) {
    const parsed = codeSchema.safeParse({ code: nextCode });
    if (!parsed.success) {
      applyZodError(parsed.error);
      return;
    }

    clearErrors();
    setCode(parsed.data.code);
    goToStep('password');
  }

  function handleCodeChange(value: string) {
    const nextCode = value.replace(/\D/g, '').slice(0, 6);
    setCode(nextCode);
    clearFieldError('code');

    if (nextCode.length === 6) {
      submitCode(nextCode);
    }
  }

  async function handleResetPassword(event: React.FormEvent) {
    event.preventDefault();
    const parsed = passwordSchema.safeParse({ newPassword, confirmPassword });
    if (!parsed.success) {
      applyZodError(parsed.error);
      return;
    }

    clearErrors();
    setIsSubmitting(true);

    try {
      const result = await authApi.resetPassword({
        email,
        code,
        newPassword: parsed.data.newPassword,
        confirmPassword: parsed.data.confirmPassword,
      });
      void navigate('/login', { state: { resetSuccess: result.message } });
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Erro ao redefinir senha',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const resendLabel =
    resendSecondsLeft > 0
      ? `Reenviar código em ${resendSecondsLeft}s`
      : isResending
        ? 'Reenviando...'
        : 'Reenviar código';

  return (
    <div className={cn('flex flex-col', className)} {...props}>
      {step === 'email' ? (
        <form onSubmit={(e) => void handleSendCode(e)}>
          <FieldGroup className="gap-5">
            <Field data-invalid={Boolean(fieldErrors.email)}>
              <FieldLabel htmlFor="forgot-email">E-mail de acesso *</FieldLabel>
              <Input
                id="forgot-email"
                type="email"
                value={email}
                aria-invalid={Boolean(fieldErrors.email)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError('email');
                }}
                placeholder="voce@exemplo.com"
                autoComplete="email"
                className={inputClassName}
              />
              <FieldError>{fieldErrors.email}</FieldError>
            </Field>
            {formError ? (
              <p className="text-sm text-destructive">{formError}</p>
            ) : null}
            <Field>
              <div className="group relative mt-2">
                <BrandImage
                  src={HEAD_CAT_SRC}
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute right-1 bottom-full z-10 h-24 w-auto translate-y-[30%] opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                />
                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-foreground text-sm text-background hover:bg-foreground/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar código'}
                </Button>
              </div>
              <FieldDescription className="text-center text-xs">
                Lembrou a senha?{' '}
                <button
                  type="button"
                  onClick={() => void navigate('/login')}
                  className="font-semibold text-foreground underline-offset-4 hover:underline"
                >
                  Voltar ao login
                </button>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      ) : null}

      {step === 'code' ? (
        <div>
          <FieldGroup className="gap-5">
            <p className="text-center text-sm leading-relaxed text-muted-foreground">
              Enviamos um e-mail com o código de recuperação da senha.
            </p>
            <Field
              data-invalid={Boolean(fieldErrors.code)}
              className="items-center"
            >
              <InputOTP
                maxLength={6}
                value={code}
                onChange={handleCodeChange}
                containerClassName="justify-center"
                aria-invalid={Boolean(fieldErrors.code)}
                autoFocus
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} aria-invalid={Boolean(fieldErrors.code)} />
                  <InputOTPSlot index={1} aria-invalid={Boolean(fieldErrors.code)} />
                  <InputOTPSlot index={2} aria-invalid={Boolean(fieldErrors.code)} />
                  <InputOTPSlot index={3} aria-invalid={Boolean(fieldErrors.code)} />
                  <InputOTPSlot index={4} aria-invalid={Boolean(fieldErrors.code)} />
                  <InputOTPSlot index={5} aria-invalid={Boolean(fieldErrors.code)} />
                </InputOTPGroup>
              </InputOTP>
              <FieldError className="text-center">{fieldErrors.code}</FieldError>
            </Field>
            {formError ? (
              <p className="text-center text-sm text-destructive">{formError}</p>
            ) : null}
            <Field>
              <FieldDescription className="text-center text-xs">
                <button
                  type="button"
                  onClick={() => void handleResendCode()}
                  disabled={resendSecondsLeft > 0 || isResending}
                  className="font-semibold text-foreground underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
                >
                  {resendLabel}
                </button>
              </FieldDescription>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 w-full text-muted-foreground"
                onClick={() => {
                  clearErrors();
                  setCode('');
                  goToStep('email');
                }}
              >
                Voltar
              </Button>
            </Field>
          </FieldGroup>
        </div>
      ) : null}

      {step === 'password' ? (
        <form onSubmit={(e) => void handleResetPassword(e)}>
          <FieldGroup className="gap-5">
            <Field data-invalid={Boolean(fieldErrors.newPassword)}>
              <FieldLabel htmlFor="new-password">Nova senha *</FieldLabel>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                aria-invalid={Boolean(fieldErrors.newPassword)}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  clearFieldError('newPassword');
                }}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                className={inputClassName}
              />
              <FieldError>{fieldErrors.newPassword}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.confirmPassword)}>
              <FieldLabel htmlFor="confirm-password">Confirmar senha *</FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearFieldError('confirmPassword');
                }}
                placeholder="Repita a nova senha"
                autoComplete="new-password"
                className={inputClassName}
              />
              <FieldError>{fieldErrors.confirmPassword}</FieldError>
            </Field>
            {formError ? (
              <p className="text-sm text-destructive">{formError}</p>
            ) : null}
            <Field>
              <Button
                type="submit"
                className="h-11 w-full rounded-xl bg-foreground text-sm text-background hover:bg-foreground/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
              </Button>
              <FieldDescription className="text-center text-xs">
                <button
                  type="button"
                  onClick={() => {
                    clearErrors();
                    goToStep('code');
                  }}
                  className="font-semibold text-foreground underline-offset-4 hover:underline"
                >
                  Voltar ao código
                </button>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      ) : null}
    </div>
  );
}
