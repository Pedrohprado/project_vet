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
  RETURN_SCHEDULED: 'secondary',
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
        <div className="flex items-start justify-between gap-2 sm:items-center sm:justify-start">
          <p className="min-w-0 truncate text-sm font-medium">
            {item.kind === 'VACCINATION' && item.vaccineName
              ? item.vaccineName
              : ATENDIMENTO_KIND_LABELS[item.kind]}
          </p>
          <Badge
            variant={statusBadgeVariant[item.status]}
            className="shrink-0 self-center px-1.5 py-0 text-[10px] leading-4"
          >
            {ATENDIMENTO_STATUS_LABELS[item.status]}
          </Badge>
        </div>
        <p className="mt-1.5 truncate text-xs text-muted-foreground">
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
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="space-y-1">
          <CardTitle>Últimos serviços</CardTitle>
          <CardDescription>
            Consultas e vacinações recentes da clínica.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" className="w-fit shrink-0" asChild>
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
          <div className="flex flex-col items-center py-8 text-center">
            <img
              src="/sniff_dog.png"
              alt="Cachorro farejando"
              className="size-40 object-contain"
            />
            <p className="ellipsis-dots -mt-8 text-xs text-muted-foreground">
              Nenhum atendimento encontrado ainda
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </p>
            <Button size="sm" className="mt-3" asChild>
              <Link to="/atendimento">Iniciar atendimento</Link>
            </Button>
          </div>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {visibleItems.map((item) => (
              <ServiceRow key={`${item.kind}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
