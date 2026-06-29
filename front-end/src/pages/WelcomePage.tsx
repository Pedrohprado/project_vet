import { useNavigate } from 'react-router';
import { PawPrint } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';

export function WelcomePage() {
  const navigate = useNavigate();
  const { user, clinic, logout } = useAuth();

  async function handleLogout() {
    await logout();
    void navigate('/login');
  }

  if (!user || !clinic) {
    return null;
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PawPrint className="size-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Project Vet</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Olá, {user.name}!</CardTitle>
            <CardDescription>
              Sua conta foi criada com sucesso. Em breve você poderá cadastrar
              tutores e pets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Clínica</p>
              <p className="font-medium">{clinic.name}</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm text-muted-foreground">Plano atual</p>
                <Badge variant="secondary" className="mt-1">
                  {clinic.plan}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Seu e-mail</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>

            <Separator />

            <p className="text-sm text-muted-foreground">
              Nas próximas etapas você terá acesso ao dashboard, cadastro de
              tutores, pets, agenda, consultas, vacinação e notificações
              automáticas para os tutores.
            </p>

            <Button variant="outline" className="w-full" onClick={handleLogout}>
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
