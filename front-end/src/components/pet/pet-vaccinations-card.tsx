import { Link } from 'react-router';
import { Syringe } from 'lucide-react';
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
import { usePetVaccinations } from '@/hooks/useVaccinations';
import {
  formatVaccinationDate,
  getVaccinationStatus,
  getVaccinationStatusLabel,
  groupLatestVaccinationsByName,
} from '@/lib/vaccination-format';
import type { Vaccination } from '@/types/vaccination';
import { cn } from '@/lib/utils';

type PetVaccinationsCardProps = {
  petId: string;
  openVaccinationId?: string;
};

function statusBadgeVariant(
  status: ReturnType<typeof getVaccinationStatus>,
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'VALID':
      return 'secondary';
    case 'EXPIRED':
      return 'destructive';
    case 'IN_PROGRESS':
      return 'default';
    default:
      return 'outline';
  }
}

function VaccinationRow({ vaccination }: { vaccination: Vaccination }) {
  const status = getVaccinationStatus(vaccination);
  const label = getVaccinationStatusLabel(vaccination);

  return (
    <div className="flex flex-wrap items-start justify-between gap-2 border-b py-3 last:border-b-0">
      <div className="min-w-0 space-y-1">
        <p className="font-medium">{vaccination.vaccineName || 'Vacinação'}</p>
        {vaccination.appliedAt ? (
          <p className="text-xs text-muted-foreground">
            Aplicada em {formatVaccinationDate(vaccination.appliedAt)}
            {vaccination.nextDoseAt
              ? ` · Próxima dose: ${formatVaccinationDate(vaccination.nextDoseAt)}`
              : ''}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Registro em andamento</p>
        )}
        {vaccination.dose ? (
          <p className="text-xs text-muted-foreground">Dose: {vaccination.dose}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={statusBadgeVariant(status)}>{label}</Badge>
        {status === 'IN_PROGRESS' ? (
          <Button variant="outline" size="sm" asChild>
            <Link to={`/vaccinations/${vaccination.id}`}>Continuar</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function PetVaccinationsCard({
  petId,
  openVaccinationId,
}: PetVaccinationsCardProps) {
  const { data: vaccinations = [], isLoading } = usePetVaccinations(petId);

  const inProgress = vaccinations.filter((item) => !item.appliedAt);
  const latestApplied = groupLatestVaccinationsByName(vaccinations);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Syringe className="size-5 shrink-0" />
          Vacinas
        </CardTitle>
        <CardDescription>
          Histórico de vacinas aplicadas e status de validade.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : inProgress.length === 0 && latestApplied.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma vacina registrada.
          </p>
        ) : (
          <div className={cn('divide-y')}>
            {inProgress.map((vaccination) => (
              <VaccinationRow key={vaccination.id} vaccination={vaccination} />
            ))}
            {latestApplied.map((vaccination) => (
              <VaccinationRow key={vaccination.id} vaccination={vaccination} />
            ))}
          </div>
        )}

        {openVaccinationId ? (
          <div className="mt-4">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/vaccinations/${openVaccinationId}`}>
                Continuar vacinação em andamento
              </Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
