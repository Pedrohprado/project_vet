import { apiFetchJson } from '@/api/http';
import type {
  CreateTutorPayload,
  Tutor,
  TutorsListResponse,
  TutorWithPets,
  UpdateTutorPayload,
} from '@/types/tutor';
import type { CreatePetPayload, Pet } from '@/types/pet';

export async function listTutors(params?: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<TutorsListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.q) searchParams.set('q', params.q);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  return apiFetchJson<TutorsListResponse>(`/tutors${query ? `?${query}` : ''}`);
}

export async function getTutor(id: string): Promise<TutorWithPets> {
  return apiFetchJson<TutorWithPets>(`/tutors/${id}`);
}

export async function createTutor(payload: CreateTutorPayload): Promise<Tutor> {
  return apiFetchJson<Tutor>('/tutors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updateTutor(
  id: string,
  payload: UpdateTutorPayload,
): Promise<Tutor> {
  return apiFetchJson<Tutor>(`/tutors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function createPetForTutor(
  tutorId: string,
  payload: CreatePetPayload,
): Promise<Pet> {
  return apiFetchJson<Pet>(`/tutors/${tutorId}/pets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
