import { useQuery } from '@tanstack/react-query';
import { getClinicStatsSummary } from '@/api/stats';

export function useClinicStats() {
  return useQuery({
    queryKey: ['stats', 'summary'],
    queryFn: getClinicStatsSummary,
    refetchOnWindowFocus: true,
  });
}

export const STATS_QUERY_KEY = ['stats', 'summary'] as const;
