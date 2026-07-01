import type { PetSpecies } from '@/types/tutor';

export type ConsultationStatus = 'OPEN' | 'FINISHED' | 'CANCELLED';

export const CONSULTATION_STATUS_LABELS: Record<ConsultationStatus, string> = {
  OPEN: 'Em andamento',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
};

export type Prescription = {
  id: string;
  medicineName: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  createdAt: string;
};

export type Consultation = {
  id: string;
  clinicId: string;
  appointmentId: string | null;
  tutorId: string;
  petId: string;
  veterinarianId: string;
  status: ConsultationStatus;
  startedAt: string;
  finishedAt: string | null;
  weightKg: string | null;
  temperature: string | null;
  mainComplaint: string | null;
  history: string | null;
  physicalExam: string | null;
  diagnosis: string | null;
  conduct: string | null;
  observations: string | null;
  needsReturn: boolean;
  returnDate: string | null;
  createdAt: string;
  updatedAt: string;
  prescriptions: Prescription[];
  tutor: {
    id: string;
    name: string;
    phone: string | null;
    whatsapp: string | null;
  };
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    photoUrl: string | null;
    birthDate: string | null;
    weightKg: string | null;
  };
  veterinarian: {
    id: string;
    name: string;
  };
};

export type ConsultationListItem = {
  id: string;
  status: ConsultationStatus;
  startedAt: string;
  finishedAt: string | null;
  tutor: { id: string; name: string };
  pet: { id: string; name: string; species: PetSpecies };
  veterinarian: { id: string; name: string };
};

export type ConsultationListResponse = {
  items: ConsultationListItem[];
  total: number;
  page: number;
  limit: number;
};

export type CreateConsultationPayload = {
  tutorId: string;
  petId: string;
  appointmentId?: string;
};

export type UpdateConsultationPayload = {
  mainComplaint?: string;
  history?: string;
  physicalExam?: string;
  weightKg?: number;
  temperature?: number;
  diagnosis?: string;
  conduct?: string;
  observations?: string;
  needsReturn?: boolean;
  returnDate?: string;
};

export type CreatePrescriptionPayload = {
  medicineName: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
};

export type FinishConsultationPayload = {
  diagnosis?: string;
  conduct?: string;
  needsReturn?: boolean;
  returnDate?: string;
};
