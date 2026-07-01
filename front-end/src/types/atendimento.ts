import type { PetSpecies } from '@/types/tutor';

export type AtendimentoKind = 'CONSULTATION' | 'VACCINATION';

export type AtendimentoStatus = 'OPEN' | 'FINISHED' | 'CANCELLED';

export type AtendimentoListItem = {
  id: string;
  kind: AtendimentoKind;
  occurredAt: string;
  status: AtendimentoStatus;
  tutor: { id: string; name: string };
  pet: { id: string; name: string; species: PetSpecies | string };
  veterinarian: { id: string; name: string };
  vaccineName?: string;
};

export const ATENDIMENTO_KIND_LABELS: Record<AtendimentoKind, string> = {
  CONSULTATION: 'Consulta',
  VACCINATION: 'Vacinação',
};

export const ATENDIMENTO_STATUS_LABELS: Record<AtendimentoStatus, string> = {
  OPEN: 'Em andamento',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
};
