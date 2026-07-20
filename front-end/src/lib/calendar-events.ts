import {
  addDays,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
  subDays,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Appointment } from '@/types/appointment';
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
} from '@/types/appointment';
import type { ConsultationListItem } from '@/types/consultation';
import { CONSULTATION_STATUS_LABELS } from '@/types/consultation';
import type { CalendarEvent } from '@/types/calendar-event';

export function getCalendarFetchRange(month: Date) {
  const start = subDays(startOfMonth(month), 7);
  const end = addDays(endOfMonth(month), 7);
  return { start, end };
}

export function getEventsForDay(events: CalendarEvent[], date: Date) {
  return events
    .filter((event) => isSameDay(new Date(event.startsAt), date))
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
}

/** Key: local calendar day `yyyy-MM-dd`. Values are sorted by startsAt. */
export function indexEventsByDay(events: CalendarEvent[]) {
  const index = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const key = format(new Date(event.startsAt), 'yyyy-MM-dd');
    const bucket = index.get(key);
    if (bucket) {
      bucket.push(event);
    } else {
      index.set(key, [event]);
    }
  }

  for (const bucket of index.values()) {
    bucket.sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
  }

  return index;
}

export function getIndexedEventsForDay(
  eventsByDay: Map<string, CalendarEvent[]>,
  date: Date,
) {
  return eventsByDay.get(format(date, 'yyyy-MM-dd')) ?? [];
}

function getAppointmentTitle(appointment: Appointment) {
  if (appointment.title?.trim()) {
    return appointment.title.trim();
  }

  return APPOINTMENT_TYPE_LABELS[appointment.type] ?? appointment.type;
}

export function mapAppointmentToCalendarEvent(
  appointment: Appointment,
): CalendarEvent | null {
  if (!appointment.tutor || !appointment.pet) {
    return null;
  }

  if (appointment.consultation) {
    return null;
  }

  if (appointment.vaccination?.appliedAt) {
    return null;
  }

  return {
    id: appointment.id,
    kind: 'APPOINTMENT',
    startsAt: appointment.scheduledAt,
    durationMinutes: appointment.durationMinutes,
    title: getAppointmentTitle(appointment),
    status: appointment.status,
    tutor: appointment.tutor,
    pet: appointment.pet,
    veterinarian: appointment.veterinarian,
    appointmentId: appointment.id,
    appointmentType: appointment.type,
    sourceConsultationId: appointment.sourceConsultationId ?? undefined,
    sourceVaccinationId: appointment.sourceVaccinationId ?? undefined,
  };
}

export function mapConsultationToCalendarEvent(
  consultation: ConsultationListItem,
): CalendarEvent {
  const isReturnVisit = Boolean(consultation.parentConsultationId);

  return {
    id: consultation.id,
    kind: 'CONSULTATION',
    startsAt: consultation.startedAt,
    title: isReturnVisit ? 'Retorno' : 'Atendimento',
    status: consultation.status,
    tutor: consultation.tutor,
    pet: consultation.pet,
    veterinarian: consultation.veterinarian,
    consultationId: consultation.id,
    parentConsultationId: consultation.parentConsultationId ?? undefined,
  };
}

export function getCalendarEventStatusLabel(event: CalendarEvent) {
  if (event.kind === 'APPOINTMENT') {
    return (
      APPOINTMENT_STATUS_LABELS[
        event.status as keyof typeof APPOINTMENT_STATUS_LABELS
      ] ?? event.status
    );
  }

  return (
    CONSULTATION_STATUS_LABELS[
      event.status as keyof typeof CONSULTATION_STATUS_LABELS
    ] ?? event.status
  );
}

export function formatEventTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDayTitle(date: Date) {
  return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function canStartConsultationFromEvent(event: CalendarEvent) {
  return (
    event.kind === 'APPOINTMENT' &&
    event.appointmentType === 'CONSULTATION' &&
    (event.status === 'SCHEDULED' || event.status === 'CONFIRMED') &&
    Boolean(event.appointmentId)
  );
}

export function canStartVaccinationFromEvent(event: CalendarEvent) {
  return (
    event.kind === 'APPOINTMENT' &&
    event.appointmentType === 'VACCINATION' &&
    (event.status === 'SCHEDULED' || event.status === 'CONFIRMED') &&
    Boolean(event.appointmentId)
  );
}

export function canContinueReturnFromEvent(event: CalendarEvent) {
  return (
    event.kind === 'APPOINTMENT' &&
    event.appointmentType === 'RETURN' &&
    Boolean(event.sourceConsultationId) &&
    (event.status === 'SCHEDULED' || event.status === 'CONFIRMED')
  );
}
