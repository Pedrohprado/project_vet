import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [crmv, setCrmv] = useState(user?.crmv ?? '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setPhone(user.phone ?? '');
    setCrmv(user.crmv ?? '');
  }, [user]);

  if (!user) {
    return <p className="text-muted-foreground">Carregando perfil...</p>;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);

    try {
      await updateProfile({
        phone: phone.trim() || null,
        crmv: crmv.trim() || null,
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
      <div className="space-y-1">
        <h1 className={pageTitleClassName}>Meu perfil</h1>
        <p className={pageDescriptionClassName}>
          Atualize seus dados profissionais para aparecerem na receita veterinária.
        </p>
      </div>

      <Card className="mt-6 max-w-xl">
        <CardHeader>
          <CardTitle>Dados profissionais</CardTitle>
          <CardDescription>
            O CRMV é opcional, mas recomendado para receitas impressas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={user.name} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={user.email} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="(14) 99680-8476"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="crmv">CRMV</Label>
              <Input
                id="crmv"
                value={crmv}
                onChange={(event) => setCrmv(event.target.value)}
                placeholder="CRMV 66278 SP"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar alterações'}
              </Button>
              <Button type="button" variant="outline" render={<Link to="/estatisticas" />}>
                Voltar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
