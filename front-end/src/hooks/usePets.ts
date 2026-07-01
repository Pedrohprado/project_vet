import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { STATS_QUERY_KEY } from '@/hooks/useStats';
import { createPetForTutor, getPet, updatePet } from '@/api/pets';

export function usePet(id: string | undefined) {
  return useQuery({
    queryKey: ['pet', id],
    queryFn: () => getPet(id!),
    enabled: Boolean(id),
  });
}

export function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tutorId,
      data,
    }: {
      tutorId: string;
      data: Parameters<typeof createPetForTutor>[1];
    }) => createPetForTutor(tutorId, data),
    onSuccess: (_, { tutorId }) => {
      void queryClient.invalidateQueries({ queryKey: ['tutor', tutorId] });
      void queryClient.invalidateQueries({ queryKey: ['tutors'] });
      void queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
    },
  });
}

export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updatePet>[1] }) =>
      updatePet(id, data),
    onSuccess: (pet) => {
      void queryClient.invalidateQueries({ queryKey: ['pet', pet.id] });
      void queryClient.invalidateQueries({ queryKey: ['tutor', pet.tutorId] });
    },
  });
}
