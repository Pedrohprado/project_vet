import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { getConsultation } from '@/api/consultations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useConsultations } from '@/hooks/useConsultations';
import { cn } from '@/lib/utils';
import { CONSULTATION_STATUS_LABELS } from '@/types/consultation';
import { PET_SPECIES_LABELS } from '@/types/pet';
import type { Consultation, ConsultationListItem } from '@/types/consultation';
import type { PetSpecies } from '@/types/tutor';

const SHAREABLE_STATUSES = new Set(['FINISHED', 'RETURN_SCHEDULED']);

type SelectConsultationForShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (consultation: Consultation) => void;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function SelectConsultationForShareDialog({
  open,
  onOpenChange,
  onSelect,
}: SelectConsultationForShareDialogProps) {
  const { data, isLoading, isError } = useConsultations(1, 50);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const shareableItems = useMemo(
    () =>
      (data?.items ?? []).filter((item) => SHAREABLE_STATUSES.has(item.status)),
    [data?.items],
  );

  async function handleSelect(item: ConsultationListItem) {
    if (item.sharedInCommunity) return;
    setLoadingId(item.id);
    try {
      const consultation = await getConsultation(item.id);
      onOpenChange(false);
      onSelect(consultation);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Erro ao carregar a consulta',
      );
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden sm:max-w-lg">
        <DialogHeader className="mb-4">
          <DialogTitle>Compartilhar caso</DialogTitle>
          <DialogDescription>
            Escolha um atendimento finalizado para publicar na comunidade.
          </DialogDescription>
          <p className="text-xs font-normal text-muted-foreground/70">
            Os dados de tutores e do pet serão anonimizados.
          </p>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto py-2 pr-1">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive">
              Não foi possível carregar os atendimentos.
            </p>
          ) : shareableItems.length === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma consulta finalizada disponível para compartilhar.
            </p>
          ) : (
            <ul className="space-y-2">
              {shareableItems.map((item) => {
                const speciesLabel =
                  PET_SPECIES_LABELS[item.pet.species as PetSpecies] ??
                  item.pet.species;
                const alreadyShared = item.sharedInCommunity;

                return (
                  <li
                    key={item.id}
                    className={cn(
                      'flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between',
                      alreadyShared && 'opacity-50 grayscale',
                    )}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">{item.pet.name}</p>
                        <Badge variant="secondary">{speciesLabel}</Badge>
                        <Badge variant="outline">
                          {CONSULTATION_STATUS_LABELS[item.status]}
                        </Badge>
                        {alreadyShared ? (
                          <Badge variant="outline">Já compartilhada</Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.tutor.name} · {item.veterinarian.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(item.finishedAt ?? item.startedAt)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="w-full shrink-0 sm:w-auto"
                      disabled={alreadyShared || loadingId !== null}
                      onClick={() => void handleSelect(item)}
                    >
                      {alreadyShared
                        ? 'Já compartilhada'
                        : loadingId === item.id
                          ? 'Carregando...'
                          : 'Compartilhar'}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
