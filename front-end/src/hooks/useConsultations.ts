import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ATENDIMENTOS_QUERY_KEY } from '@/hooks/useAtendimentos';
import { CALENDAR_EVENTS_QUERY_KEY } from '@/hooks/useCalendarEvents';
import { STATS_QUERY_KEY } from '@/hooks/useStats';
import { PET_TIMELINE_QUERY_KEY } from '@/hooks/usePetTimeline';
import {
  addPrescription,
  createConsultation,
  createReturnConsultation,
  cancelScheduledReturn,
  deleteConsultation,
  finishConsultation,
  getConsultation,
  getOpenConsultationByPet,
  getOpenReturnConsultationByParent,
  getReturnScheduledConsultationByPet,
  listConsultations,
  removePrescription,
  updateConsultation,
  uploadConsultationAttachment,
  deleteConsultationAttachment,
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

export function useReturnScheduledConsultation(petId: string | undefined) {
  return useQuery({
    queryKey: ['consultation', 'return-scheduled', petId],
    queryFn: () => getReturnScheduledConsultationByPet(petId!),
    enabled: Boolean(petId),
  });
}

export function useCreateReturnConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parentId,
      appointmentId,
    }: {
      parentId: string;
      appointmentId?: string;
      petId?: string;
    }) => createReturnConsultation(parentId, { appointmentId }),
    onSuccess: (consultation, { parentId, petId }) => {
      void queryClient.invalidateQueries({ queryKey: ['consultations'] });
      void queryClient.invalidateQueries({ queryKey: [ATENDIMENTOS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [CALENDAR_EVENTS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: ['consultation', consultation.id] });
      void queryClient.invalidateQueries({ queryKey: ['consultation', parentId] });
      void queryClient.invalidateQueries({
        queryKey: ['consultation', parentId, 'open-return'],
      });

      if (petId) {
        void queryClient.invalidateQueries({
          queryKey: ['consultation', 'open', petId],
        });
        void queryClient.invalidateQueries({
          queryKey: ['consultation', 'return-scheduled', petId],
        });
      }
    },
  });
}

export function useOpenReturnConsultationByParent(parentId: string | undefined) {
  return useQuery({
    queryKey: ['consultation', parentId, 'open-return'],
    queryFn: () => getOpenReturnConsultationByParent(parentId!),
    enabled: Boolean(parentId),
  });
}

export function useCancelScheduledReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parentId,
    }: {
      parentId: string;
      petId?: string;
    }) => cancelScheduledReturn(parentId),
    onSuccess: (consultation, { parentId, petId }) => {
      void queryClient.invalidateQueries({ queryKey: ['consultations'] });
      void queryClient.invalidateQueries({ queryKey: [ATENDIMENTOS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [CALENDAR_EVENTS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: ['consultation', parentId] });
      void queryClient.invalidateQueries({
        queryKey: ['consultation', parentId, 'open-return'],
      });

      if (petId) {
        void queryClient.invalidateQueries({
          queryKey: ['consultation', 'return-scheduled', petId],
        });
        void queryClient.invalidateQueries({
          queryKey: ['consultation', 'open', petId],
        });
        void queryClient.invalidateQueries({
          queryKey: [PET_TIMELINE_QUERY_KEY, petId],
        });
      }

      return consultation;
    },
  });
}

export function useConsultation(id: string | undefined) {
  return useQuery({
    queryKey: ['consultation', id],
    queryFn: () => getConsultation(id!),
    enabled: Boolean(id),
    retry: false,
    refetchOnMount: 'always',
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
        queryKey: ['consultation', 'return-scheduled', consultation.petId],
      });
      void queryClient.invalidateQueries({
        queryKey: [PET_TIMELINE_QUERY_KEY, consultation.petId],
      });
      sessionStorage.removeItem(`consultation-step-${id}`);

      return consultation;
    },
  });
}

type DeleteConsultationVariables = {
  id: string;
  petId?: string;
  parentId?: string;
};

export function useDeleteConsultation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteConsultationVariables>({
    mutationFn: ({ id }) => deleteConsultation(id),
    onSuccess: (_, { id, petId, parentId }) => {
      queryClient.removeQueries({ queryKey: ['consultation', id] });
      void queryClient.invalidateQueries({ queryKey: ['consultations'] });
      void queryClient.invalidateQueries({ queryKey: [ATENDIMENTOS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [CALENDAR_EVENTS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: [PET_TIMELINE_QUERY_KEY] });

      if (parentId) {
        void queryClient.invalidateQueries({
          queryKey: ['consultation', parentId],
        });
        void queryClient.invalidateQueries({
          queryKey: ['consultation', parentId, 'open-return'],
        });
      }

      if (petId) {
        void queryClient.invalidateQueries({ queryKey: ['pet', petId] });
        void queryClient.invalidateQueries({
          queryKey: ['pet-weight-records', petId],
        });
        void queryClient.invalidateQueries({
          queryKey: ['consultation', 'open', petId],
        });
        void queryClient.invalidateQueries({
          queryKey: ['consultation', 'return-scheduled', petId],
        });
        void queryClient.invalidateQueries({
          queryKey: [PET_TIMELINE_QUERY_KEY, petId],
        });
      }

      sessionStorage.removeItem(`consultation-step-${id}`);
    },
  });
}

function invalidateConsultationQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  consultationId: string,
  petId?: string,
) {
  void queryClient.invalidateQueries({ queryKey: ['consultation', consultationId] });

  if (petId) {
    void queryClient.invalidateQueries({
      queryKey: [PET_TIMELINE_QUERY_KEY, petId],
    });
  }
}

export function useUploadConsultationAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      consultationId,
      file,
      label,
    }: {
      consultationId: string;
      petId: string;
      file: File;
      label?: string;
    }) => uploadConsultationAttachment(consultationId, file, label),
    onSuccess: (_, { consultationId, petId }) => {
      invalidateConsultationQueries(queryClient, consultationId, petId);
    },
  });
}

export function useDeleteConsultationAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      consultationId,
      attachmentId,
    }: {
      consultationId: string;
      petId: string;
      attachmentId: string;
    }) => deleteConsultationAttachment(consultationId, attachmentId),
    onSuccess: (_, { consultationId, petId }) => {
      invalidateConsultationQueries(queryClient, consultationId, petId);
    },
  });
}
