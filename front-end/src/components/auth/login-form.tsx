import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
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
import { cn } from '@/lib/utils';

const inputClassName =
  'h-11 rounded-xl border-border/80 bg-white px-3.5 text-sm';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
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
      void navigate('/estatisticas');
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
    <div className={cn('flex flex-col', className)} {...props}>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <FieldGroup className="gap-5">
          <Field>
            <FieldLabel htmlFor="email">E-mail de acesso</FieldLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              required
              autoComplete="email"
              className={inputClassName}
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
              className={inputClassName}
            />
          </Field>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
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
