import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTutor,
  getTutor,
  listTutors,
  updateTutor,
} from '@/api/tutors';

export function useTutors(search?: string) {
  return useQuery({
    queryKey: ['tutors', search ?? ''],
    queryFn: () => listTutors({ q: search || undefined }),
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
