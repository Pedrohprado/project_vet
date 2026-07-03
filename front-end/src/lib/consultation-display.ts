import type { Consultation, ConsultationStatus } from '@/types/consultation';
import { CONSULTATION_STATUS_LABELS } from '@/types/consultation';

type ConsultationStatusInput = Pick<
  Consultation,
  'status' | 'parentConsultationId'
>;

export function getConsultationDisplayStatusLabel(
  consultation: ConsultationStatusInput,
): string {
  if (consultation.status === 'OPEN' && consultation.parentConsultationId) {
    return 'Retorno em andamento';
  }

  return CONSULTATION_STATUS_LABELS[consultation.status] ?? consultation.status;
}

export function isConsultationReturnScheduled(consultation: Pick<Consultation, 'status'>) {
  return consultation.status === 'RETURN_SCHEDULED';
}

export function isConsultationEditable(consultation: Pick<Consultation, 'status'>) {
  return consultation.status === 'OPEN';
}

export function isConsultationReadOnly(consultation: Pick<Consultation, 'status'>) {
  return (
    consultation.status === 'FINISHED' ||
    consultation.status === 'RETURN_SCHEDULED' ||
    consultation.status === 'CANCELLED'
  );
}

export function getConsultationStatusForList(status: ConsultationStatus): string {
  return CONSULTATION_STATUS_LABELS[status] ?? status;
}
