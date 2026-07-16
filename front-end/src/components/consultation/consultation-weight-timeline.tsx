import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { formatPetWeight } from '@/lib/pet-format';
import { cn } from '@/lib/utils';
import type { PetWeightRecord } from '@/types/pet-weight-record';

type WeightTimelineItem =
  | { kind: 'pending'; weightKg: number }
  | { kind: 'record'; record: PetWeightRecord };

function formatRecordDate(recordedAt: string) {
  return new Date(recordedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function buildTimelineItems(
  records: PetWeightRecord[],
  consultationId: string | undefined,
  pendingWeightKg: number | null,
  limit = 3,
): WeightTimelineItem[] {
  const items: WeightTimelineItem[] = [];

  if (pendingWeightKg !== null) {
    items.push({ kind: 'pending', weightKg: pendingWeightKg });
  }

  for (const record of records) {
    if (pendingWeightKg !== null && record.consultationId === consultationId) {
      continue;
    }

    items.push({ kind: 'record', record });

    if (items.length >= limit) {
      break;
    }
  }

  return items;
}

type ConsultationWeightTimelineProps = {
  records: PetWeightRecord[];
  consultationId: string;
  pendingWeightKg?: number | null;
  disabled?: boolean;
  onAddClick: () => void;
};

export function ConsultationWeightTimeline({
  records,
  consultationId,
  pendingWeightKg = null,
  disabled = false,
  onAddClick,
}: ConsultationWeightTimelineProps) {
  const items = buildTimelineItems(records, consultationId, pendingWeightKg);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>Peso (kg)</Label>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shrink-0"
          disabled={disabled}
          onClick={onAddClick}
          aria-label="Adicionar pesagem"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nenhuma pesagem registrada.
        </p>
      ) : (
        <ol className="flex w-full pt-1">
          {items.map((item, index) => {
            const isLatest = index === 0;
            const isLast = index === items.length - 1;
            const weightKg =
              item.kind === 'pending'
                ? String(item.weightKg)
                : item.record.weightKg;
            const dateLabel =
              item.kind === 'pending'
                ? 'Esta consulta'
                : formatRecordDate(item.record.recordedAt);

            return (
              <li
                key={item.kind === 'pending' ? 'pending' : item.record.id}
                className="relative flex min-w-0 flex-1 flex-col items-center"
              >
                <div className="relative flex h-5 w-full items-center justify-center">
                  {!isLast ? (
                    <span
                      className="absolute top-1/2 left-1/2 h-px w-full -translate-y-1/2 bg-border"
                      aria-hidden="true"
                    />
                  ) : null}
                  <span
                    className={cn(
                      'relative z-10 flex size-2.5 shrink-0 rounded-full border-2 border-background',
                      isLatest ? 'bg-primary' : 'bg-muted-foreground/40',
                    )}
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-1 w-full text-center">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isLatest && 'text-primary',
                    )}
                  >
                    {formatPetWeight(weightKg)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {dateLabel}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
