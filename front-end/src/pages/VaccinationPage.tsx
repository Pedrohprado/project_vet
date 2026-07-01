import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, PawPrint, Syringe } from 'lucide-react';
import { ApiError } from '@/api/http';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  pageShellClassName,
  pageTitleClassName,
  stickyActionBarClassName,
} from '@/lib/mobile-ui';
import { formatPetAge, formatPetWeight } from '@/lib/pet-format';
import { suggestNextDoseDate } from '@/lib/vaccination-format';
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

function stepStorageKey(vaccinationId: string) {
  return `vaccination-step-${vaccinationId}`;
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

  const [currentStep, setCurrentStep] = useState(0);
  const [cancelOpen, setCancelOpen] = useState(false);

  const [form, setForm] = useState({
    catalogSelection: '',
    vaccineName: '',
    dose: '',
    batch: '',
    manufacturer: '',
    notes: '',
    nextDoseAt: '',
  });

  useEffect(() => {
    if (!vaccination) return;

    const catalogId = vaccination.vaccineCatalogItemId ?? '';
    const isOther =
      !catalogId && Boolean(vaccination.vaccineName?.trim());

    setForm({
      catalogSelection: catalogId || (isOther ? OTHER_VACCINE_VALUE : ''),
      vaccineName: vaccination.vaccineName ?? '',
      dose: vaccination.dose ?? '',
      batch: vaccination.batch ?? '',
      manufacturer: vaccination.manufacturer ?? '',
      notes: vaccination.notes ?? '',
      nextDoseAt: vaccination.nextDoseAt
        ? vaccination.nextDoseAt.slice(0, 10)
        : '',
    });
  }, [vaccination]);

  useEffect(() => {
    if (!vaccination || vaccination.appliedAt) return;

    const stored = sessionStorage.getItem(stepStorageKey(vaccination.id));
    if (stored !== null) {
      setCurrentStep(Number(stored));
    }
  }, [vaccination?.id, vaccination?.appliedAt]);

  useEffect(() => {
    if (!id || vaccination?.appliedAt) return;
    sessionStorage.setItem(stepStorageKey(id), String(currentStep));
  }, [id, vaccination?.appliedAt, currentStep]);

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
      nextDoseAt: form.nextDoseAt || null,
    };
  }

  async function handleSave() {
    if (!id) return;
    await updateVaccination.mutateAsync({ id, data: buildUpdatePayload() });
  }

  function handleCatalogChange(value: string | null) {
    if (!value) return;

    const catalogItem = catalog.find((item) => item.id === value);
    const suggestedNext = catalogItem?.defaultIntervalDays
      ? suggestNextDoseDate(catalogItem.defaultIntervalDays)?.slice(0, 10)
      : '';

    setForm((prev) => ({
      ...prev,
      catalogSelection: value,
      vaccineName: value === OTHER_VACCINE_VALUE ? prev.vaccineName : catalogItem?.name ?? '',
      manufacturer:
        value === OTHER_VACCINE_VALUE
          ? prev.manufacturer
          : catalogItem?.manufacturer ?? prev.manufacturer,
      nextDoseAt: suggestedNext || prev.nextDoseAt,
    }));
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

    try {
      await finishVaccination.mutateAsync({
        id,
        data: buildUpdatePayload(),
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

  return (
    <div className={pageShellClassName}>
      <div className="flex flex-col gap-3">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isFinished ? 'secondary' : 'default'}>
              {isFinished ? 'Aplicada' : 'Em andamento'}
            </Badge>
          </div>
          <h1 className={pageTitleClassName}>Vacinação</h1>
          <div className="space-y-2">
            <div className="flex items-start gap-2.5">
              <Avatar className="size-9 shrink-0 sm:size-10">
                {pet.photoUrl ? (
                  <AvatarImage src={pet.photoUrl} alt={pet.name} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary">
                  <PawPrint className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-base font-semibold sm:text-lg">{pet.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  {pet.birthDate
                    ? formatPetAge(pet.birthDate)
                    : 'Idade não informada'}
                </p>
              </div>
            </div>
            <p className="text-sm font-medium sm:text-base">{tutor.name}</p>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Veterinário: {vaccination.veterinarian?.name ?? '—'}
            </p>
          </div>
        </div>
        {!isFinished && (
          <Button
            type="button"
            variant="outline"
            className="w-full text-destructive hover:text-destructive sm:w-auto sm:self-start"
            onClick={() => setCancelOpen(true)}
          >
            Cancelar vacinação
          </Button>
        )}
      </div>

      {!isFinished && (
        <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              type="button"
              onClick={() => index <= currentStep && setCurrentStep(index)}
              disabled={index > currentStep}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors',
                index === currentStep
                  ? 'border-primary bg-primary text-primary-foreground'
                  : index < currentStep
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground',
              )}
            >
              <Syringe className="size-3.5" />
              {step.label}
            </button>
          ))}
        </nav>
      )}

      <div ref={stepRef}>
        {isFinished ? (
          <Card>
            <CardHeader>
              <CardTitle>{vaccination.vaccineName}</CardTitle>
              <CardDescription>
                Aplicada em{' '}
                {new Date(vaccination.appliedAt!).toLocaleDateString('pt-BR')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {vaccination.dose ? <p>Dose: {vaccination.dose}</p> : null}
              {vaccination.batch ? <p>Lote: {vaccination.batch}</p> : null}
              {vaccination.manufacturer ? (
                <p>Fabricante: {vaccination.manufacturer}</p>
              ) : null}
              {vaccination.nextDoseAt ? (
                <p>
                  Próxima dose:{' '}
                  {new Date(vaccination.nextDoseAt).toLocaleDateString('pt-BR')}
                </p>
              ) : (
                <p>Sem reforço agendado</p>
              )}
              {vaccination.notes ? <p>Observações: {vaccination.notes}</p> : null}
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
                  value={form.catalogSelection}
                  onValueChange={handleCatalogChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a vacina" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalog.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                    <SelectItem value={OTHER_VACCINE_VALUE}>Outra</SelectItem>
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
                <DatePicker
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
    </div>
  );
}
