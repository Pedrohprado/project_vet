import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addPrescription,
  createConsultation,
  finishConsultation,
  getConsultation,
  getOpenConsultationByPet,
  removePrescription,
  updateConsultation,
} from '@/api/consultations';

export function useOpenConsultation(petId: string | undefined) {
  return useQuery({
    queryKey: ['consultation', 'open', petId],
    queryFn: () => getOpenConsultationByPet(petId!),
    enabled: Boolean(petId),
  });
}

export function useConsultation(id: string | undefined) {
  return useQuery({
    queryKey: ['consultation', id],
    queryFn: () => getConsultation(id!),
    enabled: Boolean(id),
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConsultation,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['consultations'] });
      void queryClient.invalidateQueries({
        queryKey: ['consultation', 'open', variables.petId],
      });
    },
  });
}

export function useUpdateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateConsultation>[1];
    }) => updateConsultation(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['consultation', id] });
    },
  });
}

export function useAddPrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      consultationId,
      data,
    }: {
      consultationId: string;
      data: Parameters<typeof addPrescription>[1];
    }) => addPrescription(consultationId, data),
    onSuccess: (_, { consultationId }) => {
      void queryClient.invalidateQueries({ queryKey: ['consultation', consultationId] });
    },
  });
}

export function useRemovePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      consultationId,
      prescriptionId,
    }: {
      consultationId: string;
      prescriptionId: string;
    }) => removePrescription(consultationId, prescriptionId),
    onSuccess: (_, { consultationId }) => {
      void queryClient.invalidateQueries({ queryKey: ['consultation', consultationId] });
    },
  });
}

export function useFinishConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof finishConsultation>[1];
    }) => finishConsultation(id, data),
    onSuccess: (consultation, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['consultation', id] });
      void queryClient.invalidateQueries({
        queryKey: ['consultation', 'open', consultation.petId],
      });
      sessionStorage.removeItem(`consultation-step-${id}`);
    },
  });
}
