import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';
import { ApiError } from '@/api/http';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { formatCpf, formatPhone, onlyDigits } from '@/lib/masks';
import { cn } from '@/lib/utils';

const registerSchema = z
  .object({
    clinicName: z.string().min(1, 'Nome da clínica é obrigatório'),
    document: z
      .string()
      .min(1, 'CPF é obrigatório')
      .refine((value) => onlyDigits(value).length === 11, 'CPF inválido'),
    phone: z
      .string()
      .min(1, 'Celular é obrigatório')
      .refine((value) => {
        const digits = onlyDigits(value);
        return digits.length === 10 || digits.length === 11;
      }, 'Celular inválido'),
    email: z.string().email('E-mail inválido'),
    name: z.string().min(1, 'Nome completo é obrigatório'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof registerSchema>;

const initialData: FormData = {
  clinicName: '',
  document: '',
  phone: '',
  email: '',
  name: '',
  password: '',
  confirmPassword: '',
};

const inputClassName =
  'h-11 rounded-xl border-border/80 bg-white px-3.5 text-sm';

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState<FormData>(initialData);
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = registerSchema.safeParse(form);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos');
      return;
    }

    setError(undefined);
    setIsSubmitting(true);

    try {
      await register({
        clinicName: parsed.data.clinicName,
        document: parsed.data.document,
        phone: parsed.data.phone,
        email: parsed.data.email,
        password: parsed.data.password,
        name: parsed.data.name,
      });

      void navigate('/estatisticas');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao criar conta';
      setError(message);

      if (err instanceof ApiError && err.statusCode === 409) {
        toast.warning(message);
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="max-h-[min(28rem,calc(100svh-16rem))] overflow-y-auto pr-1"
      >
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="clinicName">Nome da clínica *</FieldLabel>
            <Input
              id="clinicName"
              value={form.clinicName}
              onChange={(e) => updateField('clinicName', e.target.value)}
              placeholder="Clínica Veterinária Exemplo"
              required
              className={inputClassName}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="document">CPF *</FieldLabel>
              <Input
                id="document"
                value={form.document}
                onChange={(e) =>
                  updateField('document', formatCpf(e.target.value))
                }
                placeholder="000.000.000-00"
                inputMode="numeric"
                maxLength={14}
                required
                className={inputClassName}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Celular *</FieldLabel>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) =>
                  updateField('phone', formatPhone(e.target.value))
                }
                placeholder="(11) 99999-8888"
                inputMode="tel"
                maxLength={15}
                required
                className={inputClassName}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="email">E-mail *</FieldLabel>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="voce@exemplo.com"
              required
              autoComplete="email"
              className={inputClassName}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="name">Nome completo *</FieldLabel>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Dr. João Silva"
              required
              className={inputClassName}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="password">Senha *</FieldLabel>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                autoComplete="new-password"
                className={inputClassName}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirmar senha *</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  updateField('confirmPassword', e.target.value)
                }
                placeholder="Repita a senha"
                required
                minLength={6}
                autoComplete="new-password"
                className={inputClassName}
              />
            </Field>
          </div>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          <Field>
            <Button
              type="submit"
              className="h-11 w-full rounded-xl bg-foreground text-sm text-background hover:bg-foreground/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </Button>
            <FieldDescription className="text-center text-xs">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={() => void navigate('/login')}
                className="font-semibold text-foreground underline-offset-4 hover:underline"
              >
                Entrar
              </button>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
