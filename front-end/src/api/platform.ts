import { apiFetchJson } from '@/api/http';
import type {
  ClinicPlan,
  PaymentMethod,
  PaymentStatus,
  UserRole,
} from '@/types/auth';

export type PlatformStats = {
  clinicsActive: number;
  clinicsInactive: number;
  clinicsTotal: number;
  tutors: number;
  pets: number;
  veterinariansTotal: number;
  veterinariansActive: number;
  veterinariansRecentLogin: number;
  consultationsFinished: number;
  communityCases: number;
  communityLikes: number;
  communityComments: number;
};

export type PlatformClinic = {
  id: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  plan: ClinicPlan;
  isActive: boolean;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
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

export type PlatformVeterinarian = {
  id: string;
  name: string;
  email: string;
  crmv: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  clinicId: string | null;
  clinicName: string | null;
  clinicPlan: ClinicPlan | null;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus | null;
  consultationsCount: number;
  communityCasesCount: number;
  commentsCount: number;
  likesGivenCount: number;
  likesReceivedCount: number;
};

export type PlatformVeterinariansResponse = {
  items: PlatformVeterinarian[];
  total: number;
  page: number;
  limit: number;
};

export type PlatformVeterinarianActivity = {
  id: string;
  name: string;
  crmv: string | null;
  clinicName: string | null;
  activityScore: number;
  casesCount: number;
  commentsCount: number;
  likesGivenCount: number;
};

export type PlatformVeterinarianRelationUser = {
  id: string;
  name: string;
  crmv: string | null;
  clinicName: string | null;
};

export type PlatformVeterinarianInteractionPair = {
  userA: PlatformVeterinarianRelationUser;
  userB: PlatformVeterinarianRelationUser;
  interactionsCount: number;
};

export type PlatformVeterinarianRelations = {
  ranking: PlatformVeterinarianActivity[];
  interactionPairs: PlatformVeterinarianInteractionPair[];
};

export type UpdatePlatformClinicPayload = {
  isActive?: boolean;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
};

export type UpdatedPlatformClinic = {
  id: string;
  name: string;
  isActive: boolean;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  plan: ClinicPlan;
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
): Promise<UpdatedPlatformClinic> {
  return updatePlatformClinic(id, { isActive });
}

export async function updatePlatformClinic(
  id: string,
  payload: UpdatePlatformClinicPayload,
): Promise<UpdatedPlatformClinic> {
  return apiFetchJson(`/platform/clinics/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function listPlatformVeterinarians(params?: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<PlatformVeterinariansResponse> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.set('q', params.q);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  return apiFetchJson<PlatformVeterinariansResponse>(
    `/platform/veterinarians${query ? `?${query}` : ''}`,
  );
}

export async function getPlatformVeterinarianRelations(): Promise<PlatformVeterinarianRelations> {
  return apiFetchJson<PlatformVeterinarianRelations>(
    '/platform/veterinarian-relations',
  );
}
