import { apiFetchJson } from '@/api/http';
import type {
  Appointment,
  CreateAppointmentPayload,
} from '@/types/appointment';

export async function listAppointments(params: {
  start: string;
  end: string;
}): Promise<Appointment[]> {
  const searchParams = new URLSearchParams({
    start: params.start,
    end: params.end,
  });

  return apiFetchJson<Appointment[]>(`/appointments?${searchParams}`);
}

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
