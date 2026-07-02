import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as platformApi from '@/api/platform';

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform', 'stats'],
    queryFn: platformApi.getPlatformStats,
  });
}

export function usePlatformClinics(
  q?: string,
  status: 'active' | 'inactive' | 'all' = 'all',
  options?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: ['platform', 'clinics', q, status, options?.page, options?.limit],
    queryFn: () =>
      platformApi.listPlatformClinics({
        q,
        status,
        page: options?.page,
        limit: options?.limit,
      }),
  });
}

export function useUpdateClinicStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      platformApi.updatePlatformClinicStatus(id, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['platform'] });
    },
  });
}
