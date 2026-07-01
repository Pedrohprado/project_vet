import { apiFetchJson } from '@/api/http';

export type ClinicStatsSummary = {
  tutors: number;
  pets: number;
  appointments: number;
  consultations: number;
  onboarding: {
    tutorCreated: boolean;
    petRegistered: boolean;
    careStarted: boolean;
  };
};

export async function getClinicStatsSummary(): Promise<ClinicStatsSummary> {
  return apiFetchJson<ClinicStatsSummary>('/stats/summary');
}
