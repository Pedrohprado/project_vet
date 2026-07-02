import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { STATS_QUERY_KEY } from '@/hooks/useStats';
import {
  createTutor,
  deleteTutor,
  getTutor,
  listTutors,
  updateTutor,
} from '@/api/tutors';
export function useTutors(search?: string, options?: { limit?: number }) {
  return useQuery({
    queryKey: ['tutors', search ?? '', options?.limit ?? ''],
    queryFn: () =>
      listTutors({
        q: search || undefined,
        limit: options?.limit,
      }),
  });
}

export function useTutor(id: string | undefined) {
  return useQuery({
    queryKey: ['tutor', id],
    queryFn: () => getTutor(id!),
    enabled: Boolean(id),
  });
}

export function useCreateTutor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTutor,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tutors'] });
      void queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
    },
  });
}

export function useUpdateTutor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTutor>[1] }) =>
      updateTutor(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['tutors'] });
      void queryClient.invalidateQueries({ queryKey: ['tutor', id] });
    },
  });
}

export function useDeleteTutor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTutor,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tutors'] });
      void queryClient.invalidateQueries({ queryKey: ['consultations'] });
      void queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['tutor'] });
    },
  });
}
