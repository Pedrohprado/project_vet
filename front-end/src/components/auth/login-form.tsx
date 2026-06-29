import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
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

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(undefined);
    setIsSubmitting(true);

    try {
      await login(email, password);
      toast.success('Login realizado com sucesso!');
      void navigate('/atendimento');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao fazer login';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-sm border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="space-y-1 text-center sm:text-left">
        <div className="mb-2 flex justify-center sm:hidden">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PawPrint className="size-5" />
          </div>
        </div>
        <CardTitle className="text-2xl">Entrar</CardTitle>
        <CardDescription>Acesse sua conta no Project Vet</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleSubmit(e)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Senha</FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                autoComplete="current-password"
              />
            </Field>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
            <FieldDescription className="text-center">
              Ainda não tem conta?{' '}
              <Link
                to="/register"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Criar conta
              </Link>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
