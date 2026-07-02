import { Link, useNavigate } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ATENDIMENTO_KIND_LABELS,
  ATENDIMENTO_STATUS_LABELS,
  type AtendimentoListItem,
  type AtendimentoStatus,
} from '@/types/atendimento';
import { PET_SPECIES_LABELS } from '@/types/pet';

const statusBadgeVariant: Record<
  AtendimentoStatus,
  'default' | 'secondary' | 'outline'
> = {
  OPEN: 'default',
  FINISHED: 'secondary',
  CANCELLED: 'outline',
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ServiceRow({ item }: { item: AtendimentoListItem }) {
  const navigate = useNavigate();
  const detailPath =
    item.kind === 'CONSULTATION'
      ? `/consultations/${item.id}`
      : `/vaccinations/${item.id}`;

  const speciesLabel =
    PET_SPECIES_LABELS[item.pet.species as keyof typeof PET_SPECIES_LABELS] ??
    item.pet.species;

  return (
    <button
      type="button"
      onClick={() => void navigate(detailPath)}
      className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-3 text-left transition-colors hover:bg-muted/60"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">
            {item.kind === 'VACCINATION' && item.vaccineName
              ? item.vaccineName
              : ATENDIMENTO_KIND_LABELS[item.kind]}
          </p>
          <Badge variant={statusBadgeVariant[item.status]} className="text-xs">
            {ATENDIMENTO_STATUS_LABELS[item.status]}
          </Badge>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {item.pet.name} ({speciesLabel}) · {item.tutor.name}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDateTime(item.occurredAt)}
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

type HomeRecentServicesProps = {
  items?: AtendimentoListItem[];
  isLoading?: boolean;
  error?: boolean;
};

export function HomeRecentServices({
  items = [],
  isLoading,
  error,
}: HomeRecentServicesProps) {
  const visibleItems = items.filter((item) => item.status !== 'CANCELLED');

  return (
    <Card className="rounded-2xl border border-border/50 bg-white/90 shadow-xl shadow-black/4 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Últimos serviços</CardTitle>
          <CardDescription>
            Consultas e vacinações recentes da clínica.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/atendimento">Ver atendimentos</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {error ? (
          <p className="text-sm text-destructive">
            Não foi possível carregar os serviços recentes.
          </p>
        ) : isLoading ? (
          <>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </>
        ) : visibleItems.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum atendimento registrado ainda.
            </p>
            <Button size="sm" className="mt-3" asChild>
              <Link to="/atendimento">Iniciar atendimento</Link>
            </Button>
          </div>
        ) : (
          visibleItems.map((item) => <ServiceRow key={`${item.kind}-${item.id}`} item={item} />)
        )}
      </CardContent>
    </Card>
  );
}
