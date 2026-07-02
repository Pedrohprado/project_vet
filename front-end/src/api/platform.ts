import { apiFetchJson } from '@/api/http';
import type { ClinicPlan } from '@/types/auth';

export type PlatformStats = {
  clinicsActive: number;
  clinicsInactive: number;
  clinicsTotal: number;
  tutors: number;
  pets: number;
};

export type PlatformClinic = {
  id: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  plan: ClinicPlan;
  isActive: boolean;
  createdAt: string;
  tutorsCount: number;
  petsCount: number;
  usersCount: number;
};

export type PlatformClinicsResponse = {
  items: PlatformClinic[];
  total: number;
  page: number;
  limit: number;
};

export async function getPlatformStats(): Promise<PlatformStats> {
  return apiFetchJson<PlatformStats>('/platform/stats');
}

export async function listPlatformClinics(params?: {
  q?: string;
  status?: 'active' | 'inactive' | 'all';
  page?: number;
  limit?: number;
}): Promise<PlatformClinicsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.set('q', params.q);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  return apiFetchJson<PlatformClinicsResponse>(
    `/platform/clinics${query ? `?${query}` : ''}`,
  );
}

export async function updatePlatformClinicStatus(
  id: string,
  isActive: boolean,
): Promise<{ id: string; name: string; isActive: boolean }> {
  return apiFetchJson(`/platform/clinics/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
}
