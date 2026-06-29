import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';
import { PawPrint } from 'lucide-react';
import { ApiError } from '@/api/http';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

const registerSchema = z
  .object({
    clinicName: z.string().min(1, 'Nome da clínica é obrigatório'),
    document: z.string().min(1, 'CPF é obrigatório'),
    phone: z.string().min(1, 'Celular é obrigatório'),
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

export function RegisterForm() {
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

      toast.success('Conta criada com sucesso!');
      void navigate('/atendimento');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao criar conta';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="space-y-1 text-center sm:text-left">
        <div className="mb-2 flex justify-center sm:hidden">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PawPrint className="size-5" />
          </div>
        </div>
        <CardTitle className="text-2xl">Criar conta</CardTitle>
        <CardDescription>
          Cadastre sua clínica e comece a usar o Project Vet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleSubmit(e)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="clinicName">Nome da clínica *</FieldLabel>
              <Input
                id="clinicName"
                value={form.clinicName}
                onChange={(e) => updateField('clinicName', e.target.value)}
                placeholder="Clínica Veterinária Exemplo"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="document">CPF *</FieldLabel>
              <Input
                id="document"
                value={form.document}
                onChange={(e) => updateField('document', e.target.value)}
                placeholder="000.000.000-00"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Celular *</FieldLabel>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="(11) 99999-8888"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">E-mail *</FieldLabel>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
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
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Confirmar senha *
                </FieldLabel>
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
                />
              </Field>
            </div>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </Button>
            <FieldDescription className="text-center">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Entrar
              </Link>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
