import { Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePetWeightRecords } from '@/hooks/usePetWeightRecords';
import { formatPetWeight } from '@/lib/pet-format';
import { cn } from '@/lib/utils';
import {
  PET_WEIGHT_RECORD_SOURCE_LABELS,
  type PetWeightRecord,
} from '@/types/pet-weight-record';

type PetWeightHistoryCardProps = {
  petId: string;
};

function formatRecordDate(recordedAt: string) {
  return new Date(recordedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function WeightRecordItem({
  record,
  isLatest,
}: {
  record: PetWeightRecord;
  isLatest: boolean;
}) {
  return (
    <li className="relative pb-6 last:pb-0">
      <span
        className={cn(
          'absolute -left-6.5 top-1 flex size-3 rounded-full border-2 border-background',
          isLatest ? 'bg-primary' : 'bg-muted-foreground/40',
        )}
        aria-hidden="true"
      />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={cn('text-sm font-medium', isLatest && 'text-primary')}>
            {formatPetWeight(record.weightKg)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatRecordDate(record.recordedAt)}
          </p>
        </div>
        <Badge variant={isLatest ? 'default' : 'outline'} className="shrink-0">
          {PET_WEIGHT_RECORD_SOURCE_LABELS[record.source]}
        </Badge>
      </div>
    </li>
  );
}

export function PetWeightHistoryCard({ petId }: PetWeightHistoryCardProps) {
  const { data: records = [], isLoading } = usePetWeightRecords(petId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scale className="size-5 shrink-0" />
          Histórico de peso
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : records.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum registro de peso.
          </p>
        ) : (
          <ol className="ml-4 border-l border-border pl-6">
            {records.map((record, index) => (
              <WeightRecordItem
                key={record.id}
                record={record}
                isLatest={index === 0}
              />
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
