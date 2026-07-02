import { useQuery } from '@tanstack/react-query';
import { listAppointments } from '@/api/appointments';
import { listDueVaccinations } from '@/api/vaccinations';
import { getWeekRange } from '@/lib/week-range';
import { APPOINTMENT_TYPE_LABELS } from '@/types/appointment';
import type { WeekReminderItem } from '@/types/home';

export const WEEK_REMINDERS_QUERY_KEY = ['week-reminders'] as const;

function mapToWeekReminders(
  appointments: Awaited<ReturnType<typeof listAppointments>>,
  dueVaccinations: Awaited<ReturnType<typeof listDueVaccinations>>,
): WeekReminderItem[] {
  const appointmentItems: WeekReminderItem[] = appointments
    .filter((item) => item.status === 'SCHEDULED' || item.status === 'CONFIRMED')
    .map((item) => ({
      id: `appointment-${item.id}`,
      kind: 'APPOINTMENT' as const,
      at: item.scheduledAt,
      title: item.title ?? APPOINTMENT_TYPE_LABELS[item.type] ?? 'Agendamento',
      subtitle: [item.pet?.name, item.tutor?.name].filter(Boolean).join(' · '),
      href: '/agenda',
    }));

  const vaccineItems: WeekReminderItem[] = dueVaccinations.map((item) => ({
    id: `vaccine-dose-${item.id}`,
    kind: 'VACCINE_DOSE' as const,
    at: item.nextDoseAt,
    title: item.vaccineName || 'Próxima dose de vacina',
    subtitle: `${item.pet.name} · ${item.tutor.name}`,
    href: `/tutors/${item.tutor.id}/pets/${item.pet.id}`,
  }));

  return [...appointmentItems, ...vaccineItems].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );
}

export function useWeekReminders() {
  const { start, end } = getWeekRange();

  return useQuery({
    queryKey: [...WEEK_REMINDERS_QUERY_KEY, start, end],
    queryFn: async () => {
      const [appointments, dueVaccinations] = await Promise.all([
        listAppointments({ start, end }),
        listDueVaccinations({ start, end }),
      ]);

      return mapToWeekReminders(appointments, dueVaccinations);
    },
    refetchOnWindowFocus: true,
  });
}
