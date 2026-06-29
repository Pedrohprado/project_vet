import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/api/http';
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

export function RegisterPage() {
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
      void navigate('/welcome');
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
    <AuthLayout
      title="Criar conta"
      description="Cadastre sua clínica e comece a usar o Project Vet"
      footer={
        <>
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clinicName">Nome da clínica *</Label>
          <Input
            id="clinicName"
            value={form.clinicName}
            onChange={(e) => updateField('clinicName', e.target.value)}
            placeholder="Clínica Veterinária Exemplo"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="document">CPF *</Label>
          <Input
            id="document"
            value={form.document}
            onChange={(e) => updateField('document', e.target.value)}
            placeholder="000.000.000-00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Celular *</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="(11) 99999-8888"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nome completo *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Dr. João Silva"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              placeholder="Repita a senha"
              required
              minLength={6}
            />
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Criando conta...' : 'Criar conta'}
        </Button>
      </form>
    </AuthLayout>
  );
}
