import { useQuery } from '@tanstack/react-query';
import { listAppointments } from '@/api/appointments';
import { listConsultations } from '@/api/consultations';
import {
  getCalendarFetchRange,
  mapAppointmentToCalendarEvent,
  mapConsultationToCalendarEvent,
} from '@/lib/calendar-events';
import type { CalendarEvent } from '@/types/calendar-event';

export const CALENDAR_EVENTS_QUERY_KEY = 'calendar-events';

export function useCalendarEvents(month: Date) {
  const { start, end } = getCalendarFetchRange(month);
  const startISO = start.toISOString();
  const endISO = end.toISOString();

  return useQuery({
    queryKey: [CALENDAR_EVENTS_QUERY_KEY, startISO, endISO],
    queryFn: async (): Promise<CalendarEvent[]> => {
      const [appointments, consultations] = await Promise.all([
        listAppointments({ start: startISO, end: endISO }),
        listConsultations({ start: startISO, end: endISO }),
      ]);

      const appointmentEvents = appointments
        .map(mapAppointmentToCalendarEvent)
        .filter((event): event is CalendarEvent => event !== null);

      const consultationEvents = consultations.items.map(
        mapConsultationToCalendarEvent,
      );

      return [...appointmentEvents, ...consultationEvents].sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      );
    },
  });
}
