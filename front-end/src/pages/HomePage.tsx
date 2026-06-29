import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { apiFetch } from '@/api/http';
import { Button } from '@/components/ui/button';

type HealthResponse = {
  status: string;
};

async function fetchHealth(): Promise<HealthResponse> {
  const response = await apiFetch('/health');
  if (!response.ok) {
    throw new Error('Falha ao consultar a API');
  }
  return response.json() as Promise<HealthResponse>;
}

export function HomePage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="w-full max-w-md space-y-4 rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Project Vet</h1>
        <p className="text-sm text-muted-foreground">
          Scaffold base — front-end conectado ao back-end via{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">/api/health</code>
        </p>

        <div className="rounded-lg border bg-muted/40 p-4">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Consultando API…</p>
          )}
          {isError && (
            <p className="text-sm text-destructive">
              API indisponível. Verifique se o back-end está rodando.
            </p>
          )}
          {data && (
            <p className="text-sm">
              Status:{' '}
              <span className="font-medium text-primary">{data.status}</span>
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`mr-2 size-4 ${isFetching ? 'animate-spin' : ''}`}
          />
          Atualizar
        </Button>
      </div>
    </main>
  );
}
