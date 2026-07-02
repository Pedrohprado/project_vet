import { Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

function WeightRecordRow({
  record,
  isLatest,
}: {
  record: PetWeightRecord;
  isLatest: boolean;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 border-b py-3 last:border-b-0">
      <div className="min-w-0 space-y-1">
        <p className={cn('font-medium', isLatest && 'text-primary')}>
          {formatPetWeight(record.weightKg)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatRecordDate(record.recordedAt)}
          {record.veterinarian?.name
            ? ` · ${record.veterinarian.name}`
            : ''}
        </p>
      </div>
      <Badge variant={isLatest ? 'default' : 'outline'}>
        {PET_WEIGHT_RECORD_SOURCE_LABELS[record.source]}
      </Badge>
    </div>
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
        <CardDescription>
          Evolução do peso registrado ao longo do tempo.
        </CardDescription>
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
          <div className="divide-y">
            {records.map((record, index) => (
              <WeightRecordRow
                key={record.id}
                record={record}
                isLatest={index === 0}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
