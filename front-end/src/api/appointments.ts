import { apiFetchJson } from '@/api/http';
import type {
  Appointment,
  CreateAppointmentPayload,
} from '@/types/appointment';

export async function createAppointment(
  payload: CreateAppointmentPayload,
): Promise<Appointment> {
  return apiFetchJson<Appointment>('/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getAppointment(id: string): Promise<Appointment> {
  return apiFetchJson<Appointment>(`/appointments/${id}`);
}
