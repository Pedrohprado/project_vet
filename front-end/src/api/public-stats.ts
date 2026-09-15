import { apiFetchJson } from '@/api/http';

export type FunnelStep = 'ENTRADA' | 'CHECKOUT' | 'ENTERED';

export type TrackFunnelEventPayload = {
  step: FunnelStep;
  path: '/' | '/login' | '/register' | '/assinatura' | '/assinatura/pagamento' | '/estatisticas';
  sessionId?: string;
};

export type PublicStats = {
  registeredUsers: number;
  entrada: number;
  checkout: number;
  entered: number;
};

export async function trackFunnelEvent(
  payload: TrackFunnelEventPayload,
): Promise<{ ok: boolean }> {
  return apiFetchJson<{ ok: boolean }>('/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'omit',
  });
}

export async function getPublicStats(): Promise<PublicStats> {
  return apiFetchJson<PublicStats>('/public/stats', {
    method: 'GET',
    credentials: 'omit',
  });
}
