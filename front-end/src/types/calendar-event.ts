import type { PetSpecies } from '@/types/tutor';
import type { AppointmentType } from '@/types/appointment';

export type CalendarEventKind = 'APPOINTMENT' | 'CONSULTATION';

export type CalendarEvent = {
  id: string;
  kind: CalendarEventKind;
  startsAt: string;
  durationMinutes?: number;
  title: string;
  status: string;
  tutor: { id: string; name: string };
  pet: { id: string; name: string; species: PetSpecies | string };
  veterinarian?: { id: string; name: string };
  appointmentId?: string;
  appointmentType?: AppointmentType;
  consultationId?: string;
  vaccinationId?: string;
};