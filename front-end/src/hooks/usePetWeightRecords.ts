import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPetWeightRecord,
  listPetWeightRecords,
} from '@/api/pet-weight-records';
import type { CreatePetWeightRecordPayload } from '@/types/pet-weight-record';

export function petWeightRecordsQueryKey(petId: string) {
  return ['pet-weight-records', petId] as const;
}

export function usePetWeightRecords(petId: string | undefined) {
  return useQuery({
    queryKey: petWeightRecordsQueryKey(petId ?? ''),
    queryFn: () => listPetWeightRecords(petId!),
    enabled: Boolean(petId),
  });
}

export function useCreatePetWeightRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      petId,
      data,
    }: {
      petId: string;
      data: CreatePetWeightRecordPayload;
      consultationId?: string;
    }) => createPetWeightRecord(petId, data),
    onSuccess: (_record, { petId, consultationId }) => {
      void queryClient.invalidateQueries({
        queryKey: petWeightRecordsQueryKey(petId),
      });
      void queryClient.invalidateQueries({ queryKey: ['pet', petId] });
      if (consultationId) {
        void queryClient.invalidateQueries({
          queryKey: ['consultation', consultationId],
        });
      }
    },
  });
}
