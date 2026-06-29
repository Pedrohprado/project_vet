export type AppointmentType =
  | 'CONSULTATION'
  | 'VACCINATION'
  | 'EXAM'
  | 'PROCEDURE'
  | 'RETURN';

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

export type Appointment = {
  id: string;
  clinicId: string;
  tutorId: string;
  petId: string;
  veterinarianId: string | null;
  type: AppointmentType;
  status: AppointmentStatus;
  title: string | null;
  description: string | null;
  scheduledAt: string;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
  tutor?: { id: string; name: string };
  pet?: { id: string; name: string; species: string };
  veterinarian?: { id: string; name: string };
};

export type CreateAppointmentPayload = {
  tutorId: string;
  petId: string;
  type: 'CONSULTATION' | 'VACCINATION';
  scheduledAt: string;
  durationMinutes?: number;
  title?: string;
  description?: string;
};

export const APPOINTMENT_TYPE_LABELS: Record<
  CreateAppointmentPayload['type'],
  string
> = {
  CONSULTATION: 'Consulta',
  VACCINATION: 'Vacinação',
};
