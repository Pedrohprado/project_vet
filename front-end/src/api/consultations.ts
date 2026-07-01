import { apiFetch, apiFetchJson, ApiError } from '@/api/http';
import type {
  Consultation,
  ConsultationListResponse,
  CreateConsultationPayload,
  CreatePrescriptionPayload,
  FinishConsultationPayload,
  Prescription,
  UpdateConsultationPayload,
} from '@/types/consultation';

export async function listConsultations(
  options: { page?: number; limit?: number; start?: string; end?: string } = {},
): Promise<ConsultationListResponse> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (options.start) {
    params.set('start', options.start);
  }

  if (options.end) {
    params.set('end', options.end);
  }

  return apiFetchJson<ConsultationListResponse>(`/consultations?${params}`);
}

export async function createConsultation(
  payload: CreateConsultationPayload,
): Promise<Consultation> {
  return apiFetchJson<Consultation>('/consultations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getOpenConsultationByPet(
  petId: string,
): Promise<Consultation | null> {
  try {
    return await apiFetchJson<Consultation>(`/consultations/pets/${petId}/open`);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

export async function getConsultation(id: string): Promise<Consultation> {
  return apiFetchJson<Consultation>(`/consultations/${id}`);
}

export async function updateConsultation(
  id: string,
  payload: UpdateConsultationPayload,
): Promise<Consultation> {
  return apiFetchJson<Consultation>(`/consultations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function addPrescription(
  consultationId: string,
  payload: CreatePrescriptionPayload,
): Promise<Prescription> {
  return apiFetchJson<Prescription>(`/consultations/${consultationId}/prescriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function removePrescription(
  consultationId: string,
  prescriptionId: string,
): Promise<void> {
  const response = await apiFetch(
    `/consultations/${consultationId}/prescriptions/${prescriptionId}`,
    { method: 'DELETE' },
  );

  if (!response.ok) {
    let message = 'Erro ao remover item da receita';

    try {
      const body = (await response.json()) as { error?: string };
      message = body.error ?? message;
    } catch {
      // ignore
    }

    throw new ApiError(message, response.status);
  }
}

export async function finishConsultation(
  id: string,
  payload: FinishConsultationPayload,
): Promise<Consultation> {
  return apiFetchJson<Consultation>(`/consultations/${id}/finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deleteConsultation(id: string): Promise<void> {
  const response = await apiFetch(`/consultations/${id}`, { method: 'DELETE' });

  if (!response.ok) {
    let message = 'Erro ao excluir atendimento';

    try {
      const body = (await response.json()) as { error?: string };
      message = body.error ?? message;
    } catch {
      // ignore
    }

    throw new ApiError(message, response.status);
  }
}
