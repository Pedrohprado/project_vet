export type WeekReminderKind = 'APPOINTMENT' | 'VACCINE_DOSE';

export type WeekReminderItem = {
  id: string;
  kind: WeekReminderKind;
  at: string;
  title: string;
  subtitle: string;
  href: string;
};

export const WEEK_REMINDER_KIND_LABELS: Record<WeekReminderKind, string> = {
  APPOINTMENT: 'Agendamento',
  VACCINE_DOSE: 'Próxima dose',
};

export type DueVaccinationReminder = {
  id: string;
  vaccineName: string;
  nextDoseAt: string;
  pet: { id: string; name: string; species: string };
  tutor: { id: string; name: string };
};
