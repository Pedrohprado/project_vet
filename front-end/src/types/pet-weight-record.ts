export type PetWeightRecordSource = 'REGISTRATION' | 'CONSULTATION' | 'MANUAL';

export const PET_WEIGHT_RECORD_SOURCE_LABELS: Record<PetWeightRecordSource, string> = {
  REGISTRATION: 'Cadastro',
  CONSULTATION: 'Consulta',
  MANUAL: 'Manual',
};

export type PetWeightRecord = {
  id: string;
  clinicId: string;
  petId: string;
  weightKg: string;
  recordedAt: string;
  source: PetWeightRecordSource;
  consultationId: string | null;
  veterinarianId: string | null;
  createdAt: string;
  veterinarian: { id: string; name: string } | null;
};

export type CreatePetWeightRecordPayload = {
  weightKg: number;
  consultationId?: string;
};
