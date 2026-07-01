import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ATENDIMENTOS_QUERY_KEY } from '@/hooks/useAtendimentos';
import { STATS_QUERY_KEY } from '@/hooks/useStats';
import { PET_TIMELINE_QUERY_KEY } from '@/hooks/usePetTimeline';
import {
  addPrescription,
  createConsultation,
  deleteConsultation,
  finishConsultation,
  getConsultation,
  getOpenConsultationByPet,
  listConsultations,
  removePrescription,
  updateConsultation,
} from '@/api/consultations';

export function useConsultations(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['consultations', page, limit],
    queryFn: () => listConsultations({ page, limit }),
  });
}

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
      void queryClient.invalidateQueries({ queryKey: [ATENDIMENTOS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [CALENDAR_EVENTS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: ['consultation', 'open', variables.petId],
      });
      void queryClient.invalidateQueries({
        queryKey: [PET_TIMELINE_QUERY_KEY, variables.petId],
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
      void queryClient.invalidateQueries({ queryKey: ['consultations'] });
      void queryClient.invalidateQueries({ queryKey: [ATENDIMENTOS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [CALENDAR_EVENTS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: ['consultation', id] });
      void queryClient.invalidateQueries({
        queryKey: ['consultation', 'open', consultation.petId],
      });
      void queryClient.invalidateQueries({
        queryKey: [PET_TIMELINE_QUERY_KEY, consultation.petId],
      });
      sessionStorage.removeItem(`consultation-step-${id}`);
    },
  });
}

export function useDeleteConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; petId?: string }) => deleteConsultation(id),
    onSuccess: (_, { id, petId }) => {
      void queryClient.invalidateQueries({ queryKey: ['consultations'] });
      void queryClient.invalidateQueries({ queryKey: [ATENDIMENTOS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [CALENDAR_EVENTS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['consultation'] });
      void queryClient.invalidateQueries({ queryKey: [PET_TIMELINE_QUERY_KEY] });

      if (petId) {
        void queryClient.invalidateQueries({
          queryKey: ['consultation', 'open', petId],
        });
        void queryClient.invalidateQueries({
          queryKey: [PET_TIMELINE_QUERY_KEY, petId],
        });
      }

      sessionStorage.removeItem(`consultation-step-${id}`);
    },
  });
}
