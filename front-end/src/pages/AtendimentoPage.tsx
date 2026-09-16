import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import {
  CalendarClock,
  EllipsisVertical,
  Eye,
  PawPrint,
  Plus,
  Search,
  Stethoscope,
  Syringe,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { SNIFF_DOG_SRC } from '@/lib/brand';
import { NewAtendimentoSheet } from '@/components/atendimento/new-atendimento-sheet';
import { BrandImage } from '@/components/brand/brand-image';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAtendimentos } from '@/hooks/useAtendimentos';
import { useDeleteConsultation } from '@/hooks/useConsultations';
import { useDeleteVaccination } from '@/hooks/useVaccinations';
import { PET_SPECIES_ICONS } from '@/lib/pet-icons';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';
import { cn } from '@/lib/utils';
import {
  ATENDIMENTO_KIND_LABELS,
  ATENDIMENTO_STATUS_LABELS,
  type AtendimentoKind,
  type AtendimentoListItem,
  type AtendimentoStatus,
} from '@/types/atendimento';
import { PET_SPECIES_LABELS } from '@/types/pet';
import type { PetSpecies } from '@/types/tutor';

type KindFilter = 'ALL' | AtendimentoKind;
type StatusFilter = 'ALL' | AtendimentoStatus;

const KIND_FILTERS: { value: KindFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'CONSULTATION', label: 'Consulta' },
  { value: 'VACCINATION', label: 'Vacinação' },
];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'OPEN', label: 'Em andamento' },
  { value: 'RETURN_SCHEDULED', label: 'Retorno' },
  { value: 'FINISHED', label: 'Finalizado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

const statusBadgeClassName: Record<AtendimentoStatus, string> = {
  OPEN: 'border-amber-500/30 bg-amber-500/12 text-amber-800 dark:text-amber-300',
  RETURN_SCHEDULED:
    'border-sky-500/30 bg-sky-500/12 text-sky-800 dark:text-sky-300',
  FINISHED: 'border-transparent bg-emerald-700 text-white',
  CANCELLED: 'border-border bg-muted text-muted-foreground',
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getSpeciesLabel(species: string) {
  return (
    PET_SPECIES_LABELS[species as keyof typeof PET_SPECIES_LABELS] ?? species
  );
}

function PetSpeciesIcon({
  species,
  className,
}: {
  species: string;
  className?: string;
}) {
  const Icon = PET_SPECIES_ICONS[species as PetSpecies] ?? PawPrint;
  return <Icon className={className} />;
}

function getDetailPath(item: AtendimentoListItem) {
  return item.kind === 'CONSULTATION'
    ? `/consultations/${item.id}`
    : `/vaccinations/${item.id}`;
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type='button'
      size='sm'
      variant={active ? 'default' : 'outline'}
      className={cn('h-7 rounded-full px-3', !active && 'bg-background')}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function KindBadge({ kind }: { kind: AtendimentoKind }) {
  return (
    <Badge
      variant='outline'
      className={cn(
        'gap-1',
        kind === 'VACCINATION'
          ? 'border-transparent bg-emerald-700 text-white'
          : 'border-transparent bg-sky-700 text-white',
      )}
    >
      {kind === 'VACCINATION' ? (
        <Syringe className='size-3' />
      ) : (
        <Stethoscope className='size-3' />
      )}
      {ATENDIMENTO_KIND_LABELS[kind]}
    </Badge>
  );
}

function StatusBadge({ status }: { status: AtendimentoStatus }) {
  return (
    <Badge variant='outline' className={statusBadgeClassName[status]}>
      {ATENDIMENTO_STATUS_LABELS[status]}
    </Badge>
  );
}

function AtendimentoActions({
  item,
  onDelete,
}: {
  item: AtendimentoListItem;
  onDelete: (item: AtendimentoListItem) => void;
}) {
  const navigate = useNavigate();
  const isOpen = item.status === 'OPEN';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='icon-sm'
            aria-label='Ações do atendimento'
          />
        }
      >
        <EllipsisVertical className='size-4' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => void navigate(getDetailPath(item))}>
          <Eye className='size-4' />
          {isOpen ? 'Continuar atendimento' : 'Ver detalhes'}
        </DropdownMenuItem>
        <DropdownMenuItem variant='destructive' onClick={() => onDelete(item)}>
          <Trash2 className='size-4' />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AtendimentoRow({
  item,
  onDelete,
}: {
  item: AtendimentoListItem;
  onDelete: (item: AtendimentoListItem) => void;
}) {
  const navigate = useNavigate();
  const isOpen = item.status === 'OPEN';

  function openDetails() {
    void navigate(getDetailPath(item));
  }

  return (
    <tr
      className={cn(
        'cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/50',
        isOpen && 'bg-amber-500/6',
      )}
      onClick={openDetails}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDetails();
        }
      }}
      tabIndex={0}
      aria-label={`Ver detalhes do atendimento de ${item.pet.name}`}
    >
      <td className='px-4 py-3 whitespace-nowrap'>
        <p className='text-sm font-medium'>{formatDate(item.occurredAt)}</p>
        <p className='text-xs text-muted-foreground'>
          {formatTime(item.occurredAt)}
        </p>
      </td>
      <td className='px-4 py-3'>
        <KindBadge kind={item.kind} />
      </td>
      <td className='px-4 py-3'>
        <div className='flex min-w-0 items-center gap-2.5'>
          <span className='flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
            <PetSpeciesIcon species={item.pet.species} className='size-4' />
          </span>
          <div className='min-w-0'>
            <p className='truncate text-sm font-medium'>{item.pet.name}</p>
            <p className='truncate text-xs text-muted-foreground'>
              {getSpeciesLabel(item.pet.species)}
            </p>
          </div>
        </div>
      </td>
      <td className='px-4 py-3 text-sm'>{item.tutor.name}</td>
      <td className='px-4 py-3 text-sm text-muted-foreground'>
        {item.veterinarian.name}
      </td>
      <td className='px-4 py-3'>
        <StatusBadge status={item.status} />
      </td>
      <td
        className='px-4 py-3 text-right'
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <AtendimentoActions item={item} onDelete={onDelete} />
      </td>
    </tr>
  );
}

function AtendimentoMobileCard({
  item,
  onDelete,
}: {
  item: AtendimentoListItem;
  onDelete: (item: AtendimentoListItem) => void;
}) {
  const navigate = useNavigate();
  const isOpen = item.status === 'OPEN';

  return (
    <div
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-background px-3 py-3 transition-colors hover:bg-muted/50',
        isOpen && 'border-amber-500/30 bg-amber-500/6',
      )}
      onClick={() => void navigate(getDetailPath(item))}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          void navigate(getDetailPath(item));
        }
      }}
      role='button'
      tabIndex={0}
      aria-label={`Ver detalhes do atendimento de ${item.pet.name}`}
    >
      <span className='mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
        <PetSpeciesIcon species={item.pet.species} className='size-4' />
      </span>
      <div className='min-w-0 flex-1 space-y-1.5'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            <p className='truncate text-sm font-medium'>{item.pet.name}</p>
            <p className='truncate text-xs text-muted-foreground'>
              {item.tutor.name} · {item.veterinarian.name}
            </p>
          </div>
          <div
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <AtendimentoActions item={item} onDelete={onDelete} />
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-1.5'>
          <KindBadge kind={item.kind} />
          <StatusBadge status={item.status} />
        </div>
        <p className='text-xs text-muted-foreground'>
          {formatDate(item.occurredAt)} às {formatTime(item.occurredAt)}
        </p>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className='space-y-2 px-4 py-4 sm:px-0'>
      <Skeleton className='h-16 w-full rounded-xl sm:h-12' />
      <Skeleton className='h-16 w-full rounded-xl sm:h-12' />
      <Skeleton className='h-16 w-full rounded-xl sm:h-12' />
      <Skeleton className='h-16 w-full rounded-xl sm:h-12' />
    </div>
  );
}

export function AtendimentoPage() {
  const [isNewSheetOpen, setIsNewSheetOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AtendimentoListItem | null>(
    null,
  );
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<KindFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const { data, isLoading, error } = useAtendimentos(1, 50);
  const deleteConsultation = useDeleteConsultation();
  const deleteVaccination = useDeleteVaccination();

  const isDeleting =
    deleteConsultation.isPending || deleteVaccination.isPending;

  const items = useMemo(() => data?.items ?? [], [data?.items]);

  const summary = useMemo(() => {
    const openCount = items.filter((item) => item.status === 'OPEN').length;
    const consultationCount = items.filter(
      (item) => item.kind === 'CONSULTATION',
    ).length;
    const vaccinationCount = items.filter(
      (item) => item.kind === 'VACCINATION',
    ).length;

    return { openCount, consultationCount, vaccinationCount };
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      if (kindFilter !== 'ALL' && item.kind !== kindFilter) return false;
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (!query) return true;

      return (
        item.pet.name.toLowerCase().includes(query) ||
        item.tutor.name.toLowerCase().includes(query) ||
        item.veterinarian.name.toLowerCase().includes(query) ||
        (item.vaccineName?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [items, kindFilter, search, statusFilter]);

  const hasActiveFilters =
    kindFilter !== 'ALL' || statusFilter !== 'ALL' || search.trim().length > 0;

  async function handleConfirmDelete() {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.kind === 'CONSULTATION') {
        await deleteConsultation.mutateAsync({
          id: itemToDelete.id,
          petId: itemToDelete.pet.id,
        });
      } else {
        await deleteVaccination.mutateAsync({
          id: itemToDelete.id,
          petId: itemToDelete.pet.id,
        });
      }

      toast.success('Atendimento excluído.');
      setItemToDelete(null);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao excluir atendimento';
      toast.error(message);
    }
  }

  return (
    <div className={pageShellClassName}>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className={pageTitleClassName}>Atendimento</h1>
          <p className={pageDescriptionClassName}>
            Encontre consultas e vacinações recentes, continue o que ficou em
            andamento ou inicie um novo.
          </p>
        </div>
        <Button
          className='w-full sm:w-auto'
          action='add'
          onClick={() => setIsNewSheetOpen(true)}
        >
          <Plus className='size-4' />
          Novo Atendimento
        </Button>
      </div>

      <div className='grid gap-3 sm:grid-cols-3'>
        <Card size='sm' className='bg-card'>
          <CardContent className='flex items-center gap-3'>
            <span className='flex size-9 items-center justify-center rounded-lg bg-amber-500/12 text-amber-700 dark:text-amber-300'>
              <CalendarClock className='size-4' />
            </span>
            <div>
              <p className='text-xs text-muted-foreground'>Em andamento</p>
              <p className='text-lg font-semibold tabular-nums'>
                {isLoading ? '—' : summary.openCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card size='sm'>
          <CardContent className='flex items-center gap-3'>
            <span className='flex size-9 items-center justify-center rounded-lg bg-sky-700 text-white'>
              <Stethoscope className='size-4' />
            </span>
            <div>
              <p className='text-xs text-muted-foreground'>Consultas</p>
              <p className='text-lg font-semibold tabular-nums'>
                {isLoading ? '—' : summary.consultationCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card size='sm'>
          <CardContent className='flex items-center gap-3'>
            <span className='flex size-9 items-center justify-center rounded-lg bg-emerald-700 text-white'>
              <Syringe className='size-4' />
            </span>
            <div>
              <p className='text-xs text-muted-foreground'>Vacinações</p>
              <p className='text-lg font-semibold tabular-nums'>
                {isLoading ? '—' : summary.vaccinationCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className='space-y-4'>
          <div className='flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <CardTitle>Últimos atendimentos</CardTitle>
              <CardDescription>
                {isLoading
                  ? 'Carregando registros da clínica.'
                  : `${filteredItems.length} de ${items.length} registros visíveis.`}
              </CardDescription>
            </div>
          </div>

          <div className='relative'>
            <Search className='absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Buscar por pet, tutor ou veterinário...'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className='pl-8'
            />
          </div>

          <div className='space-y-2'>
            <div className='flex flex-wrap items-center gap-1.5'>
              <span className='mr-1 text-xs font-medium text-muted-foreground'>
                Tipo
              </span>
              {KIND_FILTERS.map((filter) => (
                <FilterChip
                  key={filter.value}
                  active={kindFilter === filter.value}
                  onClick={() => setKindFilter(filter.value)}
                >
                  {filter.label}
                </FilterChip>
              ))}
            </div>
            <div className='flex flex-wrap items-center gap-1.5'>
              <span className='mr-1 text-xs font-medium text-muted-foreground'>
                Status
              </span>
              {STATUS_FILTERS.map((filter) => (
                <FilterChip
                  key={filter.value}
                  active={statusFilter === filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                >
                  {filter.label}
                </FilterChip>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-0 sm:px-6 sm:pb-4'>
          {isLoading && <ListSkeleton />}

          {error && (
            <p className='px-4 py-8 text-sm text-destructive sm:px-0'>
              Não foi possível carregar os atendimentos.
            </p>
          )}

          {!isLoading && !error && items.length === 0 && (
            <div className='flex flex-col items-center px-4 py-10 text-center sm:px-0'>
              <BrandImage
                src={SNIFF_DOG_SRC}
                alt=''
                className='size-36 object-contain'
              />
              <p className='-mt-4 text-sm font-medium'>
                Nenhum atendimento registrado ainda
              </p>
              <p className='mt-1 max-w-sm text-xs text-muted-foreground'>
                Comece uma consulta ou vacinação para acompanhar o histórico
                aqui.
              </p>
              <Button
                className='mt-4'
                size='sm'
                onClick={() => setIsNewSheetOpen(true)}
              >
                <Plus className='size-4' />
                Novo Atendimento
              </Button>
            </div>
          )}

          {!isLoading && !error && items.length > 0 && filteredItems.length === 0 && (
            <div className='px-4 py-10 text-center sm:px-0'>
              <p className='text-sm font-medium'>Nenhum resultado</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                Ajuste a busca ou os filtros para ver outros atendimentos.
              </p>
              {hasActiveFilters && (
                <Button
                  className='mt-3'
                  size='sm'
                  variant='outline'
                  onClick={() => {
                    setSearch('');
                    setKindFilter('ALL');
                    setStatusFilter('ALL');
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          )}

          {!isLoading && !error && filteredItems.length > 0 && (
            <>
              <div className='space-y-2 px-4 pb-4 sm:hidden'>
                {filteredItems.map((item) => (
                  <AtendimentoMobileCard
                    key={`${item.kind}-${item.id}`}
                    item={item}
                    onDelete={setItemToDelete}
                  />
                ))}
              </div>

              <div className='hidden overflow-x-auto sm:block'>
                <table className='w-full min-w-180 text-left'>
                  <thead>
                    <tr className='border-b bg-muted/40 text-xs tracking-wide text-foreground/70 uppercase'>
                      <th className='px-4 py-3 font-semibold'>Data</th>
                      <th className='px-4 py-3 font-semibold'>Tipo</th>
                      <th className='px-4 py-3 font-semibold'>Pet</th>
                      <th className='px-4 py-3 font-semibold'>Tutor</th>
                      <th className='px-4 py-3 font-semibold'>Veterinário</th>
                      <th className='px-4 py-3 font-semibold'>Status</th>
                      <th className='px-4 py-3 font-semibold text-right'>
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <AtendimentoRow
                        key={`${item.kind}-${item.id}`}
                        item={item}
                        onDelete={setItemToDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <NewAtendimentoSheet
        open={isNewSheetOpen}
        onOpenChange={setIsNewSheetOpen}
      />

      <Dialog
        open={itemToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setItemToDelete(null);
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Excluir atendimento?</DialogTitle>
            <DialogDescription>
              Esta ação não tem volta. O atendimento de{' '}
              <strong>{itemToDelete?.pet.name}</strong> (
              {itemToDelete?.tutor.name}) será removido permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setItemToDelete(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={() => void handleConfirmDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
