import {
  addDays,
  endOfMonth,
  isSameDay,
  startOfMonth,
  subDays,
} from 'date-fns';
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
  };
}

export function mapConsultationToCalendarEvent(
  consultation: ConsultationListItem,
): CalendarEvent {
  return {
    id: consultation.id,
    kind: 'CONSULTATION',
    startsAt: consultation.startedAt,
    title: 'Atendimento',
    status: consultation.status,
    tutor: consultation.tutor,
    pet: consultation.pet,
    veterinarian: consultation.veterinarian,
    consultationId: consultation.id,
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
