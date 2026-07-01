import { apiFetchJson } from '@/api/http';
import type {
  AuthResponse,
  RegisterClinicPayload,
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
