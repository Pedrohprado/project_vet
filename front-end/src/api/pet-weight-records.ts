import { apiFetchJson } from '@/api/http';
import type {
  CreatePetWeightRecordPayload,
  PetWeightRecord,
} from '@/types/pet-weight-record';

export async function listPetWeightRecords(petId: string): Promise<PetWeightRecord[]> {
  return apiFetchJson<PetWeightRecord[]>(`/pets/${petId}/weight-records`);
}

export async function createPetWeightRecord(
  petId: string,
  payload: CreatePetWeightRecordPayload,
): Promise<PetWeightRecord> {
  return apiFetchJson<PetWeightRecord>(`/pets/${petId}/weight-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
