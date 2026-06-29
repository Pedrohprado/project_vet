import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { ApiError } from '@/api/http';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
  stickyActionBarClassName,
} from '@/lib/mobile-ui';
import {
  useAddPrescription,
  useConsultation,
  useFinishConsultation,
  useRemovePrescription,
  useUpdateConsultation,
} from '@/hooks/useConsultations';
import type { Consultation } from '@/types/consultation';
import { PET_SPECIES_LABELS } from '@/types/pet';

const STEPS = [
  { id: 'anamnesis', label: 'Anamnese' },
  { id: 'diagnosis', label: 'Diagnóstico' },
  { id: 'prescription', label: 'Receita' },
  { id: 'return', label: 'Retorno' },
] as const;

function stepStorageKey(consultationId: string) {
  return `consultation-step-${consultationId}`;
}

function inferStep(consultation: Consultation): number {
  const hasAnamnesis = Boolean(
    consultation.mainComplaint ||
      consultation.history ||
      consultation.physicalExam ||
      consultation.weightKg ||
      consultation.temperature,
  );
  const hasDiagnosis = Boolean(consultation.diagnosis || consultation.conduct);

  if (!hasAnamnesis) return 0;
  if (!hasDiagnosis) return 1;
  if (!consultation.needsReturn && consultation.prescriptions.length === 0) {
    return 2;
  }
  return 3;
}

export function ConsultationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const stepRef = useRef<HTMLDivElement>(null);
  const { data: consultation, isLoading } = useConsultation(id);
  const updateConsultation = useUpdateConsultation();
  const addPrescription = useAddPrescription();
  const removePrescription = useRemovePrescription();
  const finishConsultation = useFinishConsultation();

  const [currentStep, setCurrentStep] = useState(0);

  const [anamnesis, setAnamnesis] = useState({
    mainComplaint: '',
    history: '',
    physicalExam: '',
    weightKg: '',
    temperature: '',
    observations: '',
  });

  const [clinical, setClinical] = useState({
    diagnosis: '',
    conduct: '',
  });

  const [returnInfo, setReturnInfo] = useState({
    needsReturn: false,
    returnDate: '',
  });

  const [prescriptionForm, setPrescriptionForm] = useState({
    medicineName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  });

  useEffect(() => {
    if (!consultation) return;

    setAnamnesis({
      mainComplaint: consultation.mainComplaint ?? '',
      history: consultation.history ?? '',
      physicalExam: consultation.physicalExam ?? '',
      weightKg: consultation.weightKg ?? '',
      temperature: consultation.temperature ?? '',
      observations: consultation.observations ?? '',
    });

    setClinical({
      diagnosis: consultation.diagnosis ?? '',
      conduct: consultation.conduct ?? '',
    });

    setReturnInfo({
      needsReturn: consultation.needsReturn,
      returnDate: consultation.returnDate
        ? consultation.returnDate.slice(0, 10)
        : '',
    });
  }, [consultation]);

  useEffect(() => {
    if (!consultation || consultation.status === 'FINISHED') return;

    const stored = sessionStorage.getItem(stepStorageKey(consultation.id));
    if (stored !== null) {
      setCurrentStep(Number(stored));
    } else {
      setCurrentStep(inferStep(consultation));
    }
  }, [consultation?.id, consultation?.status]);

  useEffect(() => {
    if (!id || consultation?.status !== 'OPEN') return;
    sessionStorage.setItem(stepStorageKey(id), String(currentStep));
  }, [id, consultation?.status, currentStep]);

  useEffect(() => {
    stepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep]);

  async function handleSaveAnamnesis() {
    if (!id) return;

    await updateConsultation.mutateAsync({
      id,
      data: {
        mainComplaint: anamnesis.mainComplaint || undefined,
        history: anamnesis.history || undefined,
        physicalExam: anamnesis.physicalExam || undefined,
        weightKg: anamnesis.weightKg ? Number(anamnesis.weightKg) : undefined,
        temperature: anamnesis.temperature
          ? Number(anamnesis.temperature)
          : undefined,
        observations: anamnesis.observations || undefined,
      },
    });
  }

  async function handleSaveClinical() {
    if (!id) return;

    await updateConsultation.mutateAsync({
      id,
      data: {
        diagnosis: clinical.diagnosis || undefined,
        conduct: clinical.conduct || undefined,
      },
    });
  }

  async function handleSaveReturn() {
    if (!id) return;

    await updateConsultation.mutateAsync({
      id,
      data: {
        needsReturn: returnInfo.needsReturn,
        returnDate: returnInfo.returnDate || undefined,
      },
    });
  }

  async function handleAddPrescription(event: React.FormEvent) {
    event.preventDefault();
    if (!id || !prescriptionForm.medicineName) return;

    await addPrescription.mutateAsync({
      consultationId: id,
      data: {
        medicineName: prescriptionForm.medicineName,
        dosage: prescriptionForm.dosage || undefined,
        frequency: prescriptionForm.frequency || undefined,
        duration: prescriptionForm.duration || undefined,
        instructions: prescriptionForm.instructions || undefined,
      },
    });

    setPrescriptionForm({
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    });
    toast.success('Medicamento adicionado!');
  }

  async function handleRemovePrescription(prescriptionId: string) {
    if (!id) return;

    await removePrescription.mutateAsync({ consultationId: id, prescriptionId });
    toast.success('Medicamento removido!');
  }

  async function handleContinue() {
    if (!consultation) return;

    try {
      if (currentStep === 0) {
        await handleSaveAnamnesis();
        toast.success('Anamnese salva!');
      } else if (currentStep === 1) {
        await handleSaveClinical();
        toast.success('Diagnóstico salvo!');
      } else if (currentStep === 2) {
        toast.success('Receita registrada!');
      } else if (currentStep === 3) {
        await handleSaveReturn();
      }

      if (currentStep < STEPS.length - 1) {
        setCurrentStep((step) => step + 1);
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Erro ao salvar etapa',
      );
    }
  }

  async function handleFinish() {
    if (!id || !consultation) return;

    try {
      await handleSaveReturn();
      await finishConsultation.mutateAsync({
        id,
        data: {
          diagnosis: clinical.diagnosis || undefined,
          conduct: clinical.conduct || undefined,
          needsReturn: returnInfo.needsReturn,
          returnDate: returnInfo.returnDate || undefined,
        },
      });
      toast.success('Consulta finalizada! Notificação pós-consulta registrada.');
      void navigate(`/tutors/${consultation.tutorId}/pets/${consultation.petId}`);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Erro ao finalizar consulta',
      );
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground">Carregando consulta...</p>;
  }

  if (!consultation) {
    return <p className="text-muted-foreground">Consulta não encontrada.</p>;
  }

  const isFinished = consultation.status === 'FINISHED';
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className={pageShellClassName}>
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <Badge variant={isFinished ? 'secondary' : 'default'}>
            {isFinished ? 'Finalizada' : 'Em andamento'}
          </Badge>
          <h1 className={`mt-2 ${pageTitleClassName}`}>Consulta</h1>
          <p className={`break-words ${pageDescriptionClassName}`}>
            {consultation.pet.name} (
            {PET_SPECIES_LABELS[
              consultation.pet.species as keyof typeof PET_SPECIES_LABELS
            ]}
            ) · Tutor: {consultation.tutor.name}
          </p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Início: {new Date(consultation.startedAt).toLocaleString('pt-BR')} · Vet:{' '}
            {consultation.veterinarian.name}
          </p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto sm:self-start" asChild>
          <Link to={`/tutors/${consultation.tutorId}/pets/${consultation.petId}`}>
            Voltar ao pet
          </Link>
        </Button>
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
              <span className="font-medium">{index + 1}.</span>
              {step.label}
            </button>
          ))}
        </nav>
      )}

      <div ref={stepRef}>
        {(isFinished || currentStep === 0) && (
          <Card>
            <CardHeader>
              <CardTitle>1. Anamnese</CardTitle>
              <CardDescription>
                Queixa principal, histórico e exame físico.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Queixa principal</Label>
                  <Textarea
                    value={anamnesis.mainComplaint}
                    disabled={isFinished}
                    onChange={(e) =>
                      setAnamnesis((prev) => ({
                        ...prev,
                        mainComplaint: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Histórico</Label>
                  <Textarea
                    value={anamnesis.history}
                    disabled={isFinished}
                    onChange={(e) =>
                      setAnamnesis((prev) => ({ ...prev, history: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Exame físico</Label>
                  <Textarea
                    value={anamnesis.physicalExam}
                    disabled={isFinished}
                    onChange={(e) =>
                      setAnamnesis((prev) => ({
                        ...prev,
                        physicalExam: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Peso (kg)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={anamnesis.weightKg}
                    disabled={isFinished}
                    onChange={(e) =>
                      setAnamnesis((prev) => ({ ...prev, weightKg: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Temperatura (°C)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={anamnesis.temperature}
                    disabled={isFinished}
                    onChange={(e) =>
                      setAnamnesis((prev) => ({
                        ...prev,
                        temperature: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={anamnesis.observations}
                    disabled={isFinished}
                    onChange={(e) =>
                      setAnamnesis((prev) => ({
                        ...prev,
                        observations: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {(isFinished || currentStep === 1) && (
          <Card className={!isFinished && currentStep === 1 ? '' : 'mt-4 sm:mt-6'}>
            <CardHeader>
              <CardTitle>2. Diagnóstico e conduta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Diagnóstico</Label>
                <Textarea
                  value={clinical.diagnosis}
                  disabled={isFinished}
                  onChange={(e) =>
                    setClinical((prev) => ({ ...prev, diagnosis: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Conduta</Label>
                <Textarea
                  value={clinical.conduct}
                  disabled={isFinished}
                  onChange={(e) =>
                    setClinical((prev) => ({ ...prev, conduct: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        {(isFinished || currentStep === 2) && (
          <Card className="mt-4 sm:mt-6">
            <CardHeader>
              <CardTitle>3. Receita</CardTitle>
              <CardDescription>Medicamentos prescritos na consulta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {consultation.prescriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum medicamento adicionado.
                </p>
              ) : (
                <div className="space-y-2">
                  {consultation.prescriptions.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{item.medicineName}</p>
                        <p className="text-sm text-muted-foreground">
                          {[item.dosage, item.frequency, item.duration]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                      {!isFinished && currentStep === 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePrescription(item.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!isFinished && currentStep === 2 && (
                <>
                  <Separator />
                  <form
                    onSubmit={handleAddPrescription}
                    className="grid grid-cols-1 gap-3"
                  >
                    <div className="space-y-2">
                      <Label>Medicamento</Label>
                      <Input
                        value={prescriptionForm.medicineName}
                        onChange={(e) =>
                          setPrescriptionForm((prev) => ({
                            ...prev,
                            medicineName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Dosagem</Label>
                      <Input
                        value={prescriptionForm.dosage}
                        onChange={(e) =>
                          setPrescriptionForm((prev) => ({
                            ...prev,
                            dosage: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Frequência</Label>
                      <Input
                        value={prescriptionForm.frequency}
                        onChange={(e) =>
                          setPrescriptionForm((prev) => ({
                            ...prev,
                            frequency: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Button type="submit" className="w-full sm:w-auto" disabled={addPrescription.isPending}>
                        Adicionar medicamento
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {(isFinished || currentStep === 3) && (
          <Card className="mt-4 sm:mt-6">
            <CardHeader>
              <CardTitle>4. Retorno</CardTitle>
              <CardDescription>
                Agende retorno se necessário e finalize a consulta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex min-h-11 items-center gap-3">
                <Checkbox
                  id="needsReturn"
                  checked={returnInfo.needsReturn}
                  disabled={isFinished}
                  onCheckedChange={(checked) =>
                    setReturnInfo((prev) => ({
                      ...prev,
                      needsReturn: checked === true,
                    }))
                  }
                />
                <Label htmlFor="needsReturn" className="cursor-pointer">
                  Necessita retorno
                </Label>
              </div>
              {returnInfo.needsReturn && (
                <div className="space-y-2">
                  <Label>Data do retorno</Label>
                  <Input
                    type="date"
                    value={returnInfo.returnDate}
                    disabled={isFinished}
                    onChange={(e) =>
                      setReturnInfo((prev) => ({
                        ...prev,
                        returnDate: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {!isFinished && (
        <div className={stickyActionBarClassName}>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((step) => step - 1)}
            >
              <ChevronLeft className="size-4" />
              Voltar
            </Button>

            {isLastStep ? (
              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={handleFinish}
                disabled={finishConsultation.isPending}
              >
                {finishConsultation.isPending ? 'Finalizando...' : 'Finalizar consulta'}
              </Button>
            ) : (
              <Button
                className="w-full sm:w-auto"
                onClick={handleContinue}
                disabled={updateConsultation.isPending}
              >
                Salvar e continuar
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
