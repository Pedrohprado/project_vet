import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ExternalLink, RotateCcw, Stethoscope, Syringe } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { getOpenVaccinationByPet } from '@/api/vaccinations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCreateConsultation, useCreateReturnConsultation } from '@/hooks/useConsultations';
import { useCreateVaccination } from '@/hooks/useVaccinations';
import {
  canContinueReturnFromEvent,
  canStartConsultationFromEvent,
  canStartVaccinationFromEvent,
  formatEventTime,
  getCalendarEventStatusLabel,
  getEventsForDay,
} from '@/lib/calendar-events';
import { cn } from '@/lib/utils';
import { PET_SPECIES_LABELS } from '@/types/pet';
import type { CalendarEvent } from '@/types/calendar-event';

type DayTimelineProps = {
  selectedDay: Date;
  events: CalendarEvent[];
  onConsultationStarted?: () => void;
};

function getBadgeVariant(
  event: CalendarEvent,
): 'default' | 'secondary' | 'outline' {
  if (event.kind === 'CONSULTATION') {
    if (event.status === 'OPEN') return 'default';
    if (event.status === 'RETURN_SCHEDULED') return 'secondary';
    if (event.status === 'FINISHED') return 'secondary';
    return 'outline';
  }

  if (event.status === 'SCHEDULED' || event.status === 'CONFIRMED') {
    return 'default';
  }

  return 'outline';
}

function isUpcomingEvent(event: CalendarEvent) {
  return (
    event.kind === 'APPOINTMENT' &&
    (event.status === 'SCHEDULED' || event.status === 'CONFIRMED')
  );
}

function DayTimelineItem({
  event,
  onConsultationStarted,
}: {
  event: CalendarEvent;
  onConsultationStarted?: () => void;
}) {
  const navigate = useNavigate();
  const createConsultation = useCreateConsultation();
  const createReturnConsultation = useCreateReturnConsultation();
  const createVaccination = useCreateVaccination();
  const isStartingConsultation = createConsultation.isPending;
  const isStartingReturn = createReturnConsultation.isPending;
  const isStartingVaccination = createVaccination.isPending;
  const isUpcoming = isUpcomingEvent(event);
  const isVaccinationAppointment = event.appointmentType === 'VACCINATION';
  const isReturnAppointment = event.appointmentType === 'RETURN';
  const Icon =
    event.kind === 'CONSULTATION'
      ? Stethoscope
      : isVaccinationAppointment
        ? Syringe
        : isReturnAppointment
          ? RotateCcw
          : Calendar;

  async function handleStartConsultation() {
    if (!event.appointmentId) {
      return;
    }

    try {
      const consultation = await createConsultation.mutateAsync({
        tutorId: event.tutor.id,
        petId: event.pet.id,
        appointmentId: event.appointmentId,
      });
      toast.success('Consulta iniciada');
      onConsultationStarted?.();
      navigate(`/consultations/${consultation.id}`);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível iniciar a consulta';
      toast.error(message);
    }
  }

  async function handleStartReturn() {
    if (!event.sourceConsultationId) {
      return;
    }

    try {
      const consultation = await createReturnConsultation.mutateAsync({
        parentId: event.sourceConsultationId,
        appointmentId: event.appointmentId,
        petId: event.pet.id,
      });
      toast.success('Retorno iniciado');
      onConsultationStarted?.();
      navigate(`/consultations/${consultation.id}`);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível iniciar o retorno';
      toast.error(message);
    }
  }

  async function handleStartVaccination() {
    if (!event.appointmentId) {
      return;
    }

    try {
      const vaccination = await createVaccination.mutateAsync({
        tutorId: event.tutor.id,
        petId: event.pet.id,
        appointmentId: event.appointmentId,
      });
      toast.success('Vacinação iniciada');
      onConsultationStarted?.();
      navigate(`/vaccinations/${vaccination.id}`);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 409) {
        const openVaccination = await getOpenVaccinationByPet(event.pet.id);
        if (openVaccination) {
          toast.info('Retomando vacinação em andamento.');
          onConsultationStarted?.();
          navigate(`/vaccinations/${openVaccination.id}`);
          return;
        }
      }

      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível iniciar a vacinação';
      toast.error(message);
    }
  }

  const canViewConsultation =
    event.kind === 'CONSULTATION' ||
    (event.kind === 'APPOINTMENT' && Boolean(event.consultationId));

  const speciesLabel =
    PET_SPECIES_LABELS[event.pet.species as keyof typeof PET_SPECIES_LABELS] ??
    event.pet.species;

  return (
    <li className="relative pb-8 last:pb-0">
      <span
        className={cn(
          'absolute -left-6.5 top-1 flex size-3 rounded-full border-2 border-background',
          isUpcoming ? 'bg-muted-foreground/40' : 'bg-primary',
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          'rounded-lg border p-3',
          isUpcoming && 'border-dashed bg-muted/20',
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2.5">
            <div
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full',
                isUpcoming
                  ? isVaccinationAppointment
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                    : isReturnAppointment
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                      : 'bg-muted text-muted-foreground'
                  : isVaccinationAppointment
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                    : isReturnAppointment
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                      : 'bg-primary/10 text-primary',
              )}
            >
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{event.title}</p>
              <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                {formatEventTime(event.startsAt)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5">
            <Badge variant={getBadgeVariant(event)}>
              {getCalendarEventStatusLabel(event)}
            </Badge>
            <Badge variant="outline">
              {event.kind === 'APPOINTMENT'
                ? isVaccinationAppointment
                  ? 'Vacinação agendada'
                  : isReturnAppointment
                    ? 'Retorno'
                    : 'Agendamento'
                : 'Atendimento'}
            </Badge>
          </div>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          {event.pet.name} ({speciesLabel}) · {event.tutor.name}
        </p>
        {event.veterinarian ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Dr(a). {event.veterinarian.name}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {canContinueReturnFromEvent(event) ? (
            <Button
              type="button"
              size="sm"
              disabled={isStartingReturn}
              onClick={() => void handleStartReturn()}
            >
              {isStartingReturn ? 'Iniciando...' : 'Iniciar retorno'}
            </Button>
          ) : null}

          {event.kind === 'CONSULTATION' &&
          event.status === 'RETURN_SCHEDULED' &&
          !event.parentConsultationId ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/consultations/${event.id}`)}
            >
              Ver consulta
            </Button>
          ) : null}

          {event.kind === 'CONSULTATION' &&
          event.status === 'OPEN' &&
          event.parentConsultationId ? (
            <Button
              type="button"
              size="sm"
              onClick={() => navigate(`/consultations/${event.id}`)}
            >
              Continuar retorno
            </Button>
          ) : null}

          {canStartConsultationFromEvent(event) ? (
            <Button
              type="button"
              size="sm"
              disabled={isStartingConsultation}
              onClick={() => void handleStartConsultation()}
            >
              Iniciar consulta
            </Button>
          ) : null}

          {canStartVaccinationFromEvent(event) ? (
            <Button
              type="button"
              size="sm"
              disabled={isStartingVaccination}
              onClick={() => void handleStartVaccination()}
            >
              Iniciar vacinação
            </Button>
          ) : null}

          {event.kind === 'CONSULTATION' && event.status === 'OPEN' ? (
            <Button
              type="button"
              size="sm"
              onClick={() => navigate(`/consultations/${event.id}`)}
            >
              Continuar
            </Button>
          ) : null}

          {canViewConsultation && event.status !== 'OPEN' ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                const targetId =
                  event.kind === 'CONSULTATION'
                    ? event.id
                    : event.consultationId;

                if (!targetId) return;

                navigate(`/consultations/${targetId}`);
              }}
            >
              Ver detalhes
            </Button>
          ) : null}

          <Button
            type="button"
            size="sm"
            variant="outline"
            render={
              <Link to={`/tutors/${event.tutor.id}/pets/${event.pet.id}`} />
            }
          >
            <ExternalLink className="size-3.5" />
            Ver pet
          </Button>
        </div>
      </div>
    </li>
  );
}

export function DayTimeline({
  selectedDay,
  events,
  onConsultationStarted,
}: DayTimelineProps) {
  const dayEvents = getEventsForDay(events, selectedDay);

  if (dayEvents.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Nenhum agendamento ou atendimento em{' '}
        {format(selectedDay, "d 'de' MMMM", { locale: ptBR })}.
      </p>
    );
  }

  return (
    <ol className="ml-4 max-h-[min(60vh,28rem)] overflow-y-auto border-l border-border pl-6">
      {dayEvents.map((event) => (
        <DayTimelineItem
          key={`${event.kind}-${event.id}`}
          event={event}
          onConsultationStarted={onConsultationStarted}
        />
      ))}
    </ol>
  );
}

export function formatDayTitle(date: Date) {
  return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
}
