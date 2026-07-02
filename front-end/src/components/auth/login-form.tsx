import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';
import { ApiError } from '@/api/http';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useFormFieldErrors } from '@/hooks/useFormFieldErrors';
import { getAuthenticatedHome } from '@/routes/ProtectedRoute';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const inputClassName =
  'h-11 rounded-xl border-border/80 bg-white px-3.5 text-sm';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState<LoginFormData>({ email: '', password: '' });
  const { fieldErrors, formError, applyZodError, clearFieldError, clearErrors, setFormError } =
    useFormFieldErrors<keyof LoginFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof LoginFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = loginSchema.safeParse(form);

    if (!parsed.success) {
      applyZodError(parsed.error);
      return;
    }

    clearErrors();
    setIsSubmitting(true);

    try {
      const data = await login(parsed.data.email, parsed.data.password);
      void navigate(getAuthenticatedHome(data.user));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao fazer login';
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <FieldGroup className="gap-5">
          <Field data-invalid={Boolean(fieldErrors.email)}>
            <FieldLabel htmlFor="email">E-mail de acesso *</FieldLabel>
            <Input
              id="email"
              type="email"
              value={form.email}
              aria-invalid={Boolean(fieldErrors.email)}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="voce@exemplo.com"
              autoComplete="email"
              className={inputClassName}
            />
            <FieldError>{fieldErrors.email}</FieldError>
          </Field>
          <Field data-invalid={Boolean(fieldErrors.password)}>
            <FieldLabel htmlFor="password">Senha *</FieldLabel>
            <Input
              id="password"
              type="password"
              value={form.password}
              aria-invalid={Boolean(fieldErrors.password)}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
              className={inputClassName}
            />
            <FieldError>{fieldErrors.password}</FieldError>
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
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
            <FieldDescription className="text-center text-xs">
              Ainda não tem conta?{' '}
              <button
                type="button"
                onClick={() => void navigate('/register')}
                className="font-semibold text-foreground underline-offset-4 hover:underline"
              >
                Criar conta
              </button>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
