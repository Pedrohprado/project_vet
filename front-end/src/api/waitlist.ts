import { apiFetchJson } from '@/api/http';

export type JoinWaitlistPayload = {
  email: string;
  clinicName?: string;
  planInterest?: string;
};

export type JoinWaitlistResponse = {
  alreadyExists: boolean;
  message: string;
};

export type WaitlistSignup = {
  id: string;
  email: string;
  clinicName: string | null;
  planInterest: string | null;
  createdAt: string;
};

export async function joinWaitlist(
  payload: JoinWaitlistPayload,
): Promise<JoinWaitlistResponse> {
  return apiFetchJson<JoinWaitlistResponse>('/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'omit',
  });
}

export async function listWaitlistSignups(): Promise<{
  items: WaitlistSignup[];
}> {
  return apiFetchJson<{ items: WaitlistSignup[] }>('/platform/waitlist');
}
