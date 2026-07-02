import { apiFetch, apiFetchJson, ApiError } from '@/api/http';
import type { DueVaccinationReminder } from '@/types/home';
import type { VaccineCatalogItem } from '@/types/vaccine-catalog';
import type {
  CreateVaccinationPayload,
  FinishVaccinationPayload,
  UpdateVaccinationPayload,
  Vaccination,
  VaccinationListResponse,
} from '@/types/vaccination';

export async function listVaccinations(
  options: { page?: number; limit?: number } = {},
): Promise<VaccinationListResponse> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiFetchJson<VaccinationListResponse>(`/vaccinations?${params}`);
}

export async function listDueVaccinations(params: {
  start: string;
  end: string;
}): Promise<DueVaccinationReminder[]> {
  const searchParams = new URLSearchParams({
    start: params.start,
    end: params.end,
  });

  return apiFetchJson<DueVaccinationReminder[]>(`/vaccinations/due?${searchParams}`);
}

export async function listVaccineCatalog(): Promise<VaccineCatalogItem[]> {
  return apiFetchJson<VaccineCatalogItem[]>('/vaccinations/catalog');
}

export async function createVaccination(
  payload: CreateVaccinationPayload,
): Promise<Vaccination> {
  return apiFetchJson<Vaccination>('/vaccinations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getOpenVaccinationByPet(
  petId: string,
): Promise<Vaccination | null> {
  try {
    return await apiFetchJson<Vaccination>(`/vaccinations/pets/${petId}/open`);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

export async function listVaccinationsByPet(petId: string): Promise<Vaccination[]> {
  return apiFetchJson<Vaccination[]>(`/vaccinations/pets/${petId}`);
}

export async function getVaccination(id: string): Promise<Vaccination> {
  return apiFetchJson<Vaccination>(`/vaccinations/${id}`);
}

export async function updateVaccination(
  id: string,
  payload: UpdateVaccinationPayload,
): Promise<Vaccination> {
  return apiFetchJson<Vaccination>(`/vaccinations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function finishVaccination(
  id: string,
  payload: FinishVaccinationPayload,
): Promise<Vaccination> {
  return apiFetchJson<Vaccination>(`/vaccinations/${id}/finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deleteVaccination(id: string): Promise<void> {
  const response = await apiFetch(`/vaccinations/${id}`, { method: 'DELETE' });

  if (!response.ok) {
    let message = 'Erro ao excluir vacinação';

    try {
      const body = (await response.json()) as { error?: string };
      message = body.error ?? message;
    } catch {
      // ignore
    }

    throw new ApiError(message, response.status);
  }
}
