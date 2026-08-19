import { useState } from 'react';
import { Link } from 'react-router';
import { Pencil, Syringe, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDeleteVaccination,
  usePetVaccinations,
  useUpdateVaccination,
} from '@/hooks/useVaccinations';
import { toClinicDate, toClinicDatePayload } from '@/lib/clinic-date';
import { formatDateValue } from '@/lib/date-input';
import {
  formatVaccinationDate,
  getVaccinationStatus,
  getVaccinationStatusLabel,
} from '@/lib/vaccination-format';
import type { Vaccination } from '@/types/vaccination';
import { cn } from '@/lib/utils';

type PetVaccinationsCardProps = {
  petId: string;
  openVaccinationId?: string;
};

function statusBadgeVariant(
  status: ReturnType<typeof getVaccinationStatus>,
): BadgeVariant {
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

function VaccinationRow({
  vaccination,
  onEditNextDose,
  onDelete,
}: {
  vaccination: Vaccination;
  onEditNextDose: (vaccination: Vaccination) => void;
  onDelete: (vaccination: Vaccination) => void;
}) {
  const status = getVaccinationStatus(vaccination);
  const label = getVaccinationStatusLabel(vaccination);
  const isApplied = Boolean(vaccination.appliedAt);

  return (
    <div className="flex flex-wrap items-start justify-between gap-2 border-b py-3 last:border-b-0">
      <div className="min-w-0 space-y-1">
        <p className="font-medium">{vaccination.vaccineName || 'Vacinação'}</p>
        {isApplied ? (
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
        ) : (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Editar próxima dose"
            onClick={() => onEditNextDose(vaccination)}
          >
            <Pencil className="size-3.5" />
          </Button>
        )}
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          aria-label="Excluir vacina"
          onClick={() => onDelete(vaccination)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function PetVaccinationsCard({
  petId,
  openVaccinationId,
}: PetVaccinationsCardProps) {
  const { data: vaccinations = [], isLoading } = usePetVaccinations(petId);
  const updateVaccination = useUpdateVaccination();
  const deleteVaccination = useDeleteVaccination();

  const [editing, setEditing] = useState<Vaccination | null>(null);
  const [nextDoseAt, setNextDoseAt] = useState('');
  const [deleting, setDeleting] = useState<Vaccination | null>(null);

  const inProgress = vaccinations.filter((item) => !item.appliedAt);
  const applied = vaccinations
    .filter((item) => item.appliedAt)
    .sort(
      (a, b) =>
        new Date(b.appliedAt!).getTime() - new Date(a.appliedAt!).getTime(),
    );

  function openEdit(vaccination: Vaccination) {
    setEditing(vaccination);
    setNextDoseAt(
      vaccination.nextDoseAt
        ? formatDateValue(toClinicDate(vaccination.nextDoseAt))
        : '',
    );
  }

  async function handleSaveNextDose() {
    if (!editing) return;

    try {
      await updateVaccination.mutateAsync({
        id: editing.id,
        data: { nextDoseAt: toClinicDatePayload(nextDoseAt) },
      });
      toast.success('Próxima dose atualizada.');
      setEditing(null);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Erro ao atualizar a próxima dose',
      );
    }
  }

  async function handleConfirmDelete() {
    if (!deleting) return;

    try {
      await deleteVaccination.mutateAsync({
        id: deleting.id,
        petId,
      });
      toast.success('Vacina excluída.');
      setDeleting(null);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Erro ao excluir vacina',
      );
    }
  }

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
        ) : inProgress.length === 0 && applied.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma vacina registrada.
          </p>
        ) : (
          <div className={cn('divide-y')}>
            {inProgress.map((vaccination) => (
              <VaccinationRow
                key={vaccination.id}
                vaccination={vaccination}
                onEditNextDose={openEdit}
                onDelete={setDeleting}
              />
            ))}
            {applied.map((vaccination) => (
              <VaccinationRow
                key={vaccination.id}
                vaccination={vaccination}
                onEditNextDose={openEdit}
                onDelete={setDeleting}
              />
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

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar próxima dose</DialogTitle>
            <DialogDescription>
              {editing?.vaccineName
                ? `Atualize a data da próxima dose de ${editing.vaccineName}.`
                : 'Atualize a data da próxima dose.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="next-dose-edit">Próxima dose</Label>
            <DatePicker
              id="next-dose-edit"
              value={nextDoseAt}
              onChange={setNextDoseAt}
              placeholder="Deixe em branco para remover"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => void handleSaveNextDose()}
              action="save"
              disabled={updateVaccination.isPending}
            >
              {updateVaccination.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir vacina?</DialogTitle>
            <DialogDescription>
              {deleting?.appliedAt
                ? 'O registro aplicado, o lembrete e o agendamento da próxima dose serão removidos.'
                : 'Os dados não finalizados serão descartados.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
              disabled={deleteVaccination.isPending}
            >
              {deleteVaccination.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
