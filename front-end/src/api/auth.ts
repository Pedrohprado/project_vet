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
