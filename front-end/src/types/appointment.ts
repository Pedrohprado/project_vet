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
  sourceConsultationId: string | null;
  sourceVaccinationId: string | null;
  createdAt: string;
  updatedAt: string;
  tutor?: { id: string; name: string };
  pet?: { id: string; name: string; species: string };
  veterinarian?: { id: string; name: string };
  consultation?: { id: string; status: string } | null;
  vaccination?: { id: string; appliedAt: string | null } | null;
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

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  CONSULTATION: 'Consulta',
  VACCINATION: 'Vacinação',
  EXAM: 'Exame',
  PROCEDURE: 'Procedimento',
  RETURN: 'Retorno',
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Concluído',
  NO_SHOW: 'Não compareceu',
};
