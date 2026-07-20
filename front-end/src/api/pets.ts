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

export async function uploadPetPhoto(id: string, file: File): Promise<Pet> {
  const formData = new FormData();
  formData.append('photo', file);

  return apiFetchJson<Pet>(`/pets/${id}/photo`, {
    method: 'PUT',
    body: formData,
  });
}

export async function deletePetPhoto(id: string): Promise<Pet> {
  return apiFetchJson<Pet>(`/pets/${id}/photo`, {
    method: 'DELETE',
  });
}

export { createPetForTutor } from '@/api/tutors';