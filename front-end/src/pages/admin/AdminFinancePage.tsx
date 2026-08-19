import { useQuery } from '@tanstack/react-query';
import { Mail } from 'lucide-react';
import { listWaitlistSignups } from '@/api/waitlist';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';

export function AdminFinancePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['platform-waitlist'],
    queryFn: listWaitlistSignups,
  });

  const items = data?.items ?? [];

  return (
    <div className={pageShellClassName}>
      <div>
        <h1 className={pageTitleClassName}>Financeiro</h1>
        <p className={pageDescriptionClassName}>
          Lista de espera e gestão comercial da plataforma.
        </p>
      </div>

      <Card className="max-w-4xl">
        <CardHeader className="space-y-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Mail className="size-6" />
          </div>
          <CardTitle>Lista de espera</CardTitle>
          <CardDescription>
            E-mails capturados na landing page antes da liberação dos planos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : isError ? (
            <p className="text-sm text-destructive">
              Não foi possível carregar a lista de espera.
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum e-mail registrado ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">E-mail</th>
                    <th className="pb-2 pr-4 font-medium">Clínica</th>
                    <th className="pb-2 pr-4 font-medium">Plano</th>
                    <th className="pb-2 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-border/40">
                      <td className="py-2.5 pr-4">{item.email}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {item.clinicName ?? '—'}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {item.planInterest ?? '—'}
                      </td>
                      <td className="py-2.5 text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-6 text-sm text-muted-foreground">
            Integração financeira via AbacatePay planejada para uma próxima etapa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
