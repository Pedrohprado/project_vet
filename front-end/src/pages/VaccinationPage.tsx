import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { ApiError } from '@/api/http';
import { ServiceDetailHeader } from '@/components/service-detail-header';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
import { formatPetAge } from '@/lib/pet-format';
import {
  pageShellClassName,
  stickyActionBarClassName,
} from '@/lib/mobile-ui';
import { addDays } from 'date-fns';
import { formatDateValue, parseDateValue } from '@/lib/date-input';
import { toClinicDate, toClinicDatePayload } from '@/lib/clinic-date';
import { getSafeMediaUrl } from '@/lib/safe-url';
import { cn } from '@/lib/utils';
import {
  formatVaccinationDate,
  suggestNextDoseDate,
} from '@/lib/vaccination-format';
import { useVaccineCatalog } from '@/hooks/useVaccineCatalog';
import {
  useDeleteVaccination,
  useFinishVaccination,
  useUpdateVaccination,
  useVaccination,
} from '@/hooks/useVaccinations';

const STEPS = [
  { id: 'vaccine', label: 'Dados da vacina' },
  { id: 'next-dose', label: 'Próxima dose' },
] as const;

const OTHER_VACCINE_VALUE = '__other__';

const NEXT_DOSE_PRESETS = [
  { days: 21, label: '21 dias' },
  { days: 28, label: '28 dias' },
  { days: 365, label: '1 ano' },
] as const;

function nextDoseDateFromApplied(appliedAt: string, days: number) {
  const base = parseDateValue(appliedAt) ?? new Date();
  return formatDateValue(addDays(base, days));
}

type NextDoseDateFieldProps = {
  appliedAt: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
};

function NextDoseDateField({
  appliedAt,
  value,
  onChange,
  id,
  placeholder = 'Opcional',
}: NextDoseDateFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {NEXT_DOSE_PRESETS.map((preset) => {
          const presetValue = nextDoseDateFromApplied(appliedAt, preset.days);
          return (
            <Button
              key={preset.days}
              type="button"
              variant={value === presetValue ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange(presetValue)}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>
      <DatePicker
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

function stepStorageKey(vaccinationId: string) {
  return `vaccination-step-${vaccinationId}`;
}

function todayDateValue() {
  return formatDateValue(new Date());
}

function isFutureDateValue(value: string) {
  if (!value) return false;
  return value > todayDateValue();
}

export function VaccinationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const stepRef = useRef<HTMLDivElement>(null);
  const { data: vaccination, isLoading } = useVaccination(id);
  const { data: catalog = [] } = useVaccineCatalog();
  const updateVaccination = useUpdateVaccination();
  const finishVaccination = useFinishVaccination();
  const deleteVaccination = useDeleteVaccination();

  const catalogSelectItems = useMemo(
    () => [
      ...catalog.map((item) => ({ value: item.id, label: item.name })),
      { value: OTHER_VACCINE_VALUE, label: 'Outra' },
    ],
    [catalog],
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [form, setForm] = useState({
    catalogSelection: '',
    vaccineName: '',
    dose: '',
    batch: '',
    manufacturer: '',
    notes: '',
    appliedAt: todayDateValue(),
    nextDoseAt: '',
  });

  const vaccinationAppliedAt = vaccination?.appliedAt;
  const [hydratedVaccinationId, setHydratedVaccinationId] = useState<
    string | null
  >(null);
  const [initializedStepForVaccinationId, setInitializedStepForVaccinationId] =
    useState<string | null>(null);

  if (vaccination && vaccination.id !== hydratedVaccinationId) {
    setHydratedVaccinationId(vaccination.id);

    const catalogId = vaccination.vaccineCatalogItemId ?? '';
    const isOther = !catalogId && Boolean(vaccination.vaccineName?.trim());

    setForm({
      catalogSelection: catalogId || (isOther ? OTHER_VACCINE_VALUE : ''),
      vaccineName: vaccination.vaccineName ?? '',
      dose: vaccination.dose ?? '',
      batch: vaccination.batch ?? '',
      manufacturer: vaccination.manufacturer ?? '',
      notes: vaccination.notes ?? '',
      appliedAt: vaccination.appliedAt
        ? formatDateValue(toClinicDate(vaccination.appliedAt))
        : todayDateValue(),
      nextDoseAt: vaccination.nextDoseAt
        ? formatDateValue(toClinicDate(vaccination.nextDoseAt))
        : '',
    });
  }

  if (
    vaccination &&
    !vaccination.appliedAt &&
    vaccination.id !== initializedStepForVaccinationId
  ) {
    const stored = sessionStorage.getItem(stepStorageKey(vaccination.id));
    if (stored !== null) {
      setCurrentStep(Number(stored));
    }
    setInitializedStepForVaccinationId(vaccination.id);
  }

  if (
    vaccination?.appliedAt &&
    vaccination.id !== initializedStepForVaccinationId
  ) {
    setInitializedStepForVaccinationId(vaccination.id);
  }

  useEffect(() => {
    if (!id || vaccinationAppliedAt) return;
    sessionStorage.setItem(stepStorageKey(id), String(currentStep));
  }, [id, vaccinationAppliedAt, currentStep]);

  useEffect(() => {
    stepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep]);

  function buildUpdatePayload() {
    const isOther = form.catalogSelection === OTHER_VACCINE_VALUE;
    const catalogItem = catalog.find((item) => item.id === form.catalogSelection);

    return {
      vaccineCatalogItemId: isOther
        ? null
        : form.catalogSelection || undefined,
      vaccineName: isOther
        ? form.vaccineName || undefined
        : catalogItem?.name ?? (form.vaccineName || undefined),
      dose: form.dose || undefined,
      batch: form.batch || undefined,
      manufacturer: form.manufacturer || undefined,
      notes: form.notes || undefined,
      nextDoseAt: toClinicDatePayload(form.nextDoseAt),
    };
  }

  async function handleSave() {
    if (!id) return;
    await updateVaccination.mutateAsync({ id, data: buildUpdatePayload() });
  }

  function handleCatalogChange(value: string | null) {
    if (!value) return;

    const catalogItem = catalog.find((item) => item.id === value);

    setForm((prev) => {
      const suggestedNext = catalogItem?.defaultIntervalDays
        ? suggestNextDoseDate(
            catalogItem.defaultIntervalDays,
            prev.appliedAt || new Date(),
          )?.slice(0, 10)
        : '';

      return {
        ...prev,
        catalogSelection: value,
        vaccineName:
          value === OTHER_VACCINE_VALUE
            ? prev.vaccineName
            : catalogItem?.name ?? '',
        manufacturer:
          value === OTHER_VACCINE_VALUE
            ? prev.manufacturer
            : catalogItem?.manufacturer ?? prev.manufacturer,
        nextDoseAt: suggestedNext || prev.nextDoseAt,
      };
    });
  }

  function handleAppliedAtChange(value: string) {
    setForm((prev) => {
      const catalogItem = catalog.find(
        (item) => item.id === prev.catalogSelection,
      );
      const suggestedNext = catalogItem?.defaultIntervalDays
        ? suggestNextDoseDate(
            catalogItem.defaultIntervalDays,
            value || new Date(),
          )?.slice(0, 10)
        : undefined;

      return {
        ...prev,
        appliedAt: value,
        nextDoseAt: suggestedNext ?? prev.nextDoseAt,
      };
    });
  }

  async function handleContinue() {
    if (!vaccination) return;

    try {
      if (currentStep === 0) {
        if (form.catalogSelection === OTHER_VACCINE_VALUE && !form.vaccineName.trim()) {
          toast.error('Informe o nome da vacina');
          return;
        }

        if (!form.catalogSelection) {
          toast.error('Selecione uma vacina do catálogo ou escolha Outra');
          return;
        }

        if (!form.appliedAt) {
          toast.error('Informe a data de aplicação');
          return;
        }

        if (isFutureDateValue(form.appliedAt)) {
          toast.error('Data de aplicação não pode ser no futuro');
          return;
        }

        await handleSave();
        setCurrentStep(1);
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Erro ao salvar etapa',
      );
    }
  }

  async function handleFinish() {
    if (!id || !vaccination?.pet) return;

    if (!form.appliedAt) {
      toast.error('Informe a data de aplicação');
      return;
    }

    if (isFutureDateValue(form.appliedAt)) {
      toast.error('Data de aplicação não pode ser no futuro');
      return;
    }

    try {
      await finishVaccination.mutateAsync({
        id,
        data: {
          ...buildUpdatePayload(),
          appliedAt: form.appliedAt,
        },
      });
      toast.success('Vacinação finalizada! Lembrete registrado se houver próxima dose.');
      void navigate(
        `/tutors/${vaccination.pet.tutor.id}/pets/${vaccination.petId}`,
      );
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Erro ao finalizar vacinação',
      );
    }
  }

  async function handleSaveNextDose() {
    if (!id) return;

    try {
      await updateVaccination.mutateAsync({
        id,
        data: { nextDoseAt: toClinicDatePayload(form.nextDoseAt) },
      });
      toast.success('Próxima dose atualizada.');
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Erro ao atualizar a próxima dose',
      );
    }
  }

  async function handleConfirmCancel() {
    if (!vaccination?.pet) return;

    try {
      await deleteVaccination.mutateAsync({
        id: vaccination.id,
        petId: vaccination.petId,
      });
      toast.success('Vacinação cancelada.');
      setCancelOpen(false);
      void navigate(
        `/tutors/${vaccination.pet.tutor.id}/pets/${vaccination.petId}`,
      );
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Erro ao cancelar vacinação',
      );
    }
  }

  async function handleConfirmDelete() {
    if (!vaccination?.pet) return;

    try {
      await deleteVaccination.mutateAsync({
        id: vaccination.id,
        petId: vaccination.petId,
      });
      toast.success('Vacina excluída.');
      setDeleteOpen(false);
      void navigate(
        `/tutors/${vaccination.pet.tutor.id}/pets/${vaccination.petId}`,
      );
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Erro ao excluir vacina',
      );
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground">Carregando vacinação...</p>;
  }

  if (!vaccination?.pet) {
    return <p className="text-muted-foreground">Vacinação não encontrada.</p>;
  }

  const isFinished = Boolean(vaccination.appliedAt);
  const isLastStep = currentStep === STEPS.length - 1;
  const pet = vaccination.pet;
  const tutor = pet.tutor;
  const petPhotoUrl = getSafeMediaUrl(pet.photoUrl);
  const savedNextDoseAt = vaccination.nextDoseAt
    ? formatDateValue(toClinicDate(vaccination.nextDoseAt))
    : '';

  return (
    <div className={pageShellClassName}>
      <ServiceDetailHeader
        backTo={`/tutors/${tutor.id}/pets/${pet.id}`}
        title="Vacinação"
        statusLabel={isFinished ? 'Aplicada' : 'Em andamento'}
        statusVariant={isFinished ? 'secondary' : 'default'}
        petName={pet.name}
        petPhotoUrl={petPhotoUrl}
        petSubtitle={
          pet.birthDate ? formatPetAge(pet.birthDate) : 'Idade não informada'
        }
        tutorName={tutor.name}
        meta={[
          {
            label: 'Veterinário',
            value: vaccination.veterinarian?.name ?? '—',
          },
          ...(isFinished
            ? [
                {
                  label: 'Aplicada em',
                  value: formatVaccinationDate(vaccination.appliedAt),
                },
              ]
            : []),
        ]}
        actions={
          !isFinished ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setCancelOpen(true)}
            >
              Cancelar vacinação
            </Button>
          ) : null
        }
      />

      {!isFinished && (
        <nav className="-mx-4 flex min-w-0 gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => index <= currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                  isCurrent &&
                    'border-primary bg-primary text-primary-foreground',
                  isCompleted &&
                    'border-emerald-950 bg-emerald-50 text-emerald-950 hover:bg-emerald-100',
                  !isCurrent &&
                    !isCompleted &&
                    'border-border bg-background text-muted-foreground',
                )}
              >
                {isCompleted ? (
                  <Check
                    className="size-3 shrink-0 text-emerald-950"
                    strokeWidth={2.5}
                  />
                ) : (
                  <span className="tabular-nums">{index + 1}.</span>
                )}
                {step.label}
              </button>
            );
          })}
        </nav>
      )}

      <div ref={stepRef}>
        {isFinished ? (
          <Card>
            <CardHeader>
              <CardTitle>{vaccination.vaccineName || 'Vacina'}</CardTitle>
              <CardDescription>
                Registro da aplicação e data da próxima dose.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <dt className="text-xs text-muted-foreground">Dose</dt>
                  <dd className="text-sm font-medium">
                    {vaccination.dose || '—'}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs text-muted-foreground">Lote</dt>
                  <dd className="text-sm font-medium">
                    {vaccination.batch || '—'}
                  </dd>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Fabricante</dt>
                  <dd className="text-sm font-medium">
                    {vaccination.manufacturer || '—'}
                  </dd>
                </div>
              </dl>

              <Separator />

              <div className="max-w-sm space-y-2">
                <Label htmlFor="finished-next-dose">Próxima dose</Label>
                <NextDoseDateField
                  id="finished-next-dose"
                  appliedAt={form.appliedAt}
                  value={form.nextDoseAt}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, nextDoseAt: value }))
                  }
                  placeholder="Sem reforço agendado"
                />
              </div>

              {vaccination.notes ? (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Observações</p>
                  <p className="text-sm whitespace-pre-wrap">
                    {vaccination.notes}
                  </p>
                </div>
              ) : null}

              <Separator />

              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  Excluir vacina
                </Button>
                <Button
                  type="button"
                  action="save"
                  onClick={() => void handleSaveNextDose()}
                  disabled={
                    updateVaccination.isPending ||
                    form.nextDoseAt === savedNextDoseAt
                  }
                >
                  {updateVaccination.isPending
                    ? 'Salvando...'
                    : 'Salvar alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : currentStep === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Dados da vacina</CardTitle>
              <CardDescription>
                Selecione do catálogo ou informe uma vacina personalizada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Vacina</Label>
                <Select
                  items={catalogSelectItems}
                  value={form.catalogSelection}
                  onValueChange={handleCatalogChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a vacina" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogSelectItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {form.catalogSelection === OTHER_VACCINE_VALUE && (
                <div className="space-y-2">
                  <Label htmlFor="vaccineName">Nome da vacina</Label>
                  <Input
                    id="vaccineName"
                    value={form.vaccineName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        vaccineName: e.target.value,
                      }))
                    }
                    placeholder="Ex.: Vacina personalizada"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Data da aplicação</Label>
                <DatePicker
                  value={form.appliedAt}
                  onChange={handleAppliedAtChange}
                  toDate={new Date()}
                  placeholder="Quando a vacina foi aplicada"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dose">Dose</Label>
                  <Input
                    id="dose"
                    value={form.dose}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, dose: e.target.value }))
                    }
                    placeholder="Ex.: 1ª dose"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch">Lote</Label>
                  <Input
                    id="batch"
                    value={form.batch}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, batch: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">Fabricante</Label>
                <Input
                  id="manufacturer"
                  value={form.manufacturer}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      manufacturer: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Próxima dose</CardTitle>
              <CardDescription>
                Informe quando o reforço deve ser aplicado, se necessário.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Data da próxima dose</Label>
                <NextDoseDateField
                  appliedAt={form.appliedAt}
                  value={form.nextDoseAt}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, nextDoseAt: value }))
                  }
                  placeholder="Opcional"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {!isFinished && (
        <div className={stickyActionBarClassName}>
          <div className="mx-auto flex w-full max-w-3xl gap-2">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setCurrentStep((step) => step - 1)}
              >
                <ChevronLeft className="size-4" />
                Voltar
              </Button>
            )}
            {!isLastStep ? (
              <Button
                type="button"
                className="flex-1"
                action="continue"
                onClick={() => void handleContinue()}
                disabled={updateVaccination.isPending}
              >
                {updateVaccination.isPending ? 'Salvando...' : 'Continuar'}
                <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                className="flex-1"
                action="finish"
                onClick={() => void handleFinish()}
                disabled={finishVaccination.isPending}
              >
                {finishVaccination.isPending
                  ? 'Finalizando...'
                  : 'Finalizar vacinação'}
              </Button>
            )}
          </div>
        </div>
      )}

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar vacinação?</DialogTitle>
            <DialogDescription>
              Os dados não finalizados serão descartados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleConfirmCancel()}
              disabled={deleteVaccination.isPending}
            >
              {deleteVaccination.isPending ? 'Cancelando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir vacina?</DialogTitle>
            <DialogDescription>
              O registro aplicado, o lembrete e o agendamento da próxima dose
              serão removidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
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
    </div>
  );
}
