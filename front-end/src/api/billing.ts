import { apiFetchJson } from '@/api/http';
import type { Clinic } from '@/types/auth';

export type SelectPixResponse = {
  clinic: Clinic;
};

export async function selectPixBilling(): Promise<SelectPixResponse> {
  return apiFetchJson<SelectPixResponse>('/billing/select-pix', {
    method: 'POST',
  });
}
