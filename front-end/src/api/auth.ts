import { apiFetchJson } from '@/api/http';
import type {
  AuthResponse,
  RegisterClinicPayload,
  UpdateProfilePayload,
} from '@/types/auth';

export async function registerClinic(
  payload: RegisterClinicPayload,
): Promise<AuthResponse> {
  return apiFetchJson<AuthResponse>('/clinics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiFetchJson<AuthResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(): Promise<AuthResponse> {
  return apiFetchJson<AuthResponse>('/auth/me');
}

export async function refreshSession(): Promise<void> {
  await apiFetchJson<{ ok: true }>('/auth/refresh', {
    method: 'POST',
  });
}

export async function logout(): Promise<void> {
  await apiFetchJson<{ ok: true }>('/auth/logout', {
    method: 'POST',
  });
}

export async function completeWelcome(): Promise<AuthResponse> {
  return apiFetchJson<AuthResponse>('/auth/complete-welcome', {
    method: 'POST',
  });
}

export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<AuthResponse> {
  return apiFetchJson<AuthResponse>('/auth/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function saveSignature(signature: string): Promise<AuthResponse> {
  return apiFetchJson<AuthResponse>('/auth/me/signature', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signature }),
  });
}

export async function deleteSignature(): Promise<AuthResponse> {
  return apiFetchJson<AuthResponse>('/auth/me/signature', {
    method: 'DELETE',
  });
}
