import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileDown,
  MessageCircle,
  PawPrint,
  Pill,
  Plus,
  Trash2,
} from 'lucide-react';
import { ApiError } from '@/api/http';
import { listAppointments } from '@/api/appointments';
import { downloadPrescriptionPdf } from '@/api/consultations';
import { ConsultationWeightTimeline } from '@/components/consultation/consultation-weight-timeline';
import { ReturnSchedulePicker } from '@/components/consultation/return-schedule-picker';
import { ParentConsultationReferenceDialog } from '@/components/consultation/parent-consultation-reference-dialog';
import { ConsultationWhatsAppReviewDialog } from '@/components/consultation/consultation-whatsapp-review-dialog';
import { PetWeightDialog } from '@/components/pet/pet-weight-dialog';
import { ConsultationAttachmentsCard } from '@/components/consultation/consultation-attachments-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  pageShellClassName,
  pageTitleClassName,
  stickyActionBarClassName,
} from '@/lib/mobile-ui';
import { Textarea } from '@/components/ui/textarea';
import { buildFormFieldId } from '@/lib/form-validation';
import {
  getConsultationDisplayStatusLabel,
  isConsultationReadOnly,
} from '@/lib/consultation-display';
import {
  formatDateTimeValue,
  getTimePartFromDateTime,
  parseDateTimeValue,
} from '@/lib/date-input';
import {
  minutesToDurationDigits,
} from '@/lib/duration-input';
import { isTimeSlotAvailable } from '@/lib/schedule-availability';
import {
  prescriptionFormFields,
  prescriptionFormSchema,
  type PrescriptionFormField,
} from '@/lib/prescription-form-validation';
import { useFormFieldErrors } from '@/hooks/useFormFieldErrors';
import { formatPetAge, formatPetWeight } from '@/lib/pet-format';
import {
  formatTemperatureFromDigits,
  handleTemperatureDigitsChange,
  parseTemperatureDigits,
  TEMPERATURE_INPUT_PLACEHOLDER,
  temperatureValueToDigits,
} from '@/lib/temperature-input';
import {
  buildConsultationWhatsAppMessage,
  buildWhatsAppUrl,
} from '@/lib/whatsapp';
import {
  useAddPrescription,
  useCancelScheduledReturn,
  useConsultation,
  useCreateReturnConsultation,
  useDeleteConsultation,
  useFinishConsultation,
  useGenerateConsultationPostSummary,
  useOpenReturnConsultationByParent,
  useRemovePrescription,
  useUpdateConsultation,
} from '@/hooks/useConsultations';
import { useConsultationDraft } from '@/hooks/useConsultationDraft';
import {
  useCreatePetWeightRecord,
  usePetWeightRecords,
} from '@/hooks/usePetWeightRecords';
import {
  readConsultationDraft,
  writeConsultationDraft,
  type ConsultationDraft,
} from '@/lib/consultation-draft';
import type {
  Consultation,
  PrescriptionDocumentType,
  PrescriptionPharmacyType,
} from '@/types/consultation';
import {
  PRESCRIPTION_DOCUMENT_TYPE_LABELS,
  PRESCRIPTION_PHARMACY_TYPE_LABELS,
  PRESCRIPTION_ROUTE_OPTIONS,
} from '@/types/consultation';

const STEPS = [
  { id: 'anamnesis', label: 'Anamnese' },
  { id: 'diagnosis', label: 'Diagnóstico' },
  { id: 'exams', label: 'Exames' },
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
  if (consultation.prescriptions.length === 0) {
    return 2;
  }
  return 4;
}

function formatConsultationStart(startedAt: string) {
  const date = new Date(startedAt);
  return {
    date: date.toLocaleDateString('pt-BR'),
    time: date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

function consultationToAnamnesis(consultation: Consultation) {
  return {
    mainComplaint: consultation.mainComplaint ?? '',
    history: consultation.history ?? '',
    physicalExam: consultation.physicalExam ?? '',
    temperature: temperatureValueToDigits(consultation.temperature),
    observations: consultation.observations ?? '',
  };
}

function consultationToClinical(consultation: Consultation) {
  return {
    diagnosis: consultation.diagnosis ?? '',
    conduct: consultation.conduct ?? '',
  };
}

function consultationToReturnInfo(consultation: Consultation) {
  return {
    needsReturn: consultation.needsReturn,
    returnDate: consultation.returnDate
      ? formatDateTimeValue(new Date(consultation.returnDate))
      : '',
  };
}

const EMPTY_PRESCRIPTION_FORM = {
  medicineName: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
  routeOfAdministration: 'USO ORAL',
  customRoute: '',
  pharmacyType: 'VETERINARY' as PrescriptionPharmacyType,
  quantity: '',
};

export function ConsultationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const stepRef = useRef<HTMLDivElement>(null);
  const {
    data: consultation,
    isLoading,
    isError,
    isFetching,
  } = useConsultation(id);
  const updateConsultation = useUpdateConsultation();
  const createReturnConsultation = useCreateReturnConsultation();
  const cancelScheduledReturn = useCancelScheduledReturn();

  const returnScheduledParentId =
    consultation?.status === 'RETURN_SCHEDULED' &&
    !consultation.parentConsultationId
      ? consultation.id
      : undefined;
  const { data: openReturnChild } = useOpenReturnConsultationByParent(
    returnScheduledParentId,
  );

  const returnLookupAnchor = consultation?.returnDate
    ? new Date(consultation.returnDate)
    : new Date();
  const returnLookupRange = {
    start: startOfMonth(returnLookupAnchor),
    end: endOfMonth(returnLookupAnchor),
  };

  const { data: pendingReturnAppointment } = useQuery({
    queryKey: [
      'pending-return-appointment',
      consultation?.id,
      returnLookupRange.start.toISOString(),
    ],
    queryFn: async () => {
      if (!consultation?.id) return null;

      const appointments = await listAppointments({
        start: returnLookupRange.start.toISOString(),
        end: returnLookupRange.end.toISOString(),
      });

      return (
        appointments.find(
          (appointment) =>
            appointment.sourceConsultationId === consultation.id &&
            appointment.type === 'RETURN' &&
            (appointment.status === 'SCHEDULED' ||
              appointment.status === 'CONFIRMED'),
        ) ?? null
      );
    },
    enabled: Boolean(
      consultation?.id &&
        !consultation.parentConsultationId &&
        (consultation.status === 'RETURN_SCHEDULED' ||
          (consultation.status === 'OPEN' &&
            (consultation.needsReturn || consultation.parentConsultationId))),
    ),
  });

  const addPrescription = useAddPrescription();
  const removePrescription = useRemovePrescription();
  const finishConsultation = useFinishConsultation();
  const generatePostSummary = useGenerateConsultationPostSummary();
  const deleteConsultation = useDeleteConsultation();
  const createWeightRecord = useCreatePetWeightRecord();

  const [currentStep, setCurrentStep] = useState(0);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelScheduledReturnOpen, setCancelScheduledReturnOpen] =
    useState(false);
  const [parentReferenceOpen, setParentReferenceOpen] = useState(false);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [whatsappReviewOpen, setWhatsappReviewOpen] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [whatsappReviewMode, setWhatsappReviewMode] = useState<
    'finish' | 'resend'
  >('finish');
  const [pendingWeightKg, setPendingWeightKg] = useState<number | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [prescriptionDocumentType, setPrescriptionDocumentType] =
    useState<PrescriptionDocumentType>('SIMPLE');

  const [anamnesis, setAnamnesis] = useState({
    mainComplaint: '',
    history: '',
    physicalExam: '',
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
  const [returnDurationMinutes, setReturnDurationMinutes] = useState(30);
  const [returnDurationDigits, setReturnDurationDigits] = useState(() =>
    minutesToDurationDigits(30),
  );

  const { data: weightRecords = [] } = usePetWeightRecords(
    consultation?.pet.id,
  );

  const previousWeightKg = useMemo(() => {
    if (!consultation) return null;

    const currentRecordIdx = weightRecords.findIndex(
      (record) => record.consultationId === consultation.id,
    );

    if (currentRecordIdx >= 0) {
      return weightRecords[currentRecordIdx + 1]?.weightKg ?? null;
    }

    return consultation.pet.weightKg;
  }, [consultation, weightRecords]);

  const [prescriptionFormOpen, setPrescriptionFormOpen] = useState(false);
  const {
    fieldErrors: prescriptionFieldErrors,
    applyZodError: applyPrescriptionZodError,
    clearFieldError: clearPrescriptionFieldError,
    clearErrors: clearPrescriptionErrors,
  } = useFormFieldErrors<PrescriptionFormField>('prescription');
  const [prescriptionForm, setPrescriptionForm] = useState(
    EMPTY_PRESCRIPTION_FORM,
  );

  const [hydratedConsultationId, setHydratedConsultationId] = useState<
    string | null
  >(null);
  const [
    initializedStepForConsultationId,
    setInitializedStepForConsultationId,
  ] = useState<string | null>(null);
  const [
    appliedPendingReturnAppointmentId,
    setAppliedPendingReturnAppointmentId,
  ] = useState<string | null>(null);
  const restoredReturnDurationFromDraftRef = useRef(false);

  if (consultation && consultation.id !== hydratedConsultationId) {
    setHydratedConsultationId(consultation.id);
    setAppliedPendingReturnAppointmentId(null);

    const draft =
      consultation.status === 'OPEN'
        ? readConsultationDraft(consultation.id)
        : null;

    restoredReturnDurationFromDraftRef.current = Boolean(draft);

    setAnamnesis(draft?.anamnesis ?? consultationToAnamnesis(consultation));
    setClinical(draft?.clinical ?? consultationToClinical(consultation));
    setReturnInfo(draft?.returnInfo ?? consultationToReturnInfo(consultation));
    setReturnDurationMinutes(draft?.returnDurationMinutes ?? 30);
    setReturnDurationDigits(
      draft?.returnDurationDigits ?? minutesToDurationDigits(30),
    );
    setPendingWeightKg(draft?.pendingWeightKg ?? null);
    setPrescriptionDocumentType(
      draft?.prescriptionDocumentType ??
        consultation.prescriptionDocumentType ??
        'SIMPLE',
    );
    setPrescriptionFormOpen(draft?.prescriptionFormOpen ?? false);
    setPrescriptionForm(draft?.prescriptionForm ?? EMPTY_PRESCRIPTION_FORM);
  }

  if (
    pendingReturnAppointment?.durationMinutes &&
    pendingReturnAppointment.id !== appliedPendingReturnAppointmentId
  ) {
    setAppliedPendingReturnAppointmentId(pendingReturnAppointment.id);
    if (!restoredReturnDurationFromDraftRef.current) {
      setReturnDurationMinutes(pendingReturnAppointment.durationMinutes);
      setReturnDurationDigits(
        minutesToDurationDigits(pendingReturnAppointment.durationMinutes),
      );
    }
    restoredReturnDurationFromDraftRef.current = false;
  }

  if (
    consultation &&
    consultation.status !== 'FINISHED' &&
    consultation.status !== 'RETURN_SCHEDULED' &&
    consultation.id !== initializedStepForConsultationId
  ) {
    const stored = sessionStorage.getItem(stepStorageKey(consultation.id));
    setCurrentStep(stored !== null ? Number(stored) : inferStep(consultation));
    setInitializedStepForConsultationId(consultation.id);
  }

  if (
    consultation &&
    (consultation.status === 'FINISHED' ||
      consultation.status === 'RETURN_SCHEDULED') &&
    consultation.id !== initializedStepForConsultationId
  ) {
    setInitializedStepForConsultationId(consultation.id);
  }

  function goToStep(step: number) {
    setCurrentStep(step);
    if (step !== 3) {
      setPrescriptionFormOpen(false);
    }
  }

  useEffect(() => {
    if (!id || consultation?.status !== 'OPEN') return;
    sessionStorage.setItem(stepStorageKey(id), String(currentStep));
  }, [id, consultation?.status, currentStep]);

  const consultationDraft = useMemo<ConsultationDraft>(
    () => ({
      anamnesis,
      clinical,
      returnInfo,
      returnDurationMinutes,
      returnDurationDigits,
      pendingWeightKg,
      prescriptionDocumentType,
      prescriptionFormOpen,
      prescriptionForm,
    }),
    [
      anamnesis,
      clinical,
      returnInfo,
      returnDurationMinutes,
      returnDurationDigits,
      pendingWeightKg,
      prescriptionDocumentType,
      prescriptionFormOpen,
      prescriptionForm,
    ],
  );

  useConsultationDraft({
    consultationId: id,
    enabled:
      consultation?.status === 'OPEN' &&
      hydratedConsultationId === consultation.id,
    draft: consultationDraft,
  });

  useEffect(() => {
    stepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep]);

  async function handleSaveAnamnesis() {
    if (!id || !consultation) return;

    await updateConsultation.mutateAsync({
      id,
      data: {
        mainComplaint: anamnesis.mainComplaint || undefined,
        history: anamnesis.history || undefined,
        physicalExam: anamnesis.physicalExam || undefined,
        temperature: (() => {
          const parsed = parseTemperatureDigits(anamnesis.temperature);
          return parsed !== null ? parsed : undefined;
        })(),
        observations: anamnesis.observations || undefined,
      },
    });

    if (pendingWeightKg === null) {
      persistDraftSnapshot();
      return;
    }

    const previous = previousWeightKg != null ? Number(previousWeightKg) : null;

    if (previous !== null && pendingWeightKg === previous) {
      setPendingWeightKg(null);
      persistDraftSnapshot({ pendingWeightKg: null });
      return;
    }

    await createWeightRecord.mutateAsync({
      petId: consultation.pet.id,
      consultationId: id,
      data: {
        weightKg: pendingWeightKg,
        consultationId: id,
      },
    });

    setPendingWeightKg(null);
    persistDraftSnapshot({ pendingWeightKg: null });
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

    persistDraftSnapshot();
  }

  async function handleSaveReturn() {
    if (!id) return;

    await updateConsultation.mutateAsync({
      id,
      data: {
        needsReturn: returnInfo.needsReturn,
        returnDate: returnInfo.returnDate
          ? new Date(returnInfo.returnDate).toISOString()
          : undefined,
        returnDurationMinutes: returnInfo.needsReturn
          ? returnDurationMinutes
          : undefined,
      },
    });

    persistDraftSnapshot();
  }

  async function validateReturnSchedule() {
    if (!returnInfo.needsReturn) return true;

    if (!returnInfo.returnDate) {
      toast.error('Selecione data e horário do retorno.');
      return false;
    }

    if (returnDurationMinutes <= 0) {
      toast.error('Informe uma duração válida para o retorno.');
      return false;
    }

    const parsed = parseDateTimeValue(returnInfo.returnDate);
    if (!parsed || !user?.id) {
      toast.error('Data ou horário do retorno inválidos.');
      return false;
    }

    const appointments = await listAppointments({
      start: startOfDay(parsed).toISOString(),
      end: endOfDay(parsed).toISOString(),
    });

    const available = isTimeSlotAvailable(
      parsed,
      getTimePartFromDateTime(returnInfo.returnDate),
      returnDurationMinutes,
      appointments,
      user.id,
      pendingReturnAppointment?.id,
    );

    if (!available) {
      toast.error('Horário indisponível. Escolha outro horário.');
      return false;
    }

    return true;
  }

  async function handleDocumentTypeChange(
    value: PrescriptionDocumentType | null,
  ) {
    if (!id || !value) return;

    setPrescriptionDocumentType(value);
    await updateConsultation.mutateAsync({
      id,
      data: { prescriptionDocumentType: value },
    });
  }

  async function handleDownloadPrescription() {
    if (!id) return;

    setIsDownloadingPdf(true);

    try {
      await downloadPrescriptionPdf(id);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Erro ao baixar receita',
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  function resetPrescriptionForm() {
    setPrescriptionForm(EMPTY_PRESCRIPTION_FORM);
  }

  function persistDraftSnapshot(overrides?: Partial<ConsultationDraft>) {
    if (!id || consultation?.status !== 'OPEN') return;
    writeConsultationDraft(id, { ...consultationDraft, ...overrides });
  }

  function handleCancelPrescriptionForm() {
    resetPrescriptionForm();
    clearPrescriptionErrors();
    setPrescriptionFormOpen(false);
  }

  async function handleAddPrescription(event: React.FormEvent) {
    event.preventDefault();
    if (!id) return;

    const parsed = prescriptionFormSchema.safeParse(prescriptionForm);

    if (!parsed.success) {
      applyPrescriptionZodError(parsed.error, prescriptionFormFields);
      return;
    }

    clearPrescriptionErrors();

    const routeOfAdministration =
      parsed.data.routeOfAdministration === 'OUTRO'
        ? parsed.data.customRoute!.trim()
        : parsed.data.routeOfAdministration;

    await addPrescription.mutateAsync({
      consultationId: id,
      data: {
        medicineName: parsed.data.medicineName,
        dosage: parsed.data.dosage,
        frequency: parsed.data.frequency,
        duration: parsed.data.duration,
        instructions: parsed.data.instructions,
        routeOfAdministration,
        pharmacyType: parsed.data.pharmacyType,
        quantity: parsed.data.quantity,
      },
    });

    resetPrescriptionForm();
    clearPrescriptionErrors();
    setPrescriptionFormOpen(false);
  }

  async function handleRemovePrescription(prescriptionId: string) {
    if (!id) return;

    await removePrescription.mutateAsync({
      consultationId: id,
      prescriptionId,
    });
  }

  async function handleContinue() {
    if (!consultation) return;

    try {
      if (currentStep === 0) {
        await handleSaveAnamnesis();
      } else if (currentStep === 1) {
        await handleSaveClinical();
      } else if (currentStep === 4) {
        if (!(await validateReturnSchedule())) return;
        await handleSaveReturn();
      }

      if (currentStep < STEPS.length - 1) {
        goToStep(currentStep + 1);
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Erro ao salvar etapa',
      );
    }
  }

  async function openPostSummaryReview(mode: 'finish' | 'resend') {
    if (!id || !consultation) return;

    const fallbackMessage = buildConsultationWhatsAppMessage({
      tutorName: consultation.tutor.name,
      petName: consultation.pet.name,
      petSpecies: consultation.pet.species,
      diagnosis: clinical.diagnosis,
      conduct: clinical.conduct,
      returnDate:
        returnInfo.needsReturn && returnInfo.returnDate
          ? returnInfo.returnDate
          : null,
      veterinarianName: consultation.veterinarian.name,
      prescriptions: consultation.prescriptions,
    });

    setWhatsappReviewMode(mode);
    setWhatsappMessage('');
    setIsGeneratingSummary(true);
    setWhatsappReviewOpen(true);

    try {
      const { message } = await generatePostSummary.mutateAsync({
        id,
        data: {
          diagnosis: clinical.diagnosis || undefined,
          conduct: clinical.conduct || undefined,
          needsReturn: returnInfo.needsReturn,
          returnDate:
            returnInfo.needsReturn && returnInfo.returnDate
              ? new Date(returnInfo.returnDate).toISOString()
              : undefined,
        },
      });
      setWhatsappMessage(message.trim() || fallbackMessage);
    } catch {
      setWhatsappMessage(fallbackMessage);
    } finally {
      setIsGeneratingSummary(false);
    }
  }

  async function handleFinish() {
    if (!id || !consultation) return;

    if (!(await validateReturnSchedule())) {
      return;
    }

    await openPostSummaryReview('finish');
  }

  async function handleResendPostSummary() {
    await openPostSummaryReview('resend');
  }

  async function handleConfirmFinish() {
    if (!id || !consultation) return;

    const tutorPhone =
      consultation.tutor.whatsapp ?? consultation.tutor.phone;

    if (whatsappReviewMode === 'resend') {
      const whatsappUrl = buildWhatsAppUrl(tutorPhone, whatsappMessage.trim());
      if (whatsappUrl) {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }
      setWhatsappReviewOpen(false);
      return;
    }

    const hasPrescriptions = consultation.prescriptions.length > 0;
    const schedulingReturn =
      returnInfo.needsReturn && Boolean(returnInfo.returnDate);

    try {
      await handleSaveReturn();
      await finishConsultation.mutateAsync({
        id,
        data: {
          diagnosis: clinical.diagnosis || undefined,
          conduct: clinical.conduct || undefined,
          needsReturn: returnInfo.needsReturn,
          returnDate: returnInfo.returnDate
            ? new Date(returnInfo.returnDate).toISOString()
            : undefined,
          returnDurationMinutes: returnInfo.needsReturn
            ? returnDurationMinutes
            : undefined,
        },
      });

      const whatsappUrl = buildWhatsAppUrl(tutorPhone, whatsappMessage.trim());
      if (whatsappUrl) {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }

      setWhatsappReviewOpen(false);

      if (schedulingReturn) {
        toast.success('Retorno agendado com sucesso!');
        void navigate('/atendimento');
        return;
      }

      toast.success('Consulta finalizada!');

      if (!hasPrescriptions) {
        void navigate(
          `/tutors/${consultation.tutorId}/pets/${consultation.petId}`,
        );
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Erro ao finalizar consulta',
      );
    }
  }

  async function handleConfirmCancel() {
    if (!id || !consultation) return;

    try {
      await deleteConsultation.mutateAsync({
        id,
        petId: consultation.petId,
        parentId: consultation.parentConsultationId ?? undefined,
      });
      toast.success(
        consultation.parentConsultationId
          ? 'Retorno cancelado.'
          : 'Consulta cancelada.',
      );
      setCancelOpen(false);
      void navigate(
        consultation.parentConsultationId
          ? `/consultations/${consultation.parentConsultationId}`
          : `/tutors/${consultation.tutorId}/pets/${consultation.petId}`,
      );
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Erro ao cancelar consulta',
      );
    }
  }

  async function handleStartReturnFromDetail() {
    if (!consultation) return;

    try {
      const child = await createReturnConsultation.mutateAsync({
        parentId: consultation.id,
        appointmentId: pendingReturnAppointment?.id,
        petId: consultation.petId,
      });
      toast.success('Retorno iniciado');
      void navigate(`/consultations/${child.id}`);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Erro ao iniciar retorno',
      );
    }
  }

  async function handleConfirmCancelScheduledReturn() {
    if (!consultation) return;

    try {
      await cancelScheduledReturn.mutateAsync({
        parentId: consultation.id,
        petId: consultation.petId,
      });
      toast.success('Retorno agendado cancelado.');
      setCancelScheduledReturnOpen(false);
      void navigate('/atendimento');
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : 'Erro ao cancelar retorno agendado',
      );
    }
  }

  if (isLoading || (isFetching && !consultation)) {
    return <p className='text-muted-foreground'>Carregando consulta...</p>;
  }

  if (isError || !consultation || consultation.id !== id) {
    return <p className='text-muted-foreground'>Consulta não encontrada.</p>;
  }

  const isReadOnly = isConsultationReadOnly(consultation);
  const isReturnVisit = Boolean(consultation.parentConsultationId);
  const isReturnScheduledParent =
    consultation.status === 'RETURN_SCHEDULED' && !consultation.parentConsultationId;
  const isLastStep = currentStep === STEPS.length - 1;
  const finishButtonLabel =
    returnInfo.needsReturn && returnInfo.returnDate
      ? 'Agendar retorno'
      : isReturnVisit
        ? 'Finalizar retorno'
        : 'Finalizar consulta';
  const consultationStatusLabel = getConsultationDisplayStatusLabel(consultation);
  const { date: startDate, time: startTime } = formatConsultationStart(
    consultation.startedAt,
  );

  return (
    <div className={pageShellClassName}>
      <div className='flex flex-col gap-3'>
        <div className='min-w-0 space-y-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant={isReadOnly ? 'secondary' : 'default'}>
              {consultationStatusLabel}
            </Badge>
          </div>
          <h1 className={pageTitleClassName}>
            {isReturnVisit ? 'Retorno' : 'Consulta'}
          </h1>
          <div className='space-y-2'>
            <div className='flex items-start gap-2.5'>
              <Avatar className='size-9 shrink-0 sm:size-10'>
                {consultation.pet.photoUrl ? (
                  <AvatarImage
                    src={consultation.pet.photoUrl}
                    alt={consultation.pet.name}
                  />
                ) : null}
                <AvatarFallback className='bg-primary/10 text-primary'>
                  <PawPrint className='size-4' />
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0'>
                <p className='text-base font-semibold sm:text-lg'>
                  {consultation.pet.name}
                </p>
                <p className='mt-0.5 text-xs text-muted-foreground sm:text-sm'>
                  {consultation.pet.birthDate
                    ? formatPetAge(consultation.pet.birthDate)
                    : 'Idade não informada'}{' '}
                  ·{' '}
                  {consultation.pet.weightKg
                    ? formatPetWeight(consultation.pet.weightKg)
                    : 'Peso não informado'}
                </p>
              </div>
            </div>
            <p className='text-sm font-medium sm:text-base'>
              {consultation.tutor.name}
            </p>
            <p className='text-xs text-muted-foreground sm:text-sm'>
              {startDate} · {startTime}
            </p>
            <p className='text-xs text-muted-foreground sm:text-sm'>
              Veterinário: {consultation.veterinarian.name}
            </p>
            {isReturnScheduledParent && consultation.returnDate ? (
              <p className='text-sm font-medium text-amber-800 dark:text-amber-200'>
                Retorno agendado para{' '}
                {new Date(consultation.returnDate).toLocaleString('pt-BR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </p>
            ) : null}
          </div>
        </div>
        {!isReadOnly && !isReturnVisit && (
          <Button
            type='button'
            variant='outline'
            className='w-full text-destructive hover:text-destructive sm:w-auto sm:self-start'
            onClick={() => setCancelOpen(true)}
            disabled={isFetching || deleteConsultation.isPending}
          >
            Cancelar consulta
          </Button>
        )}
        {!isReadOnly && isReturnVisit && (
          <Button
            type='button'
            variant='outline'
            className='w-full text-destructive hover:text-destructive sm:w-auto sm:self-start'
            onClick={() => setCancelOpen(true)}
            disabled={isFetching || deleteConsultation.isPending}
          >
            Cancelar retorno
          </Button>
        )}
        {isReturnScheduledParent ? (
          <div className='flex flex-wrap gap-2'>
            {openReturnChild ? (
              <Button
                type='button'
                className='w-full sm:w-auto'
                onClick={() =>
                  void navigate(`/consultations/${openReturnChild.id}`)
                }
              >
                Continuar retorno
              </Button>
            ) : (
              <>
                <Button
                  type='button'
                  className='w-full sm:w-auto'
                  disabled={createReturnConsultation.isPending}
                  onClick={() => void handleStartReturnFromDetail()}
                >
                  {createReturnConsultation.isPending
                    ? 'Iniciando...'
                    : 'Iniciar retorno'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  className='w-full text-destructive hover:text-destructive sm:w-auto'
                  disabled={cancelScheduledReturn.isPending}
                  onClick={() => setCancelScheduledReturnOpen(true)}
                >
                  Cancelar retorno
                </Button>
              </>
            )}
            <Button
              type='button'
              variant='outline'
              className='w-full sm:w-auto'
              disabled={isGeneratingSummary || whatsappReviewOpen}
              onClick={() => void handleResendPostSummary()}
            >
              <MessageCircle className='size-4' />
              Pós-consulta enviado
            </Button>
            <Button
              type='button'
              variant='outline'
              className='w-full sm:w-auto'
              render={
                <Link
                  to={`/tutors/${consultation.tutorId}/pets/${consultation.petId}`}
                />
              }
            >
              Ir para ficha do pet
            </Button>
          </div>
        ) : null}
        {isReadOnly && !isReturnScheduledParent && (
          <div className='flex flex-col gap-2 sm:flex-row sm:self-start'>
            {consultation.status === 'FINISHED' ? (
              <Button
                type='button'
                variant='outline'
                className='w-full sm:w-auto'
                disabled={isGeneratingSummary || whatsappReviewOpen}
                onClick={() => void handleResendPostSummary()}
              >
                <MessageCircle className='size-4' />
                Pós-consulta enviado
              </Button>
            ) : null}
            <Button
              type='button'
              variant='outline'
              className='w-full sm:w-auto'
              render={
                <Link
                  to={`/tutors/${consultation.tutorId}/pets/${consultation.petId}`}
                />
              }
            >
              Ir para ficha do pet
            </Button>
          </div>
        )}
      </div>

      {!isReadOnly && (
        <div className='flex items-center justify-between gap-3'>
          <nav className='-mx-4 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0'>
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <button
                  key={step.id}
                  type='button'
                  onClick={() => isCompleted && goToStep(index)}
                  disabled={index > currentStep}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                    isCurrent &&
                      'border-primary bg-primary text-primary-foreground',
                    isCompleted &&
                      'border-emerald-950 bg-emerald-50 text-emerald-950! hover:bg-emerald-100',
                    !isCurrent &&
                      !isCompleted &&
                      'border-border bg-background text-muted-foreground',
                  )}
                >
                  {isCompleted ? (
                    <Check
                      className='size-3 shrink-0 text-emerald-950'
                      strokeWidth={2.5}
                    />
                  ) : (
                    <span className='tabular-nums'>{index + 1}.</span>
                  )}
                  {step.label}
                </button>
              );
            })}
          </nav>

          {isReturnVisit && consultation.parentConsultationId ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='hidden shrink-0 sm:inline-flex'
              onClick={() => setParentReferenceOpen(true)}
            >
              Ver consulta anterior
            </Button>
          ) : null}
        </div>
      )}

      {!isReadOnly &&
      isReturnVisit &&
      consultation.parentConsultationId ? (
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='w-full sm:hidden'
          onClick={() => setParentReferenceOpen(true)}
        >
          Ver consulta anterior
        </Button>
      ) : null}

      <div ref={stepRef}>
        {(isReadOnly || currentStep === 0) && (
          <Card>
            <CardHeader>
              <CardTitle>1. Anamnese</CardTitle>
              <CardDescription>
                Queixa principal, histórico e exame físico.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4'>
                <div className='space-y-2'>
                  <Label>Queixa principal</Label>
                  <Textarea
                    value={anamnesis.mainComplaint}
                    disabled={isReadOnly}
                    onChange={(e) =>
                      setAnamnesis((prev) => ({
                        ...prev,
                        mainComplaint: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Histórico</Label>
                  <Textarea
                    value={anamnesis.history}
                    disabled={isReadOnly}
                    onChange={(e) =>
                      setAnamnesis((prev) => ({
                        ...prev,
                        history: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Exame físico</Label>
                  <Textarea
                    value={anamnesis.physicalExam}
                    disabled={isReadOnly}
                    onChange={(e) =>
                      setAnamnesis((prev) => ({
                        ...prev,
                        physicalExam: e.target.value,
                      }))
                    }
                  />
                </div>
                <ConsultationWeightTimeline
                  records={weightRecords}
                  consultationId={consultation.id}
                  pendingWeightKg={pendingWeightKg}
                  disabled={isReadOnly}
                  onAddClick={() => setWeightDialogOpen(true)}
                />
                <div className='space-y-2'>
                  <Label>Temperatura (°C)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder={TEMPERATURE_INPUT_PLACEHOLDER}
                    value={formatTemperatureFromDigits(anamnesis.temperature)}
                    disabled={isReadOnly}
                    onChange={(e) =>
                      setAnamnesis((prev) => ({
                        ...prev,
                        temperature: handleTemperatureDigitsChange(
                          e.target.value,
                          prev.temperature,
                        ),
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Observações</Label>
                  <Textarea
                    value={anamnesis.observations}
                    disabled={isReadOnly}
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

        {(isReadOnly || currentStep === 1) && (
          <Card
            className={!isReadOnly && currentStep === 1 ? '' : 'mt-4 sm:mt-6'}
          >
            <CardHeader>
              <CardTitle>2. Diagnóstico e conduta</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label>Diagnóstico</Label>
                <Textarea
                  value={clinical.diagnosis}
                  disabled={isReadOnly}
                  onChange={(e) =>
                    setClinical((prev) => ({
                      ...prev,
                      diagnosis: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label>Conduta</Label>
                <Textarea
                  value={clinical.conduct}
                  disabled={isReadOnly}
                  onChange={(e) =>
                    setClinical((prev) => ({
                      ...prev,
                      conduct: e.target.value,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        {(isReadOnly || currentStep === 2) && id ? (
          <ConsultationAttachmentsCard
            consultationId={id}
            petId={consultation.petId}
            attachments={consultation.attachments ?? []}
            canManage={
              consultation.status === 'OPEN' ||
              consultation.status === 'FINISHED'
            }
            className={
              !isReadOnly && currentStep === 2 ? 'mt-0! sm:mt-0!' : undefined
            }
          />
        ) : null}

        {(isReadOnly || currentStep === 3) && (
          <Card className='mt-4 sm:mt-6'>
            <CardHeader className='gap-3 sm:flex-row sm:items-start sm:justify-between'>
              <div className='space-y-1'>
                <CardTitle>4. Receita</CardTitle>
                <CardDescription>
                  Medicamentos prescritos na consulta.
                </CardDescription>
              </div>
              {isReadOnly && consultation.prescriptions.length > 0 && (
                <Button
                  type='button'
                  variant='outline'
                  className='w-full sm:w-auto'
                  onClick={() => void handleDownloadPrescription()}
                  disabled={isDownloadingPdf}
                >
                  <FileDown className='size-4' />
                  {isDownloadingPdf ? 'Baixando...' : 'Baixar receita (PDF)'}
                </Button>
              )}
            </CardHeader>
            <CardContent className='space-y-4'>
              {!isReadOnly && currentStep === 3 && (
                <div className='space-y-2'>
                  <Label>Tipo de receita</Label>
                  <Select
                    items={[
                      {
                        value: 'SIMPLE',
                        label: PRESCRIPTION_DOCUMENT_TYPE_LABELS.SIMPLE,
                      },
                      {
                        value: 'SPECIAL_CONTROL',
                        label:
                          PRESCRIPTION_DOCUMENT_TYPE_LABELS.SPECIAL_CONTROL,
                      },
                    ]}
                    value={prescriptionDocumentType}
                    onValueChange={(value) =>
                      void handleDocumentTypeChange(
                        value as PrescriptionDocumentType | null,
                      )
                    }
                  >
                    <SelectTrigger className='w-full sm:max-w-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='SIMPLE'>
                        {PRESCRIPTION_DOCUMENT_TYPE_LABELS.SIMPLE}
                      </SelectItem>
                      <SelectItem value='SPECIAL_CONTROL'>
                        {PRESCRIPTION_DOCUMENT_TYPE_LABELS.SPECIAL_CONTROL}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!user?.crmv &&
                !isReadOnly &&
                currentStep === 3 &&
                consultation.prescriptions.length > 0 && (
                  <p className='rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-sm text-muted-foreground'>
                    Cadastre seu CRMV em{' '}
                    <Link
                      to='/perfil'
                      className='font-medium text-primary underline-offset-4 hover:underline'
                    >
                      Meu perfil
                    </Link>{' '}
                    para incluí-lo na receita impressa.
                  </p>
                )}

              {!user?.signatureUrl &&
                !isReadOnly &&
                currentStep === 3 &&
                consultation.prescriptions.length > 0 && (
                  <p className='rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-sm text-muted-foreground'>
                    Cadastre sua assinatura em{' '}
                    <Link
                      to='/perfil'
                      className='font-medium text-primary underline-offset-4 hover:underline'
                    >
                      Meu perfil
                    </Link>{' '}
                    para incluí-la no final da receita em PDF.
                  </p>
                )}

              {consultation.prescriptions.length === 0 ? (
                <p className='text-sm text-muted-foreground'>
                  Nenhum medicamento adicionado.
                </p>
              ) : (
                <div className='space-y-2'>
                  {consultation.prescriptions.map((item) => {
                    const details = [item.dosage, item.frequency, item.duration]
                      .filter(Boolean)
                      .join(' · ');
                    const meta = [
                      item.routeOfAdministration,
                      item.pharmacyType
                        ? PRESCRIPTION_PHARMACY_TYPE_LABELS[item.pharmacyType]
                        : null,
                      item.quantity,
                    ]
                      .filter(Boolean)
                      .join(' · ');

                    return (
                      <div
                        key={item.id}
                        className='flex items-center gap-3 rounded-lg border bg-card p-3'
                      >
                        <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                          <Pill className='size-4' />
                        </div>
                        <div className='min-w-0 flex-1 space-y-0.5'>
                          <p className='font-medium leading-snug'>
                            {item.medicineName}
                          </p>
                          {meta ? (
                            <p className='text-xs text-muted-foreground'>
                              {meta}
                            </p>
                          ) : null}
                          {details ? (
                            <p className='text-sm text-muted-foreground'>
                              {details}
                            </p>
                          ) : null}
                          {item.instructions ? (
                            <p className='text-xs text-muted-foreground'>
                              {item.instructions}
                            </p>
                          ) : null}
                        </div>
                        {!isReadOnly && currentStep === 3 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon-sm'
                            className='shrink-0 text-muted-foreground hover:text-destructive'
                            aria-label={`Remover ${item.medicineName}`}
                            onClick={() => handleRemovePrescription(item.id)}
                          >
                            <Trash2 className='size-4' />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!isReadOnly && currentStep === 3 && !prescriptionFormOpen && (
                <Button
                  type='button'
                  variant='outline'
                  className='w-full sm:w-auto'
                  onClick={() => {
                    clearPrescriptionErrors();
                    setPrescriptionFormOpen(true);
                  }}
                >
                  <Plus className='size-4' />
                  Adicionar medicamento
                </Button>
              )}

              {!isReadOnly && currentStep === 3 && (
                <div
                  className={cn(
                    'grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out',
                    prescriptionFormOpen
                      ? 'mt-0 grid-rows-[1fr] opacity-100'
                      : 'mt-0 grid-rows-[0fr] opacity-0',
                  )}
                >
                  <div className='min-h-0 overflow-hidden'>
                    <form
                      onSubmit={handleAddPrescription}
                      className='grid grid-cols-1 gap-3 rounded-lg border border-dashed bg-muted/20 p-4 sm:grid-cols-2'
                    >
                      <FormField
                        id={buildFormFieldId('prescription', 'medicineName')}
                        label='Medicamento *'
                        error={prescriptionFieldErrors.medicineName}
                        className='sm:col-span-2'
                      >
                        <Input
                          id={buildFormFieldId('prescription', 'medicineName')}
                          value={prescriptionForm.medicineName}
                          aria-invalid={Boolean(
                            prescriptionFieldErrors.medicineName,
                          )}
                          onChange={(e) => {
                            setPrescriptionForm((prev) => ({
                              ...prev,
                              medicineName: e.target.value,
                            }));
                            clearPrescriptionFieldError('medicineName');
                          }}
                        />
                      </FormField>
                      <FormField
                        id={buildFormFieldId(
                          'prescription',
                          'routeOfAdministration',
                        )}
                        label='Via de administração *'
                        error={prescriptionFieldErrors.routeOfAdministration}
                      >
                        <Select
                          items={[
                            ...PRESCRIPTION_ROUTE_OPTIONS.map((route) => ({
                              value: route,
                              label: route,
                            })),
                            { value: 'OUTRO', label: 'Outro' },
                          ]}
                          value={prescriptionForm.routeOfAdministration}
                          onValueChange={(value) => {
                            setPrescriptionForm((prev) => ({
                              ...prev,
                              routeOfAdministration: value ?? 'USO ORAL',
                            }));
                            clearPrescriptionFieldError(
                              'routeOfAdministration',
                            );
                            clearPrescriptionFieldError('customRoute');
                          }}
                        >
                          <SelectTrigger
                            id={buildFormFieldId(
                              'prescription',
                              'routeOfAdministration',
                            )}
                            className='w-full'
                            aria-invalid={Boolean(
                              prescriptionFieldErrors.routeOfAdministration,
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRESCRIPTION_ROUTE_OPTIONS.map((route) => (
                              <SelectItem key={route} value={route}>
                                {route}
                              </SelectItem>
                            ))}
                            <SelectItem value='OUTRO'>Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                      {prescriptionForm.routeOfAdministration === 'OUTRO' && (
                        <FormField
                          id={buildFormFieldId('prescription', 'customRoute')}
                          label='Via personalizada *'
                          error={prescriptionFieldErrors.customRoute}
                        >
                          <Input
                            id={buildFormFieldId('prescription', 'customRoute')}
                            value={prescriptionForm.customRoute}
                            aria-invalid={Boolean(
                              prescriptionFieldErrors.customRoute,
                            )}
                            onChange={(e) => {
                              setPrescriptionForm((prev) => ({
                                ...prev,
                                customRoute: e.target.value,
                              }));
                              clearPrescriptionFieldError('customRoute');
                            }}
                            placeholder='Ex.: USO AURICULAR'
                          />
                        </FormField>
                      )}
                      <FormField
                        id={buildFormFieldId('prescription', 'pharmacyType')}
                        label='Tipo de farmácia *'
                        error={prescriptionFieldErrors.pharmacyType}
                      >
                        <Select
                          items={[
                            {
                              value: 'VETERINARY',
                              label:
                                PRESCRIPTION_PHARMACY_TYPE_LABELS.VETERINARY,
                            },
                            {
                              value: 'HUMAN',
                              label: PRESCRIPTION_PHARMACY_TYPE_LABELS.HUMAN,
                            },
                          ]}
                          value={prescriptionForm.pharmacyType}
                          onValueChange={(value) => {
                            setPrescriptionForm((prev) => ({
                              ...prev,
                              pharmacyType: (value ??
                                'VETERINARY') as PrescriptionPharmacyType,
                            }));
                            clearPrescriptionFieldError('pharmacyType');
                          }}
                        >
                          <SelectTrigger
                            id={buildFormFieldId(
                              'prescription',
                              'pharmacyType',
                            )}
                            className='w-full'
                            aria-invalid={Boolean(
                              prescriptionFieldErrors.pharmacyType,
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='VETERINARY'>
                              {PRESCRIPTION_PHARMACY_TYPE_LABELS.VETERINARY}
                            </SelectItem>
                            <SelectItem value='HUMAN'>
                              {PRESCRIPTION_PHARMACY_TYPE_LABELS.HUMAN}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                      <FormField
                        id={buildFormFieldId('prescription', 'quantity')}
                        label='Quantidade *'
                        error={prescriptionFieldErrors.quantity}
                      >
                        <Input
                          id={buildFormFieldId('prescription', 'quantity')}
                          value={prescriptionForm.quantity}
                          aria-invalid={Boolean(
                            prescriptionFieldErrors.quantity,
                          )}
                          onChange={(e) => {
                            setPrescriptionForm((prev) => ({
                              ...prev,
                              quantity: e.target.value,
                            }));
                            clearPrescriptionFieldError('quantity');
                          }}
                          placeholder='Ex.: 4 UNIDADES'
                        />
                      </FormField>
                      <FormField
                        id={buildFormFieldId('prescription', 'dosage')}
                        label='Dosagem *'
                        error={prescriptionFieldErrors.dosage}
                      >
                        <Input
                          id={buildFormFieldId('prescription', 'dosage')}
                          value={prescriptionForm.dosage}
                          aria-invalid={Boolean(prescriptionFieldErrors.dosage)}
                          onChange={(e) => {
                            setPrescriptionForm((prev) => ({
                              ...prev,
                              dosage: e.target.value,
                            }));
                            clearPrescriptionFieldError('dosage');
                          }}
                        />
                      </FormField>
                      <FormField
                        id={buildFormFieldId('prescription', 'frequency')}
                        label='Frequência *'
                        error={prescriptionFieldErrors.frequency}
                      >
                        <Input
                          id={buildFormFieldId('prescription', 'frequency')}
                          value={prescriptionForm.frequency}
                          aria-invalid={Boolean(
                            prescriptionFieldErrors.frequency,
                          )}
                          onChange={(e) => {
                            setPrescriptionForm((prev) => ({
                              ...prev,
                              frequency: e.target.value,
                            }));
                            clearPrescriptionFieldError('frequency');
                          }}
                        />
                      </FormField>
                      <FormField
                        id={buildFormFieldId('prescription', 'duration')}
                        label='Duração *'
                        error={prescriptionFieldErrors.duration}
                      >
                        <Input
                          id={buildFormFieldId('prescription', 'duration')}
                          value={prescriptionForm.duration}
                          aria-invalid={Boolean(
                            prescriptionFieldErrors.duration,
                          )}
                          onChange={(e) => {
                            setPrescriptionForm((prev) => ({
                              ...prev,
                              duration: e.target.value,
                            }));
                            clearPrescriptionFieldError('duration');
                          }}
                          placeholder='Ex.: 30 dias'
                        />
                      </FormField>
                      <FormField
                        id={buildFormFieldId('prescription', 'instructions')}
                        label='Instruções *'
                        error={prescriptionFieldErrors.instructions}
                        className='sm:col-span-2'
                      >
                        <Textarea
                          id={buildFormFieldId('prescription', 'instructions')}
                          value={prescriptionForm.instructions}
                          aria-invalid={Boolean(
                            prescriptionFieldErrors.instructions,
                          )}
                          onChange={(e) => {
                            setPrescriptionForm((prev) => ({
                              ...prev,
                              instructions: e.target.value,
                            }));
                            clearPrescriptionFieldError('instructions');
                          }}
                          placeholder='Ex.: Dar 6 ml a cada 12 horas'
                        />
                      </FormField>
                      <div className='flex justify-end gap-2 sm:col-span-2'>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={handleCancelPrescriptionForm}
                          disabled={addPrescription.isPending}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type='submit'
                          disabled={addPrescription.isPending}
                        >
                          {addPrescription.isPending
                            ? 'Adicionando...'
                            : 'Adicionar'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(isReadOnly || currentStep === 4) && (
          <Card className='mt-4 sm:mt-6'>
            <CardHeader>
              <CardTitle>5. Retorno</CardTitle>
              <CardDescription>
                Agende retorno se necessário. Com retorno marcado, o status da
                consulta passa a ser &quot;Retorno agendado&quot; até a visita.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex min-h-11 items-center gap-3'>
                <Checkbox
                  id='needsReturn'
                  checked={returnInfo.needsReturn}
                  disabled={isReadOnly}
                  onCheckedChange={(checked) =>
                    setReturnInfo((prev) => ({
                      needsReturn: checked === true,
                      returnDate:
                        checked === true && !prev.returnDate
                          ? formatDateTimeValue(new Date())
                          : prev.returnDate,
                    }))
                  }
                />
                <Label htmlFor='needsReturn' className='cursor-pointer'>
                  Necessita retorno
                </Label>
              </div>
              {returnInfo.needsReturn && user?.id ? (
                <ReturnSchedulePicker
                  value={returnInfo.returnDate}
                  durationMinutes={returnDurationMinutes}
                  durationDigits={returnDurationDigits}
                  disabled={isReadOnly}
                  veterinarianId={user.id}
                  excludeAppointmentId={pendingReturnAppointment?.id}
                  onChange={(returnDate) =>
                    setReturnInfo((prev) => ({ ...prev, returnDate }))
                  }
                  onDurationChange={(minutes, digits) => {
                    setReturnDurationMinutes(minutes);
                    setReturnDurationDigits(digits);
                  }}
                />
              ) : null}
              {returnInfo.needsReturn && !user?.id ? (
                <p className='text-sm text-destructive'>
                  Não foi possível identificar o veterinário logado.
                </p>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>

      {!isReadOnly && (
        <div className={stickyActionBarClassName}>
          <div className='flex w-full gap-2'>
            <Button
              type='button'
              variant='outline'
              className='flex-1'
              disabled={currentStep === 0}
              onClick={() => goToStep(currentStep - 1)}
            >
              <ChevronLeft className='size-4' />
              Voltar
            </Button>

            {isLastStep ? (
              <Button
                size='lg'
                className='flex-1'
                onClick={() => void handleFinish()}
                disabled={
                  finishConsultation.isPending || whatsappReviewOpen
                }
              >
                {finishButtonLabel}
              </Button>
            ) : (
              <Button
                className='flex-1'
                onClick={handleContinue}
                disabled={updateConsultation.isPending}
              >
                Salvar e continuar
                <ChevronRight className='size-4' />
              </Button>
            )}
          </div>
        </div>
      )}

      <ConsultationWhatsAppReviewDialog
        open={whatsappReviewOpen}
        onOpenChange={(open) => {
          if (
            !finishConsultation.isPending &&
            !updateConsultation.isPending &&
            !isGeneratingSummary
          ) {
            setWhatsappReviewOpen(open);
          }
        }}
        tutorName={consultation.tutor.name}
        tutorPhone={
          consultation.tutor.whatsapp ?? consultation.tutor.phone
        }
        message={whatsappMessage}
        onMessageChange={setWhatsappMessage}
        onConfirm={() => void handleConfirmFinish()}
        confirmLabel={
          whatsappReviewMode === 'resend' ? 'Enviar no WhatsApp' : 'Concluir'
        }
        confirmingLabel={
          whatsappReviewMode === 'resend' ? 'Abrindo...' : 'Concluindo...'
        }
        isConfirming={
          finishConsultation.isPending || updateConsultation.isPending
        }
        isGenerating={isGeneratingSummary}
      />

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {isReturnVisit ? 'Cancelar retorno?' : 'Cancelar consulta?'}
            </DialogTitle>
            <DialogDescription>
              {isReturnVisit ? (
                <>
                  O retorno em andamento de{' '}
                  <strong>{consultation.pet.name}</strong> será removido e o
                  agendamento voltará a ficar disponível para iniciar novamente.
                </>
              ) : (
                <>
                  A consulta em andamento de{' '}
                  <strong>{consultation.pet.name}</strong> será removida
                  permanentemente. Esta ação não tem volta.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setCancelOpen(false)}
              disabled={deleteConsultation.isPending}
            >
              Voltar
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={() => void handleConfirmCancel()}
              disabled={deleteConsultation.isPending}
            >
              {deleteConsultation.isPending
                ? 'Cancelando...'
                : isReturnVisit
                  ? 'Cancelar retorno'
                  : 'Cancelar consulta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={cancelScheduledReturnOpen}
        onOpenChange={setCancelScheduledReturnOpen}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Cancelar retorno agendado?</DialogTitle>
            <DialogDescription>
              O retorno agendado de <strong>{consultation.pet.name}</strong>{' '}
              será cancelado e a consulta original passará a constar como
              finalizada, sem retorno pendente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setCancelScheduledReturnOpen(false)}
              disabled={cancelScheduledReturn.isPending}
            >
              Voltar
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={() => void handleConfirmCancelScheduledReturn()}
              disabled={cancelScheduledReturn.isPending}
            >
              {cancelScheduledReturn.isPending
                ? 'Cancelando...'
                : 'Cancelar retorno'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {consultation && consultation.parentConsultationId ? (
        <ParentConsultationReferenceDialog
          parentConsultationId={consultation.parentConsultationId}
          open={parentReferenceOpen}
          onOpenChange={setParentReferenceOpen}
        />
      ) : null}

      {consultation ? (
        <PetWeightDialog
          open={weightDialogOpen}
          onOpenChange={setWeightDialogOpen}
          petName={consultation.pet.name}
          previousWeightKg={previousWeightKg}
          initialWeightKg={
            pendingWeightKg !== null
              ? String(pendingWeightKg)
              : (consultation.weightKg ?? previousWeightKg)
          }
          onConfirm={setPendingWeightKg}
        />
      ) : null}
    </div>
  );
}
