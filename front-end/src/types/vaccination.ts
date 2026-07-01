import type { PetSpecies } from '@/types/tutor';
import type { VaccineCatalogItem } from '@/types/vaccine-catalog';

export type VaccinationStatusKind =
  | 'IN_PROGRESS'
  | 'VALID'
  | 'EXPIRED'
  | 'NO_REINFORCEMENT';

export type Vaccination = {
  id: string;
  clinicId: string;
  appointmentId: string | null;
  petId: string;
  veterinarianId: string;
  vaccineCatalogItemId: string | null;
  vaccineName: string;
  dose: string | null;
  batch: string | null;
  manufacturer: string | null;
  appliedAt: string | null;
  nextDoseAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  pet?: {
    id: string;
    name: string;
    species: PetSpecies | string;
    breed: string | null;
    photoUrl: string | null;
    birthDate: string | null;
    tutorId: string;
    tutor: {
      id: string;
      name: string;
      phone: string | null;
      whatsapp: string | null;
    };
  };
  veterinarian?: { id: string; name: string };
  vaccineCatalogItem?: Pick<
    VaccineCatalogItem,
    'id' | 'name' | 'defaultIntervalDays'
  > | null;
};

export type VaccinationListItem = {
  id: string;
  vaccineName: string;
  appliedAt: string | null;
  createdAt: string;
  pet: {
    id: string;
    name: string;
    species: PetSpecies | string;
    tutor: { id: string; name: string };
  };
  veterinarian: { id: string; name: string };
};

export type VaccinationListResponse = {
  items: VaccinationListItem[];
  total: number;
  page: number;
  limit: number;
};

export type CreateVaccinationPayload = {
  tutorId: string;
  petId: string;
  appointmentId?: string;
};

export type UpdateVaccinationPayload = {
  vaccineCatalogItemId?: string | null;
  vaccineName?: string;
  dose?: string;
  batch?: string;
  manufacturer?: string;
  nextDoseAt?: string | null;
  notes?: string;
};

export type FinishVaccinationPayload = {
  vaccineCatalogItemId?: string | null;
  vaccineName?: string;
  dose?: string;
  batch?: string;
  manufacturer?: string;
  nextDoseAt?: string | null;
  notes?: string;
  appliedAt?: string;
};

export const VACCINATION_STATUS_LABELS: Record<VaccinationStatusKind, string> = {
  IN_PROGRESS: 'Em andamento',
  VALID: 'Válida',
  EXPIRED: 'Vencida',
  NO_REINFORCEMENT: 'Sem reforço',
};
