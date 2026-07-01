export type PetTimelineEventKind =
  | 'REGISTRATION'
  | 'CONSULTATION'
  | 'APPOINTMENT'
  | 'VACCINATION';

export type PetTimelineLinkType = 'consultation' | 'appointment' | 'vaccination';

export type PetTimelineEvent = {
  id: string;
  kind: PetTimelineEventKind;
  occurredAt: string;
  title: string;
  description: string | null;
  status?: string;
  veterinarianName: string | null;
  linkTo?: { type: PetTimelineLinkType; id: string };
};

export const PET_TIMELINE_KIND_LABELS: Record<PetTimelineEventKind, string> = {
  REGISTRATION: 'Cadastro',
  CONSULTATION: 'Consulta',
  APPOINTMENT: 'Agendamento',
  VACCINATION: 'Vacinação',
};

export const PET_TIMELINE_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Em andamento',
  FINISHED: 'Finalizada',
  CANCELLED: 'Cancelada',
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  NO_SHOW: 'Não compareceu',
  APPLIED: 'Aplicada',
  IN_PROGRESS: 'Em andamento',
  VALID: 'Válida',
  EXPIRED: 'Vencida',
  NO_REINFORCEMENT: 'Sem reforço',
};
