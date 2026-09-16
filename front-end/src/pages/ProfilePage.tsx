import { useState } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { PageBackButton } from '@/components/page-back-button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { formatPhone } from '@/lib/masks';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
  stickyActionBarClassName,
} from '@/lib/mobile-ui';
import { USER_ROLE_LABELS } from '@/types/auth';

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function ProfilePage() {
  const { user, clinic, updateProfile } = useAuth();
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [crmv, setCrmv] = useState(user?.crmv ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [prevUser, setPrevUser] = useState(user);

  if (user !== prevUser) {
    setPrevUser(user);
    if (user) {
      setPhone(user.phone ?? '');
      setCrmv(user.crmv ?? '');
    }
  }

  if (!user) {
    return <p className="text-muted-foreground">Carregando perfil...</p>;
  }

  const roleLabel = USER_ROLE_LABELS[user.role];
  const isPlatformAdmin = user.role === 'SUPER_ADMIN';
  const normalizedPhone = phone.trim() || null;
  const normalizedCrmv = crmv.trim() || null;
  const hasChanges =
    normalizedPhone !== (user.phone?.trim() || null) ||
    normalizedCrmv !== (user.crmv?.trim() || null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!hasChanges) return;

    setIsSaving(true);

    try {
      await updateProfile({
        phone: normalizedPhone,
        crmv: normalizedCrmv,
      });
      toast.success('Perfil atualizado!');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar perfil');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={pageShellClassName}>
      <PageBackButton to="/estatisticas" />

      <div>
        <h1 className={pageTitleClassName}>Meu perfil</h1>
        <p className={`mt-1 ${pageDescriptionClassName}`}>
          Atualize seus dados profissionais.
        </p>
      </div>

      <Card>
        <CardContent className="flex items-start gap-4 pt-1 sm:items-center">
          <Avatar className="size-16 text-base" size="lg">
            <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p className="truncate text-lg font-semibold tracking-tight">
                {user.name}
              </p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{roleLabel}</Badge>
              {clinic?.name ? (
                <span className="text-sm text-muted-foreground">{clinic.name}</span>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Dados profissionais</CardTitle>
            <CardDescription>
              Nome, e-mail e cargo não podem ser alterados por aqui.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">Nome</FieldLabel>
                <Input id="name" value={user.name} disabled />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input id="email" value={user.email} disabled />
              </Field>

              <Field>
                <FieldLabel htmlFor="role">Cargo</FieldLabel>
                <Input id="role" value={roleLabel} disabled />
                <FieldDescription>
                  O cargo é definido pela clínica e não pode ser alterado nesta tela.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Telefone</FieldLabel>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(event) => setPhone(formatPhone(event.target.value))}
                  placeholder="(14) 99680-8476"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </Field>

              {!isPlatformAdmin ? (
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="crmv">CRMV</FieldLabel>
                  <Input
                    id="crmv"
                    value={crmv}
                    onChange={(event) => setCrmv(event.target.value)}
                    placeholder="Ex.: 12345-SP"
                  />
                  <FieldDescription>
                    Opcional, mas recomendado para receitas impressas.
                  </FieldDescription>
                </Field>
              ) : null}
            </FieldGroup>
          </CardContent>
        </Card>

        <div className={stickyActionBarClassName}>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            {hasChanges ? (
              <p className="text-sm text-muted-foreground sm:mr-auto">
                Há alterações pendentes.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground sm:mr-auto">
                Nenhuma alteração pendente.
              </p>
            )}
            <Button
              type="submit"
              className="w-full sm:w-auto"
              action="save"
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
