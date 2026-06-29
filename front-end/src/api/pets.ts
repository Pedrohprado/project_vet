import { apiFetchJson } from '@/api/http';
import type { Pet, UpdatePetPayload } from '@/types/pet';

export async function getPet(id: string): Promise<Pet> {
  return apiFetchJson<Pet>(`/pets/${id}`);
}

export async function updatePet(id: string, payload: UpdatePetPayload): Promise<Pet> {
  return apiFetchJson<Pet>(`/pets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export { createPetForTutor } from '@/api/tutors';
